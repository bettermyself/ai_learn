Python subprocess 模块是用于产生新进程、连接到它们的输入/输出/错误管道，并获取它们的返回码的标准工具。它是 Python 中执行系统命令（如 shell 脚本、外部程序）的首选方式。

## 核心概念：父进程与子进程

在使用 subprocess 时，Python 脚本是父进程，被调用的外部命令是子进程。你需要管理两者之间的数据流（Stdin, Stdout, Stderr）。

## 第一部分：核心 API 详解

### 1. subprocess.run() —— 官方推荐的瑞士军刀

从 Python 3.5 开始，subprocess.run() 是大多数场景下的首选。它是同步的（阻塞），意味着它会等待命令执行完成。

#### 场景 A: 最简单的命令执行

```python
import subprocess

# shell=True 允许使用 shell 特性（如通配符、管道符），但在处理不信任输入时有安全风险
# 在 Windows 上通常是 dir，Mac/Linux 是 ls -l
subprocess.run("echo Hello World", shell=True)
```

#### 场景 B: 获取输出结果 (常用)

如果你需要拿到命令打印出来的文字，需要配置 capture_output 和 text。

```python
import subprocess

# capture_output=True: 捕获 stdout 和 stderr
# text=True (或 universal_newlines=True): 将输出解码为字符串而非字节(bytes)
result = subprocess.run(["python", "--version"], capture_output=True, text=True)

print("命令返回码:", result.returncode)
print("标准输出:", result.stdout)
print("标准错误:", result.stderr) # 很多程序将日志或版本信息输出到 stderr
```

#### 场景 C: 错误处理与超时

生产环境中，命令可能会失败或卡死。

```python
import subprocess

try:
    # check=True: 如果返回码不是 0，抛出 CalledProcessError
    # timeout=2: 如果 2 秒没执行完，抛出 TimeoutExpired
    subprocess.run(["sleep", "3"], check=True, timeout=2)
except subprocess.TimeoutExpired:
    print("错误：命令执行超时！")
except subprocess.CalledProcessError as e:
    print(f"错误：命令执行失败，返回码 {e.returncode}")
```

#### 场景 D: 向子进程输入数据 (Stdin)

```python
import subprocess

# 等同于在命令行输入 "grep world" 然后输入 "hello world\nhello python"
input_str = "hello world\nhello python\ngoodbye world"
result = subprocess.run(
    ["grep", "world"], 
    input=input_str, 
    capture_output=True, 
    text=True
)
print("筛选结果:\n", result.stdout)
```

### 2. subprocess.Popen() —— 高级、异步控制

如果你需要与进程进行持续交互，或者需要非阻塞地运行命令，就需要用到底层的 Popen 类。

#### 场景 A: 实时获取输出（边执行边打印）

对于耗时很久的任务（如视频转码、下载大文件），run() 会等到最后才一次性显示，而 Popen 可以一行行读取。

```python
import subprocess

# 使用 Popen 启动进程
process = subprocess.Popen(
    ["ping", "-c", "4", "google.com"], # Windows 上请用 ["ping", "-n", "4", "google.com"]
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    text=True
)

# 实时读取输出
while True:
    output = process.stdout.readline()
    # process.poll() - 检查子进程是否结束，若仍在运行则返回 None，否则返回退出码
    if output == '' and process.poll() is not None:
        break
    if output:
        print(f"[实时]: {output.strip()}")

rc = process.poll()
print(f"任务结束，返回码: {rc}")
```

#### 场景 B: 复杂的交互 (communicate)

使用 `communicate()` 发送数据并获取最终结果。虽然 run() 也能做，但在 Popen 中可以更精细地控制何时调用。

```python
import subprocess

process = subprocess.Popen(
    ["python", "-c", "import sys; print(sys.stdin.read().upper())"],
    stdin=subprocess.PIPE,
    stdout=subprocess.PIPE,
    text=True
)

# 向 stdin 写入数据，并关闭输入流，等待子进程结束
stdout_data, stderr_data = process.communicate(input="make me upper case")

print("转换结果:", stdout_data)
```

### 3. 管道连接 (Piping) —— 像 Shell 一样链式操作

模拟 Shell 中的 `cat file.txt | grep "error"`。

```python
import subprocess

# 进程 1: echo "apple banana apple"
p1 = subprocess.Popen(["echo", "apple\nbanana\napple"], stdout=subprocess.PIPE)

# 进程 2: grep "apple" (读取 p1 的输出作为输入)
p2 = subprocess.Popen(
    ["grep", "apple"], 
    stdin=p1.stdout, 
    stdout=subprocess.PIPE,
    text=True
)

# 允许 p1 在 p2 获得其输出后接收 SIGPIPE 信号退出
p1.stdout.close() 

output, _ = p2.communicate()
print("管道筛选结果:\n", output)
```

## 第二部分：实战小项目 —— "简单服务器健康监控器"

这个项目展示了如何整合上述 API。它会并发地 Ping 多个服务器，检查它们是否在线，并获取它们的系统运行时间（假设服务器是 Linux/Mac）。

功能点：
- 使用 run 进行简单的 Ping 检测（带超时）。
- 使用 Popen 获取详细的系统信息（如果在线）。
- 格式化输出报告。

```python
import subprocess
import platform

class ServerMonitor:
    def __init__(self, hosts):
        self.hosts = hosts
        # 根据系统决定 ping 命令的参数
        self.param = '-n' if platform.system().lower() == 'windows' else '-c'

    def check_server_status(self, host):
        """简单检查服务器是否可达"""
        print(f"--- 正在检测: {host} ---")
        try:
            # 使用 run，因为只需要知道成功与否，设置 2 秒超时
            subprocess.run(
                ["ping", self.param, "1", host],
                check=True,
                stdout=subprocess.DEVNULL, # 丢弃输出，保持界面整洁
                stderr=subprocess.DEVNULL,
                timeout=2
            )
            return True
        except (subprocess.CalledProcessError, subprocess.TimeoutExpired):
            return False

    def get_server_uptime(self, host):
        """如果是在线状态，模拟获取更详细信息（这里演示执行复杂命令）"""
        # 注意：这里为了演示，我们在本地执行 uptime。
        # 实际远程监控通常结合 ssh 命令，如 ["ssh", host, "uptime"]
        try:
            result = subprocess.run(
                ["uptime"], # Windows 没有 uptime 命令，可改为 "systeminfo" 或其他
                capture_output=True,
                text=True,
                timeout=5
            )
            return result.stdout.strip()
        except FileNotFoundError:
            return "无法获取运行时间（命令未找到）"

    def run_report(self):
        results = []
        
        for host in self.hosts:
            is_online = self.check_server_status(host)
            
            if is_online:
                uptime_info = self.get_server_uptime(host)
                status = "✅ 在线"
                details = uptime_info
            else:
                status = "❌ 离线/超时"
                details = "N/A"
            
            results.append({"host": host, "status": status, "details": details})

        self._print_table(results)

    def _print_table(self, results):
        print("\n" + "="*60)
        print(f"{'服务器':<20} | {'状态':<10} | {'详情'}")
        print("-" * 60)
        for row in results:
            # 截断详情以防过长
            detail_short = (row['details'][:25] + '...') if len(row['details']) > 25 else row['details']
            print(f"{row['host']:<20} | {row['status']:<10} | {detail_short}")
        print("="*60 + "\n")

if __name__ == "__main__":
    # 定义要监控的目标（可以是域名或IP）
    targets = ["127.0.0.1", "google.com", "192.168.0.999"] # 包含一个必然失败的IP用于测试
    
    monitor = ServerMonitor(targets)
    monitor.run_report()
```

## 关键最佳实践总结

- **优先使用 list 传参**：尽量使用 `["cmd", "arg1"]` 而不是 `"cmd arg1"`。
  - 好: `subprocess.run(["ls", "-l", "my file"])` (处理文件名空格很安全)
  - 坏: `subprocess.run("ls -l my file", shell=True)` (容易出错，且有注入风险)
- **慎用 shell=True**：除非你需要 shell 特定的功能（如 `&&`, `|`, `>` 重定向），否则为了安全性（防止 Shell 注入攻击）和跨平台一致性，默认设为 `False`。
- **处理编码**：在 Python 3 中，默认 I/O 是字节流。如果你处理的是文本，务必加上 `text=True` (旧版本叫 `universal_newlines=True`)
