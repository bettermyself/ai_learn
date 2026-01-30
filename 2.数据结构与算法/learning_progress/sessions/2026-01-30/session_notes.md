# Day 22 学习笔记 - 2026-01-30

## 学习内容
- **题目**：LeetCode 15 三数之和 (3Sum)
- **核心知识点**：三指针逻辑、去重技巧、剪枝优化

---

## 核心知识点

### 1. 降维策略
三数之和 → 两数之和（固定一个数，转化为双指针问题）

### 2. 三指针框架
```
i  → 遍历数组，固定第一个数
left  → i + 1，从左向右
right  → len(nums) - 1，从右向左
```

### 3. 两层去重（难点）
- **i 层去重**：`if i > 0 and nums[i] == nums[i-1]: continue`
- **left/right 层去重**：找到解后，用 while 循环跳过重复元素

### 4. 剪枝优化
- `if nums[i] > 0: break` —— 后面都是正数，不可能和为0

---

## 知识点问答记录

### 问题 1：为什么要先对数组排序？
**回答**：只有先排序，数组才有单调性，双指针移动的方向才能明确。同时，只有先排序，才能更好的实行去重操作。
**评价**：✅ 完全正确

### 问题 2：i 层去重触发时机
**回答**：当 i=2 的时候，nums[2]==nums[1]，此时 -1 这个元素已经处理过了，会触发 i 层去重。
**评价**：✅ 完全正确

### 问题 3：为什么需要 while 循环去重？
**回答**：找到一组解后，需要 while 循环来跳过重复元素，如果直接 left += 1 和 right -= 1，那么 left += 1 和 right -= 1 的元素可能和 left 和 right 元素相同，导致重复。
**评价**：✅ 完全正确

### 问题 4：为什么 nums[i] > 0 时 break 而不是 continue？
**回答**：因为 nums 已经被排序过，nums[i]>0 的情况下，后面的都大于0，不可能存在三个都大于0的数相加等于0，所以可以直接 break。
**评价**：✅ 完全正确

---

## 代码实现

```python
class Solution:
    def threeSum(self, nums: List[int]) -> List[List[int]]:
        nums.sort()
        result = []
        for i in range(len(nums)):
            if nums[i] > 0:
                break
            if i > 0 and nums[i] == nums[i - 1]:
                continue

            target = -nums[i]
            left, right = i + 1, len(nums) - 1

            while left < right:
                if nums[left] + nums[right] > target:
                    right -= 1
                elif nums[left] + nums[right] < target:
                    left += 1
                else:
                    result.append([nums[i], nums[left], nums[right]])
                    while left < right and nums[left] == nums[left + 1]:
                        left += 1
                    while left < right and nums[right] == nums[right - 1]:
                        right -= 1
                    left += 1
                    right -= 1
        return result
```

---

## 复杂度分析

| 复杂度 | 值 | 说明 |
|:-------|:---|:-----|
| 时间 | O(n²) | 排序 O(n log n) + 外层循环 O(n) × 内层双指针 O(n) |
| 空间 | O(1) | 除结果外只用了常数空间 |

---

## 核心模式总结

### n 数之和通用框架
```
1. 排序数组
2. for i in range(len(nums) - k + 1):
       剪枝 + i 层去重
       递归或双指针处理 (k-1) 数之和
```

### 关键技巧
1. **降维**：k 数 → (k-1) 数 → ... → 2 数（双指针）
2. **排序**：保证单调性 + 便于去重
3. **两层去重**：循环层 + 指针层
4. **剪枝**：提前终止不可能的情况

---

## 学习状态
- ✅ 知识点完全掌握
- ✅ 代码实现正确
- ✅ 去重逻辑清晰
- ✅ 剪枝优化理解到位

---

## 复习计划（下次学习）
- Day 22 复习：三数之和去重逻辑 + 代码手写
- Day 23：三数之和巩固 + 变体练习
