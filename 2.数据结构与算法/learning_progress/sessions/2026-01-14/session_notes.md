# Day 10 会话笔记 - 集合 Set 的应用

**日期**: 2026年1月14日
**阶段**: 第一阶段 - 入门基础构建（第2周：哈希表进阶应用）
**主题**: Day 10 - 集合 Set 的应用

---

## 学习目标

掌握集合 Set 的核心特性与应用，完成 LeetCode 349。

---

## 核心知识点

### Set 的核心特性

1. **唯一性**：Set 中不会有重复元素
2. **无序性**：Set 不保证元素的顺序
3. **快速查找**：基于哈希表实现，平均 O(1) 时间复杂度

### Set 的常见操作

| 操作 | 时间复杂度 | 说明 |
|:---|:---|:---|
| `add(x)` | O(1) 平均 | 添加元素 |
| `remove(x)` | O(1) 平均 | 删除元素 |
| `in` | O(1) 平均 | 判断是否存在 |
| 交集 `&` | O(min(n,m)) | 两个集合的交集 |
| 并集 `\|` | O(n+m) | 两个集合的并集 |

### Set vs List 的选择

| 场景 | 选择 | 原因 |
|:---|:---|:---|
| 需要去重 | Set | 自动去重 |
| 频繁查找某元素是否存在 | Set | O(1) vs O(n) |
| 需要按索引访问 | List | Set 无索引 |
| 需要维护顺序 | List | Set 无序 |

---

## 知识点问答记录

### Q1: Set 为什么能自动去重？

**学生回答**: ✅ 正确
- Set 内部基于哈希表实现
- 插入时先计算哈希值得到索引
- 如果索引位置已有元素（哈希冲突），通过 `__eq__` 判断是否相同
- 相同则拒绝插入（去重），不同则开放寻址或链表法处理

### Q2: 如果需要判断一个元素是否在集合中，用 Set 和用 List 的时间复杂度分别是多少？

**学生回答**: ✅ 正确
- Set: O(1) - 通过哈希计算索引直接定位
- List: O(n) - 需要遍历所有元素

### Q3: 两个数组求交集，用 Set 如何操作？

**学生回答**: ✅ 正确
1. 对 nums1 和 nums2 用 `set()` 去重
2. 判断去重后哪个集合长度小（用 `len()`）
3. 遍历长度小的集合，用 `in` 判断是否在长度大的集合中
4. 返回交集

---

## 题目学习：LeetCode 349

### 题目描述

给定两个数组 `nums1` 和 `nums2`，返回**它们的交集**。输出结果中的每个元素一定是**唯一**的。你可以**不考虑输出结果的顺序**。

**示例**:
```
输入: nums1 = [1,2,2,1], nums2 = [2,2]
输出: [2]

输入: nums1 = [4,9,5], nums2 = [9,4,9,8,4]
输出: [9,4]
```

### 学生思路

1. 题目强调"每个元素一定是唯一的"，提示需要对数组用 `set()` 去重
2. 方法：对两个数组都去重，遍历长度小的集合，用 `in` 判断是否为交集

### 学生代码

```python
class Solution:
    def intersection(self, nums1: List[int], nums2: List[int]) -> List[int]:
        set_nums1, set_nums2 = set(nums1), set(nums2)
        intersection_array = []
        for set_nums in set_nums1:
            if set_nums in set_nums2:
                intersection_array.append(set_nums)
        return intersection_array
```

**评价**: ✅ 逻辑完全正确

**优化建议**:
1. 变量命名：`set_nums` 是单个数字，用 `num` 更清晰
2. 遍历较小的集合以优化效率
3. 需要导入 `from typing import List`

### 优化后的代码

```python
from typing import List

class Solution:
    def intersection(self, nums1: List[int], nums2: List[int]) -> List[int]:
        set1, set2 = set(nums1), set(nums2)

        # 优化：遍历较小的集合
        if len(set1) > len(set2):
            set1, set2 = set2, set1

        result = []
        for num in set1:
            if num in set2:
                result.append(num)

        return result
```

**或者使用 Set 内置的交集运算（最简洁）**:

```python
from typing import List

class Solution:
    def intersection(self, nums1: List[int], nums2: List[int]) -> List[int]:
        return list(set(nums1) & set(nums2))
```

**复杂度**:
- 时间: O(n + m)
- 空间: O(n + m)

---

## 会话状态

✅ **已完成**
- 复习 Day 09 内容（键值设计技巧）
- 知识点讲解：集合 Set 的应用
- 知识点问答：3/3
- 题目完成：LeetCode 349

---

## 复习记录（2026年1月15日）

### 复习问题检查

| 问题 | 状态 |
|:---|:---|
| Q1: Set 的三大核心特性 | 待回答 |
| Q2: Set 和 List 查找的时间复杂度差异 | 待回答 |
| Q3: 用 Set 求交集的完整思路 | 待回答 |

### 复习评价
待明日复习后填写

---

## 下一步

Day 11: LeetCode 560 和为 K 的子数组（前缀和与哈希结合）
