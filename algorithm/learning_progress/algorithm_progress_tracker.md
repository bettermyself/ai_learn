# LeetCode 算法学习进度跟踪器

## 进度跟踪表

| 阶段 | 阶段名称         | 状态     | 完成题目数 | 掌握程度 (1-5) | 备注 |
| :--- | :--------------- | :------- | :--------- | :------------- | :--- |
| 1    | 入门 - 基础构建  | 进行中   | 3          | 5              | 深入理解数组内存模型与 List 底层 |
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
- **待完成:**
  - LeetCode 1: 两数之和 (Two Sum)
  - LeetCode 242: 有效的字母异位词 (Valid Anagram)
  - LeetCode 125: 验证回文串 (Valid Palindrome)
  - LeetCode 167: 两数之和 II (Two Sum II)
  - LeetCode 11: 盛最多水的容器 (Container With Most Water)
  - LeetCode 15: 三数之和 (3Sum)

## 薄弱环节分析
- 暂无。展现出极强的底层探索能力。

## 里程碑记录
- 2026-01-04: 完成 LeetCode 217 学习，深刻理解 "空间换时间" 思想。
- 2026-01-04: 掌握哈希表底层原理（哈希函数、位运算优化）及排序法在内存受限场景下的应用。
- 2026-01-05: 完成 Day02 学习，深入理解 Python List 内存模型与 C/C++ 数组的本质区别。

## 个性化路线调整
- 按照原计划继续第一阶段的学习。
- 下一题推荐：LeetCode 1 (Two Sum) 或 LeetCode 242 (Valid Anagram)，巩固哈希表及 Counter 的应用。

## 复习记录

### 2026年1月5日 - 复习 LeetCode 217 与哈希表底层
- **复习内容**：
  - LeetCode 217 两种解法对比（哈希集合 vs 排序遍历）
  - 理解检查：当数组已有序时，直接遍历是最优解 (O(n) Time, O(1) Space)
  - 哈希表底层原理：
    - 哈希函数：值 → 索引映射，O(1) 查询的基础
    - 哈希冲突：链地址法 vs 开放寻址法
    - 负载因子与扩容：阈值 ~0.75，触发 2 倍扩容 + Rehash
    - 位运算优化：`& (size-1)` 替代 `%`，要求 size 为 2 的幂
- **掌握情况**：✅ 扎实，能够清晰解释原理并回答延伸问题

### 2026年1月5日 - Day02: 数组内存模型理论
- **学习内容**：
  - LeetCode 1929: 数组串联 - 掌握 `nums * 2` 和 `nums + nums` 两种写法
  - LeetCode 1920: 基于排列构建数组 - 掌握列表推导式 `[nums[num] for num in nums]`
  - **核心理论**：
    - Python List 底层是动态数组，存储的是对象引用（指针）
    - 引用指针连续存储（8字节固定），对象本身可能分散在堆内存
    - 扩容策略：约 1.125 倍增长（`newsize + (newsize >> 3) + 常数`）
    - 与 C/C++ 区别：C++ 数组存储值本身，Python List 存储引用
    - 这使得 Python List 能容纳任意类型数据
- **掌握情况**：✅ 扎实，能清晰解释"引用 vs 值"的本质区别

### 2026年1月5日 - Day02 补充: 数组原地算法 (In-place Algorithm)
- **学习内容**:
  - LeetCode 1920 的 O(1) 空间解法
  - **核心技巧**:
    - 利用取模和整除在同一个内存单元存储两个数: `val = old + new * n`
    - 还原: `old = val % n`, `new = val // n`
  - **工程权衡**:
    - 优点: 空间复杂度降为 O(1)
    - 缺点: 需要两次遍历(编码+解码)，存在整型溢出风险(Integer Overflow)
  - **高阶视角**:
    - CPU 缓存亲和性: 理解 C 数组对比 Python List 在 Cache Miss 上的性能差异
    - 均摊复杂度: 理解为什么 O(N) 的扩容不影响 append 的 O(1) 总体评价
- **掌握情况**: ✅ 能够推导公式并分析优缺点，接触系统级性能视角

## 最后更新日期
2026年1月5日