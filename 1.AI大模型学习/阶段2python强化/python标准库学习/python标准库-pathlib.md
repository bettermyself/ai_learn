## 概述
`pathlib` 是 Python 3.4 引入的标准库，旨在用面向对象的方式处理文件路径。相比传统的 `os.path`，它语义更清晰，跨平台性更好（自动处理 Windows 的 `\` 和 macOS/Linux 的 `/`）。

以下是 `pathlib` 常用 API 的详解、代码示例以及一个实战小项目。



## 第一部分：常用 API 详解

### 导入核心类
```python
from pathlib import Path
```

### 1. 路径创建与初始化
这是起步操作，用于生成路径对象。

| 方法/属性     | 描述                                         | 示例代码                      |
| ------------- | -------------------------------------------- | ----------------------------- |
| `Path()`      | 默认为当前脚本所在目录                       | `p = Path()`                  |
| `Path('str')` | 传入字符串创建路径                           | `p = Path('/usr/bin/python')` |
| `Path.cwd()`  | 获取当前工作目录 (Current Working Directory) | `cwd = Path.cwd()`            |
| `Path.home()` | 获取当前用户的主目录 (Home)                  | `home = Path.home()`          |

### 2. 路径信息的获取 (拆解路径)
不涉及文件系统操作，仅分析路径字符串本身。

```python
from pathlib import Path

# 假设路径为: /home/user/projects/demo.py (在 Windows 下会自动转换分隔符)
p = Path('/home/user/projects/demo.py')

print(f"文件名: {p.name}")       # demo.py
print(f"主文件名: {p.stem}")      # demo
print(f"扩展名: {p.suffix}")     # .py
print(f"父目录: {p.parent}")     # /home/user/projects
print(f"所有父级: {list(p.parents)}") # [Path('/home/user/projects'), Path('/home/user'), ...]
print(f"路径拆分: {p.parts}")      # ('/', 'home', 'user', 'projects', 'demo.py')
```

### 3. 路径拼接与变换
`pathlib` 最强大的特性之一是支持使用 `/` 运算符拼接路径。

```python
base_dir = Path.home()

# 1. 拼接路径 (推荐用 / 符号)
project_path = base_dir / "Documents" / "PythonCode"
# 等同于: project_path = base_dir.joinpath("Documents", "PythonCode")

# 2. 变换文件名 (不修改实际文件，仅修改路径对象)
new_path = project_path.with_name("config.json")    # 换掉整个文件名
backup_path = new_path.with_suffix(".bak")          # 仅换掉扩展名

print(backup_path) 
# 输出示例: /Users/username/Documents/PythonCode/config.bak
```

### 4. 判断与检查
检查文件是否存在、类型等。

```python
p = Path("example.txt")

if p.exists():              # 路径是否存在
    if p.is_file():         # 是否是文件
        print("It's a file.")
    elif p.is_dir():        # 是否是目录
        print("It's a directory.")
        
# 检查是否是绝对路径
print(p.is_absolute())
```

### 5. 文件读写 (语法糖)
对于简单的文本或字节读写，无需使用 `with open(...)`，`pathlib` 提供了快捷方式。

```python
p = Path("data.txt")

# 写入文本
p.write_text("Hello, Pathlib!", encoding='utf-8')

# 读取文本
content = p.read_text(encoding='utf-8')
print(content)  # Hello, Pathlib!

# 注意：对于大文件或复杂操作，仍建议使用 with p.open('r') as f: ...
```

### 6. 目录操作与遍历
这是文件处理中最常用的功能。

```python
folder = Path.cwd()

# 1. 创建目录
# parents=True: 类似 mkdir -p，如果父目录不存在则一起创建
# exist_ok=True: 如果目录已存在不报错
(folder / "logs" / "2024").mkdir(parents=True, exist_ok=True)

# 2. 遍历目录 (iterdir) - 只遍历当前层级
for item in folder.iterdir():
    print(item.name)

# 3. 模式匹配 (glob) - 非常常用！
# 查找当前目录下所有 .py 文件
py_files = list(folder.glob("*.py"))

# 4. 递归查找 (rglob)
# 查找当前目录及其所有子目录下名为 "config.ini" 的文件
configs = list(folder.rglob("config.ini"))
```

### 7. 文件管理 (重命名、移动、删除)

```python
src = Path("old_name.txt")

# 0. 创建空文件
src.touch()  

# 1. 重命名/移动
# 如果 dest 路径包含新目录，则视为移动；如果在同目录下，视为重命名
dest = Path("archived/new_name.txt")
dest.parent.mkdir(parents=True, exist_ok=True) # 确保目标文件夹存在
src.rename(dest) 

# 2. 删除文件
file_to_del = Path("temp.log")
if file_to_del.exists():
    file_to_del.unlink()  # 删除文件

# 3. 删除目录
dir_to_del = Path("empty_folder")
try:
    dir_to_del.rmdir()  # 只能删除空目录
except OSError:
    print("目录不为空，请使用 shutil.rmtree")
```



## 第二部分：实战小项目 —— 「智能文件分类整理器」

### 项目背景
下载文件夹（Downloads）通常杂乱无章。我们需要编写一个脚本，扫描指定目录，根据文件后缀名（如 .jpg, .pdf, .py）自动将文件移动到对应的分类子文件夹中（如 Images, Docs, Scripts）。

### 功能点
* 定义后缀名到文件夹的映射
* 遍历目标目录
* 自动创建分类文件夹
* 移动文件并处理重名冲突
* 生成整理报告

### 代码实现

```python
import shutil
from pathlib import Path
from datetime import datetime

class FileOrganizer:
    def __init__(self, target_dir):
        # 将输入字符串转换为 Path 对象，并解析为绝对路径
        self.target_dir = Path(target_dir).resolve()
        
        # 定义文件类型映射
        self.extensions_map = {
            'Images':  ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg'],
            'Documents': ['.pdf', '.docx', '.txt', '.xlsx', '.pptx', '.md'],
            'Archives':  ['.zip', '.rar', '.tar', '.gz', '.7z'],
            'Scripts':   ['.py', '.js', '.sh', '.html', '.css'],
            'Executables': ['.exe', '.msi', '.dmg', '.app']
        }
        
        # 反转映射：将后缀名指向文件夹，方便查找
        # 结果示例: {'.jpg': 'Images', '.pdf': 'Documents', ...}
        self.ext_to_folder = {}
        for folder, exts in self.extensions_map.items():
            for ext in exts:
                self.ext_to_folder[ext.lower()] = folder

    def organize(self):
        """执行整理逻辑"""
        if not self.target_dir.exists():
            print(f"错误: 目录 {self.target_dir} 不存在")
            return

        print(f"正在整理目录: {self.target_dir} ...")
        stats = {'moved': 0, 'skipped': 0, 'errors': 0}

        # 遍历目录下所有项目
        for item in self.target_dir.iterdir():
            # 忽略目录本身和隐藏文件
            if item.is_dir() or item.name.startswith('.'):
                continue

            # 获取文件后缀 (转换为小写)
            file_ext = item.suffix.lower()

            # 查找该后缀对应的分类文件夹
            # dict.get(key, default) -> 如果没找到，放入 'Others' 文件夹
            folder_name = self.ext_to_folder.get(file_ext, 'Others')

            # 构建目标文件夹路径
            dest_folder = self.target_dir / folder_name
            
            try:
                # 核心操作：创建目录 (如果已存在则忽略)
                dest_folder.mkdir(exist_ok=True)
                
                # 构建目标文件路径
                dest_path = dest_folder / item.name

                # 处理重名：如果目标文件已存在，添加时间戳
                if dest_path.exists():
                    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
                    new_name = f"{item.stem}_{timestamp}{item.suffix}"
                    dest_path = dest_folder / new_name

                # 移动文件 (使用 shutil.move 比 path.rename 更健壮，可以跨磁盘移动)
                shutil.move(str(item), str(dest_path))
                print(f"[移动] {item.name} -> {folder_name}/")
                stats['moved'] += 1

            except Exception as e:
                print(f"[错误] 无法移动 {item.name}: {e}")
                stats['errors'] += 1

        print("-" * 30)
        print(f"整理完成! 成功移动: {stats['moved']}, 错误: {stats['errors']}")

# --- 使用示例 ---
if __name__ == "__main__":
    # 1. 创建一个测试用的乱序文件夹 (为了演示，我们先自动生成一些假文件)
    demo_dir = Path("demo_messy_folder")
    demo_dir.mkdir(exist_ok=True)
    
    # 创建一些假文件
    (demo_dir / "photo.jpg").touch()
    (demo_dir / "resume.pdf").touch()
    (demo_dir / "script.py").touch()
    (demo_dir / "unknown_file.xyz").touch()
    
    # 2. 实例化并运行整理器
    organizer = FileOrganizer("demo_messy_folder")
    organizer.organize()
```



## 总结

### pathlib 的核心记忆点
* **一切皆对象**：所有的路径都是对象，不再是字符串
* **/ 操作符**：像拼积木一样拼接路径
* **链式调用**：`p.resolve().parent.name` 这样的写法非常顺滑
* **glob 查找**：相比 `os.walk`，`glob` 和 `rglob` 通常更直观
