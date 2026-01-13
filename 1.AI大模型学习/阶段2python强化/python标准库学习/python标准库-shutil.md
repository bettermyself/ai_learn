shutil（Shell Utilities）是 Python 标准库中用于高级文件操作的模块。与基础的 os 模块不同，shutil 更侧重于复制、移动、重命名以及打包/解包整个目录树，类似于你在命令行中使用的 `cp -r`、`mv`、`rm -rf` 等命令。

以下是为你整理的 shutil 核心 API 详解及实战项目。

## 第一部分：常用 API 详解

为了方便记忆，我将 API 分为四类：文件复制、目录操作、移动与删除、归档压缩。

### 1. 文件复制 (Copy Operations)

这是面试和实际开发中最容易混淆的部分，区别在于**元数据（权限、时间戳）**的保留程度。

| API 方法                  | 描述                  | 是否保留权限 | 是否保留元数据(时间) | 适用场景                   |
| ------------------------- | --------------------- | ------------ | -------------------- | -------------------------- |
| `copyfile(src, dst)`      | 仅复制内容            | ❌            | ❌                    | 只要内容，不关心属性       |
| `copy(src, dst)`          | 复制内容 + 权限       | ✅            | ❌                    | 相当于 Linux `cp` 命令     |
| `copy2(src, dst)`         | 复制内容 + 所有元数据 | ✅            | ✅                    | 最常用，完整备份 (`cp -p`) |
| `copyfileobj(fsrc, fdst)` | 复制文件对象流        | -            | -                    | 处理大文件或网络流         |

**代码示例：**

```python
import shutil
import os
import time

# 准备测试文件
with open('source.txt', 'w') as f:
    f.write('Hello Shutil!')

# 1. shutil.copyfile: 仅复制内容
# 目标 dst 可以是文件名，不能是目录
shutil.copyfile('source.txt', 'target_content_only.txt')

# 2. shutil.copy: 复制内容 + 权限 (Unix下常用)
# 目标 dst 可以是目录
os.mkdir('backup_dir')
shutil.copy('source.txt', 'backup_dir') 

# 3. shutil.copy2: 完整克隆 (包括创建时间、修改时间)
shutil.copy2('source.txt', 'target_clone.txt')

# 验证时间戳
src_stat = os.stat('source.txt')
dst_stat = os.stat('target_clone.txt')
print(f"源文件修改时间: {src_stat.st_mtime}")
print(f"Copy2 文件修改时间: {dst_stat.st_mtime}") # 应该与源文件一致
```

### 2. 目录操作 (Directory Operations)

处理整个文件夹（递归操作）是 shutil 的强项。

- **`shutil.copytree(src, dst, dirs_exist_ok=False, ignore=None)`**
    - 递归复制整个目录树。
    - `dirs_exist_ok=True` (Python 3.8+): 允许目标目录已存在（类似覆盖合并）。
    - `ignore`: 可以配合 `shutil.ignore_patterns` 忽略特定文件（如 `.pyc`, `.git`）。

**代码示例：**

```python
import shutil
import os

# 创建一个模拟的项目结构
os.makedirs('project/src', exist_ok=True)
os.makedirs('project/logs', exist_ok=True)
with open('project/src/main.py', 'w') as f: f.write('print("main")')
with open('project/src/temp.pyc', 'w') as f: f.write('binary data') # 需要忽略的文件

# 复制整个项目，但忽略 .pyc 文件
# 目标目录 'project_backup' 必须不存在 (除非设置 dirs_exist_ok=True)
shutil.copytree(
    'project', 
    'project_backup',
    ignore=shutil.ignore_patterns('*.pyc', 'logs') # 忽略 pyc 文件和 logs 文件夹
)

print("备份完成，检查 project_backup 中是否没有 .pyc 文件")
```

### 3. 移动与删除 (Move & Delete)

- **`shutil.move(src, dst)`**: 递归移动文件或目录（相当于重命名或剪切）。
- **`shutil.rmtree(path)`**: 危险操作。递归删除目录树（相当于 `rm -rf`）。`os.remove` 只能删文件，`os.rmdir` 只能删空目录，而 `rmtree` 可以删除一切。

**代码示例：**

```python
import shutil
import os

# 1. 移动/重命名
shutil.move('target_clone.txt', 'final_version.txt')

# 2. 递归删除
try:
    # 无论目录是否为空，直接删除
    shutil.rmtree('project_backup') 
    print("备份目录已彻底删除")
except OSError as e:
    print(f"删除失败: {e}")
```

### 4. 归档与压缩 (Archiving)

shutil 提供了极其简便的高层接口来处理 zip 和 tar 包，不需要去学 zipfile 或 tarfile 的底层用法。

- **`shutil.make_archive(base_name, format, root_dir)`**: 创建压缩包。
- **`shutil.unpack_archive(filename, extract_dir)`**: 解压。
- **`shutil.disk_usage(path)`**: 查看磁盘使用情况。

**代码示例：**

```python
import shutil

# 1. 压缩
# 将 'project' 文件夹压缩为 'my_archive.zip'
# format 可选: 'zip', 'tar', 'gztar', 'bztar'
shutil.make_archive('my_archive', 'zip', root_dir='project')

# 2. 解压
shutil.unpack_archive('my_archive.zip', 'unpacked_project')

# 3. 查看磁盘空间
total, used, free = shutil.disk_usage(".")
print(f"当前磁盘剩余空间: {free // (2**30)} GB")
```

## 第二部分：实战项目

### 项目名称：自动文件分类整理与备份工具

**场景：**

你的“下载”文件夹（Downloads）非常杂乱，里面混合了图片、文档、安装包等。你需要一个脚本，一键完成以下工作：

1. **分类**：将文件按扩展名移动到 Images, Docs, Apps 等子文件夹。
2. **备份**：将整理好的文件夹打包成 zip 备份，并在文件名中加上当天的日期。
3. **清理**：（可选）删除原始的临时文件。

**代码实现：**

```python
import os
import shutil
import datetime
from pathlib import Path

class FileOrganizer:
    def __init__(self, target_dir):
        self.target_dir = Path(target_dir)
        if not self.target_dir.exists():
            raise FileNotFoundError(f"目录 {target_dir} 不存在")
        
        # 定义文件类型映射
        self.extensions = {
            'Images': ['.jpg', '.jpeg', '.png', '.gif', '.bmp'],
            'Documents': ['.pdf', '.docx', '.txt', '.xlsx', '.pptx', '.md'],
            'Archives': ['.zip', '.rar', '.tar', '.gz'],
            'Scripts': ['.py', '.sh', '.js']
        }

    def organize(self):
        """核心逻辑：遍历并移动文件"""
        print(f"正在整理目录: {self.target_dir}")
        
        # 遍历目录下所有项
        for item in self.target_dir.iterdir():
            if item.is_file():
                # 获取文件后缀
                ext = item.suffix.lower()
                
                # 查找对应的分类文件夹
                dest_folder_name = 'Others' # 默认分类
                for category, ext_list in self.extensions.items():
                    if ext in ext_list:
                        dest_folder_name = category
                        break
                
                # 创建目标路径 (例如: Downloads/Images)
                dest_path = self.target_dir / dest_folder_name
                dest_path.mkdir(exist_ok=True)
                
                # 使用 shutil.move 移动文件
                try:
                    # shutil.move 支持跨文件系统移动
                    shutil.move(str(item), str(dest_path / item.name))
                    print(f"  [移动] {item.name} -> {dest_folder_name}/")
                except Exception as e:
                    print(f"  [错误] 无法移动 {item.name}: {e}")

    def backup(self, output_dir):
        """核心逻辑：使用 make_archive 创建带时间戳的备份"""
        date_str = datetime.datetime.now().strftime("%Y%m%d")
        base_name = f"Backup_{self.target_dir.name}_{date_str}"
        output_path = Path(output_dir) / base_name
        
        print(f"\n正在创建备份: {output_path}.zip ...")
        
        try:
            # make_archive 返回生成的压缩包完整路径
            archive_name = shutil.make_archive(
                base_name=str(output_path), 
                format='zip', 
                root_dir=self.target_dir
            )
            print(f"✅ 备份成功: {archive_name}")
            return archive_name
        except Exception as e:
            print(f"❌ 备份失败: {e}")
            return None

# --- 模拟运行 ---
if __name__ == "__main__":
    # 1. 创建一个模拟的混乱目录
    demo_dir = Path("Demo_Downloads")
    demo_dir.mkdir(exist_ok=True)
    
    # 创建一些假文件
    (demo_dir / "photo.jpg").touch()
    (demo_dir / "report.pdf").touch()
    (demo_dir / "script.py").touch()
    (demo_dir / "unknown.xyz").touch()
    
    print("--- 环境准备完成，开始执行任务 ---")

    # 2. 初始化工具
    organizer = FileOrganizer(target_dir="Demo_Downloads")
    
    # 3. 执行整理
    organizer.organize()
    
    # 4. 执行备份 (备份到当前目录)
    organizer.backup(output_dir=".")
    
    print("\n--- 演示结束，你可以检查 Demo_Downloads 文件夹和生成的 Zip 包 ---")
```

## 关键点总结

1. **`shutil.move`**: 比 `os.rename` 强大，因为如果目标在不同的磁盘分区，`os.rename` 会失败，而 `shutil.move` 会自动处理“复制+删除”的过程。
2. **`shutil.make_archive`**: 一行代码解决了复杂的目录递归压缩问题。
3. **配合 pathlib**: 代码中使用了 `pathlib.Path`，这是 Python 3 面向对象的文件路径处理库，配合 shutil 使用非常优雅。
