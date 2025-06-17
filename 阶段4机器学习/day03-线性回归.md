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



### 3.3 应用场景

![image-20230901103123601](assets/image-20230901103123601.png)



## 2、线性回归问题的求解

**学习目标：**

1.知道线性回归API的使用

2.知道损失函数是什么

3.复习导数和矩阵的相关内容

4.理解正规方程法

5.掌握梯度下降算法的内容



### 线性回归API的应用

预测播仔身高

已知数据:

![image-20230901104147248](assets/image-20230901104147248.png)

 需求:播仔身高是176，请预测体重?



![image-20230901104237860](assets/image-20230901104237860.png)



通过线性回归API可快速的找到一条红色直线，是怎么求解的呢？

![image-20230901104626001](assets/image-20230901104626001.png)

### 损失函数

需要设置一个评判标准

![image-20230901110253313](assets/image-20230901110253313.png)

 **误差概念**：用预测值y – 真实值y就是误差

**损失函数**：衡量每个样本预测值与真实值效果的函数

“红色直线能更好的拟合所有点”也就是误差最小，误差和最小

损失函数数学如何表达呢？又如何求损失函数的最小值呢？

![image-20230901110606206](assets/image-20230901110606206.png)

![image-20230901110842936](assets/image-20230901110842936.png)

![image-20230901110853094](assets/image-20230901110853094.png)

当损失函数取最小值时，得到k就是最优解

![image-20230901113810862](assets/image-20230901113810862.png)

<img src="assets/image-20230901113822728.png" alt="image-20230901113822728"  />

![image-20230901113834036](assets/image-20230901113834036.png)

想求一条直线更好的拟合所有点 y = kx + b 

- ​     引入损失函数(衡量预测值和真实值效果) Loss(k, b) 

- ​     通过一个优化方法，求损失函数最小值，得到K最优解

![image-20230912103729099](assets/image-20230912103729099.png)

回归的损失函数：

- *均方误差* *(*Mean-Square Error, MSE*)*

![image-20230901114527268](assets/image-20230901114527268.png)

- *平均绝对误差* *(Mean Absolute Error* *,* *MAE)*

  ![image-20230901114539398](assets/image-20230901114539398.png)



![image-20230901114816872](assets/image-20230901114816872.png)





### 导数和矩阵

#### 常见的数据表述

- 为什么要学习标量、向量、矩阵、张量?
  - 因机器学习、深度学习中经常用，不要因是数学就害怕
  - 宗旨:用到就学什么，不要盲目的展开、大篇幅学数学
- 标量scalar :一个独立存在的数，只有大小没有方向
- 向量vector :向量指一列顺序排列的元素。默认是列向量

![image-20230901115201758](assets/image-20230901115201758.png)

![image-20230901115210623](assets/image-20230901115210623.png)

- 矩阵matrix :二维数组

  ![image-20230901115223778](assets/image-20230901115223778.png)

  ![image-20230901115232323](assets/image-20230901115232323.png)

- 张量Tensor :多维数组，张量是基于向量和矩阵的推广

  ![image-20230901115246275](assets/image-20230901115246275.png)

#### 导数

当函数y=f（x）的自变量x在一点$x_0$上产生一个增量Δx时，函数输出值的增量Δy与自变量增量Δx的比值在Δx趋于0时的极限a如果存在，a即为在$x_0$处的导数，记作$f^\prime(x_0)$或df($x_0$)/dx。

![](assets/导数.jpeg)



导数是函数的局部性质。一个函数在某一点的导数描述了这个函数在这一点附近的变化率。

函数在某一点的导数就是该函数所代表的曲线在这一点上的切线斜率

常见函数的导数：

![image-20240731191353155](assets/image-20240731191353155-17224246394383.png)

导数的四则运算：

![image-20240731191324217](assets/image-20240731191324217-17224246656145-17224247243948.png)

复合函数求导：g(h)是外函数 h(x)是内函数。先对外函数求导，再对内函数求导

![image-20230901143204713](assets/image-20230901143204713.png)



导数求极值：

导数为0的位置是函数的极值点 

![image-20230901143529603](assets/image-20230901143529603.png)

#### 偏导

![image-20230901144053678](assets/image-20230901144053678.png)



![image-20230901144102962](assets/image-20230901144102962.png)



#### 向量

向量运算：

![image-20230901144711751](assets/image-20230901144711751.png)

![image-20230901145009232](assets/image-20230901145009232.png)

#### 矩阵

** 点乘 @ 点积的区别

![image-20230901145231388](assets/image-20230901145231388.png)

<img src="assets/image-20230901145322438.png" alt="image-20230901145322438" />

![image-20230901145840373](assets/image-20230901145840373.png)

![image-20230901150113602](assets/image-20230901150113602.png)

### 一元线性回归的解析解

![image-20230901150406897](assets/image-20230901150406897.png)



![image-20230901150708528](assets/image-20230901150708528.png)

![image-20230912145402703](assets/image-20230912145402703.png)

### 多元线性回归的解析解-正规方程法

![image-20230901152528805](assets/image-20230901152528805.png)

![image-20230911234116911](assets/image-20230911234116911.png)





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



