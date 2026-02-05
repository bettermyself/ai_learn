# Day 25 学习笔记 - 2026年2月4日

## 今日主题：滑动窗口（可变窗口）

### 知识点讲解

**核心概念：**
- 可变窗口：窗口大小不固定，根据条件动态扩张和收缩
- 与固定窗口的对比：固定窗口大小已知，可变窗口大小动态变化

**可变窗口 vs 固定窗口：**

| 特性 | 固定窗口 | 可变窗口 |
|:-----|:---------|:---------|
| 窗口大小 | 固定 k | 动态变化 |
| 扩张条件 | 每次循环都滑动 | 满足条件时扩张 |
| 收缩条件 | 每次循环都滑动 | 不满足条件时收缩 |
| 典型问题 | 最大平均数、最大和 | 最小长度子数组、最长无重复 |

**可变窗口标准模板：**
```python
left = 0
result = float('inf')  # 或其他初始值
current_sum = 0

for right in range(len(nums)):
    # 1. 扩张窗口：加入 right 指向的元素
    current_sum += nums[right]

    # 2. 收缩窗口：当满足某个条件时，移动 left
    while current_sum >= target:  # 条件因题而异
        # 3. 更新结果
        result = min(result, right - left + 1)
        # 4. 收缩：移除 left 指向的元素
        current_sum -= nums[left]
        left += 1
```

### 问答检查（全部正确）

| 问题 | 学生回答 | 状态 |
|:-----|:---------|:-----|
| 1. right 和 left 指针的移动方式区别？ | right一直往后（循环遍历），left只在current_sum>=target时移动 | ✓ |
| 2. 为什么收缩窗口时用 while 而不是 if？ | 可能减去多个nums[left]后仍满足条件，需要while找到当前right下的最小窗口 | ✓ |
| 3. 扩张和收缩分别对应什么操作？ | 扩张对应滑入窗口，收缩代表滑出窗口 | ✓ |

### 题目：LeetCode 209 - 长度最小的子数组

**题目描述：**
给定一个含有 n 个正整数的数组和一个正整数 target。找出该数组中满足其总和大于等于 target 的长度最小的连续子数组，并返回其长度。如果不存在符合条件的子数组，返回 0。

**示例：**
```
输入：target = 7, nums = [2,3,1,2,4,3]
输出：2
解释：子数组 [4,3] 是该条件下的长度最小的子数组。
```

**暴力法分析：**
- 两层遍历，外层遍历起始位置，内层累加求和
- 时间复杂度：O(n²)
- 问题：很多和被重复计算

**学生代码实现：**
```python
class Solution:
    def minSubArrayLen(self, target: int, nums: List[int]) -> int:
        result = float('inf')  # 初始化为无穷大
        left = 0
        current_sum = 0

        for right in range(len(nums)):
            current_sum += nums[right]

            if current_sum >= target:
                result = min(result, right - left + 1)
                # 收缩到最小
                while current_sum - nums[left] >= target:
                    current_sum -= nums[left]
                    left += 1
                    result = min(result, right - left + 1)

        return result if result != float('inf') else 0
```

**代码要点：**
1. `result = float('inf')`：初始化为无穷大，避免边界问题
2. `while current_sum - nums[left] >= target`：先试探减去后是否还满足条件
3. `return result if result != float('inf') else 0`：判断是否找到解

**复杂度分析：**
- 时间复杂度：O(n)
- 空间复杂度：O(1)

**手动模拟验证（target=7, nums=[2,3,1,2,4,3]）：**
```
right=0: current_sum=2  (<7)
right=1: current_sum=5  (<7)
right=2: current_sum=6  (<7)
right=3: current_sum=8  (≥7), result=4
right=4: current_sum=12 (≥7), 收缩后 result=3
right=5: current_sum=10 (≥7), 收缩后 result=2 ✓
最终：result=2, 对应子数组[4,3]
```

**学习表现：** 优秀
- 知识点问答全部正确
- 代码逻辑一次性写对
- 能手动模拟验证算法流程
- 理解了 O(n) vs O(n²) 的优化原理

---

## 复习内容（Day 24）

复习日期：2026年2月4日

**复习题目：**
- LeetCode 643：子数组最大平均数 I（固定窗口滑动）

**复习问答：**

| 问题 | 学生回答 | 状态 |
|:-----|:---------|:-----|
| 1. 滑动窗口 vs 暴力法的时间复杂度？ | O(n) vs O(n*k)，增量更新更快 | ✓ |
| 2. 固定窗口移动时新窗口和如何计算？ | 新和 = 旧和 - nums[i-1] + nums[i+k-1] | ✓ |
| 3. 为什么最大化平均数 = 最大化窗口和？ | k是固定常数，分母不变 | ✓ |
| 4. 为什么 range 从 1 开始而不是 0？ | 从0开始 nums[i-1]=nums[-1] 会出错 | ✓ |

**复习结果：** ✓ 知识点完全巩固，4个问答全部正确，边界条件理解清晰

---

## 复习内容（Day 25）

复习日期：2026年2月5日

**复习题目：**
- LeetCode 209：长度最小的子数组（可变窗口）

**复习问答：**

| 问题 | 学生回答 | 状态 |
|:-----|:---------|:-----|
| 1. 固定窗口和可变窗口的核心区别？ | 固定窗口：left和right同步移动；可变窗口：right循环往后，left满足条件时移动 | ✓ |
| 2. 为什么收缩窗口时用 while 而不是 if？ | while会持续移动left直到不满足条件，if只移动一次 | ✓ |
| 3. 扩张和收缩分别对应什么操作？ | 扩张：right后移，滑入元素；收缩：left后移，滑出元素 | ✓ |
| 4. 手动模拟执行过程（target=7, nums=[2,3,1,2,4,3]） | 完整模拟6步，最终result=2，对应子数组[4,3] | ✓ |

**复习结果：** ✓ 知识点完全巩固，4个问答全部正确，理解了可变窗口的扩张收缩逻辑

