# Day 4 学习笔记 - 2026年1月7日

## 今日主题：哈希表原理（Hash Collision, Load Factor）

## 知识点讲解

### 1. 哈希函数（Hash Function）

#### 取模法 vs 位运算

| 方法 | 公式 | 条件 | 速度 |
|:---|:---|:---|:---:|
| **取模法** | `hash % size` | 任意 size | 慢（20-40 时钟周期） |
| **位运算法** | `hash & (size-1)` | size 必须是 2 的幂 | 快（1 时钟周期） |

#### 位运算原理

当 `size = 2^k` 时，`size - 1` 的二进制是 `k` 个 1：

```
size = 8  →  size-1 = 7  = 0111₂  (保留后 3 位)
size = 16 →  size-1 = 15 = 01111₂ (保留后 4 位)
size = 32 →  size-1 = 31 = 011111₂(保留后 5 位)
```

**关键等价性**：当 size 是 2 的幂时，`hash & (size-1) = hash % size`

两者都是保留低 k 位，但位运算快得多。

### 2. 哈希冲突（Hash Collision）

**定义**：不同的键通过哈希函数得到相同的索引。

**解决方法**：

| 方法 | 描述 | 优点 | 缺点 |
|:---|:---|:---|:---|
| **链地址法** | 每个位置维护链表 | 简单、处理能力强 | 链表过长时性能下降 |
| **开放寻址法** | 寻找下一个空位 | 缓存友好、无额外指针 | 删除复杂、聚集现象 |

#### 开放寻址法的查找机制

**核心**：不记住位置变更，查找时重新执行相同的探测序列。

**三态标记**：
| 状态 | 标记 | 查找行为 |
|:---|:---|:---|
| 从未放入 | `EMPTY` | 停止，元素不存在 |
| 已删除 | `DELETED` | 继续探测 |
| 占用中 | `key` | 检查是否匹配 |

```python
# 查找伪代码
def find(key):
    index = hash(key) % size
    while table[index] 不为空:
        if table[index].key == key:
            return table[index]
        index = (index + 1) % size  # 线性探测
    return NOT_FOUND
```

### 3. 负载因子（Load Factor）

**定义**：`load_factor = 元素个数 / 哈希表容量`

**扩容机制**：
- 阈值：约 0.75
- 扩容策略：容量翻倍
- 扩容后需要 Rehash（重新计算所有元素位置）

**为什么 0.75？**
- 太低：空间浪费
- 太高：冲突频繁
- 0.75 是时间和空间的平衡点

### 4. Python 中的哈希相关

| 类型 | 描述 | 应用场景 |
|:---|:---|:---|
| `set` | 哈希集合，只存键 | 去重、成员检查 |
| `dict` | 哈希表，存键值对 | 结构化数据、键值映射 |
| `Counter` | dict 的子类 | 频率统计 |

## 题目：LeetCode 242. 有效的字母异位词

### 题目要求
判断两个字符串是否由相同字母重新排列而成。

### 三种解法

#### 解法 1：Counter（最简洁）
```python
from collections import Counter

class Solution:
    def isAnagram(self, s: str, t: str) -> bool:
        return Counter(s) == Counter(t)
```
- 时间：O(n)
- 空间：O(1) - 只有 26 个字母

#### 解法 2：数组哈希（最优）
```python
class Solution:
    def isAnagram(self, s: str, t: str) -> bool:
        counts = [0] * 26

        for ch in s:
            counts[ord(ch) - ord('a')] += 1
        for ch in t:
            counts[ord(ch) - ord('a')] -= 1

        return all(c == 0 for c in counts)
```
- 时间：O(n)
- 空间：O(1) - 固定 26 大小
- `ord(ch) - ord('a')` 将字母映射到索引 [0, 25]

#### 解法 3：排序法
```python
class Solution:
    def isAnagram(self, s: str, t: str) -> bool:
        return sorted(s) == sorted(t)
```
- 时间：O(n log n)
- 空间：O(n) - sorted 返回新列表

## 学生的问答表现

| 问题 | 回答情况 |
|:---|:---|
| 哈希表 O(1) 原理 | ✅ 正确：哈希函数映射索引，数组随机访问 |
| 哈希冲突及解决方法 | ✅ 正确：链地址法、开放寻址法 |
| 负载因子与扩容 | ✅ 正确：元素数/容量，超过 0.75 扩容 |
| set vs dict 区别 | ✅ 正确：set 存键（去重），dict 存键值对 |
| 开放寻址法查找机制 | ✅ 正确：理解了重新探测和三态标记 |
| 位运算 vs 取模 | ✅ 正确：理解两者等价性和速度差异 |

## 掌握程度：✅ 扎实

## 下一步
- Day 5：哈希表实战 - LeetCode 1. 两数之和

---

## Python 基础知识补充

### 1. Counter 相等性比较

**问题**：为什么 `Counter()` 返回的字典可以用 `==` 来判断是否相等？

**答案**：
- `Counter` 是 `dict` 的子类，继承了 `__eq__` 方法
- `==` 比较的是键值对内容，而非内存地址
- Counter 的 `__eq__` 会忽略零/负数计数

```python
from collections import Counter

c1 = Counter({'a': 1, 'b': 2})
c2 = Counter({'b': 2, 'a': 1})  # 顺序不同
c3 = Counter({'a': 1, 'b': 2, 'c': 0})  # 含零计数的元素

print(c1 == c2)  # True - 顺序不影响
print(c1 == c3)  # True - Counter 忽略零计数
```

**Counter 构造函数可接受任何可迭代对象**：
```python
Counter('aab')          # Counter({'a': 2, 'b': 1})
Counter(['a', 'a', 'b']) # Counter({'a': 2, 'b': 1})
# 两者相等！
```

### 2. Python 中 `==` vs `is`

| 运算符 | 判断内容 | 调用方法 |
|:---|:---|:---|
| `==` | 值是否相等（逻辑相等） | `__eq__()` |
| `is` | 内存地址是否一致（同一性） | 直接比较 `id()` |

```python
a = [1, 2, 3]
b = [1, 2, 3]

print(a == b)  # True  - 内容相同
print(a is b)  # False - 不同对象，内存地址不同
```

**⚠️ 重要例外**：自定义类不重写 `__eq__` 时，`==` 退化成 `is` 行为：
```python
class Person:
    def __init__(self, name):
        self.name = name

p1 = Person("Alice")
p2 = Person("Alice")

print(p1 == p2)  # False - 没有重写 __eq__，比较内存地址！
```

### 3. None 单例模式

**None 是单例对象**，内存中只有一个 None 实例。

**最佳实践**：使用 `is None` 判断（PEP 8 推荐）
```python
# ✅ 推荐
if x is None:
    ...

if x is not None:
    ...

# ❌ 避免
if x == None:
    ...
```

**原因**：
- 更快：直接比较内存地址，无需调用方法
- 更安全：避免自定义类重写 `__eq__` 的影响

```python
a = None
b = None
print(a is b)  # True - 永远指向同一个对象
print(id(a) == id(None))  # True
```

### 4. 其他 Python 单例对象
- `True` / `False`（bool 类型）
- `Ellipsis`（`...`）
- `NotImplemented`
