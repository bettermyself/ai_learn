## 一、DOM 基础

### 1.1 什么是 API

**API**（Application Programming Interface，应用程序接口）是程序员调用以实现特定功能的接口，无需关心内部实现细节。

### 1.2 DOM 简介

**DOM**（Document Object Model，文档对象模型）用于**操作网页文档**，开发网页特效和实现用户交互。

**核心思想**：将网页内容当做**对象**来处理，通过对象的属性和方法对网页内容进行操作。

#### document 对象

`document` 是 DOM 的顶级对象，作为网页内容的入口，提供的属性和方法专门用于访问和操作网页内容。

```javascript
// 示例：document.write() 向文档写入内容
document.write('Hello World')
```



## 二、获取 DOM 元素

### 2.1 CSS 选择器方式（推荐）

#### 2.1.1 获取单个元素

| 方法              | 语法                               | 返回值               | 说明              |
| :---------------- | :--------------------------------- | :------------------- | :---------------- |
| `querySelector()` | `document.querySelector('选择器')` | 第一个匹配的元素对象 | 无匹配返回 `null` |

```javascript
// 1. 通过标签名获取
const box = document.querySelector('div')

// 2. 通过类名获取
const box = document.querySelector('.box')

// 3. 通过后代选择器获取
const li = document.querySelector('ol li')        // 获取第一个li
const li2 = document.querySelector('ol li:nth-child(2)')  // 获取第2个li

// 4. 未匹配到时返回 null
const p = document.querySelector('p')  // null
```

#### 2.1.2 获取多个元素

| 方法                 | 语法                                  | 返回值          | 说明                        |
| :------------------- | :------------------------------------ | :-------------- | :-------------------------- |
| `querySelectorAll()` | `document.querySelectorAll('选择器')` | NodeList 伪数组 | 即使只有1个元素也返回伪数组 |

```javascript
// 获取所有匹配的元素
const lis = document.querySelectorAll('.nav li')

// ⚠️ 注意：返回的是伪数组
// - 有长度和索引号
// - 没有 push/pop/splice 等数组方法
// - 需要通过循环遍历获取每个元素

for (let i = 0; i < lis.length; i++) {
  console.log(lis[i])  // 每个元素对象
}
```

### 2.2 传统获取方式（了解）

| 方法                       | 语法                                      | 返回值                | 说明             |
| :------------------------- | :---------------------------------------- | :-------------------- | :--------------- |
| `getElementById()`         | `document.getElementById('id')`           | 单个元素              | 根据ID获取       |
| `getElementsByTagName()`   | `document.getElementsByTagName('标签名')` | HTMLCollection 伪数组 | 根据标签名获取   |
| `getElementsByClassName()` | `document.getElementsByClassName('类名')` | HTMLCollection 伪数组 | 根据类名获取     |
| `getElementsByName()`      | `document.getElementsByName('name值')`    | NodeList 伪数组       | 根据name属性获取 |

```javascript
// 传统方式示例
const box = document.getElementById('box')
const items = document.getElementsByClassName('item')
const ps = document.getElementsByTagName('p')
const inputs = document.getElementsByName('username')
```



## 三、操作元素内容

| 属性        | 说明               | 特点                 |
| :---------- | :----------------- | :------------------- |
| `innerText` | 操作元素文本内容   | **不解析** HTML 标签 |
| `innerHTML` | 操作元素 HTML 内容 | **解析** HTML 标签   |

### 3.1 innerText 使用

```javascript
const box = document.querySelector('.box')

// 1. 查 - 获取文本内容
console.log(box.innerText)  // 输出: 古丽扎娜

// 2. 改 - 修改文本内容
box.innerText = '迪丽热巴'

// 3. 增 - 添加文本内容
box.innerText = '佟丽丫丫'

// 4. 删 - 清空内容（赋空字符串）
box.innerText = ''
```

### 3.2 innerHTML 使用

```javascript
// innerHTML 会解析 HTML 标签
box.innerHTML = '<strong>迪丽热巴</strong>'  // 文本显示为粗体
```

💡 **建议**：文本内容包含 HTML 标签时使用 `innerHTML`，否则建议使用 `innerText`。

### 3.3 案例：年会抽奖

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>年会抽奖</title>
  <style>
    .wrapper {
      width: 840px;
      height: 420px;
      background: url(./images/bg01.jpg) no-repeat center / cover;
      padding: 100px 250px;
      box-sizing: border-box;
    }
    .wrapper span { color: #b10e0d; }
  </style>
</head>
<body>
  <div class="wrapper">
    <strong>年会抽奖</strong>
    <h1>一等奖：<span class="one">???</span></h1>
    <h3>二等奖：<span class="two">???</span></h3>
    <h5>三等奖：<span class="three">???</span></h5>
  </div>

  <script>
    // 参与抽奖的人员名单
    const arr = ['迪丽热巴', '古丽扎娜', '佟丽丫丫', '马尔扎哈']
    
    // 抽取一等奖
    const random = Math.floor(Math.random() * arr.length)
    document.querySelector('.one').innerText = arr[random]
    arr.splice(random, 1)  // 删除已中奖人员，避免重复
    
    // 抽取二等奖
    const random2 = Math.floor(Math.random() * arr.length)
    document.querySelector('.two').innerText = arr[random2]
    arr.splice(random2, 1)
    
    // 抽取三等奖
    const random3 = Math.floor(Math.random() * arr.length)
    document.querySelector('.three').innerText = arr[random3]
    arr.splice(random3, 1)
  </script>
</body>
</html>
```



## 四、操作元素属性

### 4.1 常用属性操作

可直接通过属性名修改元素的常见属性，如 `src`、`href`、`title`、`alt` 等。

```javascript
const img = document.querySelector('img')

// 1. 查 - 获取属性值
console.log(img.src)

// 2. 改 - 修改属性值
img.src = './images/3.png'

// 3. 增 - 添加新属性
img.title = '我是播仔，我是不是很可爱'

// 4. 删 - 清空属性值
img.alt = ''
```

### 4.2 案例：随机显示图片

```javascript
// 图片地址数组
const arr = [
  './images/1.png',
  './images/2.png',
  './images/3.png',
  './images/4.png'
]

const img = document.querySelector('img')

// 随机抽取图片地址
const random = Math.floor(Math.random() * arr.length)

// 赋值给 src 属性
img.src = arr[random]
```

### 4.3 操作样式属性

#### 方式一：通过 style 属性

```javascript
const box = document.querySelector('.box')

// 直接设置样式（使用小驼峰命名法）
box.style.width = '300px'
box.style.marginTop = '50px'        // margin-top → marginTop
box.style.backgroundColor = 'skyblue'  // background-color → backgroundColor
```

⚠️ **注意事项**：

1. 修改样式通过 `style` 属性引出
2. 属性名含 `-` 连接符时，转换为**小驼峰命名法**
3. 赋值时不要忘记添加 CSS 单位（如 `px`）

#### 方式二：通过 className 操作类名

```javascript
const box = document.querySelector('.box')

// 设置类名（会覆盖原有类名）
box.className = 'circle'

// 保留原有类名并添加新类名
box.className = 'box circle'
```

⚠️ **注意**：`className` 使用新值替换旧值，如需保留原有类名需手动拼接。

#### 方式三：通过 classList 操作类名（推荐）

| 方法                       | 作用     | 说明                     |
| :------------------------- | :------- | :----------------------- |
| `classList.add('类名')`    | 添加类名 | 追加类名，不覆盖原有类名 |
| `classList.remove('类名')` | 移除类名 | 删除指定类名             |
| `classList.toggle('类名')` | 切换类名 | 有则删除，无则添加       |

```javascript
const box = document.querySelector('.box')

// 追加类名
box.classList.add('circle')

// 删除类名
box.classList.remove('box')

// 切换类名（有则删，无则加）
box.classList.toggle('circle')
```

### 4.4 操作表单元素属性

表单元素属性操作与其他标签类似，但**布尔型属性**（`disabled`、`checked`、`selected`）使用布尔值控制。

```javascript
// 1. 操作 type 和 value 属性
const username = document.querySelector('[name=username]')
username.type = 'password'           // 修改类型
username.value = '请输入用户名'       // 修改值
username.value = ''                  // 清空值

// 2. 禁用按钮（布尔型属性）
const button = document.querySelector('button')
button.disabled = true   // true: 禁用按钮
button.disabled = false  // false: 启用按钮

// 3. 勾选复选框（布尔型属性）
const agree = document.querySelector('[name=agree]')
agree.checked = true   // true: 选中
agree.checked = false  // false: 未选中
```

### 4.5 自定义属性（data-*）

HTML5 提供 `data-*` 自定义属性，用于存储数据，通过 `dataset` 对象获取。

```html
<!-- HTML 中定义自定义属性 -->
<div class="box" data-id="1" data-name="box"></div>
```

```javascript
const box = document.querySelector('.box')

// 获取自定义属性
console.log(box.dataset)       // 返回包含所有 data-* 属性的对象
console.log(box.dataset.id)    // "1"
console.log(box.dataset.name)  // "box"
```



## 五、定时器 - 间隔函数

### 5.1 开启定时器

使用 `setInterval()` 每隔固定时间重复执行指定函数。

```javascript
// 语法：setInterval(回调函数, 间隔时间)
setInterval(function () {
  console.log('每秒执行一次')
}, 1000)  // 间隔时间单位：毫秒
```

### 5.2 关闭定时器

使用 `clearInterval()` 关闭定时器，需要传入定时器标识符。

```javascript
// 1. 开启定时器并保存标识符
let timer = setInterval(function () {
  console.log('执行中...')
}, 1000)

// 2. 关闭定时器
clearInterval(timer)
```

💡 **提示**：`setInterval()` 返回唯一的数字标识符，可用于关闭对应的定时器。



## 六、综合案例：定时轮播图

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>定时轮播图</title>
  <style>
    * { box-sizing: border-box; }
    
    .slider {
      width: 560px;
      height: 400px;
      overflow: hidden;
    }
    
    .slider-wrapper {
      width: 100%;
      height: 320px;
    }
    
    .slider-wrapper img {
      width: 100%;
      height: 100%;
      display: block;
    }
    
    .slider-footer {
      height: 80px;
      background-color: rgb(100, 67, 68);
      padding: 12px;
      position: relative;
    }
    
    .slider-footer p {
      margin: 0;
      color: #fff;
      font-size: 18px;
    }
    
    .slider-indicator {
      display: flex;
      list-style: none;
      padding: 0;
      margin: 10px 0 0;
    }
    
    .slider-indicator li {
      width: 8px;
      height: 8px;
      margin: 4px;
      border-radius: 50%;
      background: #fff;
      opacity: 0.4;
      cursor: pointer;
    }
    
    .slider-indicator li.active {
      width: 12px;
      height: 12px;
      opacity: 1;
    }
  </style>
</head>
<body>
  <div class="slider">
    <div class="slider-wrapper">
      <img src="./images/slider01.jpg" alt="">
    </div>
    <div class="slider-footer">
      <p>对人类来说会不会太超前了？</p>
      <ul class="slider-indicator">
        <li class="active"></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
      </ul>
    </div>
  </div>

  <script>
    // 轮播图数据
    const sliderData = [
      { url: './images/slider01.jpg', title: '对人类来说会不会太超前了？', color: 'rgb(100, 67, 68)' },
      { url: './images/slider02.jpg', title: '开启剑与雪的黑暗传说！', color: 'rgb(43, 35, 26)' },
      { url: './images/slider03.jpg', title: '真正的jo厨出现了！', color: 'rgb(36, 31, 33)' },
      { url: './images/slider04.jpg', title: '李玉刚：让世界通过B站看到东方大国文化', color: 'rgb(139, 98, 66)' },
      { url: './images/slider05.jpg', title: '快来分享你的寒假日常吧~', color: 'rgb(67, 90, 92)' },
      { url: './images/slider06.jpg', title: '哔哩哔哩小年YEAH', color: 'rgb(166, 131, 143)' },
      { url: './images/slider07.jpg', title: '一站式解决你的电脑配置问题！！！', color: 'rgb(53, 29, 25)' },
      { url: './images/slider08.jpg', title: '谁不想和小猫咪贴贴呢！', color: 'rgb(99, 72, 114)' }
    ]
    
    // 获取元素
    const img = document.querySelector('.slider-wrapper img')
    const p = document.querySelector('.slider-footer p')
    const footer = document.querySelector('.slider-footer')
    
    // 信号量：控制当前显示的图片索引
    let i = 0
    
    // 开启定时器，每秒切换一次
    setInterval(function () {
      // 索引递增，到达末尾后回到开头
      i = (i + 1) % sliderData.length
      
      // 1. 更换图片
      img.src = sliderData[i].url
      
      // 2. 更换标题
      p.innerText = sliderData[i].title
      
      // 3. 更换背景色
      footer.style.backgroundColor = sliderData[i].color
      
      // 4. 更新小圆点状态
      // 4.1 移除当前激活状态
      document.querySelector('.slider-indicator .active').classList.remove('active')
      
      // 4.2 添加新的激活状态（nth-child从1开始计数）
      document.querySelector(`.slider-indicator li:nth-child(${i + 1})`).classList.add('active')
      
    }, 1000)
  </script>
</body>
</html>
```



## 七、API 速查表

| 类别         | 属性/方法                             | 作用                       |
| :----------- | :------------------------------------ | :------------------------- |
| **获取元素** | `document.querySelector('选择器')`    | 获取第一个匹配元素         |
|              | `document.querySelectorAll('选择器')` | 获取所有匹配元素（伪数组） |
| **操作内容** | `元素.innerText`                      | 操作文本内容（不解析标签） |
|              | `元素.innerHTML`                      | 操作 HTML 内容（解析标签） |
| **操作样式** | `元素.style.属性名`                   | 直接设置行内样式           |
|              | `元素.className`                      | 设置类名（覆盖式）         |
|              | `元素.classList.add('类名')`          | 追加类名                   |
|              | `元素.classList.remove('类名')`       | 移除类名                   |
|              | `元素.classList.toggle('类名')`       | 切换类名                   |
| **操作属性** | `元素.属性名`                         | 获取/设置标准属性          |
|              | `元素.dataset.xxx`                    | 获取 data-* 自定义属性     |
| **表单属性** | `元素.disabled`                       | 布尔值，控制禁用状态       |
|              | `元素.checked`                        | 布尔值，控制选中状态       |
| **定时器**   | `setInterval(fn, 毫秒)`               | 开启间隔定时器             |
|              | `clearInterval(标识符)`               | 关闭定时器                 |
