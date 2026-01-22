itertools 是 Python 标准库中处理迭代器（Iterator）的核心模块。它的设计深受 Haskell 等函数式编程语言的影响，主要优势在于内存高效（惰性计算）和代码简洁。

### 第一部分：常用的 API 详解

我将 itertools 的功能分为三大类进行讲解。请注意，为了展示结果，我在代码中使用了 list() 将迭代器转换为列表，但在实际开发中，我们通常直接遍历它们以节省内存。

#### 1. 无限迭代器 (Infinite Iterators)

这些迭代器如果不加控制（如 break 或 islice），会无限生成数据。

- **count(start, step)**：创建一个从 start 开始，步长为 step 的计数器。
- **cycle(iterable)**：无限重复给定的序列。
- **repeat(elem, times)**：重复生成某个元素（可指定次数）。

```python
import itertools

# 1. count: 类似 while True: i += 1
counter = itertools.count(start=10, step=2)
print(f"Count: {[next(counter) for _ in range(3)]}") 
# 输出: [10, 12, 14]

# 2. cycle: 循环播放 A, B, C, A, B, C ...
cycler = itertools.cycle('ABC')
print(f"Cycle: {[next(cycler) for _ in range(5)]}")
# 输出: ['A', 'B', 'C', 'A', 'B']

# 3. repeat: 提供常量流，常用于 map 或 zip
repeater = itertools.repeat("Hello", 3)
print(f"Repeat: {list(repeater)}")
# 输出: ['Hello', 'Hello', 'Hello']
```

#### 2. 排列组合迭代器 (Combinatoric Iterators)

用于处理复杂的数学排列组合问题，避免手写多层嵌套循环。

- **product(*iterables)**：笛卡尔积（相当于嵌套的 for 循环）。
- **permutations(iterable, r)**：排列（有序，AB != BA，，不包含重复元素）。
- **combinations(iterable, r)**：组合（无序，AB == BA，不包含重复元素）。

```python
# 1. product: 比如要把颜色和尺寸所有组合列出来
colors = ['Red', 'Blue']
sizes = ['S', 'M']
print(f"Product: {list(itertools.product(colors, sizes))}")
# 输出: [('Red', 'S'), ('Red', 'M'), ('Blue', 'S'), ('Blue', 'M')]

# 2. permutations: 全排列 (选2个)
items = [1, 2, 3]
print(f"Permutations: {list(itertools.permutations(items, 2))}")
# 输出: [(1, 2), (1, 3), (2, 1), (2, 3), (3, 1), (3, 2)] (注意 (1,2) 和 (2,1) 都有)

# 3. combinations: 组合 (选2个)
print(f"Combinations: {list(itertools.combinations(items, 2))}")
# 输出: [(1, 2), (1, 3), (2, 3)] (没有 (2,1))
```

#### 3. 处理输入序列的迭代器 (Terminating Iterators)

这是最常用的一类，用于操作和转换现有的序列。

- **chain(*iterables)**：将多个序列“链”在一起，变成一个长序列。
- **groupby(iterable, key)**：将连续的重复元素分组（注意：使用前必须排序）。
- **islice(iterable, start, stop, step)**：迭代器的切片（因为普通迭代器不支持 [0:5] 语法）。
- **zip_longest(*iterables, fillvalue)**：类似 zip，但以最长的序列为准，短的用 fillvalue 填充。
- **dropwhile / takewhile**：根据条件丢弃或获取元素。

```python
# 1. chain: 连接列表
list1 = [1, 2]
list2 = [3, 4]
print(f"Chain: {list(itertools.chain(list1, list2))}")
# 输出: [1, 2, 3, 4] 只会拆开一层，将里面的作为一个元素。

# 2. islice: 切片
gen = itertools.count()  # 无限迭代器
print(f"Islice: {list(itertools.islice(gen, 0, 10, 2))}")
# 输出: [0, 2, 4, 6, 8]

# 3. zip_longest: 对齐数据
names = ['Alice', 'Bob']
ages = [25, 30, 35]
print(f"Zip Longest: {list(itertools.zip_longest(names, ages, fillvalue='Unknown'))}")
# 输出: [('Alice', 25), ('Bob', 30), ('Unknown', 35)]

# 4. groupby: 分组 (必须先排序！)
data = [{'dept': 'IT', 'name': 'A'}, {'dept': 'HR', 'name': 'B'}, {'dept': 'IT', 'name': 'C'}]
# 先按 key 排序
data.sort(key=lambda x: x['dept']) 
for key, group in itertools.groupby(data, key=lambda x: x['dept']):
    print(f"Dept: {key}, Staff: {list(group)}")
# 输出: 
# Dept: HR, Staff: [{'dept': 'HR', 'name': 'B'}]
# Dept: IT, Staff: [{'dept': 'IT', 'name': 'A'}, {'dept': 'IT', 'name': 'C'}]
```

### 第二部分：实战小项目 —— 日志流分析与报表生成器

这个项目模拟处理一个电商系统的订单日志。数据可能来自不同的服务器（不同的列表），包含杂乱的信息。我们需要利用 itertools 高效地清洗、合并、分组并计算总销售额。

#### 场景需求：

- 合并来自不同来源的订单数据。
- 清洗掉状态为 "Cancelled" 的订单。
- 按 "Category"（类别）对订单进行分组。
- 计算每个类别的总销售额。

#### 代码示例

```python
import itertools

# 模拟数据源：来自 Server A 和 Server B 的订单日志
# 格式: (OrderID, Category, Price, Status)
logs_server_a = [
    (101, 'Electronics', 1200, 'Completed'),
    (102, 'Books', 25, 'Cancelled'),
    (103, 'Electronics', 800, 'Completed'),
]

logs_server_b = [
    (104, 'Books', 45, 'Completed'),
    (105, 'Clothing', 150, 'Completed'),
    (106, 'Clothing', 80, 'Returns'), # 假设我们只统计 Completed
]

def process_order_logs(source1, source2):
    print("--- 开始处理订单日志 ---")

    # 1. 【chain】: 将两个数据流合并为一个，避免创建新的大列表
    all_logs = itertools.chain(source1, source2)

    # 2. 【filterfalse】 (或者用 filter): 过滤掉非 Completed 的订单
    # 这里演示过滤掉所有不是 'Completed' 的
    valid_orders = itertools.filterfalse(
        lambda x: x[3] != 'Completed', 
        all_logs
    )

    # 3. 准备 groupby: groupby 之前必须按 key 排序
    # 我们按 Category (索引1) 排序
    sorted_orders = sorted(valid_orders, key=lambda x: x[1])

    # 4. 【groupby】: 按类别分组统计
    print(f"{'Category':<15} | {'Count':<5} | {'Total Revenue'}")
    print("-" * 40)

    for category, items in itertools.groupby(sorted_orders, key=lambda x: x[1]):
        # 注意: items 是一个迭代器，遍历一次后就空了。
        # 如果需要多次使用，必须转为 list，但要注意内存。
        items_list = list(items) 
        
        count = len(items_list)
        # 使用 sum 计算该组的总金额 (索引2)
        total_revenue = sum(order[2] for order in items_list)
        
        print(f"{category:<15} | {count:<5} | ${total_revenue}")

# 运行项目
if __name__ == "__main__":
    process_order_logs(logs_server_a, logs_server_b)
```

#### 项目输出结果：

```
--- 开始处理订单日志 ---
Category        | Count | Total Revenue
----------------------------------------
Books           | 1     | $45
Clothing        | 1     | $150
Electronics     | 2     | $2000
```

### 总结

- **内存优化**：如果不使用 itertools.chain，你需要 logs_a + logs_b，这会立即在内存中创建一个全新的大列表。而 chain 只是创建了一个迭代器，逐个取出元素，几乎不占额外内存。
- **代码逻辑**：使用 groupby 配合排序，是处理分类统计最经典的数据流模式。

