# Python Pathlib 系统学习指南

`pathlib` 是 Python 3 中处理文件路径的标准库，完全面向对象，比传统的 `os.path` 更加语义化和优雅。

在使用前请先导入：

```python
from pathlib import Path
```

## 一、核心 API 速查表 (Cheat Sheet)

### 1. 路径创建与获取

| 方法                   | 描述                                          | 示例                                           |
| ---------------------- | --------------------------------------------- | ---------------------------------------------- |
| `Path.cwd()`           | 获取当前脚本运行的工作目录                    | `p = Path.cwd()`                               |
| `Path.home()`          | 获取当前用户的主目录（如 `/Users/name`）      | `p = Path.home()`                              |
| `Path('str')`          | 将字符串转换为路径对象                        | `p = Path('data/raw')`                         |
| `/` (运算符)           | 拼接路径，最优雅的特性（支持路径对象/字符串） | `p = Path.cwd() / 'logs' / 'error.log'`        |
| `Path.joinpath(*args)` | 传统拼接方式（类似于 `/` 运算符）             | `p = Path.cwd().joinpath('logs', 'error.log')` |

### 2. 路径属性拆解 (假设 `p = Path('/usr/bin/python3.8.tar.gz')`)

| 属性         | 描述                                 | 示例输出                                  |
| ------------ | ------------------------------------ | ----------------------------------------- |
| `p.name`     | 获取完整文件名                       | `'python3.8.tar.gz'`                      |
| `p.stem`     | 获取不含后缀的文件名（只去尾部后缀） | `'python3.8.tar'`                         |
| `p.suffix`   | 获取文件后缀名                       | `'.gz'`                                   |
| `p.suffixes` | 获取所有后缀名的列表                 | `['.tar', '.gz']`                         |
| `p.parent`   | 获取父级目录路径对象                 | `/usr/bin`                                |
| `p.parents`  | 获取所有父级目录的可迭代祖先序列     | `list(p.parents)`                         |
| `p.parts`    | 将路径拆分为元组                     | `('/', 'usr', 'bin', 'python3.8.tar.gz')` |

### 3. 判断与测试

| 方法              | 描述                   | 示例                 |
| ----------------- | ---------------------- | -------------------- |
| `p.exists()`      | 判断文件或目录是否存在 | `if p.exists(): ...` |
| `p.is_file()`     | 判断是否为文件         | `p.is_file()`        |
| `p.is_dir()`      | 判断是否为目录         | `p.is_dir()`         |
| `p.is_absolute()` | 判断是否为绝对路径     | `p.is_absolute()`    |

### 4. 文件与目录操作 (增删改)

| 方法                                   | 描述                                       | 示例                                                      |
| -------------------------------------- | ------------------------------------------ | --------------------------------------------------------- |
| `p.mkdir(parents=True, exist_ok=True)` | 创建目录（推荐加上这两个参数以防报错）     | `Path('data/new_dir').mkdir(parents=True, exist_ok=True)` |
| `p.touch()`                            | 创建一个空文件（如果文件存在则更新时间戳） | `Path('test.txt').touch()`                                |
| `p.rename(target)`                     | 重命名或移动文件                           | `p.rename('new_name.txt')`                                |
| `p.unlink()`                           | 删除文件（如果文件不存在会报错）           | `Path('temp.txt').unlink(missing_ok=True)`                |
| `p.rmdir()`                            | 删除空目录（目录不为空会报错）             | `Path('empty_dir').rmdir()`                               |
| `p.resolve()`                          | 获取文件的绝对路径（解析符号链接和 `..`）  | `abs_path = Path('file.txt').resolve()`                   |

### 5. 遍历与查找

| 方法               | 描述                                      | 示例                                             |
| ------------------ | ----------------------------------------- | ------------------------------------------------ |
| `p.iterdir()`      | 遍历目录下的内容（生成器，不递归）        | `for child in Path('.').iterdir(): print(child)` |
| `p.glob(pattern)`  | 通配符查找当前目录下匹配的文件            | `list(Path('.').glob('*.jpg'))`                  |
| `p.rglob(pattern)` | 递归查找目录下所有匹配的文件（Recursive） | `list(Path('.').rglob('*.py'))`                  |

### 6. 文件读写 (快捷操作)

| 方法                                   | 描述                         | 示例                                            |
| -------------------------------------- | ---------------------------- | ----------------------------------------------- |
| `p.read_text(encoding='utf-8')`        | 读取文件全部内容为字符串     | `content = p.read_text(encoding='utf-8')`       |
| `p.read_bytes()`                       | 以二进制模式读取文件内容     | `data = p.read_bytes()`                         |
| `p.write_text(data, encoding='utf-8')` | 将字符串写入文件（覆盖模式） | `p.write_text("Hello World", encoding='utf-8')` |
| `p.write_bytes(data)`                  | 将二进制数据写入文件         | `p.write_bytes(b'\x00\x01')`                    |

## 二、实战测试小项目：日志归档工具

**项目目标**：创建一个脚本，模拟生成一堆日志文件，然后根据文件名中的日期，自动创建对应的日期文件夹，并将日志移动进去。

**包含知识点**：路径创建、文件生成、字符串解析、目录创建、文件移动。

### 1. 项目代码

```python
from pathlib import Path
import random

# 定义基础工作目录
base_dir = Path.cwd() / "logs_playground"

def setup_environment():
    """初始化：创建测试目录并生成一些模拟日志文件"""
    if base_dir.exists():
        # 注意：pathlib删除非空目录比较麻烦，生产环境建议用shutil.rmtree
        # 这里为了演示pathlib，简单起见我们假设目录是干净的或手动删除
        print(f"目录 {base_dir} 已存在，请确保它是空的或手动清理一下。")
    
    base_dir.mkdir(parents=True, exist_ok=True)
    
    # 模拟生成不同日期的日志
    filenames = [
        "app_2023-10-01.log", "error_2023-10-01.log",
        "app_2023-10-02.log", "access_2023-10-02.txt",
        "system_2023-11-05.log"
    ]
    
    print("--- 正在生成模拟文件 ---")
    for fname in filenames:
        (base_dir / fname).touch()
        print(f"已创建: {fname}")

def archive_logs():
    """核心逻辑：归档文件"""
    print("\n--- 开始归档整理 ---")
    
    # 遍历目录下所有文件
    for file_path in base_dir.iterdir():
        # 跳过文件夹，只处理文件
        if not file_path.is_file():
            continue
            
        # 简单逻辑：假设文件名里包含日期，格式为 YYYY-MM-DD
        # 也可以用 file_path.stem.split('_')[-1] 等方式提取
        file_name = file_path.name
        
        # 寻找看起来像日期的字符串 (简单的字符串切片示例)
        # 实际项目中可以使用正则表达式 re 模块
        if "2023-" in file_name:
            # 提取日期部分作为文件夹名 (这里假设日期在文件名中固定位置或格式)
            # 粗暴提取示例：找到 2023-xx-xx
            try:
                start_index = file_name.find("2023-")
                date_str = file_name[start_index : start_index + 10] # 提取 2023-10-01
                
                # 组装目标文件夹路径
                target_folder = base_dir / date_str
                
                # 如果文件夹不存在则创建
                target_folder.mkdir(exist_ok=True)
                
                # 移动文件
                new_path = target_folder / file_name
                file_path.rename(new_path)
                print(f"移动: {file_name} -> {date_str}/")
                
            except Exception as e:
                print(f"处理 {file_name} 时出错: {e}")

if __name__ == "__main__":
    setup_environment()
    archive_logs()
    
    print("\n--- 目录结构检查 ---")
    # 简单的递归打印展示结果
    for path in sorted(base_dir.rglob('*')):
        # 计算层级深度用于缩进
        depth = len(path.relative_to(base_dir).parts)
        spacer = "    " * depth
        print(f"{spacer}|- {path.name}")
```

### 2. 练习任务

1. **运行代码**：直接运行上述脚本，观察 `logs_playground` 文件夹内的变化。

2. **修改代码**：修改脚本，使其能够根据文件的修改时间（而不是文件名）来归档文件。
   - **提示**：使用 `p.stat().st_mtime` 获取时间戳，配合 `datetime` 模块转换格式。

3. **增加过滤**：只归档 `.log` 后缀的文件，忽略 `.txt` 文件。
   - **提示**：在循环开始处增加 `if file_path.suffix != '.log': continue`。

---

这个学习指南已经优化了排版，采用了清晰的 Markdown 格式，包括表格展示 API、代码块和练习任务。你可以直接保存为 `pathlib_study.md` 文件，方便日常查阅和练习。