Python 的 argparse 是处理命令行参数的标准库，功能强大且无需安装第三方包。掌握它，你可以写出像 git 或 docker 那样专业的命令行工具。

## 第一部分：核心工作流

使用 argparse 通常分为四步：

1. 创建解析器 (ArgumentParser)
2. 添加参数 (add_argument)
3. 解析参数 (parse_args)
4. 使用参数 (从解析结果中读取)

最简单的骨架：

```python
import argparse

# 1. 创建解析器
parser = argparse.ArgumentParser(description="这是一个演示程序")

# 2. 添加参数
parser.add_argument("name", help="输入你的名字")

# 3. 解析参数
args = parser.parse_args()

# 4. 使用参数
print(f"你好, {args.name}!")
```

## 第二部分：常用 API 详解与示例

我们将重点放在 add_argument() 方法的各种参数配置上。

### 1. 位置参数 (Positional Arguments)

这是必须提供的参数，不需要带前缀（如 - 或 --）。

```python
parser.add_argument("filename", help="需要处理的文件名")
# 运行: python script.py data.txt
# 访问: args.filename -> "data.txt"
```

### 2. 可选参数 (Optional Arguments)

通常用于标志或配置，使用 - (短参数) 或 -- (长参数)。

```python
# 这两个选项指向同一个参数
parser.add_argument("-v", "--verbose", help="开启详细模式")
# 运行: python script.py --verbose
# 注意：默认情况下，如果不传该参数，值为 None
```

### 3. 参数类型 (type)

默认输入都是字符串。使用 type 可以自动进行类型转换与验证。

```python
parser.add_argument("--count", type=int, help="输入次数")
parser.add_argument("--scale", type=float, help="缩放比例")
# 运行: python script.py --count 5
# 访问: args.count -> 5 (整型，而不是 "5")
# 如果输入 "abc"，程序会自动报错并退出
```

### 4. 默认值 (default)

如果用户没有在命令行提供该参数，则使用此值。

```python
parser.add_argument("--port", type=int, default=8080, help="服务端口")
# 运行: python script.py
# 访问: args.port -> 8080
```

### 5. 必填的可选参数 (required)

虽然逻辑上矛盾（"必填"的"可选"参数），但有时我们需要用户必须使用 --file 这样的标志。

```python
parser.add_argument("--config", required=True, help="配置文件路径")
# 如果不传 --config，程序会报错退出
```

### 6. 布尔开关与计数 (action)

最常用的参数之一，用于处理不需要值的标志（Flag）。

- `store_true` / `store_false`: 出现即为 True/False。
- `count`: 统计出现次数 (如 -vvv)。

```python
# 出现 --enable 即为 True，否则为 False
parser.add_argument("--enable", action="store_true", help="启用功能")

# 统计 -v 出现的次数
parser.add_argument("-v", action="count", default=0, help="日志级别")
# 运行: python script.py -vvv
# 访问: args.v -> 3
```

### 7. 限定可选值 (choices)

限制用户只能输入特定的几个值之一。

```python
parser.add_argument("--mode", choices=['train', 'test', 'val'], help="运行模式")
# 运行: python script.py --mode debug -> 报错：invalid choice
```

### 8. 参数个数 (nargs)

控制一个参数后面可以跟多少个值。

- `N`: 具体的数字（如 2）。
- `+`: 至少一个（生成列表）。
- `*`: 零个或多个（生成列表）。
- `?`: 零个或一个。

```python
parser.add_argument("--files", nargs="+", help="上传多个文件")
# 运行: python script.py --files a.txt b.txt c.txt
# 访问: args.files -> ['a.txt', 'b.txt', 'c.txt']
```

### 9. 变量名与显示名 (dest & metavar)

- `dest`: 代码中访问属性的名字（args.xxx）。
- `metavar`: 帮助信息中显示的占位符名字。

```python
parser.add_argument("--out", dest="output_file", metavar="FILE", help="输出文件")
# 运行: python script.py --out result.txt
# 访问: args.output_file -> "result.txt"
# 帮助显示: --out FILE   输出文件
```

### 10. 子命令 (add_subparsers)

像 git commit 和 git clone 这样根据第一个参数不同执行完全不同逻辑的功能。

```python
subparsers = parser.add_subparsers(dest="command", help="子命令")

# 子命令 1: install
parser_install = subparsers.add_parser("install", help="安装包")
parser_install.add_argument("pkg_name")

# 子命令 2: list
parser_list = subparsers.add_parser("list", help="列出包")
parser_list.add_argument("-a", action="store_true")

# 运行: python script.py install numpy
# 访问: args.command -> "install", args.pkg_name -> "numpy"
```

## 第三部分：实战小项目 —— "CLI 文本处理器"

我们将编写一个名为 text_tool.py 的工具。它能够读取文件，进行统计或大小写转换，并支持将结果输出到新文件。

### 功能需求：

- 接收一个输入文件（位置参数）。
- 选择操作模式：stats（统计信息）或 convert（内容转换）。
- 如果是 convert 模式，支持 --upper 转大写或 --reverse 反转文本。
- 支持 -o/--output 将结果保存到文件。
- 支持 -v 显示处理过程。

### 项目代码 (text_tool.py)

```python
import argparse
import sys
import os

def main():
    # 1. 初始化解析器
    parser = argparse.ArgumentParser(
        prog="TextTool",
        description="一个简单的命令行文本处理工具",
        epilog="感谢使用 TextTool!"
    )

    # 全局参数
    parser.add_argument("filename", help="要处理的源文件路径")
    parser.add_argument("-v", "--verbose", action="store_true", help="显示详细处理日志")
    parser.add_argument("-o", "--output", help="结果输出文件 (默认打印到控制台)")

    # 创建子命令处理器
    subparsers = parser.add_subparsers(dest="command", required=True, help="操作模式")

    # --- 子命令: stats (统计) ---
    parser_stats = subparsers.add_parser("stats", help="统计文件信息")
    # stats 模式不需要额外参数，但为了演示，我们可以加一个
    parser_stats.add_argument("--count-words", action="store_true", help="仅统计单词数")

    # --- 子命令: convert (转换) ---
    parser_convert = subparsers.add_parser("convert", help="转换文件内容")
    # 创建一个互斥组 (不能同时选转大写和反转)
    group = parser_convert.add_mutually_exclusive_group(required=True)
    group.add_argument("--upper", action="store_true", help="转换为大写")
    group.add_argument("--lower", action="store_true", help="转换为小写")
    group.add_argument("--reverse", action="store_true", help="反转文本内容")

    # 2. 解析参数
    # 如果没有参数，打印帮助并退出
    # sys.argv[0] 是程序本身的名称，当 len(sys.argv) == 1 时，表示没有传递任何命令行参数
    if len(sys.argv) == 1:
        parser.print_help()
        sys.exit(1)
        
    args = parser.parse_args()

    # 3. 业务逻辑
    if args.verbose:
        print(f"[Log] 正在读取文件: {args.filename}")

    if not os.path.exists(args.filename):
        print(f"错误: 文件 '{args.filename}' 不存在。")
        sys.exit(1)

    try:
        with open(args.filename, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"读取错误: {e}")
        sys.exit(1)

    result = ""

    # 处理 stats 模式
    if args.command == "stats":
        lines = len(content.splitlines())
        words = len(content.split())
        chars = len(content)
        
        if args.count_words:
            result = f"单词数: {words}"
        else:
            result = (f"--- 统计信息 ---\n"
                      f"行数: {lines}\n"
                      f"单词: {words}\n"
                      f"字符: {chars}")

    # 处理 convert 模式
    elif args.command == "convert":
        if args.verbose:
            print("[Log] 正在进行内容转换...")
            
        if args.upper:
            result = content.upper()
        elif args.lower:
            result = content.lower()
        elif args.reverse:
            result = content[::-1]

    # 4. 输出结果
    if args.output:
        if args.verbose:
            print(f"[Log] 正在写入结果到: {args.output}")
        with open(args.output, 'w', encoding='utf-8') as f:
            f.write(result)
        print("处理完成。")
    else:
        print("\n" + result + "\n")

if __name__ == "__main__":
    main()
```

### 如何测试运行

假设你有一个文件 sample.txt，内容为 "Hello World"：

- 查看帮助：
  ```bash
  python text_tool.py -h
  python text_tool.py convert -h
  ```

- 统计信息：
  ```bash
  python text_tool.py sample.txt stats
  ```

- 转大写并显示日志：
  ```bash
  python text_tool.py sample.txt -v convert --upper
  ```

- 反转文本并保存到文件：
  ```bash
  python text_tool.py sample.txt -o result.txt convert --reverse
  ```

## 总结

argparse 的核心在于定义预期。只要你清晰地通过 add_argument 告诉程序你需要什么样的数据，argparse 就会自动帮你处理解析、类型转换、错误提示和帮助文档的生成。
