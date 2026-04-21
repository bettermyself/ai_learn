## 一、深入对象

### 1.1 创建对象的三种方式

JavaScript 提供了多种创建对象的方式，以下是常用的三种方法：

| 方式             | 语法示例                                    | 适用场景                 |
| :--------------- | :------------------------------------------ | :----------------------- |
| **字面量**       | `const o = { name: '佩奇' }`                | 创建单个简单对象，最常用 |
| **new Object()** | `const oo = new Object(); oo.name = '佩奇'` | 动态构建对象属性         |
| **构造函数**     | `new Pig('佩奇', 6, '女')`                  | 批量创建结构相似的对象   |

```javascript
// 1. 字面量创建（推荐）
const o = {
  name: '佩奇'
}

// 2. new Object() 创建
const oo = new Object()
oo.name = '佩奇'

// 3. 构造函数创建（见下文）
```

### 1.2 构造函数详解

**构造函数**是一种特殊的函数，专门用于创建和初始化对象。

#### 使用场景

常规的字面量语法 `{...}` 适合创建单个对象。但当需要创建多个结构相同、值不同的对象时（如佩奇和乔治），使用构造函数可以大大提高代码复用性。

```javascript
// 构造函数：首字母大写，使用 new 调用
function Pig(name, age, gender) {
  // this.name 是实例属性
  // name 是形参（传入的属性值）
  this.name = name
  this.age = age
  this.gender = gender
}

// 使用 new 关键字实例化对象
const peiqi = new Pig('佩奇', 6, '女')
const qiaozhi = new Pig('乔治', 3, '男')

console.log(peiqi)   // Pig {name: '佩奇', age: 6, gender: '女'}
console.log(qiaozhi) // Pig {name: '乔治', age: 3, gender: '男'}
```

#### 构造函数使用规范

| 规范              | 说明                               |
| :---------------- | :--------------------------------- |
| **首字母大写**    | 与普通函数区分，如 `Pig`、`Person` |
| **使用 new 调用** | 必须使用 `new` 关键字实例化        |
| **无需 return**   | 构造函数自动返回新创建的对象       |
| **可省略括号**    | 无参数时可省略 `()`，如 `new Pig`  |

#### new 实例化过程

当使用 `new` 关键字调用构造函数时，JavaScript 引擎执行以下步骤：

1. **创建新空对象** — 建立一个空的简单对象
2. **绑定原型链** — 将新对象的 `[[Prototype]]` 指向构造函数的 `prototype`
3. **绑定 this 并执行** — 将构造函数内部的 `this` 指向新对象，执行构造函数代码
4. **返回新对象** — 如果构造函数没有返回对象，则自动返回新创建的对象

### 1.3 实例成员与静态成员

#### 实例成员

通过构造函数创建的对象称为**实例对象**，实例对象上的属性和方法称为**实例成员**（实例属性和实例方法）。

```javascript
function Pig(name) {
  this.name = name
}

const peiqi = new Pig('佩奇')
const qiaozhi = new Pig('乔治')

// 实例属性
peiqi.name = '小猪佩奇'

// 实例方法
peiqi.sayHi = () => {
  console.log('hi~~')
}

console.log(peiqi === qiaozhi) // false — 实例彼此独立，互不影响
```

#### 静态成员

**静态成员**是定义在构造函数本身的属性和方法，只能通过构造函数访问。

```javascript
function Pig(name) {
  this.name = name
}

// 静态属性
Pig.eyes = 2

// 静态方法
Pig.sayHi = function () {
  console.log(this) // this 指向构造函数 Pig
}

Pig.sayHi()      // 调用静态方法
console.log(Pig.eyes) // 2 — 访问静态属性
```

| 特性          | 实例成员                   | 静态成员                          |
| :------------ | :------------------------- | :-------------------------------- |
| **定义位置**  | 构造函数内部（`this.xxx`） | 构造函数本身（`Constructor.xxx`） |
| **访问方式**  | `实例对象.xxx`             | `构造函数.xxx`                    |
| **this 指向** | 实例对象                   | 构造函数                          |
| **示例**      | `peiqi.name`               | `Date.now()`, `Math.PI`           |

### 1.4 一切皆对象

JavaScript 中，**几乎所有数据都可以基于构造函数创建**：

- **引用类型**：`Object`、`Array`、`RegExp`、`Date` 等
- **基本数据类型**：字符串、数值、布尔等也有对应的**包装类型**

#### 包装类型执行过程

当对基本类型调用方法时（如 `'andy'.length`），JavaScript 会临时执行以下步骤：

1. 创建对应包装类型的实例（`new String('andy')`）
2. 调用实例上的方法（获取 `length` 或调用 `substring` 等）
3. 销毁临时实例

```javascript
const str = 'andy'
console.log(str.length) // 4

// 实际执行过程：
// 1. const temp = new String('andy')
// 2. temp.length
// 3. temp = null
```



## 二、内置构造函数

### 2.1 Object

`Object` 是内置构造函数，用于创建普通对象。⚠️ **推荐使用字面量 `{}` 声明对象**，而非 `Object` 构造函数。

#### 常用静态方法

| 方法                            | 作用               | 返回值   |
| :------------------------------ | :----------------- | :------- |
| `Object.keys(obj)`              | 获取对象所有属性名 | 数组     |
| `Object.values(obj)`            | 获取对象所有属性值 | 数组     |
| `Object.assign(target, source)` | 对象拷贝（浅拷贝） | 目标对象 |

```javascript
const o = { name: '佩奇', age: 6, gender: '女' }

// 1. 获取所有属性名
const keys = Object.keys(o)
console.log(keys) // ['name', 'age', 'gender']

// 2. 获取所有属性值
const values = Object.values(o)
console.log(values) // ['佩奇', 6, '女']

// 3. 对象拷贝
const oo = {}
Object.assign(oo, o) // 将 o 的属性拷贝到 oo
oo.name = '小猪佩奇'

console.log(oo) // {name: '小猪佩奇', age: 6, gender: '女'}
console.log(o)  // {name: '佩奇', age: 6, gender: '女'} — 原对象不受影响
```

### 2.2 Array

`Array` 是内置构造函数。⚠️ **推荐使用字面量 `[]` 声明数组**。

#### 核心实例方法速查表

| 方法                   | 作用                 | 是否改变原数组 | 返回值             |
| :--------------------- | :------------------- | :------------- | :----------------- |
| `forEach(fn)`          | 遍历数组             | 否             | `undefined`        |
| `map(fn)`              | 映射为新数组         | 否             | 新数组             |
| `filter(fn)`           | 过滤元素             | 否             | 新数组             |
| `find(fn)`             | 查找首个匹配元素     | 否             | 匹配值/`undefined` |
| `every(fn)`            | 是否全部满足条件     | 否             | `boolean`          |
| `some(fn)`             | 是否有元素满足条件   | 否             | `boolean`          |
| `reduce(fn, init)`     | 累加器，归约为单一值 | 否             | 累计结果           |
| `join(sep)`            | 拼接为字符串         | 否             | 字符串             |
| `concat(arr)`          | 合并数组             | 否             | 新数组             |
| `sort(fn)`             | 排序                 | **是**         | 排序后的数组       |
| `splice(start, count)` | 删除/替换元素        | **是**         | 被删除的元素       |
| `reverse()`            | 反转数组             | **是**         | 反转后的数组       |
| `findIndex(fn)`        | 查找元素索引         | 否             | 索引/`-1`          |

#### reduce 方法详解

`reduce()` 是数组归约的核心方法，将数组元素累积为单一值。

```javascript
const arr = [1, 5, 8]

// 无初始值：从数组第二个元素开始
const total1 = arr.reduce((prev, current) => prev + current)
// 执行过程：
// 第1次: prev=1, current=5, return 6
// 第2次: prev=6, current=8, return 14
console.log(total1) // 14

// 有初始值：从第一个元素开始
const total2 = arr.reduce((prev, current) => prev + current, 10)
// 执行过程：
// 第1次: prev=10, current=1, return 11
// 第2次: prev=11, current=5, return 16
// 第3次: prev=16, current=8, return 24
console.log(total2) // 24
```

### 2.3 String

`String` 是内置构造函数，用于创建字符串。

#### 常用实例方法

| 方法                    | 作用               | 示例                                   |
| :---------------------- | :----------------- | :------------------------------------- |
| `length`                | 获取字符串长度     | `'abc'.length` → `3`                   |
| `split(sep)`            | 拆分为数组         | `'a,b,c'.split(',')` → `['a','b','c']` |
| `substring(start, end)` | 截取子串           | `'hello'.substring(1,4)` → `'ell'`     |
| `startsWith(str)`       | 是否以某字符串开头 | `'abc'.startsWith('ab')` → `true`      |
| `includes(str)`         | 是否包含某字符串   | `'abc'.includes('b')` → `true`         |
| `toUpperCase()`         | 转大写             | `'abc'.toUpperCase()` → `'ABC'`        |
| `toLowerCase()`         | 转小写             | `'ABC'.toLowerCase()` → `'abc'`        |
| `indexOf(str)`          | 查找子串位置       | `'abc'.indexOf('b')` → `1`             |
| `endsWith(str)`         | 是否以某字符串结尾 | `'abc'.endsWith('bc')` → `true`        |
| `replace(old, new)`     | 替换子串           | `'abc'.replace('b', 'x')` → `'axc'`    |
| `match(regexp)`         | 正则匹配           | `'abc'.match(/b/)`                     |

```javascript
// 综合示例：字符串翻转
const str = '传智播客'
// 步骤：字符串 → 数组 → 翻转 → 字符串
const reversed = str.split('').reverse().join('')
console.log(reversed) // '客播智传'
```

### 2.4 Number

`Number` 是内置构造函数，用于创建数值。⚠️ **推荐使用字面量声明数值**。

```javascript
const num = 12.345

// toFixed(n) 保留 n 位小数（四舍五入）
console.log(num.toFixed(2))  // '12.35'
console.log(num.toFixed(1))  // '12.3'

// 整数也会补零
const num1 = 12
console.log(num1.toFixed(2)) // '12.00'
```
