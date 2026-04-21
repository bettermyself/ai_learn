## 一、深浅拷贝

### 1.1 浅拷贝（Shallow Copy）

**浅拷贝**：创建一个新对象，复制原始对象的第一层属性值。如果属性是基本数据类型，拷贝的是值；如果是引用数据类型，拷贝的是内存地址。

⚠️ **注意**：浅拷贝后，新旧对象的嵌套对象仍然共享同一引用，修改嵌套属性会影响原对象。

#### 常见实现方法

| 目标类型 | 方法                       | 示例                                    |
| :------- | :------------------------- | :-------------------------------------- |
| **对象** | `Object.assign()`          | `const newObj = Object.assign({}, obj)` |
| **对象** | 展开运算符                 | `const newObj = { ...obj }`             |
| **数组** | `Array.prototype.concat()` | `const newArr = [].concat(arr)`         |
| **数组** | 展开运算符                 | `const newArr = [ ...arr ]`             |

#### 代码示例

```javascript
// 1. 对象浅拷贝
const obj = { name: '佩奇' };
const newObj = { ...obj };

console.log(newObj === obj);  // false（不同引用）
newObj.name = '乔治';
console.log(obj.name);        // "佩奇"（基本类型，互不影响）

// 2. 数组浅拷贝
const arr = ['佩奇', '乔治'];
const newArr = [...arr];
newArr[1] = '猪爸爸';
console.log(arr[1]);          // "乔治"（基本类型，互不影响）

// 3. ⚠️ 浅拷贝的局限性：嵌套对象共享引用
const deepObj = {
  name: '佩奇',
  family: { father: '猪爸爸' }
};
const copiedObj = { ...deepObj };
copiedObj.family.father = 'dad';

console.log(deepObj.family.father);   // "dad"（原对象被修改！）
console.log(copiedObj.family.father); // "dad"
```

### 1.2 深拷贝（Deep Copy）

**深拷贝**：递归复制对象的所有层级，生成完全独立的新对象，新旧对象互不影响。

#### 实现方法对比

| 方法                   | 优点                   | 缺点                                             | 适用场景           |
| :--------------------- | :--------------------- | :----------------------------------------------- | :----------------- |
| **JSON序列化**         | 简单，一行代码         | 忽略 `function`、`undefined`、`Symbol`、循环引用 | 纯数据对象         |
| **Lodash `cloneDeep`** | 功能完善，处理边界情况 | 需引入第三方库                                   | 生产环境复杂对象   |
| **递归实现**           | 无依赖，可定制         | 需处理循环引用、特殊类型                         | 学习原理、简单场景 |

#### 方法一：JSON 序列化

```javascript
const obj = {
  name: '佩奇',
  family: { father: '猪爸爸' },
  hobby: ['跳泥坑', '唱歌'],
  love: undefined,           // ⚠️ 会被忽略
  sayHi() {                  // ⚠️ 会被忽略
    console.log('我会唱歌');
  }
};

const newObj = JSON.parse(JSON.stringify(obj));

console.log(newObj === obj);           // false
newObj.family.father = 'dad';
console.log(obj.family.father);        // "猪爸爸"（原对象不受影响）
console.log(newObj.love);              // undefined（属性丢失）
console.log(newObj.sayHi);             // undefined（方法丢失）
```

#### 方法二：Lodash 库

```html
<!-- 引入 lodash -->
<script src="./js/lodash.min.js"></script>
<script>
  const obj = {
    name: '佩奇',
    love: undefined,
    family: { father: '猪爸爸' },
    hobby: ['跳泥坑', '唱歌'],
    sayHi() {
      console.log('我会唱歌');
    }
  };

  // 💡 使用 _.cloneDeep() 实现完美深拷贝
  const newObj = _.cloneDeep(obj);
  
  newObj.family.father = 'dad';
  console.log(obj.family.father);   // "猪爸爸"（完全独立）
  console.log(newObj.sayHi);        // function（保留方法）
</script>
```

#### 方法三：递归实现

```javascript
/**
 * 递归实现深拷贝
 * @param {Object|Array} oldObj - 待拷贝的对象或数组
 * @returns {Object|Array} 深拷贝后的新对象
 */
function cloneDeep(oldObj) {
  // 1. 判断是数组还是对象，初始化新容器
  const newObj = Array.isArray(oldObj) ? [] : {};

  // 2. 遍历所有属性
  for (let key in oldObj) {
    // 3. 判断属性值类型
    if (typeof oldObj[key] === 'object') {
      // 3.1 引用类型：递归拷贝
      newObj[key] = cloneDeep(oldObj[key]);
    } else {
      // 3.2 基本类型：直接赋值
      newObj[key] = oldObj[key];
    }
  }

  return newObj;
}

// 使用示例
const obj = {
  name: '佩奇',
  family: { father: '猪爸爸' },
  hobby: ['跳泥坑', '唱歌']
};

const newObj = cloneDeep(obj);
newObj.family.father = 'dad';

console.log(obj.family.father);    // "猪爸爸"（原对象不受影响）
console.log(newObj.family.father); // "dad"
```

💡 **技巧**：现代浏览器支持原生深拷贝 API `structuredClone(obj)`，功能比 JSON 方法更完善。



## 二、异常处理

### 2.1 throw 抛出异常

使用 `throw` 主动抛出异常，中断程序执行并提供错误信息。

```javascript
function counter(x, y) {
  if (!x || !y) {
    // 抛出字符串（不推荐）
    // throw '参数不能为空!';
    
    // ✅ 推荐：使用 Error 对象，信息更完整
    throw new Error('参数不能为空!');
  }
  return x + y;
}

counter(); // Error: 参数不能为空!
```

**要点总结**：

- `throw` 会**终止程序执行**
- 优先使用 `new Error()` 获取堆栈信息
- 可抛出任意类型（字符串、数字、对象等）

### 2.2 try...catch 捕获异常

预估可能出错的代码，避免程序崩溃。

```javascript
function fetchData() {
  try {
    // 可能出错的代码
    const data = JSON.parse('{ invalid json }');
    return data;
  } catch (error) {
    // 错误处理
    console.error('解析失败:', error.message);
    return null; // 提供降级方案
  } finally {
    // 无论成功与否都会执行（常用于清理资源）
    console.log('执行完毕');
  }
}
```

**执行规则**：

1. `try` 代码块无错误 → 跳过 `catch`，执行 `finally`
2. `try` 代码块有错误 → 执行 `catch`，再执行 `finally`
3. `finally` 始终执行（即使在 `try`/`catch` 中使用了 `return`）

### 2.3 debugger 断点调试

在代码中插入 `debugger` 语句，浏览器开发者工具会自动在此位置暂停执行，相当于手动设置断点。

```javascript
function complexCalculation(a, b) {
  const sum = a + b;
  debugger; // ⏸️ 执行到此会暂停，可查看变量值
  return sum * 2;
}
```



## 三、处理 this 指向

### 3.1 this 指向规则

`this` 的指向**不取决于函数定义位置**，而取决于**调用方式**：

| 调用场景            | this 指向                        | 示例                                |
| :------------------ | :------------------------------- | :---------------------------------- |
| **全局调用**        | `window`（严格模式 `undefined`） | `fn()`                              |
| **对象方法**        | 调用对象                         | `obj.fn()`                          |
| **构造函数**        | 实例对象                         | `new Person()`                      |
| **事件处理**        | 触发事件的 DOM 元素              | `btn.addEventListener('click', fn)` |
| **箭头函数**        | 继承上一级作用域                 | `const fn = () => this`             |
| **call/apply/bind** | 指定的对象                       | `fn.call(obj)`                      |

```javascript
// 1. 全局调用
function fn() {
  console.log(this); // window
}
fn();

// 2. 对象方法
const obj = {
  name: '佩奇',
  sayHi() {
    console.log(this); // obj 对象
  }
};
obj.sayHi();

// 3. 构造函数
function Person(name) {
  this.name = name;
  console.log(this); // 实例对象
}
const p = new Person('佩奇');

// 4. 事件处理
document.querySelector('button').addEventListener('click', function() {
  console.log(this); // button 元素
});

// 5. 箭头函数（无自身 this，继承外层）
const arrow = () => {
  console.log(this); // 继承定义时的 this
};
```

### 3.2 改变 this 指向的方法

JavaScript 提供三种方法动态指定函数内部的 `this`：

| 方法        | 是否立即执行 | 参数形式                | 返回值             | 典型应用场景           |
| :---------- | :----------- | :---------------------- | :----------------- | :--------------------- |
| **`call`**  | ✅ 是         | 参数列表 `(arg1, arg2)` | 函数执行结果       | 检测数据类型、借用方法 |
| **`apply`** | ✅ 是         | 数组 `[arg1, arg2]`     | 函数执行结果       | 数组相关操作（求最值） |
| **`bind`**  | ❌ 否         | 参数列表 `(arg1, arg2)` | 绑定 this 的新函数 | 回调函数、定时器       |

#### call() 方法

```javascript
const obj = { name: '佩奇' };

function greet(greeting, punctuation) {
  console.log(`${greeting}, ${this.name}${punctuation}`);
}

// 调用函数并指定 this 为 obj
greet.call(obj, '你好', '!'); // "你好, 佩奇!"

// 💡 经典应用：精确检测数据类型
console.log(Object.prototype.toString.call([]));      // "[object Array]"
console.log(Object.prototype.toString.call(null));    // "[object Null]"
console.log(Object.prototype.toString.call(/abc/));   // "[object RegExp]"
```

#### apply() 方法

```javascript
const obj = { name: '佩奇' };

function sum(a, b) {
  console.log(this.name + ' 计算:', a + b);
}

// 参数以数组形式传递
sum.apply(obj, [10, 20]); // "佩奇 计算: 30"

// 💡 经典应用：求数组最值（无需展开运算符）
const nums = [5, 2, 8, 1, 9];
console.log(Math.max.apply(null, nums)); // 9
console.log(Math.min.apply(null, nums)); // 1
```

#### bind() 方法

```javascript
const obj = { name: '佩奇' };

function greet() {
  console.log(this.name);
}

// 返回新函数，不立即执行
const boundFn = greet.bind(obj);
boundFn(); // "佩奇"

// 💡 经典应用：定时器中保持 this 指向
const btn = document.querySelector('.code');
btn.addEventListener('click', function() {
  this.innerHTML = '05秒后重新获取';
  
  setInterval(function() {
    console.log(this); // 如果不绑定，this 指向 window
    this.innerHTML = '重新获取';
  }.bind(this), 1000); // ✅ 绑定外层 this
});
```



## 四、性能优化

### 4.1 防抖（Debounce）

**定义**：单位时间内频繁触发事件，**只执行最后一次**。

**类比**：电梯关门 —— 最后一个人进入后，等待几秒才关门。

**适用场景**：

- 搜索框输入（用户停止输入后才搜索）
- 表单验证（输入完成后校验）
- 窗口 resize（调整结束后计算布局）

#### Lodash 实现

```html
<script src="./js/lodash.min.js"></script>
<script>
  const box = document.querySelector('.box');
  let i = 1;
  
  function mouseMove() {
    box.innerHTML = i++;
  }
  
  // 500ms 内只执行最后一次
  box.addEventListener('mousemove', _.debounce(mouseMove, 500));
</script>
```

#### 手写防抖函数

```javascript
/**
 * 防抖函数
 * @param {Function} fn - 要执行的函数
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
function debounce(fn, delay) {
  let timer = null; // 定时器标识

  return function (...args) {
    // 1. 清除之前的定时器（核心：重置计时）
    if (timer) clearTimeout(timer);

    // 2. 创建新的定时器
    timer = setTimeout(() => {
      fn.apply(this, args); // 3. 延迟执行，保持 this 指向
    }, delay);
  };
}

// 使用示例
const box = document.querySelector('.box');
box.addEventListener('mousemove', debounce(function(e) {
  console.log('鼠标位置:', e.clientX, e.clientY);
}, 500));
```

### 4.2 节流（Throttle）

**定义**：单位时间内频繁触发事件，**只执行一次**。

**类比**：技能冷却 —— 释放技能后，必须等待冷却时间才能再次释放。

**适用场景**：

- 高频事件：`mousemove`、`scroll`、`resize`
- 按钮点击防重复提交
- 游戏动画帧控制

#### Lodash 实现

```html
<script src="./js/lodash.min.js"></script>
<script>
  const box = document.querySelector('.box');
  let i = 1;
  
  function mouseMove() {
    box.innerHTML = i++;
  }
  
  // 每 3000ms 最多执行一次
  box.addEventListener('mousemove', _.throttle(mouseMove, 3000));
</script>
```

#### 手写节流函数

```javascript
/**
 * 节流函数
 * @param {Function} fn - 要执行的函数
 * @param {number} interval - 时间间隔（毫秒）
 * @returns {Function} 节流后的函数
 */
function throttle(fn, interval) {
  let timer = null; // 定时器标识

  return function (...args) {
    // 1. 如果有定时器在运行，直接返回（不执行）
    if (timer) return;

    // 2. 创建定时器
    timer = setTimeout(() => {
      fn.apply(this, args); // 执行函数
      timer = null;         // 3. 清空定时器，允许下一次执行
    }, interval);
  };
}

// 使用示例
window.addEventListener('scroll', throttle(function() {
  console.log('滚动位置:', window.scrollY);
}, 200));
```

### 4.3 防抖 vs 节流对比

| 特性           | 防抖（Debounce）       | 节流（Throttle） |
| :------------- | :--------------------- | :--------------- |
| **核心思想**   | 停止触发后执行最后一次 | 按固定频率执行   |
| **执行时机**   | 延迟执行               | 定时执行         |
| **类比**       | 电梯关门               | 技能冷却         |
| **搜索框输入** | ✅ 用户输完再搜索       | ❌ 会频繁搜索     |
| **滚动加载**   | ❌ 可能不触发           | ✅ 定期检测位置   |
| **按钮提交**   | ✅ 防止重复点击         | ✅ 限制点击频率   |
| **鼠标移动**   | ❌ 不够实时             | ✅ 控制更新频率   |
