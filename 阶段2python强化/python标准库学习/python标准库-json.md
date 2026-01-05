JSON（JavaScript Object Notation）是目前互联网最通用的轻量级数据交换格式。Python 的 `json` 库是处理 API 数据、配置文件和跨语言数据传输的核心工具。

## 1. 核心概念与类型映射

在开始写代码前，理解 Python 数据类型与 JSON 标准类型之间的映射关系至关重要。

| Python 类型     | JSON 类型   | 备注                  |
| --------------- | ----------- | --------------------- |
| `dict`          | object      | JSON 的键必须是字符串 |
| `list`, `tuple` | array       | 元组会被转换为数组    |
| `str`           | string      | 必须双引号            |
| `int`, `float`  | number      |                       |
| `True`, `False` | true, false | 首字母大小写转换      |
| `None`          | null        |                       |

> **注意**：JSON 不支持 Python 的 `set`（集合）和 `datetime`（日期时间）对象，直接转换会报错，需要特殊处理（见进阶部分）。



## 2. 基础操作：四字真言

`json` 模块的核心功能由四个函数组成，记住 **"s" 代表 string (字符串)** 即可区分内存操作和文件操作。

### 2.1 内存操作（字符串转换）

适用于 API 请求/响应处理。

- **`json.dumps(obj)`**：序列化（Python → JSON 字符串）
- **`json.loads(json_str)`**：反序列化（JSON 字符串 → Python）

```python
import json

# 1. Python 对象
data = {
    "name": "Gemini",
    "version": 1.5,
    "is_ai": True,
    "skills": ["coding", "writing"],
    "meta": None
}

# 2. 序列化：转为 JSON 字符串
# ensure_ascii=False 是为了让中文正常显示，而不是显示 \uXXXX
json_str = json.dumps(data, ensure_ascii=False)
print(f"JSON 类型: {type(json_str)}")
print(f"JSON 内容: {json_str}")

# 3. 反序列化：转回 Python 字典
python_obj = json.loads(json_str)
print(f"Python 类型: {type(python_obj)}")
print(f"技能列表: {python_obj['skills']}")
```

### 2.2 文件操作（读写文件）

适用于处理配置文件或本地数据存储。

- **`json.dump(obj, fp)`**：写入文件
- **`json.load(fp)`**：读取文件

```python
import json

data = {"config": "dark_mode", "user_id": 1024}

# 1. 写入文件 (Dump)
with open("settings.json", "w", encoding="utf-8") as f:
    json.dump(data, f)

# 2. 读取文件 (Load)
with open("settings.json", "r", encoding="utf-8") as f:
    loaded_data = json.load(f)

print(loaded_data['config'])  # 输出: dark_mode
```



## 3. 进阶技巧：写出专业的 JSON

### 3.1 美化输出（Pretty Print）

在调试或生成配置文件时，单行的 JSON 难以阅读。使用 `indent` 参数。

```python
# indent=4 表示缩进4个空格
# sort_keys=True 表示按键的字母顺序排序，保证输出确定性
pretty_json = json.dumps(data, indent=4, sort_keys=True, ensure_ascii=False)
print(pretty_json)
```

**输出效果：**
```json
{
    "config": "dark_mode",
    "user_id": 1024
}
```

### 3.2 处理复杂对象（如日期、自定义类）

默认情况下，`json` 无法处理 `datetime` 或自定义 `Class`。我们需要指定 `default` 参数或自定义 Encoder。

**场景：处理日期时间**

```python
import json
from datetime import datetime

data = {
    "task": "Learn Python",
    "created_at": datetime.now()  # datetime 对象默认不可序列化
}

# 方法 1：使用 default 参数（最简单）
# 如果类型无法识别，尝试调用 str() 函数转换
json_str = json.dumps(data, default=str, indent=2)

# 方法 2：自定义处理逻辑（更灵活）
def custom_serializer(obj):
    if isinstance(obj, datetime):
        return obj.strftime('%Y-%m-%d %H:%M:%S')
    raise TypeError("Type not serializable")

json_str_custom = json.dumps(data, default=custom_serializer)
```

### 3.3 容错处理

在解析不可靠的 JSON 数据时，务必捕获异常。

```python
bad_json = '{"name": "Gemini", "age": }'  # 格式错误的 JSON

try:
    data = json.loads(bad_json)
except json.JSONDecodeError as e:
    print(f"解析失败: {e.msg}")
    print(f"错误位置: 行 {e.lineno}, 列 {e.colno}")
```



## 4. 常见陷阱与最佳实践

- **Key 的类型**  Python 字典允许 `tuple` 或 `int` 作为 Key，但 JSON 只允许 `string`。
  
  ```python
  d = {1: "a", 2: "b"}
  j = json.dumps(d) 
  # 结果: '{"1": "a", "2": "b"}' -> Key 被自动转为字符串了！
  # 如果再 load 回来，Key 依然是字符串 "1"，而不是整数 1。这是一个常见的 Bug 来源。
  ```

- **中文处理**  永远记得在 `dump/dumps` 时加上 `ensure_ascii=False`，否则中文会被转换成 `\u6d4b\u8bd5` 这样的 Unicode 转义字符，不利于阅读。
  
- **单引号与双引号**  标准的 JSON 必须使用双引号 (`"`)。Python 的单引号字符串 `'key'` 在 JSON 中是非法的。如果你手动拼接字符串生成 JSON，极易出错，请务必使用 `json.dumps()`。
  
- **性能考量**  对于极大数据量的处理（如几百 MB 的 JSON），Python 标准库的 `json` 速度中规中矩。如果在高性能场景下（如高并发 Web 服务），可以考虑第三方库如 `orjson` 或 `ujson`，它们 API 兼容但速度快得多。



## 5. 总结速查表

| 场景                 | 函数                | 记忆口诀         |
| -------------------- | ------------------- | ---------------- |
| Python → JSON 字符串 | `json.dumps(obj)`   | Dump to String   |
| JSON 字符串 → Python | `json.loads(s)`     | Load from String |
| Python → JSON 文件   | `json.dump(obj, f)` | Dump to File     |
| JSON 文件 → Python   | `json.load(f)`      | Load from File   |



## 6. JSON项目：命令行记账本 (CLI Expense Tracker)

这是一个非常适合练手的实战项目，涵盖了数据持久化、读取历史记录、数据结构转换以及错误处理，是掌握 `json` 模块的最佳实践。

### 项目简介：简易命令行记账本

#### 功能描述

- 程序启动时，自动读取本地的 `data.json` 文件
- 用户可以添加一笔消费（包含：金额、类别、描述、时间）
- 用户可以查看所有消费记录
- 用户可以统计总消费金额
- 程序退出时或每次操作后，自动将数据保存回文件

### 完整代码 (expense_manager.py)

```python
import json
import os
from datetime import datetime

# 定义数据文件名
DATA_FILE = "expenses.json"

def load_data():
    """从文件中读取 JSON 数据"""
    # 如果文件不存在或损坏，返回一个空列表
    if not os.path.exists(DATA_FILE):
        return []
    
    try:
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            # 核心操作：反序列化 (File -> Python List)
            return json.load(f)
    except (json.JSONDecodeError, IOError):
        print("⚠️ 数据文件损坏或为空，已重置数据。")
        return []

def save_data(data):
    """将 Python 列表写入 JSON 文件"""
    try:
        with open(DATA_FILE, 'w', encoding='utf-8') as f:
            # 核心操作：序列化 (Python List -> File)
            # ensure_ascii=False 保证中文正常显示
            # indent=4 让文件内容排版美观，方便人类阅读
            json.dump(data, f, ensure_ascii=False, indent=4)
        print("✅ 数据已保存。")
    except IOError as e:
        print(f"❌ 保存失败: {e}")

def add_expense(expenses):
    """添加一笔新消费"""
    try:
        amount = float(input("请输入金额: "))
        category = input("请输入类别 (如餐饮/交通): ")
        desc = input("请输入备注: ")
        
        # 构造一个字典对象
        record = {
            "amount": amount,
            "category": category,
            "description": desc,
            # datetime 对象不能直接存入 JSON，必须转为字符串
            "date": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        
        expenses.append(record)
        save_data(expenses)  # 立即保存
        print("✨ 记账成功！")
        
    except ValueError:
        print("❌ 金额输入错误，请输入数字。")

def show_expenses(expenses):
    """打印所有消费记录"""
    if not expenses:
        print("📭 暂无记录。")
        return

    print("\n" + "=" * 40)
    print(f"{'时间':<20} | {'金额':<8} | {'类别':<6} | {'备注'}")
    print("-" * 40)
    
    for item in expenses:
        # 这里不需要 json 操作，只是普通的字典访问
        print(f"{item['date']} | {item['amount']:<8} | {item['category']:<6} | {item['description']}")
    print("=" * 40 + "\n")

def show_stats(expenses):
    """简单的统计功能"""
    total = sum(item['amount'] for item in expenses)
    count = len(expenses)
    print(f"\n📊 统计报告: 共 {count} 笔消费，总计支出: {total:.2f} 元\n")

def main():
    # 1. 程序启动加载数据
    my_expenses = load_data()
    
    while True:
        print("\n=== 💰 个人记账本 ===")
        print("1. 记一笔")
        print("2. 查账本")
        print("3. 看统计")
        print("4. 退出")
        
        choice = input("请选择功能 (1-4): ")
        
        if choice == '1':
            add_expense(my_expenses)
        elif choice == '2':
            show_expenses(my_expenses)
        elif choice == '3':
            show_stats(my_expenses)
        elif choice == '4':
            print("👋 再见！")
            break
        else:
            print("无效输入，请重试。")

if __name__ == "__main__":
    main()
```

### 项目解析：你学到了什么？

#### 1. 初始化与容错 (load_data)

```python
if not os.path.exists(DATA_FILE):
    return []
```

- **场景**：第一次运行程序时，`expenses.json` 肯定不存在
- **学习点**：在读取 JSON 之前，先检查文件是否存在，避免报错。如果文件损坏（`json.JSONDecodeError`），我们要捕获异常并返回空列表，而不是让程序崩溃

#### 2. 数据持久化 (save_data)

```python
json.dump(data, f, ensure_ascii=False, indent=4)
```

- **场景**：你需要把内存中的 Python 列表保存到硬盘上
- **学习点**：
  - `indent=4`：你可以试着去掉这个参数，生成的 JSON 会变成一行。加上它，生成的 JSON 文件结构清晰，你可以直接用记事本打开查看和编辑
  - `ensure_ascii=False`：如果你输入中文备注（如"午饭"），不加这个参数，JSON 文件里会变成 `\u5348\u996d`

#### 3. 类型转换陷阱

```python
"date": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
```

- **场景**：想存时间
- **学习点**：我在代码里手动把时间转成了字符串。因为 JSON 标准不支持 `datetime` 对象。如果你直接存 `datetime.now()`，程序会报错 `TypeError: Object of type datetime is not JSON serializable`。这是新手最容易踩的坑
