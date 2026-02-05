# Day 2 学习笔记

**日期**: 2025-02-05
**主题**: 原始类型与隐式类型转换（Coercion）

---

## 今日知识点摘要

### 1. JavaScript 七种原始类型

| 类型 | 描述 | Python 对比 |
|------|------|-------------|
| `String` | 字符串 | `str` |
| `Number` | 整数和浮点数（无区分） | `int` + `float` |
| `BigInt` | 超大整数（ES2020） | Python 整数无限制 |
| `Boolean` | 布尔值 | `bool` |
| `Symbol` | 唯一标识符（ES6） | 无直接对应 |
| `Undefined` | 变量声明未赋值 | 无对应 |
| `Null` | 主动空值 | `None` |

### 2. null vs undefined

```javascript
// undefined - 声明但未赋值
let x;
console.log(x);  // undefined

// null - 主动设置为空
let y = null;
console.log(y);  // null
```

**Python 对比**：Python 只有 `None`，对应 JS 的 `null`（表示"无值"）

### 3. TDZ 精确理解

**关键修正**：TDZ 看的是**声明语句执行前**，不是赋值语句执行前。

```javascript
// 代码块 1：声明在访问前
{
  let b;         // TDZ 结束，b = undefined
  console.log(b); // undefined
}

// 代码块 2：访问在声明前
{
  console.log(b); // ReferenceError（还在 TDZ）
  let b = 10;
}
```

### 4. == vs ===

| 运算符 | 名称 | 类型转换 | 推荐使用 |
|--------|------|----------|----------|
| `==` | 宽松相等 | ✅ 会转换 | ❌ 否 |
| `===` | 严格相等 | ❌ 不转换 | ✅ 是 |

**黄金法则**：永远使用 `===`

### 5. 类型转换规则

```javascript
// + 的双重身份
1 + "2"    // "12"（拼接）
1 - "2"    // -1（转为数字算术）

// 危险的 == 转换
0 == ""    // true
0 == false // true
"" == false // true
null == undefined // true（特殊规则）

// 严格比较
0 === ""   // false
null === undefined // false
```

### 6. for 循环三种形式

```javascript
// 传统 for（计数循环）
for (let i = 0; i < 5; i++) { }

// for...in（遍历索引/属性）
for (let index in arr) { }     // 索引是字符串
for (let key in obj) { }

// for...of（遍历值）
for (let item of arr) { }
```

---

## 学生表现

### 答对的问题
- ✅ 区分强类型（Python）和弱类型（JavaScript）
- ✅ 理解 `null` 对应 Python 的 `None`
- ✅ 正确预测 7 道类型转换题目
- ✅ 理解 TDZ 的精确含义（声明 vs 赋值）
- ✅ 独立实现真值表生成器

### 学生提出的优质问题
1. "为什么 `let x; console.log(x)` 输出 undefined 而不是 TDZ？" - 发现了 TDZ 边界的关键理解点
2. "两个代码块的区别，为什么会输出不一致" - 主动通过对比来验证理解
3. "我以为 TDZ 看的是赋值语句执行前" - 自我纠正了认知误区

---

## Python vs JS 对照表

| 特性 | Python | JavaScript |
|------|--------|------------|
| 空值 | `None` | `null`, `undefined` |
| 1 + "1" | `TypeError` | `"11"`（拼接）|
| 类型系统 | 强类型 | 弱类型 |
| 等值比较 | `==` 比较值 | `===` 比较值和类型 |
| for 遍历 | `for item in arr` | `for item of arr` |
| for 索引 | `enumerate(arr)` | `for i in arr` 或传统 `for` |

---

## 最终代码实现

### 实战：类型转换真值表生成器

```javascript
function geneteTruthTable() {
  const values = [0, '', false, null, undefined];

  for (let item of values) {
    for (let item2 of values) {
      console.log(`${item} == ${item2}: ${item2 == item}`);
    }
  }
}
geneteTruthTable();
```

**关键发现**：
- `0 == ""` → true
- `0 == false` → true
- `"" == false` → true
- `null == undefined` → true

---

## 复习内容（下次会话开始时检查）

### 问题 1：原始类型识别

以下哪些是 JavaScript 的原始类型？（多选）
- [ ] A. Object
- [ ] B. Symbol
- [ ] C. Array
- [ ] D. BigInt
- [ ] E. Function

### 问题 2：null vs undefined

请解释 `null` 和 `undefined` 的区别，并举例说明各自的使用场景。

### 问题 3：预测输出

预测以下代码的输出：

```javascript
console.log(1 + "2" + "2");
console.log(1 + +"2");
console.log(1 + -"1");
console.log(+"1" + +"1");
console.log([] == 0);
console.log([] === 0);
```

---

## 复习记录

（待明日填写）
