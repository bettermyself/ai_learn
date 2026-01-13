# LeetCode 算法学习进度跟踪器

## 进度跟踪表

| 阶段 | 阶段名称         | 状态     | 完成题目数 | 掌握程度 (1-5) | 备注 |
| :--- | :--------------- | :------- | :--------- | :------------- | :--- |
| 1    | 入门 - 基础构建  | 进行中   | 8          | 5              | 第2周：哈希表进阶应用 |
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
- **待完成:**
  - LeetCode 349: 两个数组的交集
  - LeetCode 560: 和为 K 的子数组
  - LeetCode 128: 最长连续序列
  - LeetCode 125: 验证回文串 (Valid Palindrome)
  - LeetCode 167: 两数之和 II (Two Sum II)
  - LeetCode 11: 盛最多水的容器 (Container With Most Water)
  - LeetCode 15: 三数之和 (3Sum)

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

## 个性化路线调整
- 进入第2周：哈希表的进阶应用
- 下一题：LeetCode 349 (两个数组的交集) - 集合 Set 的应用

## 最后更新日期
2026年1月13日
