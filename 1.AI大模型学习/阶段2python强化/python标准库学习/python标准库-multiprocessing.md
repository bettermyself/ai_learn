这份指南将带你系统地学习 Python 标准库 multiprocessing。由于 Python 全局解释器锁（GIL）的存在，多线程在 CPU 密集型任务中无法利用多核优势，而 multiprocessing 通过创建子进程完美解决了这个问题。

为了确保代码在所有平台（尤其是 Windows）上正常运行，所有示例代码必须包含 `if __name__ == '__main__':` 保护块。

## 一、 核心组件与 API 详解

### 1. 进程管理：Process
这是最基础的类，用于创建一个独立的进程。

* API: `Process(target, args)`, `start()`, `join()`, `is_alive()`, `terminate()`

```python
import multiprocessing
import time
import os

def worker(name, delay):
    print(f"子进程 {name} (PID: {os.getpid()}) 开始运行...")
    time.sleep(delay)
    print(f"子进程 {name} 结束。")

if __name__ == '__main__':
    print(f"主进程 (PID: {os.getpid()})")
    
    # 创建两个进程
    p1 = multiprocessing.Process(target=worker, args=('A', 2))
    p2 = multiprocessing.Process(target=worker, args=('B', 1))
    
    p1.start() # 启动进程
    p2.start()
    
    print("主进程等待子进程结束...")
    p1.join() # 阻塞主进程，直到 p1 完成
    p2.join() # 阻塞主进程，直到 p2 完成
    
    print("所有任务完成。")
```

### 2. 进程池：Pool
当需要管理大量进程时，手动创建 Process 很低效。Pool 维护一个进程池，可以重复利用进程。

* API: `apply()` (阻塞), `apply_async()` (非阻塞), `map()` (并行映射), `close()`, `join()`

```python
from multiprocessing import Pool
import time

def square(x):
    time.sleep(0.5) # 模拟耗时计算
    return x * x

if __name__ == '__main__':
    # 创建一个包含 4 个工作进程的进程池
    # 这里的 'with' 语法会在代码块结束后自动关闭池
    with Pool(processes=4) as pool:
        print("开始计算...")
        
        # map: 类似于内置的 map，但任务是并行分发的
        # 它会阻塞直到所有结果返回，并保持顺序
        results = pool.map(square, range(10))
        print(f"Map 结果: {results}")
        
        # apply_async: 异步执行单个任务
        result_async = pool.apply_async(square, (10,))
        
        # 获取异步结果（会阻塞直到结果准备好）
        print(f"Async 结果: {result_async.get()}")
```

### 3. 进程间通信 (IPC)：Queue
进程之间内存是隔离的，不能直接使用全局变量通信。Queue 是最常用的线程/进程安全的通信方式。

* API: `put()`, `get()`, `empty()`, `full()`

```python
from multiprocessing import Process, Queue
import time

def producer(q):
    for i in range(5):
        print(f"生产: 数据 {i}")
        q.put(i)
        time.sleep(0.2)
    q.put(None) # 发送结束信号

def consumer(q):
    while True:
        item = q.get()
        if item is None: # 收到结束信号
            break
        print(f"\t消费: 处理 {item}")

if __name__ == '__main__':
    q = Queue() # 创建共享队列
    
    p1 = Process(target=producer, args=(q,))
    p2 = Process(target=consumer, args=(q,))
    
    p1.start()
    p2.start()
    
    p1.join()
    p2.join()
```

### 4. 进程间通信：Pipe
Pipe 创建一个管道，返回两个连接对象（Conn1, Conn2），分别代表管道的两端。它比 Queue 更底层、更快，但通常只用于两个进程间通信。

* API: `send()`, `recv()`

```python
from multiprocessing import Process, Pipe

def sender(conn):
    conn.send("Hello from sender")
    conn.close()

def receiver(conn):
    msg = conn.recv() # 如果管道没数据，会阻塞
    print(f"收到消息: {msg}")
    conn.close()

if __name__ == '__main__':
    parent_conn, child_conn = Pipe()
    
    p = Process(target=sender, args=(child_conn,))
    p.start()
    
    receiver(parent_conn) # 主进程接收
    p.join()
```

### 5. 进程同步：Lock
当多个进程需要访问同一资源（如打印到屏幕、写入同一个文件）时，使用锁防止数据错乱。

* API: `acquire()`, `release()`

```python
from multiprocessing import Process, Lock
import time

def printer(lock, name):
    # 获取锁
    lock.acquire()
    try:
        print(f"进程 {name} 正在打印...")
        time.sleep(1)
        print(f"进程 {name} 打印结束。")
    finally:
        # 无论如何都要释放锁
        lock.release()

if __name__ == '__main__':
    lock = Lock()
    processes = []
    
    for i in range(3):
        p = Process(target=printer, args=(lock, f'P{i}'))
        processes.append(p)
        p.start()
        
    for p in processes:
        p.join()
```

### 6. 共享内存与状态：Value, Array, Manager
虽然不推荐（推荐使用消息传递如 Queue），但 multiprocessing 允许进程通过共享内存块来共享数据。

* API: `Value` (单个值), `Array` (C数组), `Manager` (共享高级对象如 list, dict)

```python
from multiprocessing import Process, Value, Array, Manager

def modify_shared(n, a, d):
    n.value = 3.14159  # 修改 Value
    for i in range(len(a)):
        a[i] = -a[i]   # 修改 Array
    d['name'] = 'Gemini' # 修改 Manager 字典

if __name__ == '__main__':
    # 'd' 表示双精度浮点数，'i' 表示有符号整数
    num = Value('d', 0.0)
    arr = Array('i', range(5))
    
    with Manager() as manager:
        d = manager.dict() # 创建跨进程的字典
        
        p = Process(target=modify_shared, args=(num, arr, d))
        p.start()
        p.join()
        
        print(f"Shared Value: {num.value}")
        print(f"Shared Array: {arr[:]}")
        print(f"Shared Dict: {d}")
```

## 二、 实战微项目：并行大规模文件哈希计算器

**场景：** 假设你有一个文件夹包含大量文件，你需要计算每个文件的 MD5 哈希值以校验完整性。如果是单线程，计算大文件会非常慢。

**解决方案：** 使用 Pool 并行计算，使用 Manager.Queue 收集进度，主进程实时显示进度条。

### 项目代码

```python
import os
import time
import hashlib
import random
import string
from multiprocessing import Pool, Manager, cpu_count

# ----------------- 辅助函数：生成测试数据 -----------------
def create_dummy_files(directory, count=10):
    if not os.path.exists(directory):
        os.makedirs(directory)
    
    print(f"正在生成 {count} 个测试文件...")
    for i in range(count):
        # 随机生成一些内容
        content = ''.join(random.choices(string.ascii_letters, k=1024 * 1024)) # 1MB string
        with open(os.path.join(directory, f"file_{i}.txt"), 'w') as f:
            f.write(content)

# ----------------- 核心任务：计算 MD5 -----------------
def compute_md5(file_path):
    """计算单个文件的MD5，这是一个CPU密集型任务"""
    # 初始化 MD5 对象
    hash_md5 = hashlib.md5()
    try:
        with open(file_path, "rb") as f:
          	# 使用 iter(lambda: f.read(4096), b'') 每次读取 4096 字节的数据块，直到文件末尾。
            for chunk in iter(lambda: f.read(4096), b""):
            		# 用 hash_md5.update(chunk) 将每个数据块逐步更新到 MD5 哈希对象中，避免一次性加载大文件导致内存占用过高
                hash_md5.update(chunk)
        # 调用 hash_md5.hexdigest() 获取最终的 MD5 哈希值（十六进制字符串格式）
        return (file_path, hash_md5.hexdigest())
    except Exception as e:
        return (file_path, str(e))

# ----------------- 主程序 -----------------
def run_parallel_hasher():
    target_dir = "./test_data"
    
    # 1. 准备数据
    create_dummy_files(target_dir, count=20)
    
    # 获取文件列表
    files = [os.path.join(target_dir, f) for f in os.listdir(target_dir) if f.endswith('.txt')]
    print(f"\n开始并行计算 {len(files)} 个文件的 MD5 (CPU核数: {cpu_count()})...\n")
    
    start_time = time.time()
    
    # 2. 并行处理
    # 使用 imap_unordered 可以让完成的任务尽快返回，而不是等待前面的任务
    # 在没有显式指定进程数量的情况下，multiprocessing.Pool 会默认使用与 CPU 核心数相同的进程数量
    with Pool() as pool:
        results = pool.imap_unordered(compute_md5, files)
        
        # 3. 实时获取结果
        for i, (fpath, md5_val) in enumerate(results, 1):
            filename = os.path.basename(fpath)
            print(f"[{i}/{len(files)}] {filename} -> {md5_val}")
            
    end_time = time.time()
    print(f"\n全部完成! 耗时: {end_time - start_time:.4f} 秒")

if __name__ == '__main__':
    run_parallel_hasher()
    
    # 清理生成的测试文件
    import shutil1
    # shutil.rmtree("./test_data") # 如果想保留文件观察结果，请注释掉这行
```

## 三、 关键注意事项 (Gotchas)

* **`if __name__ == '__main__':`：** 这一点至关重要。Windows 创建新进程时会导入主模块。如果不加这个判断，会导致递归创建进程，直到机器崩溃（Fork vs Spawn 机制的区别）。
* **死锁（Deadlock）：** 如果在使用 Lock 或 Queue 时发生异常导致锁未释放，程序会永久挂起。尽量使用上下文管理器（`with lock:`）。
* **僵尸进程：** 确保主进程调用了 `join()`，或者使用了 `with Pool() ...`，否则子进程结束后可能变成僵尸进程占用系统资源。
