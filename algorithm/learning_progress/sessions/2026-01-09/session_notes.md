# Day 6 会话笔记 - 综合复习

**日期**: 2026年1月9日
**阶段**: 第一阶段 - 入门基础构建
**主题**: Day 1-5 综合复习

---

## 学习目标

复习本周（Day 1-5）所学核心知识点，巩固理解，准备进行代码重写练习。

---

## 核心知识点复习问答

### 问题1：哈希表容量为 2 的幂

**问题**: 为什么哈希表的容量通常设计为 2 的幂？这与位运算优化有什么关系？

**学生回答**: ✅ 正确
- size-1 的二进制为 `011...1`
- 通过位运算 `hash & (size-1)` 能快速将哈希值映射到索引范围
- 位运算比取模运算 `%` 更快

---

### 问题2：补数查找模式

**问题**: 补数查找模式（两数之和）的核心思想是什么？为什么要"先查询再插入"？

**学生回答**: ✅ 正确
- **核心思想**: 维护字典存储已遍历的值及其索引，查询 `target - num` 是否存在
- **先查询再插入的原因**:
  1. 避免自我匹配（如 `target=6`，数组为 `[3, 3]` 时，先插入会覆盖前一个 3 的索引）
  2. 避免不必要的插入操作，节省时间和空间

---

### 问题3：Python 字符串不可变性

**问题**: Python 字符串为什么设计成不可变的？请说出至少两个原因。

**学生回答**: ✅ 正确（回答了3点）
1. **字符串驻留缓存**: Python 内部缓存常用小字符串，设计不可变是为了数据安全
2. **哈希稳定性**: 字符串作为哈希表的键，需要哈希值始终不变
3. **线程安全**: 不可变对象天然多线程安全，无需加锁

---

### 问题4：双指针循环条件

**问题**: 双指针反转字符串时，循环条件为什么是 `left < right` 而不是 `left <= right`？

**学生回答**: ✅ 正确
- 当字符串长度为奇数时，`left` 和 `right` 最终会指向同一个中间字符
- 中间字符无需和自己交换，`left < right` 可以避免这种多余操作

---

### 问题5：数组哈希 vs Counter

**问题**: LeetCode 242 有效的字母异位词，为什么用长度为 26 的数组比 Counter 更优？

**学生回答**: ✅ 正确
- **内存占用更少**: 数组在同一个容器上操作（+1/-1），Counter 需要构建两个哈希字典
- **判断更直接**: 数组检查全0即可，Counter 需调用 `__eq__` 比较整个字典
- **CPU 缓存友好**: 数组连续存储，CPU 一次性读入缓存行，字典分散存储导致更多 Cache Miss
- **无哈希计算**: Counter 需计算哈希值 + 处理冲突，数组 `arr[index]` 直接寻址

---

## 本周题目回顾

| Day | 题目 | 核心知识点 |
|:---|:-----|:-----------|
| Day 1 | LeetCode 217 存在重复元素 | 哈希集合、排序法 |
| Day 2 | LeetCode 1929, 1920 | 数组内存模型、列表推导式 |
| Day 3 | LeetCode 344 反转字符串 | 字符串不可变性、双指针 |
| Day 4 | LeetCode 242 有效的字母异位词 | 数组哈希、Counter |
| Day 5 | LeetCode 1 两数之和 | 补数查找模式 |

---

## 代码重写练习

### LeetCode 1 两数之和（哈希法）

**学生代码**:
```python
class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        processed = {}
        for idx, num in enumerate(nums):
            complement = target - num
            if complement in processed:
                return [idx, processed[complement]]
            processed[num] = idx
```

**评价**: ✅ 一次性通过
- 正确实现补数查找模式
- "先查询再插入"顺序正确
- 变量命名清晰（complement）

**延伸学习**: 讨论了"返回所有索引对"的变体，掌握索引列表存储模式

---

### LeetCode 344 反转字符串（双指针）

**学生代码**:
```python
class Solution:
    def reverseString(self, s: List[str]) -> None:
        left, right = 0, len(s)-1
        while left < right:
            s[left], s[right] = s[right], s[left]
            left += 1
            right -= 1
```

**评价**: ✅ 一次性通过
- 标准双指针实现
- 循环条件 `left < right` 正确处理奇数长度
- Python 多重赋值实现交换

---

### LeetCode 242 有效的字母异位词（数组哈希）

**学生代码**:
```python
class Solution:
    def isAnagram(self, s: str, t: str) -> bool:
        arr = [0] * 26
        for ch in s:
            arr[ord(ch)-ord('a')] += 1
        for ch in t:
            arr[ord(ch)-ord('a')] -= 1
        return False if any(arr) else True
```

**评价**: ✅ 一次性通过
- 标准数组哈希实现
- `ord(ch)-ord('a')` 正确映射到 [0, 25]
- `any(arr)` 简洁检查非零值

---

## 会话状态

✅ **已完成** - 复习问答（5/5）+ 代码重写练习（3/3）全部通过
