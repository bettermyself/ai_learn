## 一、作用域（Scope）

**作用域**规定了变量能够被访问的"范围"，离开该范围则无法访问。JavaScript 作用域分为**全局作用域**和**局部作用域**。

### 1.1 局部作用域

局部作用域分为**函数作用域**和**块作用域**。

#### 1.1.1 函数作用域

在函数内部声明的变量只能在函数内部访问，外部无法直接访问。

```javascript
function counter(x, y) {
  const s = x + y;  // 函数内部声明的变量
  console.log(s);   // 18
}

counter(10, 8);
console.log(s);     // ❌ 报错：s is not defined
```

**核心要点：**

| 特性       | 说明                                 |
| :--------- | :----------------------------------- |
| 变量隔离   | 函数内部声明的变量，函数外部无法访问 |
| 参数作用域 | 函数参数属于函数内部的局部变量       |
| 作用域隔离 | 不同函数内部声明的变量无法互相访问   |

#### 1.1.2 块作用域

使用 `{}` 包裹的代码称为代码块，`let` 和 `const` 声明的变量具有块级作用域。

```javascript
{
  let age = 18;
  console.log(age);  // ✅ 正常输出
}
console.log(age);    // ❌ 报错：age is not defined

// if 语句块
if (true) {
  let str = 'hello';
  console.log(str);  // ✅ 正常输出
}
console.log(str);    // ❌ 报错

// for 循环块
for (let i = 0; i < 3; i++) {
  console.log(i);    // ✅ 正常输出
}
console.log(i);      // ❌ 报错
```

**var vs let/const 对比：**

| 声明方式 | 块作用域 | 变量提升 | 推荐使用       |
| :------- | :------- | :------- | :------------- |
| `var`    | ❌ 无     | ✅ 有     | ⚠️ 不推荐       |
| `let`    | ✅ 有     | ❌ 无     | ✅ 推荐         |
| `const`  | ✅ 有     | ❌ 无     | ✅ 推荐（常量） |

### 1.2 全局作用域

`<script>`标签和 `.js` 文件的最外层即为全局作用域，在此声明的变量可在任何作用域访问。

```javascript
// 全局变量
const name = '小明';
const flag = true;
let x = 10;

// 函数作用域中访问全局变量
function sayHi() {
  console.log('你好' + name);  // ✅ 访问全局变量 name
}

// 块作用域中访问全局变量
if (flag) {
  let y = 5;
  console.log(x + y);  // ✅ x 是全局变量
}
```

⚠️ **注意事项：**

- 避免为 `window` 对象动态添加属性（隐式全局变量）
- 函数中未使用关键字声明的变量会成为全局变量（**不推荐**）
- **尽可能减少全局变量声明**，防止命名污染

### 1.3 作用域链

嵌套关系的作用域串联形成**作用域链**，本质是底层的**变量查找机制**（就近原则）。

```javascript
let b = 22;  // 全局作用域

function f() {
  let a = 1;  // f 的局部作用域
  
  function g() {
    // let a = 2;  // g 的局部作用域
    console.log(a);  // 1（沿作用域链向上查找）
    console.log(b);  // 22（查找到全局作用域）
  }
  g();
}
f();
```

**作用域链查找规则：**

1. **当前作用域优先** - 函数执行时优先在当前作用域查找变量
2. **逐级向上查找** - 当前作用域未找到则向父级作用域查找，直至全局作用域
3. **单向访问** - 子作用域可访问父作用域，父作用域**无法**访问子作用域
4. **未找到报错** - 全局作用域也未找到则提示变量未定义

### 1.4 垃圾回收机制（GC）

JavaScript 中内存的分配和回收自动完成，内存在不使用时会被垃圾回收器自动回收。

**内存生命周期：**

| 阶段         | 说明                                                         |
| :----------- | :----------------------------------------------------------- |
| **内存分配** | 声明变量、函数、对象时系统自动分配                           |
| **内存使用** | 读写内存，使用变量、函数等                                   |
| **内存回收** | 使用完毕由垃圾回收器自动回收（垃圾回收机制中，**可达性**是关键） |

⚠️ **内存泄漏**：程序分配的内存由于某种原因未释放或无法释放，导致内存占用持续增长。

**回收规则：**

- 全局变量：页面关闭时回收
- 局部变量：使用完毕后自动回收

### 1.5 闭包（Closure）

**定义**：闭包 = **内层函数** + **外层函数的变量**。当一个函数记住并访问其词法作用域，即使在该作用域外执行，即形成闭包。

```javascript
// 基础示例：统计函数调用次数
function createCounter() {
  let count = 0;  // 外层函数的变量（被闭包保护）
  
  return function() {
    count++;      // 内层函数访问外层变量
    console.log(`函数被调用 ${count} 次`);
  };
}

const counter = createCounter();
counter();  // 函数被调用 1 次
counter();  // 函数被调用 2 次
```

**闭包的核心作用：**

| 作用           | 说明                               |
| :------------- | :--------------------------------- |
| **数据私有化** | 封闭数据，外部无法直接访问内部变量 |
| **状态保持**   | 延长变量生命周期，实现数据持久化   |
| **模块化**     | 创建私有方法和属性，实现封装       |

⚠️ **潜在风险**：闭包可能导致**内存泄漏** - 被引用的外部变量不会被垃圾回收，长期占用内存。

### 1.6 变量提升

变量提升允许在变量声明之前访问变量（仅存在于 `var` 声明）。

```javascript
console.log(age);  // undefined（变量声明提升，赋值不提升）
var age = 18;
console.log(age);  // 18

function fn() {
  console.log(uname);  // undefined
  var uname = 'andy';
}
fn();
```

**变量提升规则：**

1. 提升到当前作用域**最前面**
2. **只提升声明**，不提升赋值
3. `let`/`const` 声明的变量**不存在**变量提升

💡 **最佳实践**：始终先声明再使用变量，使用 `let`/`const` 替代 `var` 避免变量提升带来的意外行为。



## 二、函数进阶

### 2.1 函数提升

函数声明会被提升到当前作用域最前面，但**函数表达式不存在提升**。

```javascript
// 函数声明 - 存在提升
fn();  // ✅ 正常执行
function fn() {
  console.log('函数提升');
}

// 函数表达式 - 不存在提升
fun();  // ❌ 报错：fun is not a function
var fun = function() {
  console.log('函数表达式');
};
```

### 2.2 函数参数

#### 2.2.1 arguments 对象（了解）

`arguments` 是函数内部内置的**伪数组**，包含调用函数时传入的所有实参。

```javascript
function sum() {
  let total = 0;
  // arguments 伪数组遍历
  for (let i = 0; i < arguments.length; i++) {
    total += arguments[i];
  }
  console.log(total);
}

sum(1, 2);       // 3
sum(1, 2, 3);    // 6
sum(1, 2, 3, 4); // 10
```

**arguments 特性：**

| 特性     | 说明                                 |
| :------- | :----------------------------------- |
| 存在范围 | 仅存在于函数内部                     |
| 数据类型 | 伪数组（有长度和索引，但无数组方法） |
| 使用方式 | 通过索引访问，通过 length 获取长度   |

#### 2.2.2 剩余参数（Rest Parameters）

使用 `...` 语法将不定数量的参数表示为**真数组**。

```javascript
// 基本用法
function sum(...numbers) {
  // numbers 是真数组 [1, 2, 3, 4]
  let sum = 0
      numbers.forEach(function (ele) {
        sum += ele
      })
  return sum;
}

sum(1, 2, 3, 4);  // 10

// 与其他参数结合使用
function greet(greeting, ...names) {
  console.log(`${greeting}, ${names.join('、')}!`);
}
greet('你好', '小明', '小红', '小刚');  // 你好, 小明、小红、小刚!
```

**剩余参数 vs arguments 对比：**

| 特性     | 剩余参数 `...args` | arguments          |
| :------- | :----------------- | :----------------- |
| 数据类型 | ✅ 真数组           | 伪数组             |
| 语法位置 | 形参列表末尾       | 自动创建，无需声明 |
| 箭头函数 | ✅ 支持             | ❌ 不支持           |
| 推荐程度 | ✅ **推荐**         | ⚠️ 了解即可         |

#### 2.2.3 展开运算符（Spread Operator）

将数组/对象展开为独立元素，与剩余参数语法相同但用途相反。

```javascript
const arr = [1, 2, 3];

// 1. 数组展开
console.log(...arr);  // 1 2 3

// 2. 求数组最大/最小值
console.log(Math.max(...arr));  // 3
console.log(Math.min(...arr));  // 1

// 3. 数组合并
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
const combined = [...arr1, ...arr2];  // [1, 2, 3, 4, 5, 6]
```

💡 **记忆技巧**：剩余参数是"**凝聚**"（收集多个元素为数组），展开运算符是"**拆散**"（将数组展开为元素）。

### 2.3 箭头函数（Arrow Function）

箭头函数是更简洁的函数表达式写法，特别适用于需要匿名函数的场景。

```javascript
// 基础语法对比
// 传统函数表达式
const fn = function(x) {
  return x * 2;
};

// 箭头函数
const fn = (x) => x * 2;
```

**箭头函数语法简写规则：**

| 场景           | 语法                 | 示例                       |
| :------------- | :------------------- | :------------------------- |
| 单参数         | 省略圆括号           | `x => x * 2`               |
| 无参数或多参数 | 保留圆括号           | `() => console.log('hi')`  |
| 单条语句       | 省略花括号，自动返回 | `x => x + 1`               |
| 返回对象       | 用小括号包裹对象     | `() => ({ name: '佩奇' })` |

```javascript
// 完整示例
const sum = x => x + x;           // 单参数，单语句
const greet = () => 'Hello!';     // 无参数
const getUser = () => ({           // 返回对象
  name: '小明',
  age: 18
});

// 箭头函数没有 arguments，使用剩余参数
const fn = (...args) => {
  console.log(args);  // 真数组
};
fn(1, 2, 3);
```

#### 2.3.1 箭头函数中的 this

⚠️ **关键区别**：箭头函数**没有自己的 this**，它会**继承外层作用域的 this**。

```javascript
// 传统函数：this 指向调用者
const obj = {
  name: 'andy',
  sayHi: function() {
    console.log(this);  // obj
  }
};
obj.sayHi();

// 箭头函数：this 继承外层作用域
const obj2 = {
  name: 'andy',
  sayHi: () => {
    console.log(this);  // window（继承全局作用域）
  }
};
obj2.sayHi();

// 实际应用：事件处理中保持 this 指向
document.querySelector('.btn').addEventListener('click', function() {
  this.disabled = true;  // this 指向按钮
  
  setTimeout(() => {
    // 箭头函数继承外层 function 的 this
    this.disabled = false;  // ✅ 正确指向按钮
  }, 5000);
});
```

**this 指向对比表：**

| 函数类型 | this 指向              | 适用场景                 |
| :------- | :--------------------- | :----------------------- |
| 传统函数 | 调用者（动态绑定）     | 需要动态 this 的事件处理 |
| 箭头函数 | 外层作用域（静态继承） | 需要固定 this 的回调函数 |

### 2.4 ES6 对象简写

```javascript
const username = '小明';
const age = 18;

// 1. 属性简写（属性名与变量名相同）
const user = {
  username,  // 等同于 username: username
  age        // 等同于 age: age
};

// 2. 方法简写
const person = {
  name: '小明',
  // 传统写法
  sayHi: function() {
    console.log('Hi!');
  },
  // ES6 简写
  sayHello() {
    console.log('Hello!');
  }
};
```



## 三、解构赋值（Destructuring）

解构赋值可以将数组中的值或对象的属性取出，赋值给其他变量。

### 3.1 数组解构

```javascript
// 基本语法
const [a, b, c] = [1, 2, 3];
console.log(a, b, c);  // 1 2 3

// 典型场景：交换变量值
let x = 1, y = 2;
[x, y] = [y, x];       // 无需临时变量
console.log(x, y);     // 2 1
```

**变量与值不匹配的处理：**

| 场景         | 处理方式               | 示例                                        |
| :----------- | :--------------------- | :------------------------------------------ |
| 变量多，值少 | 多余变量为 `undefined` | `const [a, b, c] = [1, 2]` → c 为 undefined |
| 设置默认值   | 使用 `=` 指定          | `const [a, b = 10] = [1]`                   |
| 变量少，值多 | 使用剩余参数           | `const [a, ...rest] = [1, 2, 3]`            |
| 按需取值     | 使用逗号跳过           | `const [a, , c] = [1, 2, 3]`                |

```javascript
// 默认值
const [a, b, c = '默认值'] = [1, 2];
console.log(c);  // '默认值'

// 剩余参数
const [first, ...others] = ['小米', '华为', '苹果'];
console.log(first);   // '小米'
console.log(others);  // ['华为', '苹果']

// 按需导入，跳过某些值
const [brand, , price] = ['iPhone', 'Apple', 9999];
console.log(brand, price);  // 'iPhone' 9999
```

### 3.2 对象解构

```javascript
const user = {
  username: '小明',
  age: 18,
  gender: '男'
};

// 基本解构（变量名必须与属性名一致）
const { username, age } = user;
console.log(username, age);  // '小明' 18

// 重命名（解决命名冲突）
const { username: uname } = user;
console.log(uname);  // '小明'

// 设置默认值
const { salary = 0 } = user;
console.log(salary);  // 0（属性不存在时使用默认值）
```

**对象数组解构：**

```javascript
const users = [
  { username: '小明', age: 18 },
  { username: '小红', age: 20 }
];

// 解构数组中的对象
const [{ username: firstName, age: firstAge }] = users;
console.log(firstName, firstAge);  // '小明' 18
```

**函数参数解构（实际应用）：**

```javascript
// 处理 API 响应数据
const response = {
  code: 200,
  msg: '获取成功',
  data: [{ id: 1, title: '新闻1' }, { id: 2, title: '新闻2' }]
};

// 直接解构需要的字段
function render({ data: newsList }) {
  // 将 data 重命名为 newsList
  console.log(newsList);
}

render(response);  // [{ id: 1, title: '新闻1' }, ...]
```



## 四、综合案例

### 4.1 filter 数组筛选

`filter()` 方法创建新数组，包含通过测试的所有元素，**不影响原数组**。

```javascript
const scores = [85, 60, 90, 55, 78];

// 筛选及格分数（>= 60）
const passed = scores.filter(score => score >= 60);
console.log(passed);   // [85, 60, 90, 78]
console.log(scores);   // [85, 60, 90, 55, 78]（原数组不变）

// 筛选优秀分数（>= 90）
const excellent = scores.filter(s => s >= 90);
console.log(excellent);  // [90]
```



## 五、拓展：垃圾回收算法详解

### 5.1 堆栈空间分配区别

| 内存区域        | 管理方式            | 存储内容                         | 回收时机             |
| :-------------- | :------------------ | :------------------------------- | :------------------- |
| **栈（Stack）** | 自动分配释放        | 基本数据类型、函数参数、局部变量 | 函数执行完毕自动释放 |
| **堆（Heap）**  | 程序员分配/垃圾回收 | 复杂数据类型（对象、数组等）     | 不再被引用时回收     |

### 5.2 引用计数法（已淘汰）

IE 早期使用的算法，通过跟踪引用次数判断对象是否可回收。

**工作原理：**

1. 记录对象被引用次数
2. 引用时计数 +1，释放引用时 -1
3. 引用次数为 0 时回收内存

⚠️ **致命缺陷**：**循环引用**无法回收（A 引用 B，B 引用 A，两者都无法被回收）。

### 5.3 标记清除法（现代标准）

现代浏览器通用的垃圾回收算法。

**核心思想：**

1. 从**根部**（全局对象）出发，定时扫描内存
2. 标记所有**可达**（被引用）的对象
3. **未标记**的对象视为不再使用，进行回收

**优势：** 解决循环引用问题，只要对象无法从根节点到达，即被回收。