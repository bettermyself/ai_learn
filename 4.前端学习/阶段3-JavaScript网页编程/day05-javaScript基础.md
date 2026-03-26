## 一、对象（Object）

### 1.1 概述

**对象**是JavaScript中的一种引用数据类型，用于存储数据。与数组相比，对象采用**键值对**形式存储数据，语义更明确，能够详细描述事物的多个特征。

| 特性     | 对象（Object）      | 数组（Array）          |
| :------- | :------------------ | :--------------------- |
| 数据结构 | 键值对（Key-Value） | 有序索引集合           |
| 访问方式 | 通过属性名（无序）  | 通过索引（有序）       |
| 适用场景 | 描述实体特征        | 存储有序列表           |
| 遍历方式 | `for...in`          | `for` 循环或 `forEach` |

### 1.2 对象的组成

对象由**属性**和**方法**组成：

- **属性**：描述性信息（名词），如姓名、年龄、性别
- **方法**：行为性信息（动词），本质是依附在对象中的函数

### 1.3 对象属性操作

#### 定义属性

```javascript
// 定义对象并初始化属性
let pig = {
  sex: '女',
  age: 4,
  uname: '佩奇',
  weight: 12.6
};
```

#### 访问属性

使用**点语法**（`.`）访问对象属性：

```javascript
// 访问对象属性：对象.属性名
console.log(pig.age);     // 输出: 4
console.log(pig.weight);  // 输出: 12.6
```

### 1.4 对象方法操作

#### 定义方法

```javascript
let pig = {
  uname: '佩奇',
  sing: function () {
    console.log('唱歌');
  },
  dance: function () {
    console.log('跳舞');
  },
  sum: function (x, y) {
    return x + y;  // 方法可以有参数和返回值
  }
};
```

#### 调用方法

```javascript
// 调用对象方法：对象.方法名()
pig.sing();           // 输出: 唱歌
pig.dance();          // 输出: 跳舞

// 带参数和返回值的方法调用
let result = pig.sum(1, 2);
console.log(result);  // 输出: 3
```

⚠️ **注意**：同一对象中属性或方法名称重复时，**后者会覆盖前者**。

### 1.5 对象的增删改查（CRUD）

| 操作             | 语法                         | 示例                     |
| :--------------- | :--------------------------- | :----------------------- |
| **查**（Read）   | `对象.属性` 或 `对象.方法()` | `pig.age` / `pig.sing()` |
| **增**（Create） | `对象.新属性 = 值`           | `pig.age = 4`            |
| **改**（Update） | `对象.属性 = 新值`           | `pig.uname = '小猪佩奇'` |
| **删**（Delete） | `delete 对象.属性`           | `delete pig.age`         |

```javascript
let pig = { uname: '佩奇' };

// 1. 查
console.log(pig.uname);

// 2. 增
pig.age = 4;
pig.dance = function () { console.log('跳舞'); };

// 3. 改
pig.uname = '小猪佩奇';

// 4. 删（较少使用）
delete pig.age;
```

### 1.6 属性访问的替代语法

对于包含特殊字符（如中横线）的属性名，点语法无法使用，需采用**方括号语法**：

```javascript
let pig = {
  'pig-name': '佩奇',  // 多词属性
  age: 4
};

// 错误：console.log(pig.pig-name);  // NaN
// 正确：
console.log(pig['pig-name']);  // 佩奇
console.log(pig['age']);       // 4，等同于 pig.age
```

💡 **使用建议**：

- 常规属性使用**点语法**（简洁）
- 多词属性或需要**动态解析变量**时使用方括号语法

### 1.7 遍历对象

由于对象**无长度属性**且**无序**，传统 `for` 循环不适用，应使用 **`for...in`** 循环：

#### 语法结构

```javascript
for (let 变量 in 对象) {
  console.log(变量);        // 输出: 属性名（字符串）
  console.log(对象[变量]); // 输出: 属性值
}
```

#### 完整示例

```javascript
let pig = {
  sex: '女',
  age: 4,
  uname: '佩奇',
  weight: 12.6
};

for (let key in pig) {
  console.log(key);        // 依次输出: sex, age, uname, weight
  console.log(pig[key]);   // 依次输出对应的属性值
}
```

⚠️ **关键要点**：

1. `key` 是变量，存储属性名字符串
2. **必须使用方括号语法** `pig[key]` 访问值，不能用 `pig.key`
3. `for...in` **主要用于遍历对象**，不推荐用于数组（会返回字符串索引）

```javascript
// 不推荐：for...in 遍历数组
let arr = ['red', 'green', 'pink'];
for (let k in arr) {
  console.log(k);  // 输出: "0", "1", "2"（字符串类型）
}
```



## 二、内置对象

JavaScript提供多种内置对象，开发者可直接调用其属性和方法。

### 2.1 Math 数学对象

`Math` 对象包含数学常数和常用计算方法：

| 属性/方法      | 作用     | 示例                | 返回值       |
| :------------- | :------- | :------------------ | :----------- |
| `Math.PI`      | 圆周率   | `Math.PI`           | `3.14159...` |
| `Math.max()`   | 最大值   | `Math.max(8, 3, 1)` | `8`          |
| `Math.min()`   | 最小值   | `Math.min(8, 3, 1)` | `1`          |
| `Math.abs()`   | 绝对值   | `Math.abs(-1)`      | `1`          |
| `Math.ceil()`  | 向上取整 | `Math.ceil(3.1)`    | `4`          |
| `Math.floor()` | 向下取整 | `Math.floor(3.8)`   | `3`          |
| `Math.round()` | 四舍五入 | `Math.round(3.8)`   | `4`          |

```javascript
// 取整方法对比
console.log(Math.ceil(1.1));   // 2  （向上取整，往大了取）
console.log(Math.ceil(-1.5));  // -1 （负数向上取整）

console.log(Math.floor(1.8));  // 1  （向下取整，往小了取）
console.log(Math.floor(-1.5)); // -2 （负数向下取整）

// 四舍五入特殊行为：.5 向正无穷方向舍入
console.log(Math.round(1.5));  // 2
console.log(Math.round(-1.5)); // -1（向+∞方向舍入）
```

### 2.2 随机数生成

`Math.random()` 返回 `[0, 1)` 范围内的随机小数（包含0，不包含1）。

#### 常用随机数公式

| 需求                 | 公式                                          | 说明                   |
| :------------------- | :-------------------------------------------- | :--------------------- |
| 0 ~ 10 的随机整数    | `Math.floor(Math.random() * 11)`              | 乘以(最大值+1)         |
| 5 ~ 15 的随机整数    | `Math.floor(Math.random() * 11) + 5`          | 先乘差值+1，再加最小值 |
| **N ~ M 的随机整数** | `Math.floor(Math.random() * (M - N + 1)) + N` | 通用公式               |

```javascript
// 1. 生成 0 ~ 10 的随机整数
// Math.random() * 11 → [0, 10.999...)
// Math.floor() → [0, 10]
let random0_10 = Math.floor(Math.random() * 11);

// 2. 生成 5 ~ 15 的随机整数
// Math.random() * 11 → [0, 10.999...)
// + 5 → [5, 15.999...)
// Math.floor() → [5, 15]
let random5_15 = Math.floor(Math.random() * 11) + 5;

// 3. 通用公式：生成 N ~ M 的随机整数
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 使用示例：生成 4 ~ 12 的随机整数
console.log(getRandomInt(4, 12));
```

💡 **公式推导**：

- `Math.random()` 生成 `[0, 1)`
- 乘以 `(M - N + 1)` 得到 `[0, M-N+1)`
- 加上 `N` 得到 `[N, M+1)`
- `Math.floor()` 最终得到 `[N, M]` 的整数



## 三、综合案例：数据渲染页面

### 3.1 案例需求

根据对象数组数据动态渲染课程列表页面。

![67109213470](assets/1671092134703.png)

### 3.2 实现思路

1. **准备数据**：对象数组存储课程信息（图片、标题、学习人数）
2. **字符串拼接**：利用循环生成多个 HTML 标签字符串
3. **DOM插入**：将拼接好的字符串添加到页面容器中

### 3.3 完整代码

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>学成在线 - 精品课程</title>
  <link rel="stylesheet" href="./css/index.css">
</head>
<body>
  <script>
    // 1. 准备课程数据（对象数组）
    let data = [
      { src: './uploads/quality01.png', title: 'JavaScript数据看板项目实战', num: 1125 },
      { src: './uploads/quality02.png', title: 'Vue.js实战——面经全端项目', num: 2726 },
      { src: './uploads/quality03.png', title: '玩转Vue全家桶，iHRM人力资源项目', num: 9456 },
      { src: './uploads/quality04.png', title: 'Vue.js实战医疗项目——优医问诊', num: 7192 },
      { src: './uploads/quality05.png', title: '小程序实战：小兔鲜电商小程序项目', num: 2703 },
      { src: './uploads/quality06.png', title: '前端框架Flutter开发实战', num: 2841 },
      { src: './uploads/quality07.png', title: '熟练使用React.js——极客园H5项目', num: 95682 },
      { src: './uploads/quality08.png', title: '熟练使用React.js——极客园PC端项目', num: 904 },
      { src: './uploads/quality09.png', title: '前端实用技术，Fetch API 实战', num: 1516 },
      { src: './uploads/quality10.png', title: '前端高级Node.js零基础入门教程', num: 2766 }
    ];

    // 2. 循环拼接生成课程卡片 HTML 字符串
    let str = '';
    for (let i = 0; i < data.length; i++) {
      str += `
        <li>
          <a href="#">
            <div class="pic">
              <img src="${data[i].src}" alt="">
            </div>
            <h4>${data[i].title}</h4>
            <p><span>高级</span> · <i>${data[i].num}</i>人在学习</p>
          </a>
        </li>
      `;
    }

    // 3. 使用 document.write 渲染到页面（实际开发建议使用 DOM 操作）
    document.write(`
      <div class="course wrapper">
        <div class="hd">
          <h3>精品推荐</h3>
          <a href="#">查看全部<span class="iconfont icon-arrow-right-bold"></span></a>
        </div>
        <div class="bd">
          <ul class="common">${str}</ul>
        </div>
      </div>
    `);
  </script>
</body>
</html>
```



## 四、数据存储与变量声明

### 4.1 内存分配原理

| 存储区域        | 特点               | 存储内容                                                  |
| :-------------- | :----------------- | :-------------------------------------------------------- |
| **栈（Stack）** | 访问速度快，容量小 | 基本数据类型（Number, String, Boolean，nul, undefined等） |
| **堆（Heap）**  | 容量大，访问相对慢 | 引用数据类型（Object, Array, Function等）                 |

### 4.2 变量声明建议

💡 **最佳实践**：**优先使用 `const`**，需要修改时再改为 `let`

```javascript
// 推荐做法
const PI = 3.14159;           // 常量，不会修改
const user = { name: '张三' }; // 对象引用不变，但属性可修改

// 需要重新赋值时使用 let
let count = 0;
count = 1;  // 允许修改
```

**使用 `const` 的优势**：

- 明确标识不可重新赋值的变量，提高代码可读性
- 避免意外修改变量引用，减少 Bug
- 现代框架（React、Vue）中普遍采用
