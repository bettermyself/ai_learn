## 概述
Python 的 re 模块（Regular Expression 正则表达式）是处理文本的强大工具，用于模式匹配、搜索、替换和分割。本文将系统介绍 re 模块的核心功能。

## 核心 API 详解与代码示例

**重要提示**：在 Python 中使用正则表达式时，务必使用原始字符串 `r"..."`，以避免反斜杠 `\` 转义带来的麻烦。

### 1.1 re.match() vs re.search()
这是初学者最容易混淆的一对函数：

- **re.match()**：仅从字符串的起始位置开始匹配。如果开头不匹配，返回 None。
- **re.search()**：扫描整个字符串，返回第一个成功的匹配。

```python
import re

text = "Error: File not found in logic."

# 1. match - 尝试从开头匹配 "File"
# 结果: None (因为开头是 "Error")
result_match = re.match(r"File", text)
print(f"Match 结果: {result_match}")

# 2. search - 搜索整个字符串找 "File"
# 结果: <re.Match object>
result_search = re.search(r"File", text)
if result_search:
    print(f"Search 结果: {result_search.group()} (位置: {result_search.span()})")
```

### 1.2 re.findall() vs re.finditer()
用于查找所有匹配项：

- **re.findall()**：直接返回所有匹配字符串的列表（List）。
- **re.finditer()**：返回一个迭代器（Iterator），每个元素都是 Match 对象。处理大文本时更节省内存。

```python
text = "Alice: 98分, Bob: 59分, Charlie: 88分"
pattern = r"\d+"  # 匹配一个或多个数字

# 1. findall - 直接拿列表
scores_list = re.findall(pattern, text)
print(f"Findall 结果: {scores_list}")
# 输出: ['98', '59', '88']

# 2. finditer - 获取更多信息（如位置）
print("Finditer 结果:")
for match in re.finditer(pattern, text):
    print(f"  找到 {match.group()} 在位置 {match.span()}")
```

### 1.3 re.sub() (替换)
用于替换字符串中的匹配项，非常适合数据清洗。

```python
text = "联系电话: 138-1234-5678, 备用: 186-0000-9999"

# 将手机号中间四位隐藏
# 逻辑: (\d{3})匹配前3位, -\d{4}-匹配中间, (\d{4})匹配后4位
# r"\1-****-\2" 表示保留第1组和第2组，中间换成星号
cleaned_text = re.sub(r"(\d{3})-\d{4}-(\d{4})", r"\1-****-\2", text)

print(cleaned_text)
# 输出: 联系电话: 138-****-5678, 备用: 186-****-9999
```

### 1.4 re.split() (分割)
比字符串自带的 `.split()` 更强大，可以按照多种分隔符切分。

```python
text = "apple, orange; banana|grape"

# 按照逗号、分号或竖线分割，周围可能有空格
# [;,|] 表示匹配其中任意一个字符，\s* 表示匹配0个或多个空格
fruits = re.split(r"[;,|]\s*", text)

print(fruits)
# 输出: ['apple', 'orange', 'banana', 'grape']
```

### 1.5 re.compile() (预编译)
如果一个正则表达式要在一个大循环中被重复使用成千上万次，先编译它能显著提高性能。

```python
# 预编译正则对象
email_pattern = re.compile(r"[\w\.-]+@[\w\.-]+")

users = ["user1@example.com", "invalid-email", "admin@site.org"]

for user in users:
    # 直接调用编译好的对象的 match/search 方法
    if email_pattern.match(user):
        print(f"有效邮箱: {user}")
```

## 常用正则符号速查表 (Cheat Sheet)

| 符号 | 描述                           | 示例                   |
| ---- | ------------------------------ | ---------------------- |
| `.`  | 匹配任意字符 (除换行符)        | `a.c` → abc, a+c       |
| `^`  | 匹配字符串开头                 | `^H` → Hello           |
| `$`  | 匹配字符串结尾                 | `ld$` → World          |
| `*`  | 重复 0 次或多次                | `ab*` → a, ab, abbb    |
| `+`  | 重复 1 次或多次                | `ab+` → ab, abbb       |
| `?`  | 重复 0 次或 1 次               | `https?` → http, https |
| `\d` | 匹配数字 [0-9]                 | `\d+` → 100            |
| `\w` | 匹配字母数字下划线 (单词字符)  | `\w+` → python_3       |
| `\s` | 匹配空白字符 (空格、Tab、换行) |                        |
| `[]` | 字符集合                       | `[aeiou]` → 匹配元音   |
| `()` | 分组 (Group)                   | `(\d{4})-(\d{2})`      |

## 实战小项目：日志分析与脱敏工具

### 场景描述
从服务器下载了一份杂乱的文本日志，其中包含用户的操作记录、IP 地址和一些敏感的 API Key。需要编写一个脚本来：

1. 提取所有出现的 IP 地址进行统计。
2. 脱敏所有 API Key（格式为 sk- 开头的20位字符）。
3. 整理成结构化数据。

### 代码实现

```python
import re
from collections import Counter

# 模拟的杂乱日志数据
raw_log_data = """
[INFO] 2023-10-01 10:00:01 User logged in from IP: 192.168.1.10
[WARN] 2023-10-01 10:05:22 Failed attempt from IP: 10.0.0.5 using key sk-Abcde12345Abcde12345
[INFO] 2023-10-01 10:15:00 User query processed. IP: 192.168.1.10
[ERR ] 2023-10-01 11:00:00 Connection reset from 172.16.254.1
[INFO] Debug info: API_KEY used was sk-XyZ9876543XyZ9876543. Success.
"""

class LogProcessor:
    def __init__(self):
        # 预编译正则模式
        # 1. 匹配 IP 地址 (简单的 IPv4 匹配)
        '''
        表达式结构分析
        \b - 单词边界：确保匹配完整的 IP 地址，不与其他字符混合
        (?:\d{1,3}.){3} - 非捕获组重复3次：
        \d{1,3} - 匹配1到3位数字（0-255范围内的数字部分）
        . - 匹配字面量点号（转义后的点）
        {3} - 前面的模式重复3次（IP 地址的前三个段）
        \d{1,3} - 最后一段数字：匹配 IP 地址的最后一段（1到3位数字）
        \b - 结束单词边界：确保 IP 地址结尾的完整性
        '''
        self.ip_pattern = re.compile(r"\b(?:\d{1,3}\.){3}\d{1,3}\b")
        
        # 2. 匹配 API Key (假设以 sk- 开头，后面跟20个字母数字)
        self.apikey_pattern = re.compile(r"(sk-)[a-zA-Z0-9]{20}")

    def analyze_ips(self, text):
        """提取并统计 IP 地址"""
        ips = self.ip_pattern.findall(text)
        return Counter(ips)

    def mask_sensitive_info(self, text):
        """将 API Key 脱敏，只保留前缀 sk- 和最后 4 位"""
        
        def replace_func(match):
            full_key = match.group(0)
            # 逻辑: 保留前3位(sk-)，中间变星号，保留最后4位
            return full_key[:3] + "*" * 10 + full_key[-4:]

        return self.apikey_pattern.sub(replace_func, text)

# --- 执行 ---
processor = LogProcessor()

print("--- 1. IP 访问统计 ---")
ip_counts = processor.analyze_ips(raw_log_data)
for ip, count in ip_counts.items():
    print(f"IP: {ip:<15} 次数: {count}")

print("\n--- 2. 脱敏后的日志 ---")
cleaned_log = processor.mask_sensitive_info(raw_log_data)
print(cleaned_log.strip())
```

### 代码运行结果预期
- **统计**：会发现 192.168.1.10 出现了 2 次，其他 IP 各 1 次。
- **脱敏**：原文中的 `sk-Abcde12345Abcde12345` 会变成类似 `sk-**********2345` 的形式。
