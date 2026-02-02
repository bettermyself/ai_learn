你好！很高兴和你一起深入探讨 Python 的 threading 标准库。这是 Python 进行并发编程（Concurrency）的基础模块。

在开始之前，有一个重要的概念需要了解：GIL (全局解释器锁)。因为 GIL 的存在，Python 的多线程在同一时刻只能有一个线程在 CPU 上执行字节码。

* 适用场景： I/O 密集型任务（爬虫、文件读写、网络请求）。
* 不适用场景： CPU 密集型任务（复杂的数学计算，这种建议用 multiprocessing）。

下面我会分模块讲解常用 API，并附带代码示例。

### 第一部分：核心对象 Thread (线程管理)
这是最基础的类，用于创建和管理线程。

#### 1. 创建与启动 (target 方式)
最简单的用法是直接传入一个函数给 target 参数。

```python
import threading
import time

def worker(name, delay):
    print(f"线程 {name} 开始工作...")
    time.sleep(delay)
    print(f"线程 {name} 工作完成！")

# 创建线程
# args 是传递给目标函数的参数元组
t1 = threading.Thread(target=worker, args=("A", 2))
t2 = threading.Thread(target=worker, args=("B", 1))

# 启动线程
t1.start()
t2.start()

# 等待线程结束 (阻塞主线程直到 t1 和 t2 运行完毕)
t1.join()
t2.join()

print("所有任务完成。")
```

#### 2. 通过继承 Thread 类创建
对于复杂的线程逻辑，通常会创建一个类继承 threading.Thread 并重写 run 方法。

```python
class MyThread(threading.Thread):
    def __init__(self, name):
        super().__init__()
        self.name = name

    def run(self):
        # 线程启动后会自动执行 run 方法内的代码
        print(f"{self.name} 正在运行...")
        time.sleep(1)
        print(f"{self.name} 结束。")

t = MyThread("自定义线程")
t.start()
t.join()
```

### 第二部分：同步原语 (Synchronization Primitives)
多线程最容易出现的问题是竞态条件 (Race Condition)，即多个线程同时修改同一数据导致数据错乱。我们需要“锁”来协调。

#### 1. Lock (互斥锁)
最常用的锁。保证同一时间只有一个线程能访问共享资源。

```python
import threading

balance = 0
lock = threading.Lock()

def change_balance(n):
    global balance
    # 获取锁
    lock.acquire()
    try:
        # 临界区：只有拿到锁的线程才能执行这里
        balance = balance + n
        balance = balance - n
    finally:
        # 必须释放锁，否则死锁
        lock.release()

    # 推荐写法：使用 with 上下文管理器，自动处理 acquire/release
    # with lock:
    #     balance = balance + n
    #     balance = balance - n

threads = []
for i in range(100):
    t = threading.Thread(target=change_balance, args=(5,))
    threads.append(t)
    t.start()

for t in threads: t.join()
print(f"最终余额: {balance}") # 如果没有锁，这里可能不是 0
```

> #### `global` 关键字使用笔记
>
> #### 1. 作用
> - 用于在函数内部声明一个变量为全局变量
> - 允许函数修改全局作用域中的变量
>
> #### 2. 使用场景
> - **必须使用 `global`**：
>   - 在函数内对全局变量进行赋值操作（如 `+=`、`=`）
>   - 需要修改全局变量的值
>
> - **无需使用 `global`**：
>   - 仅读取全局变量的值
>   - 修改可变对象（如列表、字典）的内容
>
> #### 3. 常见错误
> ```python
> balance = 0
> 
> def bad_modify():
>     balance += 1  # 报错：UnboundLocalError
> 
> def good_modify():
>     global balance
>     balance += 1  # 正确
> ```
>
>
> #### 4. 注意事项
> - `global` 的使用与多线程无关
> - 是 Python 作用域规则的要求
> - 养成良好习惯：需要修改全局变量时显式使用 `global`
>
> ---

#### 2. RLock (可重入锁)

如果一个线程在一个函数里拿了锁，又调用了另一个也需要拿同一把锁的函数，用普通的 Lock 会死锁。RLock 允许同一个线程多次请求同一把锁。

```python
rlock = threading.RLock()

def step_two():
    with rlock:
        print("第二步执行中...")

def step_one():
    with rlock:
        print("第一步执行中...")
        step_two() # 同一个线程再次获取锁，不会死锁

t = threading.Thread(target=step_one)
t.start()
```

#### 3. Condition (条件变量)
用于复杂的线程间通信（例如：生产者-消费者）。一个线程等待特定条件，另一个线程满足条件后通知它。

```python
import threading
import time

cond = threading.Condition()
item_list = []

def consumer():
    with cond:
        print("消费者: 等待数据...")
        cond.wait() # 释放锁并挂起，直到被 notify
        print(f"消费者: 消费了 {item_list.pop()}")

def producer():
    time.sleep(1)
    with cond:
        item = "数据包"
        item_list.append(item)
        print("生产者: 生产了数据，通知消费者")
        cond.notify() # 唤醒一个正在 wait 的线程

threading.Thread(target=consumer).start()
threading.Thread(target=producer).start()
```

#### 4. Semaphore (信号量)
用于控制同时访问资源的线程数量（例如：限制数据库连接池最大连接数为 5）。

```python
# 允许同时有 3 个线程执行
sem = threading.Semaphore(3)

def limited_task(i):
    with sem:
        print(f"线程 {i} 获得了通行证")
        time.sleep(2)
        print(f"线程 {i} 释放了通行证")

for i in range(6):
    threading.Thread(target=limited_task, args=(i,)).start()
```

#### 5. Event (事件)
最简单的线程通信机制。一个线程发信号（set），其他线程等待信号（wait）。常用于启动控制或停止信号。

```python
event = threading.Event()

def racer(name):
    print(f"{name} 准备好了，等待发令枪...")
    event.wait() # 阻塞，直到 event.is_set() 为 True
    print(f"{name} 跑！")

threading.Thread(target=racer, args=("选手A",)).start()
threading.Thread(target=racer, args=("选手B",)).start()

print("裁判: 各就位...")
time.sleep(1)
print("裁判: 砰！")
event.set() # 发送信号，唤醒所有 wait 的线程
```

### 第三部分：辅助工具
#### 1. Timer (定时器)
在指定时间后执行某个函数。

```python
def hello():
    print("定时器触发：Hello!")

t = threading.Timer(2.0, hello) # 2秒后执行 hello
t.start()
# 如果想取消：t.cancel()
```

#### 2. local (线程本地数据)
创建线程独立的变量空间，线程之间互不干扰。

```python
data = threading.local()

def process_data():
    # 这里获取的 data.value 是当前线程独有的
    try:
        print(f"{threading.current_thread().name} 数据: {data.value}")
    except AttributeError:
        print(f"{threading.current_thread().name} 没有数据")

def task(val):
    data.value = val # 只影响当前线程
    process_data()

t1 = threading.Thread(target=task, args=(10,), name="线程1")
t2 = threading.Thread(target=task, args=(20,), name="线程2")
t1.start(); t2.start()
```

### 实战小项目：多线程下载器与进度监控
我们将结合 Thread, Event, Lock 以及 queue.Queue (线程安全的队列，实际项目中常用它替代手写的 Condition) 来模拟一个多线程文件下载系统。

功能：
* 生产者：向队列中添加下载任务（URL）。
* 消费者（Worker）：多个线程同时从队列取任务并模拟下载。
* 监控器：单独一个线程每秒打印当前下载进度。

```python
import threading
import time
import queue
import random

# 模拟的任务队列
task_queue = queue.Queue()
# 用于统计进度的锁和计数器
progress_lock = threading.Lock()
completed_tasks = 0
total_tasks = 20

# 停止信号
stop_event = threading.Event()

def downloader(worker_id):
    """消费者线程：模拟下载"""
    global completed_tasks
    while not stop_event.is_set():
        try:
            # timeout 是为了防止队列空了之后线程死等，导致无法响应 stop_event
            url = task_queue.get(timeout=1) 
        except queue.Empty:
            continue
        
        # 模拟下载耗时 (0.5 到 2 秒不等)
        sleep_time = random.uniform(0.5, 2.0)
        time.sleep(sleep_time)
        
        with progress_lock:
            completed_tasks += 1
            # 实际场景这里可以记录日志
            # print(f"线程-{worker_id} 下载完成: {url}")
        
        task_queue.task_done()

def monitor():
    """监控线程：实时显示进度条"""
    while not stop_event.is_set():
        with progress_lock:
            current = completed_tasks
        
        percentage = (current / total_tasks) * 100
        bar = '#' * int(percentage / 5)
        print(f"\r进度: [{bar:<20}] {percentage:.1f}% ({current}/{total_tasks})", end="")
        
        if current >= total_tasks:
            break
        time.sleep(0.5)
    print("\n监控结束。")

def main():
    print(f"开始多线程下载任务，总任务数: {total_tasks}")
    
    # 1. 填充任务 (模拟生产者)
    for i in range(total_tasks):
        task_queue.put(f"https://example.com/file_{i}.zip")
        
    # 2. 启动 3 个下载线程 (消费者)
    workers = []
    for i in range(3):
        t = threading.Thread(target=downloader, args=(i+1,))
        t.start()
        workers.append(t)
        
    # 3. 启动监控线程
    monitor_thread = threading.Thread(target=monitor)
    monitor_thread.start()
    
    # 4. 阻塞主线程直到队列为空
    task_queue.join()
    
    # 5. 任务全部完成，发送停止信号并回收线程
    stop_event.set()
    
    for t in workers:
        t.join()
    monitor_thread.join()
    
    print("所有下载任务处理完毕！")

if __name__ == "__main__":
    main()
```

> 线程同步的关键代码
> （1）task_queue.join() + stop_event.set()
> 作用：
> task_queue.join()：阻塞主线程，直到所有任务完成。
> stop_event.set()：通知所有线程退出循环。
> 目的：确保任务处理完毕并触发线程安全退出。
> （2）t.join() + monitor_thread.join()
> 作用：
> t.join()：等待所有工作线程（downloader）完全退出。
> monitor_thread.join()：等待监控线程（monitor）完全退出。
> 目的：确保所有线程彻底终止，防止资源泄漏或程序异常。
>
> 4. 为什么需要双重保障？
> 原因：
> task_queue.join() 和 stop_event.set() 只能保证任务完成和线程收到退出信号。
> t.join() 和 monitor_thread.join() 确保线程真正执行完收尾逻辑后才退出。
> 结论：两者互补，共同保障多线程程序的健壮性和安全性。

#### 项目解析：

* Queue: task_queue 是线程安全的，我们不需要在 put 和 get 时手动加锁，简化了代码。
* Lock: 在修改 completed_tasks 计数器时，使用了 progress_lock，防止多个线程同时修改导致计数错误。
* Event: 使用 stop_event 来优雅地关闭 Worker 线程。

