## 1、线性回归简介

| **线性回归知识点**     | **具体内容**                                                |
| :--------------------- | :---------------------------------------------------------- |
| **线性回归简介**       | 定义、线性回归的分类、应用场景                              |
| **线性回归问题的求解** | 线性回归API、损失函数、导数和矩阵、正规方程法、梯度下降算法 |
| **回归模型评估方法**   | MAE、MSE、RMSE                                              |
| **线性回归API和案例**  | 线性回归API、案例波士顿房价预测                             |
| **欠拟合与过拟合**     | 出现原因、解决方法、L1正则化、L2正则化                      |

​	

**举个栗子：**假若有了身高和体重数据，只知道播仔的身高，你能预测播仔体重吗?

![image-20230901101426794](assets/image-20230901101426794.png)

 这是一个回归问题，该如何求解呢?

**思路：**先从已知身高  **$x$**  和体重  **$y$**  中找规律，然后再预测。

![image-20230901101621761](assets/image-20230901101621761.png)

> 数学解法：用一条线来拟合身高和体重之间的关系，再对新数据进行预测
>

![image-20230901101918502](assets/image-20230901101918502.png)

![image-20230901101931661](assets/image-20230901101931661.png)



方程定义：$Y = kX + b$，求解线性方程的  $k$  和  $b$  

**给定方程组：**
$$
\begin{cases} 160k + b = 56.3 & \text{(1)} \\ 166k + b = 60.6 & \text{(2)} \end{cases}
$$
**结果方程：**
$$
Y≈0.7167X−58.372
$$
最后代入播仔的身高数据，得出预测的体重。



### 1.1 线性回归

- **定义：** 一种利用**回归方程（函数）** 对一个或多个**自变量（特征值）** 与**因变量（目标值）** 之间关系进行建模的分析方法。
- 核心概念：
  - **目标：** 通过数据学习权重系数 **$w$** ，揭示特征与目标值之间的内在规律。
  - **关键：** 学习**权重系数（w）**。
  - **模型输出：** 通常表示为 $y = w₁x₁ + w₂x₂ + ... + wₙxₙ + b$（其中 `b` 是截距/偏置项）。
- 为什么叫“线性”模型？
  - 因为模型方程关于待学习的**权重系数（w）** 是**线性的**（即 `w` 都是**零次幂**的常数项）。
  - 注意：模型关于**特征（x）** 本身可以是线性的，也可以是非线性的（例如 `x²`），只要关于**权重（w）** 是线性的即可。
- 权重的意义：
  - 某个权重值 `wᵢ` **越大**，表明对应的特征 `xᵢ` 对预测目标值 `y` 的**影响程度越大**。
  - 权重的**符号（正/负）** 表示特征与目标值之间是**正相关**还是**负相关**。



![image-20230901102250602](assets/image-20230901102250602.png)

![image-20230901102402944](assets/image-20230901102402944.png)



### 1.2 线性回归分类

线性回归根据**自变量（特征）的数量**主要分为两类：**一元线性回归**和**多元线性回归**。

| 特征           | 一元线性回归                               | 多元线性回归                                                 |
| :------------- | :----------------------------------------- | :----------------------------------------------------------- |
| **自变量数量** | 1个 (`x`)                                  | 2个或更多 (`x₁, x₂, ..., xₙ`)                                |
| **因变量数量** | 1个 (`y`)                                  | 1个 (`y`)                                                    |
| **数学表达式** | $y = kx + b$                               | $y =w₁x₁ + w₂x₂ + ... + wₙxₙ + b$                            |
| **几何意义**   | 在二维平面 (`x, y`) 上拟合一条**直线**     | 在 `n+1` 维空间 (`x₁, x₂, ..., xₙ, y`) 中拟合一个**超平面**  |
| **目标值关系** | 目标值 (`y`) 仅与**一个**自变量 (`x`) 相关 | 目标值 (`y`) 与**多个**自变量 (`x₁, x₂, ..., xₙ`) 相关       |
| **典型场景**   | 房价 vs. 房屋面积； 销量 vs. 广告投入      | 房价 vs. (面积, 卧室数, 地段)； 销量 vs. (广告费, 促销力度, 竞品价格) |



### 1.3 应用场景

![image-20230901103123601](assets/image-20230901103123601.png)



## 2、线性回归问题的求解

### 2.1 线性回归API

**案例：预测播仔身高**

- 已知数据:

![image-20230901101931661](assets/image-20230901101931661.png)



-  需求:播仔身高是176，请预测体重?

| **步骤**        | **关键操作**      | **代码示例**                                        | **说明**                                |
| :-------------- | :---------------- | :-------------------------------------------------- | :-------------------------------------- |
| **1. 导入**     | 导入线性回归包    | `from sklearn.linear_model import LinearRegression` | 从scikit-learn库导入线性回归模块        |
| **2. 准备数据** | 定义特征X（身高） | `X = [[160], [166], [172], ...]`                    | 必须是二维数组（即使单个特征）          |
|                 | 定义目标y（体重） | `y = [56.3, 60.6, 65.1, ...]`                       | 一维数组形式                            |
| **3. 实例化**   | 创建模型对象      | `estimator = LinearRegression()`                    | 实例化线性回归模型                      |
| **4. 训练**     | 训练模型          | `estimator.fit(X, y)`                               | 学习数据规律，生成预测模型              |
|                 | 获取斜率参数      | `estimator.coef_`                                   | 返回权重系数（如：体重/身高的比例系数） |
|                 | 获取截距参数      | `estimator.intercept_`                              | 返回偏置项（基准体重）                  |
| **5. 预测**     | 预测新数据        | `estimator.predict([[176]])`                        | 输入需为二维数组，输出预测体重值        |



通过线性回归API可快速的找到一条红色直线，具体是怎么求解的呢？

![image-20250618090824107](assets\image-20250618090824107.png)

### 2.2 损失函数

需要设置一个评判标准来衡量预测效果：

| **概念**     | **定义**                                                     | **数学表达**             |
| :----------- | :----------------------------------------------------------- | :----------------------- |
| **误差**     | 预测值与真实值的差异                                         | $\epsilon = \hat{y} - y$ |
| **损失函数** | 量化每个样本预测值与真实值的差异程度。目标是通过优化使**误差总和最小**（例如图中红色直线能更好拟合所有点）。 | $L(k, b)$                |

![image-20230901110253313](assets/image-20230901110253313.png)

#### 2.2.1 损失函数数学表达及最小值求解

##### a、损失函数的数学表达

对于线性方程 $y = kx + b$，损失函数定义为所有样本点的预测值与真实值之差的平方和：
$$
L(k, b) = \sum_{i=1}^{n} (y_i - \hat{y_i})^2 = \sum_{i=1}^{n} (y_i - (kx_i + b))^2
$$
在给定样本点的情况下，具体损失函数为：
$$
L(k, b) = (160k + b - 56.3)^2 + (166k + b - 60.6)^2 + (172k + b - 65.1)^2 + (174k + b - 58.5)^2 + (180k + b - 56.3)^2
$$


##### b、固定截距简化求解

损失函数是关于k、b的函数，展开会变成二元二次方程，为简化计算，固定截距 $b = -100$，损失函数简化为：
$$
\begin{aligned}
L(k) &= (160k - 100 - 56.3)^2 + (166k - 100 - 60.6)^2 + (172k - 100 - 65.1)^2 \\
     &+ (174k - 100 - 58.5)^2 + (180k - 100 - 56.3)^2 \\
&= (160k - 156.3)^2 + (166k - 160.6)^2 + (172k - 165.1)^2 \\
     &+ (174k - 158.5)^2 + (180k - 156.3)^2
\end{aligned}
$$


##### c、展开并合并同类项

将损失函数展开并合并同类项：
$$
\begin{aligned}
L(k) &= (160k)^2 - 2 \cdot 160k \cdot 156.3 + (156.3)^2 \\
     &+ (166k)^2 - 2 \cdot 166k \cdot 160.6 + (160.6)^2 \\
     &+ (172k)^2 - 2 \cdot 172k \cdot 165.1 + (165.1)^2 \\
     &+ (174k)^2 - 2 \cdot 174k \cdot 158.5 + (158.5)^2 \\
     &+ (180k)^2 - 2 \cdot 180k \cdot 156.3 + (156.3)^2
\end{aligned}
$$
计算系数后得到一元二次函数：
$$
L(k) = 145416k^2 - 281671.6k + 136496.32
$$




##### d、求解最小值点

对于一元二次函数 $f(k) = ak^2 + bk + c$（其中 $a > 0$），最小值点在：
$$
k = -\frac{b}{2a}
$$

> 也就是   $L'(k)=0$

代入系数 $a = 145416$, $b = -281671.6$：
$$
k = -\frac{-281671.6}{2 \times 145416} = \frac{281671.6}{290832} \approx 0.9685
$$

##### e、应用最优解预测

当 $b = -100$ 且 $k = 0.9685$ 时，预测 $x = 176$ 的值：
$$
y = 0.9685 \times 176 - 100 = 170.456 - 100 = 70.456
$$
通过固定截距 $b = -100$，我们求得最优斜率 $k \approx 0.9685$，此时损失函数达到最小值。该直线拟合了所有样本点，可用于预测新数据点的值。

```mermaid
graph LR
A[原始损失函数] --> B[固定 b = -100]
B --> C[展开并合并同类项]
C --> D[得到一元二次函数]
D --> E[求最小值点 k = -b/2a]
E --> F[应用最优解预测]
```

#### 2.2.2 常用损失函数

损失函数用于衡量模型预测值 $h(x^{(i)})$ 与真实值 $y^{(i)}$ 之间的差异，为优化模型参数 $(w, b)$ 提供方向。

##### (1) 均方误差 (Mean-Square Error, MSE)

$$
L(w, b) = \frac{1}{m} \sum_{i=0}^{m} (h(x^{(i)}) - y^{(i)})^2
$$

##### (2) 平均绝对误差 (Mean Absolute Error, MAE)

$$
L(w, b) = \frac{1}{m} \sum_{i=0}^{m} |h(x^{(i)}) - y^{(i)}|
$$

##### (3) 均方根误差 (Root Mean Square Error, RMSE)

$$
L(w, b) = \sqrt{\frac{1}{m} \sum_{i=0}^{m} (h(x^{(i)}) - y^{(i)})^2}
$$



**公式说明：**

- $h(x^{(i)})$：模型对第 $i$ 个样本的预测值
- $y^{(i)}$：第 $i$ 个样本的真实值
- $m$：样本数量
- $w$ 和 $b$：模型参数（权重和偏置）



**线性回归模型要素**

| 数据                                                 | 线性回归模型                                                 | 损失函数      | 优化方法                                                     |
| :--------------------------------------------------- | :----------------------------------------------------------- | :------------ | :----------------------------------------------------------- |
| 由特征值 $x$ 和目标值 $y$ 组成，假设数据分布是线性的 | **假设函数** - 单特征：$Y = wx + b$ - 多特征：$Y = w_1x_1 + w_2x_2 + \cdots + w_nx_n + b$ | 1. MSE 2. MAE | 1. 梯度下降法：利用梯度逐步逼近最优解 $\theta_j := \theta_j - \alpha\frac{\partial}{\partial\theta_j}J(\theta)$ 2. 正规方程法：直接求解偏导数为零的点 $\frac{\partial}{\partial w_j}J(w) = 0$ |

**优化方法说明：**

- $\alpha$：学习率 (learning rate)
- $\theta_j$：模型参数（包含 $w_j$ 和 $b$）
- $J(\theta)$：损失函数



### 2.3 导数和矩阵

#### 2.3.1 常见的数据表述

**四大核心概念对比**

| **类型**          | **维度**  | **本质**       | **表示方式**                                                 | **关键特性**                       |
| :---------------- | :-------- | :------------- | :----------------------------------------------------------- | :--------------------------------- |
| **标量** (Scalar) | 0维       | 独立数值       | 小写字母（例：$s \in \mathbb{R}$）                           | 仅有大小，无方向                   |
| **向量** (Vector) | 1维       | **有序元素列** | 粗体小写字母（例：$\mathbf{x} = \begin{bmatrix}x_1\\ x_2\\ \vdots\\ x_m\end{bmatrix}$）$\begin{bmatrix}x_1\\ x_2\\ \vdots\\ x_m\end{bmatrix}\in \mathbb{R}^{m}$ | **默认列向量**，有大小和方向       |
| **矩阵** (Matrix) | 2维       | 二维数组       | 粗体大写字母（例：$\mathbf{A} \in \mathbb{R}^{m×n}$）$ A = \begin{bmatrix} a_{11} & a_{12} & \cdots & a_{1n} \\ a_{21} & a_{22} & \cdots & a_{2n} \\ a_{31} & a_{32} & \cdots & a_{3n} \\ \vdots & \vdots & \ddots & \vdots \\ a_{m1} & a_{m2} & \cdots & a_{mn} \end{bmatrix} $ | 行列结构，m代表多少行，n代表特征数 |
| **张量** (Tensor) | n维 (n≥3) | 多维数组       | 特殊字体（例：$\mathscr{T}\in \mathbb{R}^{d_1 \times d_2 \times \cdots \times d_n}$） | 高维数据容器，基于向量和矩阵的推广 |



#### 2.3.2 导数

设函数 $y = f(x)$。若自变量 $x$ 在点 $x_0$ 处产生增量 $\Delta x$，则函数输出值相应地产生增量 $\Delta y$。当增量 $\Delta x$ 趋于 $0$（即 $\Delta x \to 0$）时，若增量比值 $\dfrac{\Delta y}{\Delta x}$ 的极限存在，则称此极限值 $a$ 为函数 $f(x)$ 在点 $x_0$ 处的**导数**，记作：
$$
f'(x_0)  \quad或\quad  \left. \frac{df}{dx} \right|_{x=x_0}
$$


![](assets/导数.jpeg)

**导数的性质与意义**

- **局部性质：** 导数是函数的**局部性质**。它描述的是函数在**特定点** $x_0$ 附近的变化率。
- **几何意义：** 函数 $f(x)$ 在点 $x_0$ 处的导数 $f'(x_0)$ 具有明确的**几何意义**：它表示函数图像（曲线）在点 $(x_0, f(x_0))$ 处的**切线斜率**。



**常见函数的导数：**

| 公式                                  | 例子                                                         |
| ------------------------------------- | ------------------------------------------------------------ |
| $$(C)' = 0$$                          | $$(5)' = 0 \quad (10)' = 0$$                                 |
| $$(x^\alpha)' = \alpha x^{\alpha-1}$$ | $$(x^3)' = 3x^2 \quad (x^5)' = 5x^4$$                        |
| $$(a^x)' = a^x \ln a$$                | $$(2^x)' = 2^x \ln 2 \quad (7^x)' = 7^x \ln 7$$              |
| $$(e^x)' = e^x$$                      | $$(e^x)' = e^x$$                                             |
| $$(\log_a x)' = \frac{1}{x \ln a}$$   | $$(\log_{10} x)' = \frac{1}{x \ln 10} \quad (\log_6 x)' = \frac{1}{x \ln 6}$$ |
| $$(\ln x)' = \frac{1}{x}$$            | $$(\ln x)' = \frac{1}{x}$$                                   |
| $$(\sin x)' = \cos x$$                | $$(\sin x)' = \cos x$$                                       |
| $$(\cos x)' = -\sin x$$               | $$(\cos x)' = -\sin x$$                                      |



**导数的四则运算：**

| 公式                                                         | 例子                                                         |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| $$[u(x) \pm v(x)]' = u'(x) \pm v'(x)$$                       | $$(e^x + 4\ln x)' = (e^x)' + (4\ln x)' = e^x + \frac{4}{x}$$ |
| $$[u(x) \cdot v(x)]' = u'(x) \cdot v(x) + u(x) \cdot v'(x)$$ | $$(\sin x \cdot \ln x)' = (\sin x)' \cdot \ln x + \sin x \cdot (\ln x)' = \cos x \cdot \ln x + \sin x \cdot \frac{1}{x}$$ |
| $$\left[ \frac{u(x)}{v(x)} \right]' = \frac{u'(x) \cdot v(x) - u(x) \cdot v'(x)}{v^2(x)}$$ | $$\left( \frac{e^x}{\cos x} \right)' = \frac{(e^x)' \cdot \cos x - e^x \cdot (\cos x)'}{\cos^2(x)} = \frac{e^x \cdot \cos x - e^x \cdot (-\sin x)}{\cos^2(x)}$$ |
| $$\{ g [h(x)] \}' = g'(h) \cdot h'(x)$$                      | $$(e^{2x})' = e^{2x} \cdot (2x)' = 2e^{2x} \quad (\sin 2x)' = \cos 2x \cdot (2x)' = 2 \cos 2x$$ |

> 复合函数求导：g(h)是外函数，h(x)是内函数。先对外函数求导，再对内函数求导。
>
> 举个例子，计算函数导数：$$ y = (x^2 + 2x)^2 $$
>
> $ y' = 2(x^2 + 2x) \cdot (2x + 2) = 4(x^3 + 3x^2 + 2x) = 4x^3 + 12x^2 + 8x  $



**导数求极值**：求函数 $y = x^2 - 4x + 5$ 的极小值。

**步骤 1：求一阶导数**
$$
y' = \frac{d}{dx}(x^2 - 4x + 5) = 2x - 4
$$
**步骤 2：求临界点**
令一阶导数等于零：
$$
2x - 4 = 0\implies x = 2
$$
**步骤 3：二阶导数检验（确认极小值）**
求二阶导数：
$$
y'' = \frac{d}{dx}(2x - 4) = 2
$$
由于 $ y'' = 2 > 0 $，函数在 $x = 2$ 处取得极小值。

**步骤 4：计算极小值**
将 $x = 2$ 代入原函数：
$$
y = (2)^2 - 4(2) + 5 = 4 - 8 + 5 = 1
$$
**结论**
函数 $y = x^2 - 4x + 5$ 的极小值为 **1**。

> 导数为0的位置是函数的极值点。
>



#### 2.3.3 偏导

已知函数 $z(x,y) = (x - 2)^2 + (y - 3)^2$，求其极小值。

**数学求解**

- **求偏导数**

  - 对 $x$ 的偏导：

    $\frac{\partial z}{\partial x} = 2(x - 2) \cdot 1 = 2(x - 2)$

  - 对 $y$ 的偏导：

    $\frac{\partial z}{\partial y} = 2(y - 3) \cdot 1 = 2(y - 3)$

- **令偏导为零求临界点**

  - $2(x−2)=0\implies x = 2$
  - $2(y−3)=0\implies y = 3$

- **验证极小值**

  函数 $z(x,y)$ 是凸函数（二次项系数为正），临界点 $(2, 3)$ 是极小值点：

  $z_{\text{min}} =(2−2)^2+(3−3)^2=0$



**偏导在机器学习应用**

在机器学习中，该问题可类比为优化损失函数，损失函数是关于权重的参数的函数。

- **损失函数**：$Loss(w1,w2)=(w1−2)^2+(w2−3)^2$
- **权重参数**：$w_1, w_2$
- **优化目标**：最小化 $\mathcal{Loss}$

**求解结果**：
当权重参数取 $w_1 = 2, w_2 = 3$ 时，损失函数达到最小值 $0$。



#### 2.3.4 向量

- **向量是有大小和方向**

几何意义上表示：向量 $(1,1)$，向量 $(1,2)$

![image-20250617202831869](assets\image-20250617202831869.png)

- **向量基本运算**

$$
\begin{pmatrix}
1\\2\\3
\end{pmatrix}+\begin{pmatrix}
4\\5\\6
\end{pmatrix}=\begin{pmatrix}
5\\7\\9
\end{pmatrix}\in \mathbb{R}^3
\quad\quad
\begin{pmatrix}
1\\2\\3
\end{pmatrix}-\begin{pmatrix}
4\\5\\6
\end{pmatrix}=\begin{pmatrix}
-3\\-3\\-3
\end{pmatrix}\in \mathbb{R}^3
\quad\quad
3*\begin{pmatrix}
4\\5\\6
\end{pmatrix}=\begin{pmatrix}
12\\15\\18
\end{pmatrix}\in \mathbb{R}^3
$$



- **向量矩阵转置 (Transpose)**

$$
x = \begin{pmatrix}
{1} \\{2}\\{3}
\end{pmatrix}
\quad\quad
x^T = (1,2,3)
\quad\quad
y = \begin{pmatrix}
11 & 12 & 13 \\
21 & 22 & 23
\end{pmatrix}
\quad\quad
Y^T = \begin{pmatrix}
11 & 21 \\
12 & 22 \\
13 & 23
\end{pmatrix}
$$

- **范数(norm)是数学中的一种基本概念，具有长度的意义**
  - $L^1$范数 - 向量中各个元素绝对值之和
  - $L^2$范数 - 向量的模长（每个元素平方求和再开平方根）
  - $L^p$范数 - $(\sum |x_i|^p)^{1/p}$




- **$L^1$范数**

$x^T = (1,2,-3) \quad \|x\|_1 = |1| + |2| + |-3| = 6$



- **$L^2$范数**

$x^T = (1,2,-3) \quad \|x\|_2 = \sqrt{1^2 + 2^2 + (-3)^2} = \sqrt{14}$

$x^T = (1,2,-3) \quad \text{注意：向量的转置@向量}\quad x^T x = 1^2 + 2^2 + (-3)^2 = 14$

$X$为向量时：$x^T x$ 与 $\|x\|_2^2$ 等价



- **$L^p$范数**

$\|x\|_p = \left( |x_1|^p + |x_2|^p + \cdots + |x_n|^p \right)^{\frac{1}{p}}$



#### 2.3.5 矩阵

- 矩阵运算的 `*` 和 `@` 符号的区别

  - `*` 运算符（逐元素乘法）

    - **作用**：执行 **逐元素乘法**（Hadamard 积）。

    - **规则**：两个矩阵的 **形状必须完全相同**。

    - **计算方式**：对应位置的元素相乘。
      $$
      \left[\begin{matrix}a_{11} & a_{12}\\a_{21} & a_{22}\end{matrix}\right]*\left[\begin{matrix}b_{11} & b_{12}\\b_{21} & b_{22}\end{matrix}\right]=\left[\begin{matrix}a_{11}\times b_{11} & a_{12}\times b_{12}\\a_{21}\times b_{21} & a_{22}\times b_{22}\end{matrix}\right]
      $$
      

  - `@` 运算符（矩阵乘法）

    - **作用**：执行 **线性代数中的矩阵乘法**。

    - **规则**：第一个矩阵的 **列数** 必须等于第二个矩阵的 **行数**。

    - **计算方式**：行与列的点积求和。
      $$
      \begin{bmatrix} a_{11} & a_{12} \\ a_{21} & a_{22} \end{bmatrix} @ \begin{bmatrix} b_{11} & b_{12} \\ b_{21} & b_{22} \end{bmatrix} = \begin{bmatrix} a_{11}b_{11} + a_{12}b_{21} & a_{11}b_{12} + a_{12}b_{22} \\ a_{21}b_{11} + a_{22}b_{21} & a_{21}b_{12} + a_{22}b_{22} \end{bmatrix}
      $$
      

- 矩阵是数学中的一种基本概念，表达 $m$ 行 $n$ 列的**数据**等



- 矩阵在机器学习中的表达

$$
A = \begin{bmatrix} 1 & 2 \\ 3 & 4 \end{bmatrix} \in \mathbb{R}^{2 \times 2}\quad A = \begin{bmatrix} 1 & 2 & 3 \\ 4 & 5 & 6 \end{bmatrix} \in \mathbb{R}^{2 \times 3}
$$

一个矩阵 $m$ 行 $n$ 列：$A \in \mathbb{R}^{m \times n}$ ，**一个数据集 $X \in \mathbb{R}^{N \times D}$：$N$ 行数据，$D$ 特征数**



- **矩阵加法和减法**

$$
\begin{bmatrix} 1 & 2 & 3 \\ 4 & 5 & 6 \end{bmatrix} + \begin{bmatrix} 1 & 2 & 3 \\ 4 & 5 & 6 \end{bmatrix} = \begin{bmatrix} 2 & 4 & 6 \\ 8 & 10 & 12 \end{bmatrix}\quad\quad\begin{bmatrix} 1 & 2 & 3 \\ 4 & 5 & 6 \end{bmatrix} - \begin{bmatrix} 1 & 2 & 3 \\ 4 & 5 & 6 \end{bmatrix} = \begin{bmatrix} 0 & 0 & 0 \\ 0 & 0 & 0 \end{bmatrix}
$$



- **矩阵乘法**：对于行列元素相乘后加和

$$
A = \begin{bmatrix} 1 & 2 & 3 \\ 4 & 5 & 6 \end{bmatrix} \in \mathbb{R}^{2 \times 3}\quad B = \begin{bmatrix} 1 & 2 \\ 3 & 4 \\ 5 & 6 \end{bmatrix} \in \mathbb{R}^{3 \times 2}\quad C = \begin{bmatrix} 1 \cdot 1 + 2 \cdot 3 + 3 \cdot 5 & 1 \cdot 2 + 2 \cdot 4 + 3 \cdot 6 \\ 4 \cdot 1 + 5 \cdot 3 + 6 \cdot 5 & 4 \cdot 2 + 5 \cdot 4 + 6 \cdot 6 \end{bmatrix} = \begin{bmatrix} 22 & 28 \\ 49 & 64 \end{bmatrix} \in \mathbb{R}^{2 \times 2}
$$

$A \in \mathbb{R}^{m \times n}, \, B \in \mathbb{R}^{n \times d} \Rightarrow A \times B = C \in \mathbb{R}^{m \times d}$



- **矩阵转置**

$$
A = \begin{bmatrix} 1 & 2 & 3 \\ 4 & 5 & 6 \end{bmatrix} \in \mathbb{R}^{2 \times 3}\quad A^T = \begin{bmatrix} 1 & 4 \\ 2 & 5 \\ 3 & 6 \end{bmatrix} \in \mathbb{R}^{3 \times 2}
$$



- **矩阵@矩阵的转置**

$A \times A^T$ 是方阵, $A^T \times A$ 是方阵，$A = \begin{bmatrix} 1 & 2 & 3 \\ 4 & 5 & 6 \end{bmatrix} \in \mathbb{R}^{2 \times 3}$



$A \times A^T =\begin{bmatrix} 1 & 2 & 3 \\ 4 & 5 & 6 \end{bmatrix}@ \begin{bmatrix} 1 & 4 \\ 2 & 5 \\ 3 & 6 \end{bmatrix}=\begin{bmatrix} 1 \cdot 1 + 2 \cdot 2 + 3 \cdot 3 & 1 \cdot 4 + 2 \cdot 5 + 3 \cdot 6 \\ 4 \cdot 1 + 5 \cdot 2 + 6 \cdot 3 & 4 \cdot 4 + 5 \cdot 5 + 6 \cdot 6 \end{bmatrix} = \begin{bmatrix} 14 & 32 \\ 32 & 77 \end{bmatrix}$

$A^T \times A =\begin{bmatrix} 1 & 4 \\ 2 & 5 \\ 3 & 6 \end{bmatrix}@\begin{bmatrix} 1 & 2 & 3 \\ 4 & 5 & 6 \end{bmatrix}= \begin{bmatrix} 1 \cdot 1 + 4 \cdot 4 & 1 \cdot 2 + 4 \cdot 5 & 1 \cdot 3 + 4 \cdot 6 \\ 2 \cdot 1 + 5 \cdot 4 & 2 \cdot 2 + 5 \cdot 5 & 2 \cdot 3 + 5 \cdot 6 \\ 3 \cdot 1 + 6 \cdot 4 & 3 \cdot 2 + 6 \cdot 5 & 3 \cdot 3 + 6 \cdot 6 \end{bmatrix} = \begin{bmatrix} 17 & 22 & 27 \\ 22 & 29 & 36 \\ 27 & 36 & 45 \end{bmatrix}$



- **方阵**：行数 = 列数的特殊矩阵



- **对称方阵**：满足 $a_{ij} = a_{ji}$ 的方阵（主对角线对称）
- **单位阵**：主对角线为1，其余为0的特殊方阵，记作 $I$ 或 $E$   例如： $I = \begin{bmatrix} 1 & 0 & 0 \\ 0 & 1 & 0 \\ 0 & 0 & 1 \end{bmatrix}$

- 矩阵乘法的性质

  - **矩阵乘法不满足交换律**：$A \times B \neq B \times A$

    - 例：$A \in \mathbb{R}^{5 \times 2}, B \in \mathbb{R}^{2 \times 5}\quad A \times B \in \mathbb{R}^{5 \times 5}\quad B \times A \in \mathbb{R}^{2 \times 2}$  
    - 特殊条件：$A,B$ 是同阶方阵时满足 $A \times B = B \times A$ 。例：$A_{2 \times 2} \times B_{2 \times 2} = B_{2 \times 2} \times A_{2 \times 2}$

    

  - **矩阵乘法满足结合律**：$A \times (B \times C) = (A \times B) \times C$

    - 例：$A \in \mathbb{R}^{5 \times 2}, B \in \mathbb{R}^{2 \times 5}, C \in \mathbb{R}^{5 \times 3}$    $(A \times B) \times C$ 数据形状 $\mathbb{R}^{5 \times 3}$

  

  - **单位矩阵性质**：矩阵与单位矩阵相乘等于矩阵本身。    $A \times I = A$，$I \times A = A$（$I$ 为单位矩阵）

  - **矩阵的逆**：  若 $A = \begin{bmatrix} 1 & 2 \\ 3 & 4 \end{bmatrix} \in \mathbb{R}^{2 \times 2}$，  存在 $B$ 使得 $A \times B = I$（单位矩阵），  则 $B$ 为 $A$ 的逆矩阵，记为 $A^{-1}$




- 矩阵转置的性质

  - $(A^T)^T = A$
  - $$(A + B)^T = A^T + B^T$$

  - $(kA)^T = kA^T$（$k$ 为常数）

  - $(A \times B)^T = B^T \times A^T$


例：  $
\left( \begin{bmatrix} 1 & 2 & 3 \\ 4 & 5 & 6 \end{bmatrix} \times \begin{bmatrix} 1 & 2 \\ 3 & 4 \\ 5 & 6 \end{bmatrix} \right)^T = \begin{bmatrix} 1 & 2 \\ 3 & 4 \\ 5 & 6 \end{bmatrix}^T \times \begin{bmatrix} 1 & 2 & 3 \\ 4 & 5 & 6 \end{bmatrix}^T
$







### 2.4 一元线性回归的解析解

![image-20250617214103750](assets\image-20250617214103750.png)

**最小二乘法：误差平方和**

$$ j(w, b) = \sum_{i=0}^m (h(x^{(i)}) - y^{(i)})^2 $$

- $\sum_{i=0}^m \cdots$ 代表求和，$m$ 代表样本个数
- $h(x^{(i)})$ 代表第 $i$ 个样本的预测值
- $y^{(i)}$ 代表第 $i$ 个样本的真实值

**注意：**
- $x^{(i)}$ 代表第 $i$ 个样本的特征值
- $x^{(1)}$ 代表第 1 个样本的 $x$ 值
- $x^{(2)}$ 代表第 2 个样本的 $x$ 值

![image-20230901101931661](assets/image-20230901101931661.png)



求解一元线性回归损失函数$ J(a, b) = \sum_{i=1}^m (h(x^{(i)}) - y^{(i)})^2 = \sum_{i=1}^m (ax^{(i)} + b - y^{(i)})^2 $的极小值

损失函数是关于a、b的函数，对 $a$、$b$ 分别求偏导并令为 0。
$$
\frac{\partial f(a,b)}{\partial a} = \sum_{i=1}^m 2(ax^{(i)} + b - y^{(i)})^{(2-1)} * (ax^{(i)} + b - y^{(i)})' = \sum_{i=1}^m (2ax^{(i)^2} + 2bx^{(i)} - 2x^{(i)}y^{(i)}) = 0\quad \quad  ···1式
$$

$$
\frac{\partial f(a,b)}{\partial b} = \sum_{i=1}^m 2(ax^{(i)} + b - y^{(i)})^{(2-1)} * (ax^{(i)} + b - y^{(i)})' = \sum_{i=1}^m (2ax^{(i)} + 2b - 2y^{(i)}) = 0\quad \quad  ···2式
$$



对1式、2式化简，$x^{(i)}$ 代表样本的特征值  ，$y^{(i)}$ 代表样本的预测值

化简后得：  
$$
a \sum_{i=1}^m x^{(i)^2} + b \sum_{i=1}^m x^{(i)} - \sum_{i=1}^m x^{(i)}y^{(i)} = 0\quad \quad  ···3式
$$

$$
a \sum_{i=1}^m x^{(i)} + b m - \sum_{i=1}^m y^{(i)} = 0\quad \quad  ···4式
$$



对3式、4式代入数据求解a，b：  
$$
a\times (160^2+166^2+172^2+174^2+180^2) + b \times (160+166+172+174+180)
\\-(160*56.3+166*60.6+172*65.1+174*68.5+180*75) = 0\quad \quad  ···5式
$$
$$
a \times (160+166+172+174+180) + b*5 - (56.3+60.6+65.1+68.5+75) = 0\quad \quad  ···6式
$$

根据5式、6式，得出：
$$
145416*a + 852*b - 55683.8 = 0
$$

$$
852*a + 5*b - 325.5 = 0
$$

求解a、b的值，预测结果：
$$
a = 0.0397\quad\quad b = 60.7615\quad\quad y = 0.0397*176+60.7615 = 67
$$
 



### 2.5 多元线性回归的解析解-正规方程法

#### 2.5.1 多元线性回归方程的已知

- 多元线性回归方程式：$ y = w_1 x_1 + w_2 x_2 + w_3 x_3 + \cdots + b = w^T x + b $  

- 有数据集：  $ D = \{(x_1, y_1), (x_2, y_2), \cdots, (x_n, y_n)\}, \, x_i \in \mathbb{R}^d, \, y_i \in \mathbb{R}, \, b \in \mathbb{R} $  

- 其中模型权重是一个向量：  $ w = \{w_1, w_2, w_3, \cdots, w_d\} $  $ d $ 代表特征数


#### 2.5.2多元线性回归方程的损失函数

第1个样本的预测值：  $ \hat{y}_1 = w_1 x_{11} + w_2 x_{12} + w_3 x_{13} + \cdots + w_d x_{1d} + b $  

第1个样本的损失：  $ \varepsilon_1^2 = (\hat{y}_1 - y_1)^2 = (w_1 x_{11} + w_2 x_{12} + \cdots + w_d x_{1d} + b - y_1)^2 = \left( \sum_{j=1}^d w_j x_{1j} + b - y_1 \right)^2 $  

$ n $ 个样本的损失最小化：  $ \text{Loss}(W) = \sum_{i=1}^n (\hat{y}_i - y_i)^2 = \sum_{i=1}^n \left( \sum_{j=1}^d w_j x_{ij} + b - y_i \right)^2 $  

- 外层 $\sum$ 求和：计算 $n$ 个样本的损失和
- 内层 $\sum$ 求和：$  w_j x_{ij} + b \implies$ 产生预测值

只要让多元线性回归损失函数取最小值，此时的权重 $ W $ （w就是一个向量）即为最优解


求最优解的方法：  

- 解矩阵方程（正规方程）  
- 梯度下降法

#### 2.5.3 多元线性回归的求解

- 损失函数的矩阵表示：$J(w) = \sum_{i=1}^m (h(x_i) - y_i)^2 = \|Xw - y\|_2^2$



**求解损失函数最小值的推导**
$$
2(Xw - y) * X = 0 \quad \text{......(1)}
$$

$$
2(Xw - y) * (XX^T) = 0X^T \quad \text{......(2)}
$$

$$
2(Xw - y) * (XX^T)(XX^T)^{-1} = 0X^T(XX^T)^{-1} \quad \text{......(3)}
$$

$$
2(Xw - y) = 0 \quad \text{......(4)}
$$

$$
Xw = y \quad \text{......(5)}
$$

$$
X^TXw = X^Ty \quad \text{......(6)}
$$

$$
(X^TX)^{-1}(X^TX) * w = (X^TX)^{-1} * X^Ty \quad \text{......(7)}
$$

$$
w = (X^TX)^{-1} * X^Ty \quad \text{......(8)}
$$









![image-20230901152745308](assets/image-20230901152745308.png)

![image-20230901152758396](assets/image-20230901152758396.png)

### 梯度下降算法

#### 梯度下降算法思想

什么是梯度下降法

• 求解函数极值还有更通用的方法就是梯度下降法。顾名思义:沿着梯度下降的方向求解极小值 • 举个例子:坡度最陡下山法

![image-20230901183007785](assets/image-20230901183007785.png)

- 输入:初始化位置S;每步距离为a 。输出:从位置S到达山底
- 步骤1:令初始化位置为山的任意位置S
- 步骤2:在当前位置环顾四周，如果四周都比S高返回S;否则执行步骤3
- 步骤3: 在当前位置环顾四周，寻找坡度最陡的方向，令其为x方向
- 步骤4:沿着x方向往下走，长度为a，到达新的位置S‘
- 步骤5:在S‘位置环顾四周，如果四周都比S‘高，则返回S‘。否则转到步骤3

小结:通过循环迭代的方法不断更新位置S (相当于不断更新权重参数w)

![image-20230901183020726](assets/image-20230901183020726.png)

 最终找到最优解 这个方法可用来求损失函数最优解， 比正规方程更通用

```
梯度下降过程就和下山场景类似
可微分的损失函数，代表着一座山
寻找的函数的最小值，也就是山底
```

![image-20230901183113930](assets/image-20230901183113930.png)



![image-20230901183125661](assets/image-20230901183125661.png)



![image-20230901183139728](assets/image-20230901183139728.png)



![image-20230901183152966](assets/image-20230901183152966.png)







#### 银行信贷案例

![image-20230901183222050](assets/image-20230901183222050.png)

![image-20230901183240178](assets/image-20230901183240178.png)



![image-20230901183301618](assets/image-20230901183301618.png)



![image-20230901183315009](assets/image-20230901183315009.png)





#### 梯度下降算法分类

![image-20230901183333299](assets/image-20230901183333299.png)

![image-20230901183346878](assets/image-20230901183346878.png)





#### 正规方程和梯度下降算法的对比

![image-20230901162716376](assets/image-20230901162716376.png)

## 回归评估方法

**学习目标：**

1.掌握常用的回归评估方法

2.了解不同评估方法的特点



**为什么要进行线性回归模型的评估**

我们希望衡量预测值和真实值之间的差距，

会用到MAE、MSE、RMSE多种测评函数进行评价

### 平均绝对误差

**Mean Absolute Error (MAE)**

<img src="assets/mae.png" alt="img" style="zoom:33%;" />

- 上面的公式中：n 为样本数量, y 为实际值, $\hat{y}$ 为预测值

- MAE 越小模型预测约准确

Sklearn 中MAE的API

```python
from sklearn.metrics import mean_absolute_error
mean_absolute_error(y_test,y_predict)
```

### 均方误差

   **Mean Squared Error (MSE)**

<img src="assets/mse.png" alt="img" style="zoom:33%;" />

- 上面的公式中：n 为样本数量, y 为实际值, $\hat{y}$ 为预测值
- MSE 越小模型预测约准确

Sklearn 中MSE的API

```python
from sklearn.metrics import mean_squared_error
mean_squared_error(y_test,y_predict)
```

###  均方根误差

**Root Mean Squared Error (RMSE)**

<img src="assets/rmse.png" alt="img" style="zoom: 33%;" />

- 上面的公式中：n 为样本数量, y 为实际值, $\hat{y}$ 为预测值
- RMSE 越小模型预测约准确

###  三种指标的比较

我们绘制了一条直线 **y = 2x +5** 用来拟合 **y = 2x + 5 + e.** 这些数据点，其中e为噪声

![img](assets/rmse2.png)

从上图中我们发现 MAE 和 RMSE 非常接近，都表明模型的误差很低（MAE 或 RMSE 越小，误差越小！）。 但是MAE 和 RMSE 有什么区别？为什么MAE较低？

- 对比MAE 和 RMSE的公式，RMSE的计算公式中有一个平方项，因此：大的误差将被平方，因此会增加 RMSE 的值

- 可以得出结论，RMSE 会放大预测误差较大的样本对结果的影响，而 MAE 只是给出了平均误差

- 由于 RMSE 对误差的 **平方和求平均** 再开根号，大多数情况下RMSE>MAE




我们再看下一个例子

![img](assets/rmse3.png)

橙色线与第一张图中的直线一样：**y = 2x +5** 

蓝色的点为： **y = y + sin(x)\*exp(x/20) + e**  其中 exp() 表示指数函数

我们看到对比第一张图，所有的指标都变大了，RMSE 几乎是 MAE 值的两倍，因为它对预测误差较大的点比较敏感

我们是否可以得出结论： RMSE是更好的指标？ 某些情况下MAE更有优势，例如：

- 假设数据中有少数异常点偏差很大，如果此时根据 RMSE 选择线性回归模型，可能会选出过拟合的模型来
- 在这种情况下，由于数据中的异常点极少，选择具有最低 MAE 的回归模型可能更合适
- 除此之外，当两个模型计算RMSE时数据量不一致，也不适合在一起比较 

## 波士顿房价预测案例

### 线性回归API

```python
sklearn.linear_model.LinearRegression(fit_intercept=True)
```

- 通过正规方程优化
- 参数：fit_intercept，是否计算偏置
- 属性：LinearRegression.coef_ （回归系数） LinearRegression.intercept_（偏置）

```python
sklearn.linear_model.SGDRegressor(loss="squared_loss", fit_intercept=True, learning_rate ='constant', eta0=0.01)
```

- 参数：loss（损失函数类型），fit_intercept（是否计算偏置）learning_rate （学习率）
- 属性：SGDRegressor.coef_ （回归系数）SGDRegressor.intercept_ （偏置）

### 波士顿房价预测

![image-20230913092037241](assets/image-20230913092037241.png)

#### 案例背景介绍

数据介绍

<img src="assets/006tNbRwly1ga8u37zooxj317g0tc7dk.jpg" style="zoom:50%;" />

<img src="assets/006tNbRwly1ga8u39xrmlj30xo0ryk16.jpg" alt="å±æ§" style="zoom: 50%;" />

> 给定的这些特征，是专家们得出的影响房价的结果属性。我们此阶段不需要自己去探究特征是否有用，只需要使用这些特征。到后面量化很多特征需要我们自己去寻找



#### 案例分析

回归当中的数据大小不一致，是否会导致结果影响较大。所以需要做标准化处理。

- 数据分割与标准化处理
- 回归预测
- 线性回归的算法效果评估



####  回归性能评估

均方误差(Mean Squared Error, MSE)评价机制：

<img src="assets/image-20240731190903826.png" alt="image-20240731190903826" style="zoom: 67%;" />

sklearn中的API：

```python
sklearn.metrics.mean_squared_error(y_true, y_pred)
```

- 均方误差回归损失
- y_true:真实值
- y_pred:预测值
- return:浮点数结果



#### 代码实现

```python
# 0.导包
from sklearn.datasets import load_boston
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LinearRegression,SGDRegressor
from sklearn.metrics import mean_squared_error

# 1.加载数据
boston = load_boston()
# print(boston)

# 2.数据集划分
x_train,x_test,y_train,y_test =train_test_split(boston.data,boston.target,test_size=0.2,random_state=22)

# 3.标准化
process=StandardScaler()
x_train=process.fit_transform(x_train)
x_test=process.transform(x_test)

# 4.模型训练
# 4.1 实例化(正规方程)
# model =LinearRegression(fit_intercept=True)
model = SGDRegressor(learning_rate='constant',eta0=0.01)
# 4.2 fit
model.fit(x_train,y_train)

# print(model.coef_)
# print(model.intercept_)
# 5.预测
y_predict=model.predict(x_test)

print(y_predict)

# 6.模型评估

print(mean_squared_error(y_test,y_predict))


```



1.2.0 以上版本实现

```python
# 0.导包
# from sklearn.datasets import load_boston
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LinearRegression,SGDRegressor
from sklearn.metrics import mean_squared_error

# 1.加载数据
# boston = load_boston()
# print(boston)
import pandas as pd
import numpy as np


data_url = "http://lib.stat.cmu.edu/datasets/boston"
raw_df = pd.read_csv(data_url, sep="\s+", skiprows=22, header=None)
data = np.hstack([raw_df.values[::2, :], raw_df.values[1::2, :2]])
target = raw_df.values[1::2, 2]

# 2.数据集划分
# x_train,x_test,y_train,y_test =train_test_split(boston.data,boston.target,test_size=0.2,random_state=22)
x_train,x_test,y_train,y_test =train_test_split(data,target,test_size=0.2,random_state=22)

# 3.标准化
process=StandardScaler()
x_train=process.fit_transform(x_train)
x_test=process.transform(x_test)

# 4.模型训练
# 4.1 实例化(正规方程)
# model =LinearRegression(fit_intercept=True)
model = SGDRegressor(learning_rate='constant',eta0=0.01)
# 4.2 fit
model.fit(x_train,y_train)

# print(model.coef_)
# print(model.intercept_)
# 5.预测
y_predict=model.predict(x_test)

print(y_predict)

# 6.模型评估

print(mean_squared_error(y_test,y_predict))
```



## 正则化

**学习目标：**

1.掌握过拟合、欠拟合的概念

2.掌握过拟合、欠拟合产生的原因

3.知道什么是正则化，以及正则化的方法

###  欠拟合与过拟合

过拟合：一个假设 **在训练数据上能够获得比其他假设更好的拟合， 但是在测试数据集上却不能很好地拟合数据** (体现在准确率下降)，此时认为这个假设出现了过拟合的现象。(模型过于复杂)

欠拟合：一个假设 **在训练数据上不能获得更好的拟合，并且在测试数据集上也不能很好地拟合数据** ，此时认为这个假设出现了欠拟合的现象。(模型过于简单)

过拟合和欠拟合的区别：

<img src="assets/006tNbRwly1ga8u2rlw69j315m0oc40y.jpg" alt="æ¬ æåè¿æåå¾ç¤º" style="zoom: 33%;" />

欠拟合在训练集和测试集上的误差都较大

过拟合在训练集上误差较小，而测试集上误差较大

![image-20230913101352444](assets/image-20230913101352444.png)

### 通过代码认识过拟合和欠拟合

绘制数据

```python
import numpy as np
import matplotlib.pyplot as plt
np.random.seed(666)
x = np.random.uniform(-3,3,size = 100)
# 线性回归模型需要二维数组
X = x.reshape(-1,1)

y = 0.5* x**2 + x+2 +np.random.normal(0,1,size = 100)

from sklearn.linear_model import LinearRegression
estimator = LinearRegression()
estimator.fit(X,y)
y_predict = estimator.predict(X)

plt.scatter(x,y)
plt.plot(x,y_predict,color = 'r')
plt.show()
```

![1](assets/1.png)

```python
#计算均方误差
from sklearn.metrics import mean_squared_error
mean_squared_error(y,y_predict)

#3.0750025765636577
```

添加二次项，绘制图像

```python
X2 = np.hstack([X,X**2])
estimator2 = LinearRegression()
estimator2.fit(X2,y)
y_predict2 = estimator2.predict(X2)

plt.scatter(x,y)
plt.plot(np.sort(x),y_predict2[np.argsort(x)],color = 'r')
plt.show()
```

![2](assets/2.png)

```python
#计算均方误差和准确率

from sklearn.metrics import mean_squared_error
mean_squared_error(y,y_predict2)

#1.0987392142417858
```

再次加入高次项，绘制图像，观察均方误差结果

```python
X5 = np.hstack([X2,X**3,X**4,X**5,X**6,X**7,X**8,X**9,X**10])

estimator3 = LinearRegression()
estimator3.fit(X5,y)
y_predict5 = estimator3.predict(X5)

plt.scatter(x,y)
plt.plot(np.sort(x),y_predict5[np.argsort(x)],color = 'r')
plt.show()

error = mean_squared_error(y, y_predict5)
error

#1.0508466763764157
```

![](assets/3.png)

通过上述观察发现，随着加入的高次项越来越多，拟合程度越来越高，均方误差也随着加入越来越小。说明已经不再欠拟合了。

问题：如何判断出现过拟合呢？

将数据集进行划分：对比X、X2、X5的测试集的均方误差

X的测试集均方误差

```python
X_train,X_test,y_train,y_test = train_test_split(X,y,random_state = 5)
estimator = LinearRegression()
estimator.fit(X_train,y_train)
y_predict = estimator.predict(X_test)

mean_squared_error(y_test,y_predict)
#3.153139806483088
```

X2的测试集均方误差

```python
X_train,X_test,y_train,y_test = train_test_split(X2,y,random_state = 5)
estimator = LinearRegression()
estimator.fit(X_train,y_train)
y_predict = estimator.predict(X_test)
mean_squared_error(y_test,y_predict)
#1.111873885731967
```

X5的测试集的均方误差

```python
X_train,X_test,y_train,y_test = train_test_split(X5,y,random_state = 5)
estimator = LinearRegression()
estimator.fit(X_train,y_train)
y_predict = estimator.predict(X_test)
mean_squared_error(y_test,y_predict)
#1.4145580542309835
```

###  原因以及解决办法

**欠拟合产生原因：** 学习到数据的特征过少

解决办法：

**1）添加其他特征项**，有时出现欠拟合是因为特征项不够导致的，可以添加其他特征项来解决

**2）添加多项式特征**，模型过于简单时的常用套路，例如将线性模型通过添加二次项或三次项使模型泛化能力更强

**过拟合产生原因：** 原始特征过多，存在一些嘈杂特征， 模型过于复杂是因为模型尝试去兼顾所有测试样本

解决办法：

1）重新清洗数据，导致过拟合的一个原因有可能是数据不纯，如果出现了过拟合就需要重新清洗数据。

2）增大数据的训练量，还有一个原因就是我们用于训练的数据量太小导致的，训练数据占总数据的比例过小。

**3）正则化**

4）减少特征维度

### 正则化

在解决回归过拟合中，我们选择正则化。但是对于其他机器学习算法如分类算法来说也会出现这样的问题，除了一些算法本身作用之外（决策树、神经网络），我们更多的也是去自己做特征选择，包括之前说的删除、合并一些特征

<img src="assets/006tNbRwly1ga8u2sjcw9j314o0g8wkd.jpg" style="zoom:50%;" />

**如何解决？**

<img src="assets/006tNbRwly1ga8u2tduvuj30zs0kctav.jpg" alt="æ­£åå" style="zoom: 33%;" />

**在学习的时候，数据提供的特征有些影响模型复杂度或者这个特征的数据点异常较多，所以算法在学习的时候尽量减少这个特征的影响（甚至删除某个特征的影响），这就是正则化**

注：调整时候，算法并不知道某个特征影响，而是去调整参数得出优化的结

#### **L1正则化**

- 假设𝐿(𝑊)是未加正则项的损失，𝜆是一个超参，控制正则化项的大小。

- 则最终的损失函数：

  <img src="assets/image-20240731190649914.png" alt="image-20240731190649914" style="zoom:50%;" />

作用：用来进行特征选择，主要原因在于L1正则化会使得较多的参数为0，从而产生稀疏解,可以将0对应的特征遗弃，进而用来选择特征。一定程度上L1正则也可以防止模型过拟合。

**L1正则为什么可以产生稀疏解（可以特征选择）**

稀疏性：向量中很多维度值为0

- 对其中的一个参数 w 计算梯度，其他参数同理，α是学习率，sigmoid(w)是符号函数。

<img src="assets/l2_4.png" alt="l2" style="zoom:50%;" />

LASSO回归:

```python
from sklearn.linear_model import Lasso
```





#### **L2正则化**

- 假设𝐿(𝑊)是未加正则项的损失，𝜆是一个超参，控制正则化项的大小。
- 则最终的损失函数：

作用：主要用来防止模型过拟合，可以减小特征的权重

优点：越小的参数说明模型越简单，越简单的模型则越不容易产生过拟合现象

Ridge回归: 

```python
from sklearn.linear_model import Ridge
```







#### **正则化案例**

```python
X10 = np.hstack([X2,X**3,X**4,X**5,X**6,X**7,X**8,X**9,X**10]) 
estimator3 = LinearRegression() 
estimator3.fit(X10,y) 
y_predict3 = estimator3.predict(X10) 

plt.scatter(x,y) 
plt.plot(np.sort(x),y_predict3[np.argsort(x)],color = 'r') 
plt.show()

estimator3.coef_

array([ 1.32292089e+00,  2.03952017e+00, -2.88731664e-01, -1.24760429e+00,
        8.06147066e-02,  3.72878513e-01, -7.75395040e-03, -4.64121137e-02,
        1.84873446e-04,  2.03845917e-03])
```

![img](assets/l2_5.png)

```python
from sklearn.linear_model import Lasso  # L1正则
from sklearn.linear_model import Ridge  # 岭回归 L2正则

X10 = np.hstack([X2,X**3,X**4,X**5,X**6,X**7,X**8,X**9,X**10]) 
estimator_l1 = Lasso(alpha=0.005,normalize=True) # 调整alpha 正则化强度 查看正则化效果
estimator_l1.fit(X10,y) 
y_predict_l1 = estimator_l1.predict(X10) 

plt.scatter(x,y) 
plt.plot(np.sort(x),y_predict_l1[np.argsort(x)],color = 'r') 
plt.show()

estimator_l1.coef_  # Lasso 回归  L1正则 会将高次方项系数变为0

array([ 0.97284077,  0.4850203 ,  0.        ,  0.        , -0.        ,
        0.        , -0.        ,  0.        , -0.        ,  0.        ])
```

![img](assets/l2_6.png)

```python
X10 = np.hstack([X2,X**3,X**4,X**5,X**6,X**7,X**8,X**9,X**10]) 
estimator_l2 = Ridge(alpha=0.005,normalize=True) # 调整alpha 正则化强度 查看正则化效果
estimator_l2.fit(X10,y) 
y_predict_l2 = estimator_l2.predict(X10) 

plt.scatter(x,y) 
plt.plot(np.sort(x),y_predict_l2[np.argsort(x)],color = 'r') 
plt.show()

estimator_l2.coef_   # l2 正则不会将系数变为0 但是对高次方项系数影响较大

array([ 9.91283840e-01,  5.24820573e-01,  1.57614237e-02,  2.34128982e-03,
        7.26947948e-04, -2.99893698e-04, -8.28333499e-05, -4.51949529e-05,
       -4.21312015e-05, -8.22992826e-07])
```

![img](assets/l2_7.png)









## 作业

1.完成线性回归部分的思维导图



2.描述梯度下降算法思想，自己推导银行信贷的案例





3.说明欠拟合和过拟合的相关内容



3.使用L1和L2正则化方法实现波士顿房价预测







## 课堂笔记

<img src="assets/image-20240730162748965.png" alt="image-20240730162748965" style="zoom:50%;" />

![image-20240731120450448](assets/image-20240731120450448.png)



**L1 / L2正则化思想**

![image-20240801093608216](assets/image-20240801093608216.png)



