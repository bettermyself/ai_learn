## 一、编程思想

### 1.1 面向过程 vs 面向对象

| 特性         | 面向过程                                 | 面向对象                             |
| :----------- | :--------------------------------------- | :----------------------------------- |
| **核心思想** | 分析解决问题的步骤，用函数逐步实现       | 将事务分解为对象，由对象分工合作     |
| **优点**     | 性能高，适合硬件紧密相关场景（如单片机） | 易维护、易复用、易扩展，适合大型项目 |
| **缺点**     | 不灵活、复用性较差                       | 性能比面向过程略低                   |
| **典型比喻** | 蛋炒饭（步骤固定）                       | 盖浇饭（灵活组合）                   |

### 1.2 面向对象的三大特性

1. **封装性** — 将数据和方法封装在对象内部
2. **继承性** — 子类继承父类的属性和方法
3. **多态性** — 同一接口，不同实现

💡 **提示**：前端开发中面向过程使用更多，但掌握面向对象思想对复杂项目开发至关重要。



## 二、构造函数

### 2.1 基本概念

构造函数是实现**封装**的核心机制，将公共属性和方法抽取封装，实现数据共享。

```javascript
function Person(name, age) {
  this.name = name
  this.age = age
  this.sayHi = function () {
    console.log('hi~')
  }
}

// 实例化
const zs = new Person('张三', 18)
const ls = new Person('李四', 19)

console.log(zs === ls)           // false — 不同实例
console.log(zs.sayHi === ls.sayHi)  // false — 方法重复创建 ⚠️
```

### 2.2 构造函数的问题

| 问题         | 说明                           | 影响                   |
| :----------- | :----------------------------- | :--------------------- |
| **内存浪费** | 每个实例都会创建独立的方法副本 | 实例越多，内存占用越大 |
| **性能损耗** | 相同功能的方法被重复定义       | 降低程序执行效率       |



## 三、原型

### 3.1 原型对象（prototype）

**定义**：每个构造函数都有一个 `prototype` 属性，指向原型对象。

**作用**：解决构造函数方法重复创建导致的内存浪费问题。

```javascript
function Person(name, age) {
  this.name = name
  this.age = age
  // 方法不再定义在构造函数内部
}

// 将方法挂载到原型对象上
Person.prototype.sayHi = function () {
  console.log('hi~')
}

const zs = new Person('张三', 18)
const ls = new Person('李四', 19)

console.log(zs.sayHi === ls.sayHi)  // true — 共享同一方法 💡
```

⚠️ **注意**：

- 构造函数和原型对象中的 `this` 都指向**实例对象**
- **箭头函数**不能做构造函数（没有自己的 `this`）
- 原型对象中的方法如需使用 `this`，也不要用箭头函数

### 3.2 constructor 属性

| 属性     | 说明                                         |
| :------- | :------------------------------------------- |
| **位置** | 每个原型对象内部                             |
| **作用** | 指向该原型对象的构造函数（即"我是谁创建的"） |

**使用场景**：当使用对象字面量形式批量添加方法时，需要手动修复 `constructor` 指向。

```javascript
function Person(name) {
  this.name = name
}

// 对象形式赋值会覆盖原有原型内容
Person.prototype = {
  constructor: Person,  // 💡 手动指回构造函数
  sing() {
    console.log('我会唱歌')
  },
  dance() {
    console.log('我会跳舞')
  }
}

console.log(Person.prototype.constructor === Person)  // true
```

### 3.3 对象原型（**proto**）

**定义**：每个对象都有一个 `__proto__` 属性，指向构造函数的 `prototype` 原型对象。

```javascript
function Person(name) {
  this.name = name
}

const zs = new Person('张三')

// 验证原型链关系
console.log(zs.__proto__ === Person.prototype)  // true
```

⚠️ **重要提示**：

| 注意点                         | 说明                                               |
| :----------------------------- | :------------------------------------------------- |
| `__proto__` 与 `[[Prototype]]` | 现代浏览器显示为 `[[Prototype]]`，两者等价         |
| 性能影响                       | 尽量不要修改 `__proto__`，会严重影响性能           |
| 命名约定                       | `prototype` 指**原型对象**，`__proto__` 指**原型** |



## 四、原型链

### 4.1 概念与作用

**定义**：`__proto__` 属性形成的链状结构称为**原型链**。

**作用**：为对象成员查找机制提供查找方向。

```plain
查找顺序：
实例对象自身 → Person.prototype → Object.prototype → null
```

```javascript
function Person(name) {
  this.name = name
}

const zs = new Person('张三')

// 方法查找优先级演示
zs.sayHi = function () {
  console.log('实例对象的方法')      // 第1优先级
}
Person.prototype.sayHi = function () {
  console.log('Person原型对象的方法') // 第2优先级
}
Object.prototype.sayHi = function () {
  console.log('Object原型对象的方法') // 第3优先级
}

zs.sayHi()  // 输出：实例对象的方法（找到即停止）
```

### 4.2 成员查找规则

1. 查找对象自身是否有该成员
2. 若无，查找其原型对象（`__proto__` 指向的 `prototype`）
3. 若仍无，查找原型对象的原型对象（`Object` 的原型对象）
4. 依此类推，直到 `Object` 为止（`null`）

### 4.3 instanceof 运算符

**语法**：`实例对象 instanceof 构造函数`

**作用**：检测构造函数的 `prototype` 是否存在于实例对象的原型链上。

```javascript
function Person(name) {
  this.name = name
}

const zs = new Person('张三')
const arr = [1, 2, 3]

// 基础检测
console.log(zs instanceof Person)   // true
console.log(zs instanceof Object)   // true（原型链继承）

// 数组检测
console.log(arr instanceof Array)   // true
console.log(arr instanceof Object)  // true（数组继承自Object）

// 验证原型链
console.log(arr.__proto__ === Array.prototype)           // true
console.log(Array.prototype.__proto__ === Object.prototype)  // true
```



## 五、原型继承

**核心思想**：将公共属性和方法写到父级，子级通过原型继承使用。

```javascript
// 1. 定义父级构造函数（封装公共属性和方法）
function Person() {
  this.eyes = 2
}
Person.prototype.eat = function () {
  console.log('我会吃饭')
}

// 2. 定义子级构造函数
function Man() {}
function Woman() {}

// 3. 实现继承：子级原型指向父级实例
Man.prototype = new Person()
Man.prototype.constructor = Man  // 修复constructor指向

Woman.prototype = new Person()
Woman.prototype.constructor = Woman

// 4. 为子级添加特有方法
Woman.prototype.baby = function () {
  console.log('我会生孩子')
}

// 5. 创建实例
const zs = new Man()
const xl = new Woman()

console.log(zs.eyes)    // 2 — 继承自Person
console.log(xl.eyes)    // 2 — 继承自Person
console.log(xl.baby)    // 有baby方法
console.log(zs.baby)    // undefined — Man没有baby方法 💡
```

⚠️ **注意**：通过原型继承时，每个子类的原型是独立的父类实例，互不影响。
