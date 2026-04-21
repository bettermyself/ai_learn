## 一、类型转换

**类型转换**是将一种数据类型转换为另一种数据类型的过程。

### 1.1 为什么需要类型转换？

使用表单或 `prompt` 获取的数据默认为字符串类型，无法直接进行数学运算（如加法），因此需要进行类型转换。

**转换分类**：

| 类型         | 说明                                                   |
| :----------- | :----------------------------------------------------- |
| **显式转换** | 手动编写代码明确指定目标类型，程序员主导，数据类型明确 |
| **隐式转换** | 运算符执行时系统自动完成的类型转换                     |

### 1.2 显式转换

#### 1.2.1 转换为数字型

| 方法               | 功能         | 返回值特点                                           |
| :----------------- | :----------- | :--------------------------------------------------- |
| `Number(数据)`     | 通用转换方式 | 成功返回数字，失败返回 `NaN`                         |
| `parseInt(数据)`   | 只保留整数   | 数字开头的字符串只保留整数部分（如 `"12px"` → `12`） |
| `parseFloat(数据)` | 保留小数     | 数字开头的字符串保留小数（如 `"12.5px"` → `12.5`）   |

```javascript
// Number() 转换示例
console.log(typeof Number('1'));      // number
console.log(Number('abcd'));         // NaN（无法转换时返回NaN）

// 布尔值转换
console.log(Number(true));   // 1
console.log(Number(false));  // 0

// null 和 undefined 转换
console.log(Number(null));       // 0
console.log(Number(undefined));  // NaN

// parseInt() 和 parseFloat() 使用场景：提取数字开头的字符串中的数值
console.log(parseInt('100px'));      // 100
console.log(parseInt('100.5px'));    // 100（只保留整数）
console.log(parseFloat('100.5px'));  // 100.5（保留小数）
```

#### 1.2.2 转换为字符串和布尔型

**转换为字符串**：

| 方法                  | 用法              | 特点                          |
| :-------------------- | :---------------- | :---------------------------- |
| `String(数据)`        | `String(1)`       | 开发中推荐使用，通用性强      |
| `变量.toString(进制)` | `num.toString(8)` | 可指定进制转换（如10转8进制） |

```javascript
// String() 方法
console.log(typeof String(1));    // '1' (string)
console.log(String(true));        // 'true' (string)

// toString() 方法
let num = 10;
console.log(num.toString());   // '10'（默认十进制）
console.log(num.toString(8));  // '12'（八进制表示）
```

**转换为布尔型**（⚠️ **重点**：分支语句中频繁使用）：

JavaScript中 **`Boolean()`** 转换规则：

- **6种假值（falsy）**：`false`、`0`、`''`（空字符串）、`null`、`undefined`、`NaN`
- **其余所有值均为真值（truthy）**

```javascript
// 假值示例
console.log(Boolean(false));      // false
console.log(Boolean(0));           // false
console.log(Boolean(''));          // false
console.log(Boolean(null));        // false
console.log(Boolean(undefined));   // false
console.log(Boolean(NaN));         // false

// 真值示例
console.log(Boolean(1));           // true
console.log(Boolean('pink'));      // true
console.log(Boolean(' '));         // true（空格字符串也是真值）
```

### 1.3 隐式转换

系统自动在特定运算符执行时完成的类型转换。

| 运算符类型             | 转换规则           | 示例                       |
| :--------------------- | :----------------- | :------------------------- |
| **算术运算符** `- * /` | 字符串转为数字     | `'1999' * '2'` → `3998`    |
| **比较运算符** `> ==`  | 字符串转为数字     | `3 > '1'` → `true`         |
| **一元正号** `+`       | 字符串转为数字     | `+'123'` → `123`           |
| **字符串拼接** `+`     | 任意类型转为字符串 | `'pink' + 18` → `'pink18'` |
| **逻辑非** `!`         | 转为布尔值后取反   | `!0` → `true`              |

```javascript
// 隐式转为数字型
console.log(8 - '3');        // 5
console.log('1999' * '2');   // 3998
console.log(3 > '1');        // true
console.log(3 == '3');       // true（宽松相等会进行类型转换）
console.log(+'123');         // 123（一元正号转换）

// 隐式转为字符串型
console.log('' + 18);        // '18'（空字符串与数字拼接）

// 隐式转为布尔型（逻辑非运算）
console.log(!0);             // true
console.log(!'');            // true
console.log(!null);          // true
console.log(!undefined);     // true
console.log(!NaN);           // true
console.log(!'pink');         // false（非空字符串为真值，取反后为false）
```



## 二、流程控制语句

### 2.1 表达式与语句的区别

| 概念       | 定义                         | 特点                        |
| :--------- | :--------------------------- | :-------------------------- |
| **表达式** | 可被求值并产生结果的代码片段 | 如 `1 + 1`、`true && false` |
| **语句**   | 执行特定操作的完整指令       | 如 `if` 语句、`for` 循环    |

### 2.2 分支语句

根据条件判定结果，选择性执行特定代码块。

#### 2.2.1 if 单分支语句

**语法**：

```javascript
if (条件表达式) {
  // 条件为 true 时执行的语句
}
```

**执行逻辑**：

- 条件表达式结果为 `true` → 执行大括号内代码
- 条件表达式结果为 `false` → 跳过代码块
- ⚠️ 非布尔类型会自动进行类型转换（类似 `Boolean()`）

```javascript
// 基础示例
if (3 < 5) {
  console.log('条件成立，执行此处代码');
}

// 类型转换示例
if ('') {  // 空字符串转为 false
  console.log('这行不会执行');
}

// 实际应用：高考成绩判断
let score = +prompt('请输入高考成绩:');
if (score >= 700) {
  alert('恭喜您考入黑马程序员');
}
```

#### 2.2.2 if-else 双分支语句

**语法**：

```javascript
if (条件表达式) {
  // 条件为 true 执行的语句
} else {
  // 条件为 false 执行的语句
}
```

```javascript
// 案例1：成绩判定
let score = +prompt('请输入考试成绩:');
if (score >= 700) {
  alert('恭喜您，考入黑马程序员');
} else {
  alert('非常抱歉，您没有考入黑马程序员，明年再战!');
}

// 案例2：用户登录验证
let uname = prompt('请输入用户名:');
let pwd = prompt('请输入密码:');
if (uname === '刘德华' && pwd === '123456') {
  alert('登录成功，欢迎回来~');
} else {
  alert('登录失败，用户名或密码错误~');
}
```

#### 2.2.3 if-else if 多分支语句

**适用场景**：多个条件区间判断

**语法**：

```javascript
if (条件1) {
  // 代码1
} else if (条件2) {
  // 代码2
} else if (条件3) {
  // 代码3
} else {
  // 以上条件均不满足时执行
}
```

```javascript
// 案例：成绩等级评定
let score = +prompt('请输入考试成绩:');

if (score >= 90) {
  alert('优秀，棒棒棒~');
} else if (score >= 70) {
  alert('良好，棒棒~');
} else if (score >= 60) {
  alert('及格，棒~');
} else {
  alert('不及格，好好加油，你可以的~');
}
```

💡 **注意事项**：

1. 使用 `>=` 判断时，条件应从**大到小**排列
2. `else if` 可有任意多个，`else` 不是必须的
3. 只有一个代码块会被执行，匹配成功后即跳出整个结构

#### 2.2.4 三元运算符（三元表达式）

**适用场景**：简单的双分支逻辑，比 `if-else` 更简洁

**语法**：

```javascript
条件 ? 表达式1 : 表达式2
```

**执行逻辑**：

- 条件为 `true` → 返回表达式1的值
- 条件为 `false` → 返回表达式2的值

```javascript
// 基础验证
console.log(5 < 3 ? '真的' : '假的');  // '假的'

// 求两个数的最大值
let x = 100;
let y = 20;
console.log(x > y ? x : y);  // 100
```

#### 2.2.5 switch 语句（了解）

**适用场景**：基于等值判断的多分支场景

**语法**：

```javascript
switch (表达式) {
  case 值1:
    代码1;
    break;
  case 值2:
    代码2;
    break;
  default:
    默认代码;
}
```

```javascript
// 水果价格查询
let fruits = '苹果';
switch (fruits) {
  case '香蕉':
    alert('香蕉的价格是: 3元/斤');
    break;
  case '苹果':
    alert('苹果的价格是: 4元/斤');
    break;
  case '橘子':
    alert('橘子的价格是: 2元/斤');
    break;
  default:
    alert('没有查到此水果');
}
```

⚠️ **重要注意事项**：

1. `switch` 适合**等值判断**，`if` 适合**区间判断**
2. 表达式的值必须**全等于**（`===`）case 的值才能匹配
3. 每个 case 后必须加 `break`，否则会造成**case穿透**（继续执行后续case）
4. 实际开发中 `if` 多分支使用频率远高于 `switch`

### 2.3 循环语句

用于重复执行指定代码块。

#### 2.3.1 while 循环

**语法**：

```javascript
while (条件表达式) {
  // 循环体
}
```

**循环三要素**：

1. **初始值**（常用变量）
2. **循环条件**
3. **变量计数**（自增或自减）

```javascript
// 需求：重复打印3次
let i = 1;
while (i <= 3) {
  document.write('月薪过万不是梦，毕业时候见英雄~<br>');
  i++;  // ⚠️ 必须包含自增，否则造成死循环
}
```

#### 2.3.2 for 循环（⚠️ **重点**：最常用的循环形式）

**优势**：将初始值、循环条件、变量计数集中在一行，结构清晰

**语法**：

```javascript
for (初始值; 循环条件; 变量计数) {
  // 循环体
}
```

```javascript
// 需求：重复打印3次
for (let i = 1; i <= 3; i++) {
  document.write('键盘敲烂要行动，前端行业一览众~ <br>');
}
```

#### 2.3.3 循环控制关键字

| 关键字     | 作用                         | 适用场景                                 |
| :--------- | :--------------------------- | :--------------------------------------- |
| `break`    | **中止整个循环**             | 结果已得到，后续循环无需执行（提高效率） |
| `continue` | **中止本次循环**，进入下一次 | 排除或跳过特定选项                       |

```javascript
// break 示例：找到结果后立即退出
for (let i = 1; i <= 6; i++) {
  document.write(`我是第${i}个孩子 <br>`);
  if (i === 3) {
    break;  // i=3 时直接退出整个循环
  }
}
// 输出：第1个孩子、第2个孩子、第3个孩子

// continue 示例：跳过特定条件
for (let i = 1; i <= 6; i++) {
  if (i === 3) {
    continue;  // 跳过第3个孩子
  }
  document.write(`第${i}个孩子可以进入电影院<br>`);
}
// 输出：第1、2、4、5、6个孩子（第3个被跳过）
```

#### 2.3.4 无限循环与退出

**构造方式**：

1. `while(true)` — 常用方式
2. `for(;;)` — 同样可行

**退出方式**：必须使用 `break` 语句

```javascript
// 需求：持续询问直到输入"爱"
// 方式1：while(true)
while (true) {
  let love = prompt('你爱我吗?');
  if (love === '爱') {
    break;  // 输入正确，退出循环
  }
}

// 方式2：for(;;)
for (;;) {
  let love = prompt('你爱我吗?');
  if (love === '爱') {
    break;
  }
}
```

### 2.4 断点调试

**作用**：

- **学习阶段**：帮助理解代码执行流程
- **工作阶段**：快速定位 Bug

**操作步骤**：

1. 按 `F12` 打开开发者工具
2. 切换到 **Sources**（源代码）面板
3. 选择目标代码文件
4. 在代码行号处点击添加**断点**
5. 刷新页面，程序执行到断点处自动暂停



## 三、综合案例：ATM存取款机

### 3.1 功能分析

| 功能选项    | 操作     | 实现逻辑            |
| :---------- | :------- | :------------------ |
| 1. 取款     | 减法操作 | `money -= 取款金额` |
| 2. 存款     | 加法操作 | `money += 存款金额` |
| 3. 查看余额 | 显示金额 | `alert(money)`      |
| 4. 退出     | 结束程序 | `break`             |

### 3.2 完整实现代码

```javascript
// ATM存取款机程序
// 初始金额
let money = 100;

// 无限循环，直到用户选择退出
while (true) {
  // 显示操作菜单
  let num = +prompt(`
请选择您的操作：
1. 取款
2. 存款
3. 查看余额
4. 退出
  `);

  // 根据用户选择执行对应操作
  if (num === 1) {
    // 取款
    let qu = +prompt('请输入取款金额：');
    money -= qu;  // 等同于 money = money - qu
  } else if (num === 2) {
    // 存款
    let cun = +prompt('请输入存款金额：');
    money += cun;  // 等同于 money = money + cun
  } else if (num === 3) {
    // 查看余额
    alert(`您的银行卡余额是：${money}元`);
  } else if (num === 4) {
    // 退出程序
    break;  // ⚠️ 注意数据类型，prompt返回字符串，需用 === 4 判断
  }
}

// 程序结束提示
document.write(`滴，您的银行卡余额为：${money}元，请节约消费`);
```
