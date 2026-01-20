`collections` 模块是 Python 标准库中非常重要的一部分，它提供了替代 Python 内建通用容器（如 dict, list, set, tuple）的**高性能、特殊容器数据类型**。

掌握这些 API 能让你的代码更简洁、运行效率更高。以下是核心 API 的详细讲解与代码示例。

---

## 1. 核心 API 详解与示例

### 1.1 `namedtuple` (具名元组)

**用途：** 赋予元组中每个位置一个含义明确的名字，使代码更具可读性。它是不可变的（Immutable），就像普通元组一样，但更像一个轻量级的对象。

```python
from collections import namedtuple

# 定义一个名为 'Point' 的具名元组，包含 'x' 和 'y' 两个字段
Point = namedtuple('Point', ['x', 'y'])

# 实例化
p = Point(10, 20)

print(f"坐标: x={p.x}, y={p.y}")  # 通过属性名访问，比 p[0] 可读性好太多
print(f"索引访问: {p[0]}")        # 依然支持索引访问

# 典型应用场景：从 CSV 或数据库读取数据行
User = namedtuple('User', ['name', 'age', 'email'])
user_row = User('Alice', 30, 'alice@example.com')
print(user_row)
```

### 1.2 `deque` (双端队列)

**用途：** `list` 在列表末尾添加数据很快，但在头部插入或删除数据很慢（需要移动所有元素）。`deque` (double-ended queue) 实现了在两端进行添加/弹出操作的 **O(1)** 高效性能。

```python
from collections import deque

# 初始化一个双端队列
d = deque(['a', 'b', 'c'])

# 右侧操作 (同 list)
d.append('d')
print(f"右侧添加后: {d}")

# 左侧操作 (高效)
d.appendleft('z')
print(f"左侧添加后: {d}")

# 弹出
last = d.pop()
first = d.popleft()
print(f"弹出首尾后: {d}")

# 限制长度 (非常实用的功能，类似保留最近 N 条记录)
limited_d = deque(maxlen=3)
for i in range(5):
    limited_d.append(i)
    # 当超出 maxlen 时，最左侧元素会自动被挤出
    print(f"当前队列: {limited_d}")
```

### 1.3 `Counter` (计数器)

**用途：** `dict` 的子类，专门用于统计可哈希对象的数量。

```python
from collections import Counter

data = ['apple', 'banana', 'apple', 'orange', 'banana', 'apple']

# 1. 自动统计
c = Counter(data)
print(f"统计结果: {c}")  
# 输出: Counter({'apple': 3, 'banana': 2, 'orange': 1})
# Counter['frult'] +=1,当'frult'不存在不会报错，而是从0开始。

# 2. 获取出现频率最高的 N 个元素, 不填写参数，则从高到低依次。
top_2 = c.most_common(2)
print(f"最常出现的两个: {top_2}")

# 3. 计数器运算
c1 = Counter(a=3, b=1)
c2 = Counter(a=1, b=2)
print(f"加法运算: {c1 + c2}") # Counter({'a': 4, 'b': 3})
print(f"减法运算: {c1 - c2}") # Counter({'a': 2}) # b 变成负数会被忽略
```

### 1.4 `defaultdict` (默认字典)

**用途：** `dict` 的子类。当访问不存在的 key 时，不会抛出 `KeyError`，而是自动调用一个工厂函数来创建默认值。

```python
from collections import defaultdict

# 场景：将列表按长度分组
words = ['apple', 'bat', 'bar', 'atom', 'book']

# 使用 list 作为默认工厂，访问不存在的 key 时自动创建一个空列表 []
grouped_words = defaultdict(list)

for word in words:
    key = len(word)
    grouped_words[key].append(word)

print(dict(grouped_words))
# 输出: {5: ['apple'], 3: ['bat', 'bar'], 4: ['atom', 'book']}

# 场景：计数（类似 Counter 的基础版）
counts = defaultdict(int) # 默认值为 0
counts['click_count'] += 1
print(f"点击数: {counts['click_count']}")
```

### 1.5 `OrderedDict` (有序字典)

**用途：** `dict` 的子类，记录了 key 插入的顺序。

> **注意：** 自 Python 3.7 起，标准 `dict` 也是有序的。但 `OrderedDict` 依然有其独特价值：它支持重排操作（如 `move_to_end`），且在比较两个字典时，它会考虑顺序（标准 dict 比较时不考虑顺序）。

```python
from collections import OrderedDict

d = OrderedDict()
d['a'] = 1
d['b'] = 2
d['c'] = 3

print(f"原始顺序: {list(d.keys())}")

# 将 'a' 移到最后
d.move_to_end('a')
print(f"移动后: {list(d.keys())}")

# 将 'c' 移到最前
d.move_to_end('c', last=False)
print(f"移动后: {list(d.keys())}")
```

### 1.6 `ChainMap` (映射链)

**用途：** 将多个字典连接在一起，创建一个单一的视图。查找时会按照顺序依次查找，修改时只会修改第一个字典。常用于处理配置项（命令行参数 > 环境变量 > 默认配置）。

```python
from collections import ChainMap

defaults = {'theme': 'dark', 'language': 'en', 'show_index': True}
user_settings = {'theme': 'light', 'show_index': False}

# 将用户设置放在前面，默认设置放在后面
config = ChainMap(user_settings, defaults)

# 查找：优先查 user_settings，查不到再查 defaults
print(f"当前主题: {config['theme']}")       # 输出 light (来自 user_settings)
print(f"当前语言: {config['language']}")    # 输出 en (来自 defaults)

# 新增/修改：只会影响第一个字典 (user_settings)
config['new_setting'] = 'value'
print(f"User Settings 变动: {user_settings}")
print(f"Defaults 未变: {defaults}")
```

---

## 2. 实战小项目：简易服务器日志分析器

**项目背景：**
假设我们有一个服务器日志流。我们需要实时处理这些日志，完成以下任务：

1. 结构化每条日志（使用 `namedtuple`）。
2. 保留最近 5 条日志用于调试回溯（使用 `deque`）。
3. 统计每种日志级别（INFO, ERROR 等）出现的次数（使用 `Counter`）。
4. 将日志按来源模块归类存储（使用 `defaultdict`）。

### 完整代码

```python
from collections import namedtuple, deque, Counter, defaultdict
import time
import random

# 1. 定义日志结构 (namedtuple)
LogEntry = namedtuple('LogEntry', ['timestamp', 'level', 'module', 'message'])

class LogAnalyzer:
    def __init__(self):
        # 2. 保留最近 5 条历史记录 (deque)
        self.history = deque(maxlen=5)
        # 3. 统计各级别日志数量 (Counter)
        self.level_stats = Counter()
        # 4. 按模块存储日志详情 (defaultdict)
        self.module_logs = defaultdict(list)

    def process_log(self, level, module, message):
        """处理单条日志"""
        # 创建结构化日志对象
        timestamp = time.strftime("%H:%M:%S")
        entry = LogEntry(timestamp, level, module, message)

        # 更新历史缓冲区
        self.history.append(entry)

        # 更新统计信息
        self.level_stats[level] += 1

        # 归类存储
        self.module_logs[module].append(entry)
        
        print(f"[{timestamp}] 处理日志: {module} - {message}")

    def generate_report(self):
        """生成分析报告"""
        print("\n" + "="*30)
        print("📊 日志分析报告")
        print("="*30)
        
        print(f"1. 总日志条数: {sum(self.level_stats.values())}")
        
        print("\n2. 级别统计 (Counter):")
        for level, count in self.level_stats.most_common():
            print(f"   - {level}: {count}")

        print("\n3. 最近 5 条活动 (deque):")
        # 由于 deque 是从左到右的，我们需要反向遍历以显示"最新"的在前
        for entry in reversed(self.history):
            print(f"   [{entry.timestamp}] {entry.level}: {entry.message}")
            
        print("\n4. 模块 'Database' 的所有错误:")
        db_logs = self.module_logs['Database']
        errors = [log for log in db_logs if log.level == 'ERROR']
        if errors:
            for err in errors:
                print(f"   - {err.message}")
        else:
            print("   无错误。")
        print("="*30 + "\n")

# --- 模拟运行 ---

# 模拟数据源
modules = ['Auth', 'Database', 'UI', 'Payment']
levels = ['INFO', 'WARNING', 'ERROR', 'CRITICAL']
messages = [
    "Connection timeout", "User logged in", "Page render failed", 
    "Payment processed", "Index out of bounds", "Cache cleared"
]

analyzer = LogAnalyzer()

print("--- 开始监控日志流 ---\n")

# 模拟生成 10 条日志
for _ in range(10):
    lvl = random.choice(levels)
    mod = random.choice(modules)
    msg = random.choice(messages)
    
    # 这里可能会有一些 ERROR
    if _ == 5: 
        analyzer.process_log("ERROR", "Database", "Deadlock detected!")
    else:
        analyzer.process_log(lvl, mod, msg)
    
    time.sleep(0.1)

# 输出报告
analyzer.generate_report()
```

### 代码亮点解析

* **清晰的数据结构：** `LogEntry` 让代码中传递的不再是混乱的元组或字典，而是有明确属性的对象。
* **内存安全：** 无论处理多少万条日志，`self.history` 永远只占用 5 条数据的内存，不需要手动编写逻辑来删除旧数据。
* **代码简洁：** `defaultdict` 让我们不需要写 `if module not in self.module_logs: self.module_logs[module] = []` 这样的样板代码。
