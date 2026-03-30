## 一、事件流（Event Flow）

### 1.1 什么是事件流

**事件流**描述的是事件在页面中传播的完整路径。当用户与页面交互（如点击）时，事件会经历两个主要阶段：

| 阶段         | 方向     | 触发顺序                                | 应用场景           |
| :----------- | :------- | :-------------------------------------- | :----------------- |
| **捕获阶段** | 从外到内 | `document` → `html` → `body` → 目标元素 | 事件拦截、预处理   |
| **冒泡阶段** | 从内到外 | 目标元素 → `body` → `html` → `document` | 事件委托、默认处理 |

💡 **实际开发建议**：现代Web开发**主要使用事件冒泡**，仅在特殊需求（如全局拦截）时使用捕获阶段。

### 1.2 事件捕获（Capture Phase）

事件从DOM根元素开始，**自上而下**传递至目标元素。需显式设置 `addEventListener` 第三个参数为 `true` 才能触发。

```javascript
// 事件捕获示例
const father = document.querySelector('.father');
const son = document.querySelector('.son');

// 第三个参数 true 表示捕获阶段触发
father.addEventListener('click', function () {
  alert('父盒子捕获阶段触发');
}, true);

son.addEventListener('click', function () {
  alert('子盒子捕获阶段触发');
}, true);
// 点击子盒子时，输出顺序：父盒子 → 子盒子
```

⚠️ **注意**：IE10及以下不支持事件捕获，因此实际工作中较少使用。

### 1.3 事件冒泡（Bubble Phase）

事件从目标元素开始，**自下而上**向祖先元素传播。这是**默认行为**。

```javascript
// 事件冒泡示例（默认行为）
father.addEventListener('click', function () {
  alert('我是爸爸');
});

son.addEventListener('click', function () {
  alert('我是儿子');
}, false); // false 可省略，表示冒泡阶段
// 点击子盒子时，输出顺序：子盒子 → 父盒子
```

### 1.4 阻止事件冒泡

当需要将事件限制在当前元素内，阻止其向父级传播时，使用 `stopPropagation()` 方法。

```javascript
son.addEventListener('click', function (e) {
  alert('我是儿子');
  // 阻止事件继续向上冒泡
  e.stopPropagation();
});
```

| 方法                  | 作用                  | 兼容性     |
| :-------------------- | :-------------------- | :--------- |
| `e.stopPropagation()` | 阻止事件冒泡/捕获传播 | 标准浏览器 |

### 1.5 鼠标经过事件对比

| 事件                        | 是否冒泡 | 推荐使用场景                           |
| :-------------------------- | :------- | :------------------------------------- |
| `mouseover` / `mouseout`    | ✅ 会冒泡 | 需要冒泡传播时                         |
| `mouseenter` / `mouseleave` | ❌ 不冒泡 | **推荐**用于精确控制，避免意外触发父级 |



## 二、事件委托（Event Delegation）

### 2.1 核心概念

**事件委托**（又称事件代理）是利用事件冒泡机制，将子元素的事件处理委托给父元素统一管理的技巧。

### 2.2 为什么使用事件委托

**传统方式的性能问题**：

```javascript
// ❌ 低效做法：为每个按钮单独绑定事件
const buttons = document.querySelectorAll('table button');
for (let i = 0; i < buttons.length; i++) {
  buttons[i].addEventListener('click', function () {
    // 处理逻辑...
  });
}
// 问题：10000个元素 = 10000个监听器，大量消耗内存
```

**事件委托的优势**：

| 优势             | 说明                             |
| :--------------- | :------------------------------- |
| **减少内存占用** | 只需一个父级监听器               |
| **动态元素支持** | 新增子元素自动生效，无需重新绑定 |
| **代码简洁**     | 统一管理，易于维护               |
| **性能提升**     | 减少DOM操作和事件注册次数        |

### 2.3 实现原理与代码

利用 `event.target` 获取真正触发事件的元素：

```javascript
// ✅ 事件委托实现
const ul = document.querySelector('ul');

ul.addEventListener('click', function (e) {
  // 判断点击的是否是目标子元素
  if (e.target.tagName === 'LI') {
    e.target.style.color = 'pink';
    console.log('点击了：', e.target.textContent);
  }
});
```

**关键属性对比**：

| 属性              | 含义                            | 示例场景                       |
| :---------------- | :------------------------------ | :----------------------------- |
| `e.target`        | **实际触发**事件的元素          | 事件委托中判断具体点击的子元素 |
| `e.currentTarget` | **绑定监听**的元素（即 `this`） | 指向父级容器                   |



## 三、阻止默认行为

某些元素具有默认行为（如表单提交、链接跳转），可使用 `preventDefault()` 阻止。

```javascript
// 阻止表单默认提交
const form = document.querySelector('form');
form.addEventListener('submit', function (e) {
  const input = document.querySelector('[name=username]');
  if (input.value === '') {
    e.preventDefault(); // 阻止空表单提交
    alert('请填写用户名');
  }
});

// 阻止链接跳转
document.querySelector('a').addEventListener('click', function (e) {
  e.preventDefault();
  console.log('链接跳转已被阻止');
});
```



## 四、事件解绑（移除监听）

### 4.1 DOM Level 2 方式（推荐）

```javascript
const btn = document.querySelector('.btn');

// 命名函数便于移除
function handleClick() {
  alert('点击一次后自动解绑');
  btn.removeEventListener('click', handleClick);
}

btn.addEventListener('click', handleClick);
```

### 4.2 DOM Level 0 方式

```javascript
const btn = document.querySelector('.btn');
btn.onclick = function () {
  alert('点击一次');
  btn.onclick = null; // 解绑事件
};
```



## 五、其他常用事件

### 5.1 页面加载事件

| 事件               | 触发时机                              | 使用场景                        |
| :----------------- | :------------------------------------ | :------------------------------ |
| `load`             | **所有资源**（图片、CSS、JS）加载完毕 | 需要操作图片尺寸等资源依赖场景  |
| `DOMContentLoaded` | **HTML文档**解析完成，无需等待资源    | 快速初始化DOM操作，推荐优先使用 |

```javascript
// 等待所有资源加载
window.addEventListener('load', function() {
  // 操作图片、iframe等资源
});

// DOM结构就绪即可执行（更快）
document.addEventListener('DOMContentLoaded', function() {
  // 安全的DOM操作
});
```

### 5.2 元素滚动事件

```javascript
// 监听页面滚动
window.addEventListener('scroll', function() {
  // 获取滚动距离
  const scrollTop = document.documentElement.scrollTop;
  
  // 应用场景：固定导航栏、返回顶部按钮显示
  if (scrollTop > 100) {
    navbar.classList.add('fixed');
  }
});
```

**常用滚动属性**：

| 属性         | 说明                     | 可读写   |
| :----------- | :----------------------- | :------- |
| `scrollTop`  | 元素被卷去的**头部**距离 | 可读可写 |
| `scrollLeft` | 元素被卷去的**左侧**距离 | 可读可写 |

### 5.3 页面尺寸事件

```javascript
// 窗口尺寸改变时触发
window.addEventListener('resize', function() {
  // 响应式布局调整、canvas重绘等
  console.log('窗口宽度：', window.innerWidth);
});
```

**元素可见尺寸**（不含边框、滚动条）：

| 属性           | 说明                              |
| :------------- | :-------------------------------- |
| `clientWidth`  | 元素可见宽度（content + padding） |
| `clientHeight` | 元素可见高度（content + padding） |



## 六、元素尺寸与位置

### 6.1 尺寸属性对比

| 属性                 | 包含内容 | 包含padding | 包含border | 包含margin |
| :------------------- | :------- | :---------- | :--------- | :--------- |
| `clientWidth/Height` | content  | ✅           | ❌          | ❌          |
| `offsetWidth/Height` | content  | ✅           | ✅          | ❌          |

```javascript
const box = document.querySelector('.box');

// 可见区域尺寸（不含border）
console.log('client:', box.clientWidth, box.clientHeight);

// 实际占用尺寸（含border）
console.log('offset:', box.offsetWidth, box.offsetHeight);
```

### 6.2 位置属性

| 属性                       | 说明                              |
| :------------------------- | :-------------------------------- |
| `offsetLeft` / `offsetTop` | 相对于**定位父元素**的偏移量      |
| `clientLeft` / `clientTop` | 边框宽度（border-left/top-width） |
