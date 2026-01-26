# Day 17 学习笔记 - 2026-01-26

## 今日主题
快慢指针（Fast-Slow Pointers）：移除元素与去重技巧

## 核心知识点

### 1. 快慢指针概念
- **慢指针（slow）**：标记"处理好的位置"或"目标位置"
- **快指针（fast）**：负责"探索"或"扫描"整个数组
- **核心优势**：同向移动，实现原地修改，空间复杂度 O(1)

### 2. 快慢指针 vs 对撞指针

| 类型 | 指针移动方向 | 典型应用场景 |
|:-----|:------------|:------------|
| **快慢指针** | 同向移动（都从左到右） | 原地移除元素、去重、覆盖 |
| **对撞指针** | 相向移动（从两端向中间） | 回文判断、有序数组两数之和 |

### 3. 快慢指针标准模板
```python
slow = 0
for fast in range(len(nums)):
    if nums[fast] 满足条件:
        nums[slow] = nums[fast]
        slow += 1
return slow
```

## 题目练习

### 题目1：LeetCode 27 - 移除元素

**题目描述**：原地移除所有等于 `val` 的元素

**解法1：快慢指针（标准解法）**
```python
class Solution:
    def removeElement(self, nums: List[int], val: int) -> int:
        slow = 0
        for fast in range(len(nums)):
            if nums[fast] != val:
                nums[slow] = nums[fast]
                slow += 1
        return slow
```

**解法2：对撞指针（优化写操作）**
```python
class Solution:
    def removeElement(self, nums: List[int], val: int) -> int:
        left, right = 0, len(nums) - 1
        while left <= right:
            if nums[left] == val:
                nums[left], nums[right] = nums[right], nums[left]
                right -= 1
            else:
                left += 1
        return left
```

**关键理解**：
- 快慢指针：每个保留元素都写一次，时间 O(n)，空间 O(1)
- 对撞指针：只在找到要删除元素时才写，当删除元素很多时更优

---

### 题目2：LeetCode 26 - 删除有序数组中的重复项

**题目描述**：原地删除有序数组中的重复元素

**解法**：
```python
class Solution:
    def removeDuplicates(self, nums: List[int]) -> int:
        slow = 0
        for fast in range(1, len(nums)):
            if nums[fast] != nums[slow]:
                slow += 1
                nums[slow] = nums[fast]
        return slow + 1
```

**核心思路**：
- 利用有序性，相同元素一定相邻
- slow 始终指向最后一个不重复元素
- 只保留首次出现的元素

---

## 延伸思考

### LeetCode 80：最多允许重复两次

**问题**：如果题目改成"最多允许重复两次"，代码应该如何修改？

**关键判断**：
```python
if slow < 2 or nums[fast] != nums[slow-2]:
    nums[slow] = nums[fast]
    slow += 1
```

**原理**：和 `nums[slow-2]` 比较，如果相等说明前面已经有2个了，跳过

**通用模式**：最多保留 k 个 → 和 `nums[slow-k]` 比较！

---

## 重要改进

### 添加问题跟踪规则
根据用户反馈，在 `CLAUDE.md` 中添加了"问题跟踪规则"：
- 每次提出问题后必须记录
- 确保所有问题都得到回应
- 被指出遗漏问题时立即道歉并回到该问题

---

## 用户表现

### 理解检查
- ✅ 理解快慢指针的扫描逻辑（一次遍历，不是多次扫描）
- ✅ 理解"满足条件"的含义（保留 vs 删除）
- ✅ 正确实现 LeetCode 27 和 26
- ✅ 理解对撞指针解法的终止条件（`left <= right`）

### 思维亮点
1. 主动思考"为什么快指针要扫描全部"
2. 对 LeetCode 80 的延伸思考准确
3. 代码实现清晰、逻辑正确

### 待复习
- Day 16: LeetCode 167（两数之和 II）- 对撞指针复习（下次会话开始时）

---

## 下次学习计划
- Day 18: 移动零（LeetCode 283）
- 保持相对顺序的重要性
- 复习 Day 16 的内容
