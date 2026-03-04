# Day 1 学习笔记

**日期**: 2025-02-04
**主题**: 变量声明、作用域与提升机制

---

## 今日知识点摘要

### 1. JavaScript 三种声明方式

| 关键字 | 作用域 | 提升 | TDZ | 推荐使用 |
|--------|--------|------|-----|----------|
| `var`  | 函数作用域 | ✅ 初始化为 undefined | ❌ 无 | ❌ 否 |
| `let`  | 块级作用域 | ⚠️ 部分提升 | ✅ 有 | ✅ 是 |
| `const`| 块级作用域 | ⚠️ 部分提升 | ✅ 有 | ✅ 是（值不变时）|

### 2. 提升（Hoisting）机制

```javascript
// var 提升 - 声明提升到顶部，初始化为 undefined
console.log(a);  // undefined
var a = 10;

// let/const TDZ - 声明提升但进入暂时性死区
console.log(b);  // ReferenceError
let b = 10;
```

### 3. 函数作用域 vs 块级作用域

- **函数作用域**: 只认函数边界，`if`、`for` 的 `{}` 不是边界
- **块级作用域**: 任何 `{}` 都是边界（if、for、while、独立块）

```javascript
// Python 对比：Python 没有块级作用域！
if True:
    x = 10
print(x)  # ✅ 10 - 可以访问
```

### 4. 作用域遮蔽（Shadowing）

函数内声明 `var` 会遮蔽全局变量，且由于提升，声明前访问得到 `undefined`。

---

## 学生表现

### 答对的问题
- ✅ 区分函数作用域与块级作用域
- ✅ 理解 `var` 的提升机制（输出 undefined）
- ✅ 理解 `let` 的 TDZ（输出 ReferenceError）
- ✅ 理解 Python 无提升机制（NameError）
- ✅ 理解作用域遮蔽现象
- ✅ 能独立修复 setTimeout 闭包陷阱

### 学生提出的优质问题
1. "什么是 TDZ？" - 主动深入核心概念
2. "为什么输出 undefined 而不是 1？" - 发现遮蔽陷阱的本质

---

## Python vs JS 对照表

| 特性 | JavaScript (let) | JavaScript (var) | Python |
|------|-----------------|------------------|--------|
| 块级作用域 | ✅ 有 | ❌ 无 | ❌ 无 |
| 变量提升 | ⚠️ TDZ | ✅ undefined | ❌ 无 |
| 声明前访问 | ReferenceError | undefined | NameError |
| if 块变量隔离 | ✅ 是 | ❌ 否 | ❌ 否 |

---

## 最终代码实现

### 实战 1：setTimeout 闭包陷阱修复

```javascript
// 问题代码 - 输出 3, 3, 3
for (var i = 0; i < 3; i++) {
    setTimeout(function() {
        console.log(i);
    }, 100);
}

// 修复后 - 输出 0, 1, 2
for (let i = 0; i < 3; i++) {
    setTimeout(function() {
        console.log(i);
    }, 100);
}
```

### 实战 2：作用域链预测

```javascript
var a = 1;
function test() {
    console.log(a);  // undefined（局部 a 遮蔽全局）
    var a = 2;
    console.log(a);  // 2
}
console.log(a);  // 1
test();
console.log(a);  // 1
// 输出顺序: 1, undefined, 2, 1
```

---

## 复习内容（下次会话开始时检查）

1. `let` 和 `var` 在 `for` 循环中的行为差异
2. 解释什么是 TDZ
3. 预测以下代码输出：

```javascript
function mystery() {
    console.log(x);
    var x = 5;
    console.log(x);
}
mystery();
```

---

## 复习记录（2025-02-05）

### 复习状态：✅ 全部通过

| 问题 | 状态 | 备注 |
|------|------|------|
| 问题1：let vs var 在 for 循环的差异 | ✅ 通过 | 正确识别作用域差异，纠正了"非阻塞"表述，改为"异步" |
| 问题2：TDZ 概念理解 | ✅ 通过 | 准确描述："在赋值之前不能使用，赋值后TDZ解除" |
| 问题3：var 提升机制预测 | ✅ 通过 | 正确预测输出：undefined, 5 |

### 新增理解

**JavaScript 异步机制澄清**：
- JS **语言本身是同步的**（单线程按顺序执行）
- **异步能力来自运行时环境**（浏览器/Node.js 提供的 Web APIs）
- `setTimeout` 是异步的（浏览器 API），但 `console.log(i)` 本身是同步执行

**TDZ 更深层理解**：
- 从作用域开始到变量声明语句之间的区域
- 目的：防止先使用后声明

### 下次学习

**准备进入 Day 2**：原始类型与隐式类型转换（Coercion）
