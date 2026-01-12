## 概述
os 模块是 Python 标准库中与操作系统交互的核心模块。它提供了通用的接口，让你在编写代码时可以跨平台（Windows, Linux, Mac）处理文件、目录和进程。

以下是 os 模块核心 API 的详解、代码示例，以及一个实战小项目。



## 一、系统环境与信息 (System Info)
这部分 API 用于获取当前运行环境的信息。

| API              | 说明                                                 |
| ---------------- | ---------------------------------------------------- |
| `os.name`        | 获取操作系统类型 (nt 为 Windows, posix 为 Linux/Mac) |
| `os.environ`     | 获取系统环境变量                                     |
| `os.getenv(key)` | 获取指定环境变量的值                                 |
| `os.cpu_count()` | 获取 CPU 核心数 (常用于多进程编程)                   |
| `os.sep`         | 路径分隔符 (Win是 `\`, Linux/Mac是 `/`)              |

**代码示例：**

```python
import os

print(f"操作系统类型: {os.name}")
print(f"CPU 核心数: {os.cpu_count()}")
print(f"路径分隔符: {os.sep}")

# 获取环境变量，例如获取 PATH
path_env = os.getenv('PATH')
print(f"PATH 环境变量片段: {path_env[:50]}...") # 只打印前50个字符
```



## 二、目录操作 (Directory Management)

用于导航、创建和删除目录。

| API                   | 说明                                                 |
| :-------------------- | :--------------------------------------------------- |
| `os.getcwd()`         | 获取当前工作目录 (Get Current Working Directory)     |
| `os.chdir(path)`      | 改变当前工作目录 (Change Directory)                  |
| `os.listdir(path)`    | 列出指定目录下的所有文件和文件夹名称 (返回列表)      |
| `os.mkdir(path)`      | 创建单级目录 (如果父目录不存在会报错)                |
| `os.makedirs(path)`   | 递归创建多级目录 (推荐使用，类似于 Linux `mkdir -p`) |
| `os.rmdir(path)`      | 删除空目录                                           |
| `os.removedirs(path)` | 递归删除多级空目录                                   |

**代码示例：**

```python
import os

# 1. 获取当前路径
current_path = os.getcwd()
print(f"当前工作目录: {current_path}")

# 2. 列出当前目录下的内容
print(f"目录内容: {os.listdir('.')}")

# 3. 创建目录
target_dir = "test_folder/sub_folder"
try:
    # exist_ok=True 表示如果目录已存在不报错
    os.makedirs(target_dir, exist_ok=True) 
    print(f"目录 '{target_dir}' 创建成功")
except Exception as e:
    print(f"创建失败: {e}")

# 4. 删除目录 (注意：rmdir 只能删除空目录)
try:
    os.rmdir(target_dir) # 删除最内层的 sub_folder
    print("子目录删除成功")
except OSError as e:
    print(f"删除失败 (目录可能非空): {e}")

# 创建多级目录用于演示
test_dir = "parent/child/grandchild"
os.makedirs(test_dir, exist_ok=True)
try:
    # 注意：os.removedirs() 会从最内层的空目录开始删除，然后递归向上删除空目录
    # 根据 Python 官方文档，os.removedirs(path) 的工作方式是：
	# 首先删除 path 指定的目录（如果它是空的）
	# 然后递归向上删除每个空的父目录
	# 但是会在遇到非空目录时停止
    os.removedirs(test_dir)
    print(f"成功删除目录: {test_dir}")
    print(f"grandchild 目录是否存在: {os.path.exists(test_dir)}")
    print(f"child 目录是否存在: {os.path.exists('parent/child')}")
    print(f"parent 目录是否存在: {os.path.exists('parent')}")
except OSError as e:
    print(f"删除失败: {e}")
```



## 三、文件操作 (File Management)

用于重命名、删除文件。

> **注意：** os 模块没有直接复制文件的函数，复制通常使用 shutil 模块。

| API                    | 说明                                |
| :--------------------- | :---------------------------------- |
| `os.remove(path)`      | 删除文件 (不能删除目录)             |
| `os.rename(src, dst)`  | 重命名文件或目录                    |
| `os.replace(src, dst)` | 重命名并覆盖目标 (原子操作，更安全) |
| `os.stat(path)`        | 获取文件属性 (大小、创建时间等)     |

**代码示例：**

```python
import os

file_name = "demo_test.txt"

# 创建一个测试文件
with open(file_name, 'w') as f:
    f.write("Hello OS module")

# 1. 获取文件属性
file_info = os.stat(file_name)
print(f"文件大小: {file_info.st_size} bytes")

# 2. 重命名
new_name = "demo_renamed.txt"
os.rename(file_name, new_name)
print(f"文件已重命名为: {new_name}")

# 3. 删除文件
os.remove(new_name)
print("文件已删除")
```



## 四、路径处理 (os.path Submodule)

这是 os 模块中最常用的部分，用于处理文件路径字符串，强烈建议使用它来拼接路径以保证跨平台兼容性。

| API                      | 说明                                |
| :----------------------- | :---------------------------------- |
| `os.path.join(p1, p2)`   | 拼接路径 (自动处理不同系统的分隔符) |
| `os.path.abspath(path)`  | 获取绝对路径                        |
| `os.path.exists(path)`   | 判断路径是否存在                    |
| `os.path.isfile(path)`   | 判断是否为文件                      |
| `os.path.isdir(path)`    | 判断是否为目录                      |
| `os.path.split(path)`    | 将路径拆分为 (目录, 文件名) 元组    |
| `os.path.splitext(path)` | 将路径拆分为 (文件名, 扩展名) 元组  |
| `os.path.basename(path)` | 获取文件名                          |
| `os.path.dirname(path)`  | 获取目录路径                        |

**代码示例：**

```python
import os

path_str = "data/users/info.json"

# 1. 路径拼接 (最常用!)
full_path = os.path.join(os.getcwd(), "data", "users", "info.json")
print(f"拼接后的绝对路径: {full_path}")

# 2. 分离扩展名 (常用于判断文件类型)
file_name, ext = os.path.splitext(path_str)
print(f"文件名: {file_name}, 后缀: {ext}")

# 3. 判断检查
if not os.path.exists(full_path):
    print("路径不存在")
```



## 五、目录树遍历 (os.walk)

`os.walk()` 是一个强大的生成器，用于递归遍历目录树。它会产生一个三元组 `(root, dirs, files)`。

**代码示例：**

```python
import os

# 假设我们需要遍历当前目录
target_path = "." 

for root, dirs, files in os.walk(target_path):
    print(f"正在扫描目录: {root}")
    # print(f"  该目录下子文件夹: {dirs}")
    # print(f"  该目录下文件: {files}")
    
    for file in files:
        if file.endswith('.py'):
            print(f"发现 Python 文件: {os.path.join(root, file)}")
```



## 六、实战项目：自动化文件整理器 (File Organizer)

### 项目背景：

你的 Downloads 文件夹通常乱七八糟。我们需要编写一个脚本，自动扫描指定目录，根据文件后缀名（图片、文档、代码），将它们移动到对应的子文件夹中。

### 主要用到的 API：

`os.listdir`, `os.path.splitext`, `os.path.join`, `os.makedirs`, `os.replace` (或 `shutil.move`)。

### 项目代码：

```python
import os
import shutil

def organize_directory(target_dir):
    """
    根据文件后缀名整理目录
    """
    # 1. 检查目标目录是否存在
    if not os.path.exists(target_dir):
        print(f"错误: 目录 '{target_dir}' 不存在")
        return

    # 定义文件类型映射规则
    extension_map = {
        'Images': ['.jpg', '.jpeg', '.png', '.gif', '.bmp'],
        'Documents': ['.pdf', '.docx', '.txt', '.xlsx', '.pptx'],
        'Code': ['.py', '.java', '.cpp', '.html', '.js'],
        'Archives': ['.zip', '.rar', '.tar', '.gz'],
        'Others': [] # 无法识别的放这里
    }

    print(f"开始整理: {target_dir} ...")

    # 2. 遍历目录下的所有项目
    # 注意：这里只处理顶层文件，不递归处理子目录，所以用 listdir 而不是 walk
    for item in os.listdir(target_dir):
        item_path = os.path.join(target_dir, item)

        # 3. 如果是文件夹，跳过
        if os.path.isdir(item_path):
            continue
        
        # 4. 获取文件后缀
        _, ext = os.path.splitext(item)
        ext = ext.lower() # 统一转小写

        # 5. 确定目标文件夹名称
        destination_folder = 'Others'
        for folder_name, extensions in extension_map.items():
            if ext in extensions:
                destination_folder = folder_name
                break
        
        # 6. 创建目标子目录
        target_sub_folder = os.path.join(target_dir, destination_folder)
        if not os.path.exists(target_sub_folder):
            os.makedirs(target_sub_folder)
            print(f"  已创建文件夹: {destination_folder}")

        # 7. 移动文件
        dst_path = os.path.join(target_sub_folder, item)
        try:
            shutil.move(item_path, dst_path) # 使用 shutil.move 跨文件系统更安全
            print(f"  [移动] {item} -> {destination_folder}/")
        except Exception as e:
            print(f"  [错误] 移动 {item} 失败: {e}")

    print("整理完成！")

# --- 使用示例 ---
if __name__ == "__main__":
    # ⚠️ 请将此处路径改为你想要整理的实际测试路径，例如 'C:/Users/Name/Downloads/Test'
    # 为了演示，我在当前目录下创建一个 dummy_data 目录来模拟
    
    test_dir = "dummy_downloads"
    os.makedirs(test_dir, exist_ok=True)
    
    # 创建一些假文件用于测试
    with open(os.path.join(test_dir, "photo.jpg"), 'w') as f: f.write("img")
    with open(os.path.join(test_dir, "report.pdf"), 'w') as f: f.write("doc")
    with open(os.path.join(test_dir, "script.py"), 'w') as f: f.write("code")
    
    # 运行整理
    organize_directory(test_dir)
```

