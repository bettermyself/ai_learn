# Day 09 会话笔记 - 键值设计技巧

**日期**: 2026年1月13日
**阶段**: 第一阶段 - 入门基础构建（第2周：哈希表进阶应用）
**主题**: Day 09 - 键值设计技巧

---

## 学习目标

掌握哈希表的 Key 设计技巧，理解两种异位词分组策略，完成 LeetCode 49。

---

## 核心知识点

### 键值设计技巧

**核心思想**：将具有相同特征的元素映射到同一个 Key，实现分组或快速查找。

**异位词分组的两种策略**：

#### 策略一：排序字符串作为 Key

```python
"eat" → 排序 → "aet"
"tea" → 排序 → "aet"
"ate" → 排序 → "aet"
```

**复杂度**: O(n × k log k)
- n 个单词，每个单词长度 k
- 每个单词排序: O(k log k)

#### 策略二：字符计数作为 Key

```python
"eat"  → tuple([1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0])
"tea"  → tuple([1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0])
```

**关键点**：
- 数组不能直接作为字典 Key（可变，不可哈希）
- 必须转换为元组 `tuple(count)` 才能作为 Key

**复杂度**: O(n × k)
- n 个单词，每个单词长度 k
- 每个单词统计频率: O(k)

**两种策略对比**：

| 策略 | 时间复杂度 | 空间复杂度 | 优点 | 缺点 |
|:---|:---|:---|:---|:---|
| 排序字符串 | O(n × k log k) | O(n × k) | 代码简洁直观 | 排序有对数级开销 |
| 计数数组 | O(n × k) | O(n × k) | 时间更优 | 需要转元组 |

**选择建议**：
- k 较小（短单词）：两种都可以
- k 较大（长单词）：计数数组更优
- 面试时：两种都要会，能讨论权衡

---

## 知识点问答记录

### Q1: 为什么排序后的字符串可以作为异位词分组的 Key？

**学生回答**: ✅ 正确
- 异位词是字母相同、位置不同
- 异位词排序后会得到相同的结果
- 字符串不可变（可哈希），可以作为字典的 Key

**补充**: 涉及两个层面
1. **分组依据**：排序让异位词产生唯一相同的结果
2. **技术要求**：字符串不可变（可哈希），能作为字典 Key

### Q2: 为什么需要把数组转换为元组才能作为字典的 Key？

**学生回答**: ✅ 正确
- 字典的 Key 要求不可变、可哈希
- list 是可变数据类型，不可哈希
- tuple 是不可变数据类型，可哈希

**代码示例**:
```python
# 列表不可哈希
key = [1, 0, 0, ...]  # ❌ TypeError: unhashable type: 'list'

# 元组可哈希
key = tuple([1, 0, 0, ...])  # ✅
```

### Q3: 假设有 1000 个单词，每个单词平均长度 100，哪种策略更优？

**学生回答**: ✅ 正确
- 计数数组策略更优
- 排序策略: O(n × k log k) = 1000 × 100 × log(100) ≈ 700,000 次操作
- 计数策略: O(n × k) = 1000 × 100 = 100,000 次操作
- 计数数组策略快约 7 倍

---

## 题目学习：LeetCode 49

### 题目描述

给你一个字符串数组 `strs`，请你将**字母异位词**组合在一起。可以按**任意顺序**返回结果列表。

**示例**:
```
输入: strs = ["eat","tea","tan","ate","nat","bat"]
输出: [["bat"],["nat","tan"],["ate","eat","tea"]]
```

**提示**:
- `1 <= strs.length <= 10⁴`
- `0 <= strs[i].length <= 100`
- `strs[i]` 仅包含小写字母

### 算法思路

**学生选择**: 计数数组策略
- 理由：字符串多（最多 10⁴）、每个字符串字符多（最多 100）、仅包含小写字母

**数据结构**: `defaultdict(list)`
- Key: `tuple(计数数组)`
- Value: 字符串列表

**算法流程**:
1. 创建空字典（或 defaultdict）
2. 遍历每个字符串
3. 统计字符频率（26 长度数组）
4. 将数组转为元组作为 Key
5. 将字符串加入对应列表
6. 返回字典的所有值

### 学生代码

```python
class Solution:
    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:
        groups = {}
        for chars in strs:
            counting_array = [0] * 26
            for ch in chars:
                counting_array[ord(ch) - ord("a")] += 1
            tuple_counting_attay = tuple(counting_array)
            if tuple_counting_attay not in groups:
                groups[tuple_counting_attay] = []
            groups[tuple_counting_attay].append(chars)

        return list(groups.values())
```

**评价**: ✅ 逻辑完全正确

**优化建议**:
1. 使用 `defaultdict(list)` 简化代码
2. 字符串用单引号（Python 约定）
3. 变量名更清晰（`s` 或 `word` 代替 `chars`）

### 优化后的代码

```python
from collections import defaultdict
from typing import List

class Solution:
    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:
        groups = defaultdict(list)

        for s in strs:
            count = [0] * 26
            for ch in s:
                count[ord(ch) - ord('a')] += 1

            key = tuple(count)
            groups[key].append(s)

        return list(groups.values())
```

**复杂度**:
- 时间: O(n × k)
- 空间: O(n × k)

---

## 延伸学习：变体题目

**问题**: 如果字符串可能包含大写字母和小写字母（52 个字符），代码需要如何修改？

**学生回答**: ✅ 正确
- 数组长度需要扩展到 `ord('z') - ord('A') + 1 = 58`
- 会有 6 个位置用不到（ASCII 91-96 的特殊字符）
- 空间换时间，值得

**修改后的代码**:
```python
class Solution:
    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:
        groups = defaultdict(list)
        BASE = ord('A')
        SIZE = ord('z') - ord('A') + 1  # 58

        for s in strs:
            count = [0] * SIZE
            for ch in s:
                count[ord(ch) - BASE] += 1

            key = tuple(count)
            groups[key].append(s)

        return list(groups.values())
```

**索引分布**:
- `A-Z` (65-90): 索引 0-25
- 特殊字符 (91-96): 索引 26-31（浪费）
- `a-z` (97-122): 索引 32-57

**另一种思路**: 统一转小写后排序作为 Key
- 优点: 不浪费空间
- 缺点: 时间复杂度上升到 O(n × k log k)

---

## 会话状态

✅ **已完成**
- 知识点讲解：键值设计技巧
- 知识点问答：3/3
- 题目完成：LeetCode 49
- 延伸学习：变体题目（大小写混合）

---

## 复习记录（2026年1月14日）

### 复习问题检查

| 问题 | 状态 |
|:---|:---|
| Q1: 异位词分组的两种策略及复杂度对比 | ✅ 完全掌握 |
| Q2: 为什么计数数组需要转为元组才能作为字典 Key | ✅ 完全掌握 |
| Q3: 如何选择排序策略 vs 计数数组策略 | ✅ 完全掌握 |

### 复习评价
**复习结论**: 完全掌握昨天的知识点，三个问题回答正确，理解清晰。

---

## 下一步

Day 10: LeetCode 349 两个数组的交集（集合 Set 的应用）
