# LeetCode 算法学习进度跟踪器

## 进度跟踪表

| 阶段 | 阶段名称         | 状态     | 完成题目数 | 掌握程度 (1-5) | 备注 |
| :--- | :--------------- | :------- | :--------- | :------------- | :--- |
| 1    | 入门 - 基础构建  | 进行中   | 16         | 5              | 第3周：双指针入门 |
| 2    | 基础 - 数据结构流利度 | 未开始   | 0          | 0              | - |
| 3    | 进阶 - 非线性结构 | 未开始   | 0          | 0              | - |
| 4    | 精通 - 最优化策略 | 未开始   | 0          | 0              | - |
| 5    | 高级算法与优化   | 未开始   | 0          | 0              | - |

## 题目练习日志 (按阶段分类)

### 第一阶段：入门 - 基础构建
- **已完成:**
  - LeetCode 217: 存在重复元素 (Contains Duplicate)
    - 解法1: 哈希集合 (O(n) Time, O(n) Space)
    - 解法2: 排序+遍历 (O(n log n) Time, O(1) Space)
  - LeetCode 1929: 数组串联 (Concatenation of Array)
    - 解法: `nums * 2` 或 `nums + nums` (O(n) Time, O(n) Space)
  - LeetCode 1920: 基于排列构建数组 (Build Array from Permutation)
    - 解法: 列表推导式 `[nums[num] for num in nums]` (O(n) Time, O(n) Space)
  - LeetCode 344: 反转字符串 (Reverse String)
    - 解法: 双指针原地反转 (O(n) Time, O(1) Space)
  - LeetCode 242: 有效的字母异位词 (Valid Anagram)
    - 解法1: Counter 统计频率 (O(n) Time, O(1) Space)
    - 解法2: 数组哈希 (O(n) Time, O(1) Space) - 最优
    - 解法3: 排序法 (O(n log n) Time, O(n) Space)
  - LeetCode 1: 两数之和 (Two Sum)
    - 解法1: 哈希法 - 补数查找 (O(n) Time, O(n) Space) - 最优
    - 解法2: 暴力法 (O(n²) Time, O(1) Space)
    - 解法3: 排序+双指针 (O(n log n) Time, O(n) Space)
  - LeetCode 387: 字符串中的第一个唯一字符 (First Unique Character in a String)
    - 解法1: 字典频率统计 + 再遍历 (O(n) Time, O(k) Space)
    - 解法2: 数组哈希 (O(n) Time, O(1) Space) - 最优
  - LeetCode 49: 字母异位词分组 (Group Anagrams)
    - 解法1: 计数数组 + defaultdict (O(n×k) Time, O(n×k) Space) - 最优
    - 解法2: 排序字符串 (O(n×k log k) Time, O(n×k) Space)
  - LeetCode 349: 两个数组的交集 (Intersection of Two Arrays)
    - 解法: Set 交集运算或手动遍历 (O(n+m) Time, O(n+m) Space)
  - LeetCode 560: 和为 K 的子数组 (Subarray Sum Equals K)
    - 解法: 前缀和 + 哈希表 (O(n) Time, O(n) Space)
  - LeetCode 128: 最长连续序列 (Longest Consecutive Sequence)
    - 解法: HashSet + 从起点扩展 (O(n) Time, O(n) Space)
  - LeetCode 125: 验证回文串 (Valid Palindrome)
    - 解法: 对撞指针 + .isalnum() 判断 (O(n) Time, O(1) Space)
  - LeetCode 167: 两数之和 II (Two Sum II)
    - 解法: 对撞指针 + 有序数组利用 (O(n) Time, O(1) Space) - 掌握升序/降序指针移动逻辑
  - LeetCode 27: 移除元素 (Remove Element)
    - 解法1: 快慢指针 (O(n) Time, O(1) Space) - 标准解法
    - 解法2: 对撞指针 (O(n) Time, O(1) Space) - 优化写操作
  - LeetCode 26: 删除有序数组中的重复项 (Remove Duplicates from Sorted Array)
    - 解法: 快慢指针 + 利用有序性 (O(n) Time, O(1) Space)
  - LeetCode 283: 移动零 (Move Zeroes)
    - 解法: 快慢指针 + 交换 (O(n) Time, O(1) Space) - 理解保持相对顺序的重要性
  - LeetCode 11: 盛最多水的容器 (Container With Most Water)
    - 解法: 对撞指针 + 贪心决策 (O(n) Time, O(1) Space) - 理解"移动矮边"的贪心策略
  - LeetCode 15: 三数之和 (3Sum)
    - 解法: 排序 + 三指针 + 两层去重 (O(n²) Time, O(1) Space) - 掌握降维策略与去重逻辑
  - LeetCode 16: 最接近的三数之和 (3Sum Closest)
    - 解法: 排序 + 三指针 + 绝对值差判断 (O(n²) Time, O(1) Space) - 掌握"最接近"的判断标准
- **待完成:** 无

## 薄弱环节分析
- 暂无。展现出极强的底层探索能力和学习能力。

## 里程碑记录
- 2026-01-04: 完成 LeetCode 217 学习，深刻理解 "空间换时间" 思想
- 2026-01-04: 掌握哈希表底层原理（哈希函数、位运算优化）及排序法在内存受限场景下的应用
- 2026-01-05: 完成 Day02 学习，深入理解 Python List 内存模型与 C/C++ 数组的本质区别
- 2026-01-06: 完成 Day03 学习，掌握字符串不可变性与双指针原地反转算法
- 2026-01-07: 完成 Day04 学习，深入理解哈希表底层原理（取模法 vs 位运算、开放寻址法查找机制）
- 2026-01-08: 完成 Day05 学习，掌握补数查找模式（两数之和），理解"先查询再插入"的关键性
- 2026-01-09: 完成 Day06 综合复习，核心知识点完全巩固
- 2026-01-09: Day07 学习 CPU 缓存系统与缓存行机制
- 2026-01-12: 完成 Day08 学习，掌握频率统计模式，理解数组 vs 哈希表的性能差异
- 2026-01-13: 完成 Day09 学习，掌握键值设计技巧（计数数组 vs 排序字符串），理解 defaultdict 的使用
- 2026-01-14: 完成 Day10 学习，掌握集合 Set 的应用（去重、快速查找、交集运算）
- 2026-01-15: 完成 Day11 学习，掌握前缀和与哈希表结合，理解 {0:1} 初始化与先查询后更新顺序
- 2026-01-20: 完成 Day12 学习，掌握利用 HashSet 实现最长连续序列查找，理解 O(n) 嵌套循环的优化原理
- 2026-01-22: 完成 Day15 学习，掌握对撞指针概念，理解回文串对称性与双指针的配合使用
- 2026-01-23: 完成 Day16 学习，掌握有序数组的单调性与对撞指针结合，理解升序/降序的指针移动逻辑
- 2026-01-26: 完成 Day17 学习，掌握快慢指针的移除元素与去重技巧，理解同向移动指针的原地修改逻辑
- 2026-01-27: 完成 Day18 学习，掌握移动零与保持相对顺序的重要性，理解快慢指针交换法的优雅之处
- 2026-01-28: 完成 Day19 学习，掌握贪心算法 + 双指针策略，理解"移动矮边"的数学直觉
- 2026-01-30: 完成 Day22 学习，掌握三数之和的三指针逻辑与两层去重技巧，理解降维策略（n数→2数）
- 2026-02-02: 完成 Day23 学习，掌握最接近的三数之和，理解"绝对值差"判断标准

## 个性化路线调整
- 第2周已完成：哈希表的进阶应用（Day 8-12）
- Day 13 完成：复盘 Day 11（前缀和+哈希表）和 Day 12（HashSet+起点扩展）
- 第3周已完成：双指针入门（Day 15-23）
- 下一步：**Day 24**: 滑动窗口引入（固定窗口）。题目：643. 子数组最大平均数 I

## 最后更新日期
2026年2月2日（Day 23 完成）

---

## 复习记录

| 日期 | 复习内容 | 状态 |
|:-----|:---------|:-----|
| 2026-01-20 | Day 11: LeetCode 560 前缀和+哈希表 | ✓ 知识点巩固 |
| 2026-01-20 | Day 12: LeetCode 128 HashSet+起点扩展 | ✓ 完成 |
| 2026-01-21 | Day 11 & 12 复习：手动推演验证 | ✓ 完成 |
| 2026-01-23 | Day 15: 对撞指针 + LeetCode 125 | ✓ 知识点完全巩固 |
| 2026-01-23 | Day 16: 有序数组 + LeetCode 167 | ✓ 知识点完全巩固 |
| 2026-01-24 | Day 16 复习：问答验证 + 代码手写 | ✓ 完成 |
| 2026-01-26 | Day 17: 快慢指针 + LeetCode 27/26 | ✓ 知识点完全巩固 |
| 2026-01-27 | Day 17 复习：问答验证（快慢指针 vs 对撞指针） | ✓ 完成 |
| 2026-01-28 | Day 18 复习：快慢指针执行流程 + 条件判断灵活应用 | ✓ 完成 |
| 2026-01-28 | Day 19: 贪心算法 + LeetCode 11 | ✓ 已复习 |
| 2026-01-29 | Day 16 复习：有序数组 + LeetCode 167 | ✓ 完成 |
| 2026-02-02 | Day 22 复习：三数之和去重逻辑 + 代码手写 | ✓ 知识点完全巩固 |
| 2026-02-02 | Day 23: 最接近的三数之和 + 代码优化 | ✓ 完成 |
