sys 模块是 Python 标准库中最基础也最重要的模块之一。它提供了Python 解释器与宿主系统（操作系统）进行交互的接口。通过 sys，你可以访问命令行参数、控制模块搜索路径、管理标准输入输出流，以及获取 Python 解释器的版本信息等。

## 一、 命令行参数与环境管理

这是 sys 模块最常用的功能，用于处理脚本启动时的参数和环境。

### 1. sys.argv (命令行参数)

获取运行 Python 脚本时传递的命令行参数。它是一个列表，第一个元素永远是脚本文件的名称。

```python
import sys

# 假设我们在终端运行: python script.py hello 123
def show_args():
    print(f"参数列表: {sys.argv}")
    print(f"脚本名称: {sys.argv[0]}")
    if len(sys.argv) > 1:
        print(f"第一个参数: {sys.argv[1]}")

# 模拟运行
# sys.argv = ['script.py', 'hello', '123'] # 手动模拟，实际运行时不需要这行
show_args()
```

### 2. sys.path (模块搜索路径)

这是一个字符串列表，指定了 Python 在 import 模块时搜索的目录路径。你可以动态修改它来导入非标准位置的模块。

```python
import sys

def manage_path():
    print("当前搜索路径:")
    for path in sys.path[:3]: # 只打印前3个，避免太长
        print(f" - {path}")
    
    # 动态添加一个路径
    custom_path = "/my/custom/libs"
    sys.path.append(custom_path)
    print(f"\n已添加路径: {custom_path}")
    
    # 此后就可以 import 该路径下的模块了
    # import my_custom_module 
```

### 3. sys.modules (已加载模块)

一个字典，映射了模块名到模块对象。用于检查某个模块是否已经被导入，或者进行一些黑魔法操作（如热更新）。

```python
import sys
import os

def check_modules():
    if 'os' in sys.modules:
        print("OS 模块已加载")
    else:
        print("OS 模块未加载")

check_modules()
```

## 二、 标准输入、输出与错误流

sys 提供了类似于 C 语言 stdin, stdout, stderr 的文件对象。这比 print() 更底层，支持更灵活的重定向。

### 4. sys.stdout & sys.stderr

 * **stdout**: 标准输出（通常是屏幕）。
 * **stderr**: 标准错误（通常也是屏幕，但可以被单独重定向到日志文件）。

```python
import sys

def stream_demo():
    # 相当于 print('Hello')
    sys.stdout.write("这是一条标准输出信息\n")
    
    # 打印错误信息，通常在日志系统中显示为红色或被单独收集
    sys.stderr.write("这是一条警告/错误信息\n")

stream_demo()
```

### 5. sys.stdin

用于从标准输入（键盘或管道）读取数据。

```python
import sys

def read_input():
    # 注意：在交互式环境中运行可能需要手动输入并按 Ctrl+D 结束
    print("请输入内容 (Ctrl+D 结束):")
    content = sys.stdin.read() 
    print(f"你输入了: {len(content)} 个字符")
```

## 三、 程序控制与退出

### 6. sys.exit([arg])

退出 Python 程序。

 * **sys.exit(0)**: 正常退出（默认）。
 * **sys.exit(1) (或非0)**: 异常退出，通常用于告知操作系统程序出错。

```python
import sys

def safe_exit(has_error):
    if has_error:
        sys.stderr.write("发生严重错误，程序终止！\n")
        sys.exit(1) # 返回错误码 1
    else:
        print("程序执行完毕")
        sys.exit(0) # 正常退出
```

## 四、 系统与解释器信息

用于编写跨平台脚本或进行性能分析。

### 7. sys.platform (操作系统标识)

判断当前运行的操作系统（Windows, Linux, macOS）。

```python
import sys

def check_os():
    if sys.platform.startswith('win'):
        print("这是 Windows 系统")
    elif sys.platform.startswith('linux'):
        print("这是 Linux 系统")
    elif sys.platform == 'darwin':
        print("这是 macOS 系统")
```

### 8. sys.version & sys.version_info

获取 Python 版本信息。version_info 是一个元组，更适合做版本比较逻辑。

```python
import sys

def check_version():
    print(f"完整版本字符串: {sys.version.split()[0]}")
    
    # 推荐的版本检查方式
    if sys.version_info >= (3, 8):
        print("Python 版本 >= 3.8，可以使用海象运算符 (:=)")
    else:
        print("Python 版本较旧")
```

### 9. sys.getsizeof(object) (内存占用)

获取对象占用的内存字节数（不包含引用的子对象）。

```python
import sys

def check_memory():
    a = [1, 2, 3]
    b = range(1000)
    print(f"列表占用字节: {sys.getsizeof(a)}")
    print(f"Range对象占用字节: {sys.getsizeof(b)}") # range 是惰性的，占用很小
```

### 10. sys.executable

当前 Python 解释器的绝对路径。在需要用 subprocess 启动新的 Python 进程时非常有用。

```python
import sys
print(f"当前解释器路径: {sys.executable}")
```

## 五、 实战小项目：CLI 系统诊断工具 (sys_tool.py)

我们将结合上述 API 编写一个命令行工具。该工具根据用户输入的命令，执行不同的系统检查任务，并正确处理退出状态。

**功能：**

 * **info**: 打印当前 Python 环境信息。
 * **check-path**: 检查某个路径是否在 sys.path 中。
 * **echo**: 演示标准错误流输出。

**项目代码 (sys_tool.py)**

```python
import sys
import os

    def print_help():
        """打印帮助菜单"""
        print("""
        使用方法: python sys_tool.py [COMMAND] [ARGS...]

        Commands:
          info          显示解释器版本和平台信息
          check-path    <path> 检查指定路径是否在 import 搜索列表中
          echo          <text> 将文本输出到 stderr (模拟错误日志)
        """)

def cmd_info():
    """显示系统信息"""
    print("-" * 30)
    print(f"Python Executable : {sys.executable}")
    print(f"Platform          : {sys.platform}")
    print(f"Version           : {sys.version.split()[0]}")
    print(f"Byte Order        : {sys.byteorder}") # 大端序还是小端序
    print("-" * 30)

def cmd_check_path(target_path):
    """检查路径是否存在于 sys.path"""
    # 规范化路径以便比较
    abs_target = os.path.abspath(target_path)
    sys_paths = [os.path.abspath(p) for p in sys.path]
    
    if abs_target in sys_paths:
        print(f"✅ 路径 '{target_path}' 在搜索列表中。")
        sys.exit(0)
    else:
        print(f"❌ 路径 '{target_path}' 不在搜索列表中。")
        # 这是一个查找失败，我们可以返回非0状态码
        sys.exit(1)

def cmd_echo(text):
    """输出到标准错误流"""
    # 模拟写入日志或报错
    sys.stderr.write(f"[STDERR] {text}\n")
    sys.exit(0)

def main():
    # 1. 检查参数长度，sys.argv[0] 是脚本名，所以长度至少要 > 1
    if len(sys.argv) < 2:
        print_help()
        sys.exit(0)

    # 2. 获取命令
    command = sys.argv[1].lower()

    # 3. 命令路由
    if command == "info":
        cmd_info()
    
    elif command == "check-path":
        if len(sys.argv) < 3:
            sys.stderr.write("错误: check-path 需要提供路径参数\n")
            sys.exit(2) # 参数错误退出码
        cmd_check_path(sys.argv[2])
        
    elif command == "echo":
        if len(sys.argv) < 3:
            sys.stderr.write("错误: echo 需要提供文本参数\n")
            sys.exit(2)
        cmd_echo(sys.argv[2])
        
    else:
        sys.stderr.write(f"未知命令: {command}\n")
        print_help()
        sys.exit(1)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        # 捕获 Ctrl+C，优雅退出
        sys.stderr.write("\n用户中断执行。\n")
        sys.exit(130)
```

**如何运行此项目**

 * **保存代码**: 将上述代码保存为 sys_tool.py。
 * **查看信息**:
   ```bash
   python sys_tool.py info
   ```
 * **测试错误流**:
   ```bash
   # 在 Linux/Mac 下，你可以将 stderr 重定向到文件，屏幕上就不会显示输出
   python sys_tool.py echo "这是一条错误日志" 2> error.log
   ```
 * **检查路径**:
   ```bash
   python sys_tool.py check-path /usr/bin
   # 然后运行 echo $? (Linux/Mac) 或 echo %errorlevel% (Windows) 查看退出码
   ```



## 核心区别概览

| 特性         | **sys 模块**                         | **os 模块**                              |
| :----------- | :----------------------------------- | :--------------------------------------- |
| **主要目的** | 与 **Python 解释器** 交互            | 与 **操作系统本身** 交互                 |
| **抽象层次** | Python 运行时环境（解释器层面）      | 操作系统底层接口（文件、进程、环境变量） |
| **功能焦点** | 解释器控制、模块系统、标准流         | 文件操作、进程管理、路径处理             |
| **跨平台性** | 高度跨平台（处理 Python 自身的抽象） | 部分函数平台相关，但有统一的跨平台接口   |
| **使用频率** | 较高（尤其在脚本开发中）             | 极高（几乎所有系统交互都需要）           |