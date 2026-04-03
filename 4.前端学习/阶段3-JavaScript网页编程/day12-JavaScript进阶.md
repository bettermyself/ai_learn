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







### 箭头函数

箭头函数比函数表达式更简洁的一种写法

使用场景：箭头函数更适用于那些本来需要匿名函数的地方，写法更简单

```html
<body>
  <script>
    // 箭头函数
    // 1. 基本语法
    // const fn = function () {
    //   console.log('我是函数表达式')
    // }
    // fn()
    // const fn = () => {
    //   console.log('我是箭头函数')
    // }
    // fn()

    // 2. 细节使用
    // 2.1 如果只有一个形参则可以省略小括号,其余个数不能省略，如果没有参数则写空的小括号
    // const sum = (x) => {
    //   console.log(x + x)
    // }
    // sum(2)
    // const sum = x => {
    //   console.log(x + x)
    // }
    // sum(2)

    // 2.2 如果函数体只有一句代码，则可以省略大括号，这句代码就是返回值（省略return）
    // const sum = x => {
    //   return x + x
    // }
    // const sum = x => x + x
    // console.log(sum(5))

    // 2.3 如果返回的是一个对象，则需要用小括号把对象包裹起来
    // const fn = function() {
    //   return {name: '佩奇'}
    // }
    // const fn = () => ({ name: '佩奇' })
    // console.log(fn())

    // 2.4 箭头函数里面没有 arguments，但是有剩余参数
    const fn = (...other) => {
      // console.log(arguments)
      console.log(other)
    }
    fn(1, 2)
  </script>
</body>
```

**用法细节：** 

1. 当箭头函数只有一个参数时，可以省略参数的小括号，其余个数不能省略（没有参数也需要写小括号）
2. 当箭头函数的函数体只有一句代码 可以省略函数体大括号，这句代码就是返回值（可以不用写return）
3. 如果返回的是个对象，则需要把对象用小括号包裹
4. 箭头函数里面没有arguments，但是有剩余参数

总结：

1. 箭头函数属于表达式函数，因此不存在函数提升
2. 箭头函数只有一个参数时可以省略圆括号 `()`
3. 箭头函数函数体只有一行代码时可以省略花括号 `{}`，并自动做为返回值被返回
4. 箭头函数中没有 `arguments`，只能使用 `...` 动态获取实参

####  箭头函数中的this

以前函数中的this指向是根据如何调用来确定的。简单理解就是this指向调用者

箭头函数本身没有this,它只会沿用上一层作用域的this 

~~~html
 <body>
  <button class="btn1">点击</button>
  <button class="btn2">5秒后启用</button>
  <script>
    // 1. 以前this的指向：  指向调用者
    // console.log(this)  // window
    // // 普通函数
    // function fn() {
    //   console.log(this)  // window
    // }
    // window.fn()
    // // 对象方法里面的this
    // const obj = {
    //   name: 'andy',
    //   sayHi: function () {
    //     console.log(this)  // obj
    //   }
    // }
    // obj.sayHi()

    // 2. 箭头函数的中this指向-沿用上一层作用域的this 
    const fn = () => {
      console.log(this)  // window
    }
    fn()
    // const obj = {
    //   name: 'andy',
    //   sayHi: () => {
    //     console.log(this)  // window
    //   }
    // }
    // obj.sayHi()

    const obj = {
      name: 'andy',
      sayHi: function () {
        const fun = () => {
          console.log(this)  // obj 
        }
        fun()
      }
    }
    obj.sayHi()

    // 3. 我们可以根据需求来选择是否使用箭头函数 this
    // document.querySelector('.btn1').addEventListener('click', function () {
    //   this.style.color = 'red'
    // })
    document.querySelector('.btn1').addEventListener('click', () => {
      // this.style.color = 'red'
      // 此处不能用 this 指向 Window不是 按钮了
      document.querySelector('.btn1').style.color = 'red'
    })

    document.querySelector('.btn2').addEventListener('click', function () {
      this.disabled = true
      // setTimeout(function () {
      //   console.log(this) //  定时器里面的this 指向 window 
      //   this.disabled = false
      // }, 5000)

      setTimeout(() => {
        console.log(this) //  
        this.disabled = false
      }, 5000)
    })
  </script>
</body>
~~~

### ES6对象简写

1. 在对象中，如果属性名和属性值一致，可以简写只写属性名即可
2. 在对象中，方法（函数）可以简写

~~~html
<body>
  用户名: <input type="text" class="username"> <br>
  密　码: <input type="password" class="password"> <br>
  <button>点击</button>
  <script>
    // ES6对象属性和方法的简写
    // 1. 对象属性的简写 (点击按钮生成对象)
    document.querySelector('button').addEventListener('click', function () {
      const username = document.querySelector('.username').value
      const password = document.querySelector('.password').value
      // const obj = {
      //   username: username,
      //   password: password
      // }
      // 属性名和属性值相同的时候，可以只写属性名
      // 2. 对象方法的简写
      // const obj = {
      //   username,
      //   password,
      //   sayHi: function() {
      //     console.log('hi~')
      //   }
      // }
      const obj = {
        username,
        password,
        sayHi() {
          console.log('hi~')
        }
      }
      console.log(obj)
    })


  </script>
~~~

## 解构赋值

> 知道解构的语法及分类，使用解构简洁语法快速为变量赋值。

解构赋值：可以将数组中的值或对象的属性取出，赋值给其他变量

解构：其实就是把一个事物的结构进行拆解

### 数组解构

基本语法：

1. 右侧数组的值将被赋值给左侧的变量
2. 变量的顺序对应数组值的位置依次进行赋值操作

```html
<body>
  <script>
    // 数组解构
    // 1. 基本语法
    const [a, b, c] = [1, 2, 3]
    console.log(a)
    console.log(b)
    console.log(c)

    // 2. 典型的使用场景  交换2个变量的值
    let x = 1
    let y = 2;
    [y, x] = [x, y]
    console.log(x, y);

    // 3. js 2个特殊情况需要加分号
    // 3.1 如果是小括号开头的则需要加分号
    (function () { })();
    (function () { })();
    // 3.2 如果是中括号开头的则需要加分号

  </script>
</body>
```

**变量和值不匹配的情况**

~~~html
<body>
  <script>
    // 数组解构变量和值不匹配的情况

    // 1. 变量多，值少的情况
    // const [a, b, c, d] = ['小米', '华为', '苹果']
    // console.log(a)
    // console.log(b)
    // console.log(c)
    // console.log(d) // undefined

    // 2. 防止undefined传值，可以设置默认值
    // const [a, b, c, d = '三星'] = ['小米', '华为', '苹果']
    // console.log(a)
    // console.log(b)
    // console.log(c)
    // console.log(d)

    // 3. 变量少，值多的情况
    // const [a, b] = ['小米', '华为', '苹果']
    // console.log(a)
    // console.log(b)

    // 4. 利用剩余参数解决变量少值多的情况
    // const [a, ...b] = ['小米', '华为', '苹果']
    // console.log(a)
    // console.log(b)

    // 5. 按需导入，忽略某些值
    const [a, , c, d] = ['小米', '华为', '苹果', 'vivo']
    console.log(a)
    console.log(c)
    console.log(d)
  </script>
</body>
~~~

### 对象解构

对象解构赋值：可以将对象的属性取出，赋值给其他变量

```html
<body>
  <script>
    const username = 'andy'
    const user = {
      username: '小明',
      age: 18
    }
    // 1. 对象解构赋值基本使用
    // const { username, age, gender } = user
    // console.log(username)  // 小明
    // console.log(age)  // 18
    // console.log(gender)  // undefined

    // 1.1 要求变量名和属性名必须一致
    // 1.2 如果变量名和属性名不一致，则默认为 undefined
    // 1.3 变量名不要和外面的变量名冲突，否则会报错

    // 2. 更改解构变量名（重命名）  变量名: 新变量名
    // const { username: uname, age } = user
    // console.log(uname)  // 小明
    // console.log(age)  // 18

    // 3. 对象数组解构
    const arr = [
      {
        username: '小明',
        age: 18
      }
    ]

    const [{ username: uname, age }] = arr
    console.log(uname)
    console.log(age)
  </script>
</body>
```

注：支持多维解构赋值

~~~html
<body>
  <script>
    // 1. 这是后台传递过来的数据
    const msg = {
      "code": 200,
      "msg": "获取新闻列表成功",
      "data": [
        {
          "id": 1,
          "title": "5G商用自己，三大运用商收入下降",
          "count": 58
        },
        {
          "id": 2,
          "title": "国际媒体头条速览",
          "count": 56
        },
        {
          "id": 3,
          "title": "乌克兰和俄罗斯持续冲突",
          "count": 1669
        },

      ]
    }

    // 需求1： 请将以上msg对象  采用对象解构的方式 只选出  data 方面后面使用渲染页面
    // const { data } = msg
    // console.log(data)
    // 需求2： 上面msg是后台传递过来的数据，我们需要把data选出当做参数传递给 函数
    // const { data } = msg
    // msg 虽然很多属性，但是我们利用解构只要 data值
    function render({ data }) {
      // const { data } = arr
      // 我们只要 data 数据
      // 内部处理
      console.log(data)

    }
    render(msg)

    // 需求3， 为了防止msg里面的data名字混淆，要求渲染函数里面的数据名改为 myData
    function render({ data: myData }) {
      // 要求将 获取过来的 data数据 更名为 myData
      // 内部处理
      console.log(myData)

    }
    render(msg)

  </script>
~~~

## 综合案例

### filter遍历数组

filter() 方法创建一个新的数组，新数组中的元素是符合条件的所有元素

主要使用场景： 筛选数组符合条件的元素，并返回筛选之后元素的新数组，不影响原数组

~~~html
<body>
  <script>
    // filter 筛选数组元素
    const arr = [10, 20, 30, 40]
    // const newArr = arr.filter(function (ele, index) {
    //   // console.log(ele)
    //   // console.log(index)
    //   // return 筛选条件
    //   return ele >= 30
    //   // return ele + 30 都是真的所以都选出来了
    // })

    const newArr = arr.filter(ele => ele >= 30)
    console.log(newArr)
  </script>
</body>
~~~

## 拓展-垃圾回收机制算法

堆栈空间分配区别：

1. 栈（操作系统）: 由操作系统自动分配释放函数的参数值、局部变量等，基本数据类型放到栈里面。
2. 堆（操作系统）: 一般由程序员分配释放，若程序员不释放，由垃圾回收机制回收。复杂数据类型放到堆里面。

下面介绍两种常见的浏览器垃圾回收算法: 引用计数法 和 标记清除法

### 引用计数

IE采用的引用计数算法, 定义“内存不再使用”，就是看一个对象是否有指向它的引用，没有引用了就回收对象

算法： 

1. 跟踪记录被引用的次数
2. 如果被引用了一次，那么就记录次数1,多次引用会累加 ++
3. 如果减少一个引用就减1 -- 
4. 如果引用次数是0 ，则释放内存

### 标记清除法

现代的浏览器已经不再使用引用计数算法了。

现代浏览器通用的大多是基于标记清除算法的某些改进算法，总体思想都是一致的。

核心：

1. 标记清除算法将“不再使用的对象”定义为“无法达到的对象”。 
2. 就是从根部（在JS中就是全局对象）出发定时扫描内存中的对象。凡是能从根部到达的对象，都是还需要使用的。

3.那些无法由根部出发触及到的对象被标记为不再使用，稍后进行回收。 