## 1、Pandas双变量可视化

### 1 散点图、蜂巢图

评分跟价格之间是否有关联：

```python
reviews[reviews['price']<100].plot.scatter(x='price',y='points')
```

![image-20230906093536874](assets/image-20230906093536874.png)

> 当数据量比较大的时候, 绘制的散点图不能反应数据的分布情况，此时有两种解决方法。

- **方法1：**采样

```python
reviews[reviews['price']<100].sample(100).plot.scatter(x='price',y='points')
```

![image-20230906093431827](assets/image-20230906093431827.png)

- **方法2：**蜂巢图

```python
# hexbin绘制蜂巢图  gridsize蜂巢网格的大小
reviews[reviews['price']<100].plot.hexbin(x='price',y='points',gridsize=15)
```

![image-20230906093440683](assets/image-20230906093440683.png)

### 2 堆叠图-堆叠柱状图

找到最受欢迎的前五种葡萄酒种类：

```python
top_5_variety = reviews['variety'].value_counts().head().index.to_list()

# isin Series中的元素, 是否在列表范围内,如果在返回True ,不在返回False
top_5_wine = reviews[reviews['variety'].isin(top_5_variety)]
```



**绘制堆叠柱状图：**

```python
top_5_wine.pivot_table(index='points',columns=['variety'],values=['description'],aggfunc='count').plot.bar(figsize=(20,8),stacked=True)
```

`stacked=True` 默认是**False**（ False的情况下柱子不会堆叠起来）

![image-20230906093914494](assets/image-20230906093914494.png)

设置为True之后会有堆叠的效果

![image-20230906093943703](assets/image-20230906093943703.png)

### 3 堆叠面积图

```python
top_5_wine.pivot_table(index='points',columns=['variety'],values=['description'],aggfunc='count').plot.area(figsize=(16,8))
```

![image-20230906094124691](assets/image-20230906094124691.png)

### 4 折线图

```python
top_5_wine.pivot_table(index='points',columns=['variety'],values=['description'],aggfunc='count').plot(figsize=(16,8),grid=True)
```

![image-20230906094134783](assets/image-20230906094134783.png)

## 2 Seaborn 绘图

Seaborn 是一个基于 **Matplotlib** 的 Python 数据可视化库，专注于统计图表的绘制。它通过简洁的语法和美观的默认样式，帮助用户快速生成高质量的可视化图表，特别适合数据探索和分析。



- **核心特点**

  - **简化复杂图表**
    相比 Matplotlib，Seaborn 用更少的代码实现复杂图表（如分面图、分布图、回归图等）。

  - **内置统计功能**
    支持直接绘制带统计分析的图表（如分布拟合、误差线、回归线）。

  - **美观的默认主题**
    提供多种颜色主题和样式（如 `darkgrid`, `whitegrid`），图表更专业。

  - **与 Pandas 无缝集成**
    支持直接传入 Pandas DataFrame，自动解析数据字段。



- **常见图表类型**

| 图表类型                 | 函数示例                           | 用途                 |
| :----------------------- | :--------------------------------- | :------------------- |
| 分布图（直方图、密度图） | `sns.histplot()`, `sns.kdeplot()`  | 数据分布分析         |
| 散点图                   | `sns.scatterplot()`                | 变量间关系           |
| 箱线图                   | `sns.boxplot()`                    | 数据分布与异常值     |
| 热力图                   | `sns.heatmap()`                    | 矩阵数据相关性可视化 |
| 分面图（多子图）         | `sns.FacetGrid()`, `sns.catplot()` | 多维度数据对比       |
| 回归图                   | `sns.regplot()`                    | 线性关系与趋势       |



- **seaborn** 通用的几个参数：

  - data：传入一个df 对象

  - x , y：DataFrame中的列名

  - hue：传入一个类别型的列名, 同样的图会按照这个类别分组, 分别绘制一份，绘制到一起方便进行对比



- **seaborn 调整图的大小**

**1. 通用方法（适用于所有图表）**

使用 Matplotlib 的 `plt.figure(figsize=(width, height))` 在绘图前设置画布大小：

```python
import seaborn as sns
import matplotlib.pyplot as plt

# 设置图形尺寸
plt.figure(figsize=(10, 6))  # 宽度10英寸，高度6英寸

# 绘制Seaborn图表
sns.lineplot(x=[1, 2, 3], y=[4, 5, 1])
plt.show()
```

**2. 子图场景**

使用 `plt.subplots()` 创建子图时直接指定 `figsize`：

```python
fig, ax = plt.subplots(figsize=(8, 4))
sns.barplot(x=['A', 'B', 'C'], y=[3, 7, 2], ax=ax)
```

```python
import matplotlib.pyplot as plt
import seaborn as sns

# 创建一个 2行×2列 的子图网格，并设置整个画布大小为 12×8 英寸
fig, axes = plt.subplots(nrows=2, ncols=2, figsize=(12, 8))

# 在第一个子图（axes[0,0]）中绘制
sns.lineplot(x=[1,2,3], y=[4,5,1], ax=axes[0,0])
axes[0,0].set_title("子图1")

# 在第二个子图（axes[0,1]）中绘制
sns.barplot(x=['A','B','C'], y=[3,7,2], ax=axes[0,1])
axes[0,1].set_title("子图2")

# ... 其他子图的绘制
plt.tight_layout()  # 自动调整子图间距
plt.show()
```

**3. 分面图（FacetGrid类图表）**

对于 `sns.catplot`, `sns.lmplot`, `sns.relplot` 等分面绘图函数，需通过 `height`（单个子图高度）和 `aspect`（宽高比）调整：

```python
# 总宽度 = height * aspect * 列数
sns.catplot(
    data=tips, x="day", y="total_bill", 
    kind="box", 
    height=4,    # 每个子图高度为4英寸
    aspect=2     # 宽高比（宽度=4*2=8英寸）
)
```

**4. 修改默认设置**

通过 Seaborn 主题配置全局图形尺寸（需在绘图前设置）：

```python
sns.set_theme(rc={'figure.figsize':(12, 8)})
```



**Seaborn API 数据传入的两种方式**

```python
# 如果 data 传入了 一个dataframe  x , y 就可以只传入列名的字符串
sns.kdeplot(data = tips,x='total_bill')
```

```python
# x 也可以直接赋值一个Series 此时 data 就不需要传参
sns.kdeplot(tips['total_bill'])
```



### 1 单变量可视化：

#### a、直方图、KDE图

- 准备数据

```python
import pandas as pd
import seaborn as sns
tips = pd.read_csv('data/tips.csv')
```

- 绘制直方图


```python
import matplotlib.pyplot as plt
plt.rcParams['font.sans-serif'] = ['Noto Sans CJK JP', 'WenQuanYi Micro Hei', 'SimHei'] # 正常显示汉字

fig,ax = plt.subplots(figsize=(12,6))
sns.histplot(x='total_bill',data=tips,hue='sex')
ax.set_title('总账单直方图')
```

![image-20230906101046248](assets/image-20230906101046248.png)

- 绘制KDE图


```python
plt.rcParams['axes.unicode_minus'] = False # 正常显示负号

fig,ax = plt.subplots(figsize=(12,6))
sns.kdeplot(data=tips,x='total_bill',hue='day')
```

![image-20230906101054532](assets/image-20230906101054532.png)

**KDE VS 直方图**

- 表示的意义基本一样, 都是线/柱子越高  出现的概率/样本数量越大/越高
- KDE当多个类别进行对比的时候, 读图比直方图方便
- Y轴的坐标, KDE图是概率密度  直方图是样本数量



#### b、计数柱状图countplot

这个api 体现了**Seaborn**这一套API另外的一个特点：除了绘图以外还会帮助做一些统计

```python
fig,ax = plt.subplots(figsize=(12,6))
sns.countplot(data=tips,x='day')
ax.set_title('计数柱状图')
plt.show()

# 使用day进行分组, 然后再计数, 把计数的结果绘制成柱状图, 同下面代码效果类似
tips['day'].value_counts().plot.bar(color=['r','g','b','orange'])
```



![image-20230906102157332](assets/image-20230906102157332.png)

### 2 双变量可视化

#### 1 散点图

```python
fig,ax = plt.subplots(figsize=(12,6))
sns.scatterplot(data=tips,x='total_bill',y='tip',hue='sex')
ax.set_title('总账小费之间关系图')
plt.show()
```

![image-20230906113643962](assets/image-20230906113643962.png)

```python
fig,ax = plt.subplots(figsize=(12,6))
# fit_reg 默认是True 会拟合一条直线 就是利用这一份数据跑了线性回归
# fit_reg=False 可以关掉
sns.regplot(data=tips,x='total_bill',y='tip')
ax.set_title('总账小费之间关系图')
plt.show()
```

![image-20230906113628456](assets/image-20230906113628456.png)

#### 2 蜂巢图

```python
# kind='hex'  加上这个参数就是蜂巢图, 如果不加就是散点图
sns.jointplot(data=tips,x='total_bill',y='tip',kind='hex')
plt.show()
```

![image-20250522153636540](assets\image-20250522153636540-1747899398696-1.png)

```python
# kind='hex'  加上这个参数就是蜂巢图, 如果不加就是散点图
sns.jointplot(data=tips,x='total_bill',y='tip')
plt.show()
```

![image-20250522153735113](assets\image-20250522153735113-1747899456410-3.png)

#### 3 2D KDE图

```python
sns.kdeplot(data=tips,x='total_bill',y='tip',fill=True,cbar=True)
plt.show()
```

- 一维KDE 只传入x, 或者 只转入Y

- 二维KDE x,y 都传入

- fill=True   是否填充曲线内的颜色

- cbar=True  是否显示 右侧的颜色示意条

![image-20230906111132723](assets/image-20230906111132723.png)

#### 4 barplot

 barplot 是对 x 分组 , 对y聚合, 聚合函数 通过estimator传入, 默认是mean 平均

```python
fig,ax = plt.subplots(figsize=(12,6))
sns.barplot(data=tips,x='time',y='total_bill',estimator='mean',errorbar=None)
ax.set_title('就餐时间和金额之间关系')
plt.show()
```

> errorbar 误差条： 默认会显示，当数据是从大量数据中抽样出来的，此时计算的结果可能不能真正代表全部的数据, 会有一个可能的统计范围，这个范围就通过这个errorbar来显示, 如果数据不是抽样的数据, 可以把它关了。



```python
# 上面的代码相当于 
tips.groupby('time')['total_bill'].mean().plot.bar()
```

![image-20230906112922023](assets/image-20230906112922023.png)

#### 5 箱线图

箱线图读图

- 箱子的中间有一条线，代表了数据的中位数

- 箱子的上下底，分别是数据的上四分位数（Q3）和下四分位数（Q1）

- 箱体包含了50%的数据。因此，箱子的高度在一定程度上反映了数据的波动程度

- 上下边缘则代表了该组数据的最大值和最小值
  - IQR = 上四分位数（Q3) - 下四分位数（Q1）
  - 判断异常值时最大值 = 上四分位数（Q3)  + 1.5 IQR  大于这个值的就是异常值
  - 判断异常值时最小值 = 下四分位数（Q1）- 1.5 IQR   小于这个值的就是异常值

- 有时候箱子外部会有一些点，可以理解为数据中的“异常值”

```python
fig,ax = plt.subplots(figsize=(12,6))
sns.boxplot(data=tips,x='time',y='total_bill')
ax.set_title('总账小费之间关系图')
plt.show()
```

>![image-20230906113259638](assets/image-20230906113259638.png)
>
>

#### 6 提琴图

相当于是箱线图的增强版

```python
fig,ax = plt.subplots(figsize=(12,6))
sns.violinplot(data=tips,x='time',y='total_bill',hue='sex',split=True)
ax.set_title('总账午餐晚餐性别之间关系图')
plt.show()
```

>split = True 默认是False  当使用hue的时候会生效
>
>会在一个violin中切开 一半显示一个类别
>
>![image-20230906113405510](assets/image-20230906113405510.png)
>
>

#### 7 成对关系图

pairplot

- ```python
  sns.pairplot(tips,hue='sex')
  ```

>默认对角线是直方图, 其它都是散点图, 默认情况下, 右上和左下图标的信息是一样的
>
>![image-20230906144553264](assets/image-20230906144553264.png)

```python
pair_grid = sns.PairGrid(tips)
# 右上角
pair_grid.map_upper(sns.regplot)
# 左下角
pair_grid.map_lower(sns.kdeplot)
# 对角线
pair_grid.map_diag(sns.histplot)
```

![image-20230906144617562](assets/image-20230906144617562.png)

### 多变量可视化和style样式

hue 参数 可以多加一个类别的变量, 用颜色进行区分

```python
# white, dark, whitegrid, darkgrid, ticks
sns.set_style('ticks')
fig,ax = plt.subplots(figsize=(12,6))
# fit_reg 默认是True 会拟合一条直线 就是利用这一份数据跑了线性回归
# fit_reg=False 可以关掉
sns.violinplot(data=tips,x='time',y='total_bill',hue='sex',split=True)
ax.set_title('总账小费之间关系图')
plt.show()
```



### Seaborn绘图小结

sns.XXXplot(data = df, x = '列名', y='列名',hue='列名')

- 调整绘图区域的大小
  - plt.subplots(figsize=())
  - 如果plt.subplots(figsize=()) 不行, 都会有一个height的参数, 指定图片的高度 可以通过height 调整图片大小
  - height 高度 aspect 宽高比例

## 3 RFM

### 3.1 RFM 模型业务说明

R recency       最近一次购买距今的时间间隔      7天以内来过  高  |  低

F frequency    最近一段时间购买的次数         最近半年来过25次   高|低 

M monetary   最近一段时间购买的金额         最近半年消费5千元   高|低 

<img src="assets/image-20230906145827647.png" alt="image-20230906145827647" style="zoom:80%;" />

RFM 计算

- R/F/M 每个维度做二分 分成8组
- R/F/M 每个维度打3分  3/2/1   333   111

RFM 计算要使用到什么样的数据

有用户ID 的交易流水信息就可以了

- 用户ID
- 消费时间
- 消费金额

计算方法

- R  最近一次购买距今的时间间隔   用户ID分组对消费时间取最大值 和今天的日期计算差值
- F   用户ID分组对消费的记录计数 count
- M  用户ID分组对消费金额求和 sum

设置打分的规则, 将R/F/M 每一个维度打分 3/2/1

把三个分数拼到一起, 就是最后的标签

把数据保存到Mysql中, 保存到Excel

每个组的数据进行可视化



RFM 适合落地的场景

- 有消费M, 消费的频率还不能太低(F不能太小)
  - 电商/打车/旅游/外卖.....

- 没有M, 但是用户的使用频率很高, 可以使用RFE E表示参与度
  - E  点赞,收藏, 评论, 分享, 弹幕.....



### 3.2 代码实现

#### 3.2.1 数据加载


```python
import pandas as pd
pd.read_excel('sales.xlsx')
```

<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>会员ID</th>
      <th>订单号</th>
      <th>提交日期</th>
      <th>订单金额</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>15278002468</td>
      <td>3000304681</td>
      <td>2015-01-01</td>
      <td>499.0</td>
    </tr>
    <tr>
      <th>1</th>
      <td>39236378972</td>
      <td>3000305791</td>
      <td>2015-01-01</td>
      <td>2588.0</td>
    </tr>
    <tr>
      <th>2</th>
      <td>38722039578</td>
      <td>3000641787</td>
      <td>2015-01-01</td>
      <td>498.0</td>
    </tr>
    <tr>
      <th>3</th>
      <td>11049640063</td>
      <td>3000798913</td>
      <td>2015-01-01</td>
      <td>1572.0</td>
    </tr>
    <tr>
      <th>4</th>
      <td>35038752292</td>
      <td>3000821546</td>
      <td>2015-01-01</td>
      <td>10.1</td>
    </tr>
    <tr>
      <th>...</th>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
    </tr>
    <tr>
      <th>30769</th>
      <td>39368100847</td>
      <td>4281994827</td>
      <td>2015-12-31</td>
      <td>828.0</td>
    </tr>
    <tr>
      <th>30770</th>
      <td>409757</td>
      <td>4282010457</td>
      <td>2015-12-31</td>
      <td>199.0</td>
    </tr>
    <tr>
      <th>30771</th>
      <td>38380526114</td>
      <td>4282017675</td>
      <td>2015-12-31</td>
      <td>208.0</td>
    </tr>
    <tr>
      <th>30772</th>
      <td>28074988</td>
      <td>4282019440</td>
      <td>2015-12-31</td>
      <td>89.0</td>
    </tr>
    <tr>
      <th>30773</th>
      <td>39460363230</td>
      <td>4282025309</td>
      <td>2015-12-31</td>
      <td>719.0</td>
    </tr>
  </tbody>
</table>
<p>30774 rows × 4 columns</p>

- 我们的数据有5个sheet，只传路径只能读取出一个sheet, 查看api 文档后发现有一个sheet_name参数


```python
sheet_names = ['2015','2016','2017','2018','会员等级']
sheet_datas = pd.read_excel('sales.xlsx',sheet_name=sheet_names)
```

- 添加sheet_name参数后，返回的是一个字典， key是sheet的名字，返回的value是对应的DataFrame


```python
sheet_datas['2016']
```

<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>会员ID</th>
      <th>订单号</th>
      <th>提交日期</th>
      <th>订单金额</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>39288120141</td>
      <td>4282025766</td>
      <td>2016-01-01</td>
      <td>76.00</td>
    </tr>
    <tr>
      <th>1</th>
      <td>39293812118</td>
      <td>4282037929</td>
      <td>2016-01-01</td>
      <td>7599.00</td>
    </tr>
    <tr>
      <th>2</th>
      <td>27596340905</td>
      <td>4282038740</td>
      <td>2016-01-01</td>
      <td>802.00</td>
    </tr>
    <tr>
      <th>3</th>
      <td>15111475509</td>
      <td>4282043819</td>
      <td>2016-01-01</td>
      <td>65.00</td>
    </tr>
    <tr>
      <th>4</th>
      <td>38896594001</td>
      <td>4282051044</td>
      <td>2016-01-01</td>
      <td>95.00</td>
    </tr>
    <tr>
      <th>...</th>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
    </tr>
    <tr>
      <th>41273</th>
      <td>35336052906</td>
      <td>4324910145</td>
      <td>2016-12-31</td>
      <td>99.00</td>
    </tr>
    <tr>
      <th>41274</th>
      <td>39305835721</td>
      <td>4324910148</td>
      <td>2016-12-31</td>
      <td>238.89</td>
    </tr>
    <tr>
      <th>41275</th>
      <td>39296945352</td>
      <td>4324910770</td>
      <td>2016-12-31</td>
      <td>765.00</td>
    </tr>
    <tr>
      <th>41276</th>
      <td>14791026234</td>
      <td>4324911025</td>
      <td>2016-12-31</td>
      <td>45.80</td>
    </tr>
    <tr>
      <th>41277</th>
      <td>16779755770</td>
      <td>4324911048</td>
      <td>2016-12-31</td>
      <td>119.00</td>
    </tr>
  </tbody>
</table>
<p>41278 rows × 4 columns</p>

- 遍历整个字典， 查看每个sheet的基本情况


```python
for i in sheet_names:
    print('==============='+i+'start======================================')
    print(sheet_datas[i].head())
    print("----------------------HEAD----------------------------------")
    print(sheet_datas[i].info())
    print('-----------------------INFO--------------------------------')
    print(sheet_datas[i].describe())
    print('======================OVER===========================')
```

    ===============2015start======================================
              会员ID         订单号       提交日期    订单金额
    0  15278002468  3000304681 2015-01-01   499.0
    1  39236378972  3000305791 2015-01-01  2588.0
    2  38722039578  3000641787 2015-01-01   498.0
    3  11049640063  3000798913 2015-01-01  1572.0
    4  35038752292  3000821546 2015-01-01    10.1
    ----------------------HEAD----------------------------------
    <class 'pandas.core.frame.DataFrame'>
    RangeIndex: 30774 entries, 0 to 30773
    Data columns (total 4 columns):
     #   Column  Non-Null Count  Dtype         
    ---  ------  --------------  -----         
     0   会员ID    30774 non-null  int64         
     1   订单号     30774 non-null  int64         
     2   提交日期    30774 non-null  datetime64[ns]
     3   订单金额    30774 non-null  float64       
    dtypes: datetime64[ns](1), float64(1), int64(2)
    memory usage: 961.8 KB
    None
    -----------------------INFO--------------------------------
                   会员ID           订单号           订单金额
    count  3.077400e+04  3.077400e+04   30774.000000
    mean   2.918779e+10  4.020414e+09     960.991161
    std    1.385333e+10  2.630510e+08    2068.107231
    min    2.670000e+02  3.000305e+09       0.500000
    25%    1.944122e+10  3.885510e+09      59.000000
    50%    3.746545e+10  4.117491e+09     139.000000
    75%    3.923593e+10  4.234882e+09     899.000000
    max    3.954613e+10  4.282025e+09  111750.000000
    ======================OVER===========================
    ===============2016start======================================
              会员ID         订单号       提交日期    订单金额
    0  39288120141  4282025766 2016-01-01    76.0
    1  39293812118  4282037929 2016-01-01  7599.0
    2  27596340905  4282038740 2016-01-01   802.0
    3  15111475509  4282043819 2016-01-01    65.0
    4  38896594001  4282051044 2016-01-01    95.0
    ----------------------HEAD----------------------------------
    <class 'pandas.core.frame.DataFrame'>
    RangeIndex: 41278 entries, 0 to 41277
    Data columns (total 4 columns):
     #   Column  Non-Null Count  Dtype         
    ---  ------  --------------  -----         
     0   会员ID    41278 non-null  int64         
     1   订单号     41278 non-null  int64         
     2   提交日期    41278 non-null  datetime64[ns]
     3   订单金额    41277 non-null  float64       
    dtypes: datetime64[ns](1), float64(1), int64(2)
    memory usage: 1.3 MB
    None
    -----------------------INFO--------------------------------
                   会员ID           订单号           订单金额
    count  4.127800e+04  4.127800e+04   41277.000000
    mean   2.908415e+10  4.313583e+09     957.106694
    std    1.389468e+10  1.094572e+07    2478.560036
    min    8.100000e+01  4.282026e+09       0.100000
    25%    1.934990e+10  4.309457e+09      59.000000
    50%    3.730339e+10  4.317545e+09     147.000000
    75%    3.923182e+10  4.321132e+09     888.000000
    max    3.954554e+10  4.324911e+09  174900.000000
    ======================OVER===========================
    ===============2017start======================================
              会员ID         订单号       提交日期    订单金额
    0  38765290840  4324911135 2017-01-01  1799.0
    1  39305832102  4324911213 2017-01-01   369.0
    2  34190994969  4324911251 2017-01-01   189.0
    3  38986333210  4324911283 2017-01-01   169.0
    4      4271359  4324911355 2017-01-01    78.0
    ----------------------HEAD----------------------------------
    <class 'pandas.core.frame.DataFrame'>
    RangeIndex: 50839 entries, 0 to 50838
    Data columns (total 4 columns):
     #   Column  Non-Null Count  Dtype         
    ---  ------  --------------  -----         
     0   会员ID    50839 non-null  int64         
     1   订单号     50839 non-null  int64         
     2   提交日期    50839 non-null  datetime64[ns]
     3   订单金额    50839 non-null  float64       
    dtypes: datetime64[ns](1), float64(1), int64(2)
    memory usage: 1.6 MB
    None
    -----------------------INFO--------------------------------
                   会员ID           订单号           订单金额
    count  5.083900e+04  5.083900e+04   50839.000000
    mean   2.882368e+10  4.332466e+09     963.587872
    std    1.409416e+10  4.404350e+06    2178.727261
    min    2.780000e+02  4.324911e+09       0.300000
    25%    1.869274e+10  4.328415e+09      59.000000
    50%    3.688044e+10  4.331989e+09     149.000000
    75%    3.923020e+10  4.337515e+09     898.000000
    max    3.954554e+10  4.338764e+09  123609.000000
    ======================OVER===========================
    ===============2018start======================================
              会员ID         订单号       提交日期    订单金额
    0  39229691808  4338764262 2018-01-01  3646.0
    1  39293668916  4338764363 2018-01-01  3999.0
    2  35059646224  4338764376 2018-01-01    10.1
    3      1084397  4338770013 2018-01-01   828.0
    4      3349915  4338770121 2018-01-01  3758.0
    ----------------------HEAD----------------------------------
    <class 'pandas.core.frame.DataFrame'>
    RangeIndex: 81349 entries, 0 to 81348
    Data columns (total 4 columns):
     #   Column  Non-Null Count  Dtype         
    ---  ------  --------------  -----         
     0   会员ID    81349 non-null  int64         
     1   订单号     81349 non-null  int64         
     2   提交日期    81349 non-null  datetime64[ns]
     3   订单金额    81348 non-null  float64       
    dtypes: datetime64[ns](1), float64(1), int64(2)
    memory usage: 2.5 MB
    None
    -----------------------INFO--------------------------------
                   会员ID           订单号           订单金额
    count  8.134900e+04  8.134900e+04   81348.000000
    mean   2.902317e+10  4.348372e+09     966.582792
    std    1.404116e+10  4.183774e+06    2204.969534
    min    2.780000e+02  4.338764e+09       0.000000
    25%    1.902755e+10  4.345654e+09      60.000000
    50%    3.740121e+10  4.349448e+09     149.000000
    75%    3.923380e+10  4.351639e+09     899.000000
    max    3.954614e+10  4.354235e+09  174900.000000
    ======================OVER===========================
    ===============会员等级start======================================
              会员ID  会员等级
    0       100090     3
    1  10012905801     1
    2  10012935109     1
    3  10013498043     1
    4  10014087899     4
    ----------------------HEAD----------------------------------
    <class 'pandas.core.frame.DataFrame'>
    RangeIndex: 154385 entries, 0 to 154384
    Data columns (total 2 columns):
     #   Column  Non-Null Count   Dtype
    ---  ------  --------------   -----
     0   会员ID    154385 non-null  int64
     1   会员等级    154385 non-null  int64
    dtypes: int64(2)
    memory usage: 2.4 MB
    None
    -----------------------INFO--------------------------------
                   会员ID           会员等级
    count  1.543850e+05  154385.000000
    mean   2.980055e+10       2.259701
    std    1.365654e+10       1.346408
    min    8.100000e+01       1.000000
    25%    2.213894e+10       1.000000
    50%    3.833022e+10       2.000000
    75%    3.927932e+10       3.000000
    max    3.954614e+10       5.000000
    ======================OVER===========================


- 结果说明
  - 每个sheet中的数据都能正常读取，无任何错误
  - 日期列（提交日期）已经被自动识别为日期格式，后期不必转换
  - 订单金额的分布是不均匀的，里面有明显的极大值
    - 例如2016年的数据中，最大值为174900，最小值仅为0.1
    - 极大极小值相差过大，数据会受极值影响
  - 订单金额中的最小值包括0、0.1这样的金额，可能为非正常订单，与业务方沟通后确认
    - 最大值的订单金额有效，通常是客户一次性购买多个大家电商品
    - 而订单金额为0.1元这类使用优惠券支付的订单，没有实际意义
    - 除此之外，所有低于1元的订单均有这个问题，因此需要在后续处理中去掉

#### 3.2.2 数据处理


- 有的表中存在缺失值记录，但数量不多，选择丢弃或填充均可


```python
for i in sheet_names[:-1]:
    sheet_datas[i] = sheet_datas[i].dropna()
    sheet_datas[i] = sheet_datas[i][sheet_datas[i]['订单金额'] > 1]# 丢弃订单金额<=1的记录
    sheet_datas[i]['max_year_date'] = sheet_datas[i]['提交日期'].max() 
```


```python
for i in sheet_names:
    print(sheet_datas[i].isnull().sum())
```

    会员ID             0
    订单号              0
    提交日期             0
    订单金额             0
    max_year_date    0
    dtype: int64
    会员ID             0
    订单号              0
    提交日期             0
    订单金额             0
    max_year_date    0
    dtype: int64
    会员ID             0
    订单号              0
    提交日期             0
    订单金额             0
    max_year_date    0
    dtype: int64
    会员ID             0
    订单号              0
    提交日期             0
    订单金额             0
    max_year_date    0
    dtype: int64
    会员ID    0
    会员等级    0
    dtype: int64

#### 3.2.3 汇总所有数据

- 为了后续计算方便， 我们将2015~2018年的销售数据合并到同一个DataFrame中


```python
data_merge = sheet_datas['2015']
for i in sheet_names[1:-1]:
    data_merge =data_merge.append(sheet_datas[i])
```


```python
data_merge
```

<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>会员ID</th>
      <th>订单号</th>
      <th>提交日期</th>
      <th>订单金额</th>
      <th>max_year_date</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>15278002468</td>
      <td>3000304681</td>
      <td>2015-01-01</td>
      <td>499.0</td>
      <td>2015-12-31</td>
    </tr>
    <tr>
      <th>1</th>
      <td>39236378972</td>
      <td>3000305791</td>
      <td>2015-01-01</td>
      <td>2588.0</td>
      <td>2015-12-31</td>
    </tr>
    <tr>
      <th>2</th>
      <td>38722039578</td>
      <td>3000641787</td>
      <td>2015-01-01</td>
      <td>498.0</td>
      <td>2015-12-31</td>
    </tr>
    <tr>
      <th>3</th>
      <td>11049640063</td>
      <td>3000798913</td>
      <td>2015-01-01</td>
      <td>1572.0</td>
      <td>2015-12-31</td>
    </tr>
    <tr>
      <th>4</th>
      <td>35038752292</td>
      <td>3000821546</td>
      <td>2015-01-01</td>
      <td>10.1</td>
      <td>2015-12-31</td>
    </tr>
    <tr>
      <th>...</th>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
    </tr>
    <tr>
      <th>81344</th>
      <td>39229485704</td>
      <td>4354225182</td>
      <td>2018-12-31</td>
      <td>249.0</td>
      <td>2018-12-31</td>
    </tr>
    <tr>
      <th>81345</th>
      <td>39229021075</td>
      <td>4354225188</td>
      <td>2018-12-31</td>
      <td>89.0</td>
      <td>2018-12-31</td>
    </tr>
    <tr>
      <th>81346</th>
      <td>39288976750</td>
      <td>4354230034</td>
      <td>2018-12-31</td>
      <td>48.5</td>
      <td>2018-12-31</td>
    </tr>
    <tr>
      <th>81347</th>
      <td>26772630</td>
      <td>4354230163</td>
      <td>2018-12-31</td>
      <td>3196.0</td>
      <td>2018-12-31</td>
    </tr>
    <tr>
      <th>81348</th>
      <td>39455580335</td>
      <td>4354235084</td>
      <td>2018-12-31</td>
      <td>2999.0</td>
      <td>2018-12-31</td>
    </tr>
  </tbody>
</table>
<p>202827 rows × 5 columns</p>

```python
data_merge['max_year_date'].value_counts()
```

- 查看合并后每年的数据情况


    2018-12-31    80801
    2017-12-31    50451
    2016-12-31    41001
    2015-12-31    30574
    Name: max_year_date, dtype: int64

- 与原始数据对比， 确认合并无误


```python
sheet_datas['2018'].shape
```


    (80801, 5)

- 查看合并后的数据字段信息


```python
data_merge.info()
```

    <class 'pandas.core.frame.DataFrame'>
    Int64Index: 202827 entries, 0 to 81348
    Data columns (total 5 columns):
     #   Column         Non-Null Count   Dtype         
    ---  ------         --------------   -----         
     0   会员ID           202827 non-null  int64         
     1   订单号            202827 non-null  int64         
     2   提交日期           202827 non-null  datetime64[ns]
     3   订单金额           202827 non-null  float64       
     4   max_year_date  202827 non-null  datetime64[ns]
    dtypes: datetime64[ns](2), float64(1), int64(2)
    memory usage: 9.3 MB


- 汇总所有数据: 由于4年的数据列名都一样，所以使用append方法将4年数据合并为一个完整的dataframe data_merge，后续的所有计算都能基于同一个dataframe进行，而不用写循环代码段对每个年份的数据单独计算

#### 3.2.4 以年为周期计算RFM

获取各自年份数据:

- 先计算各自年份的最大日期与每个行的日期的差，得到日期间隔
- 再增加一列新的字段，为每个记录行发生的年份，使用data_merge['提交日期'].dt.year实现
- 转换日期间隔为数字：data_merge['date_interval'].apply(lambda x: x.days) 是将data_merge['date_interval']的时间间隔转换为数值型计算对象，这里使用了apply方法。


```python
data_merge['date_interval'] = data_merge['max_year_date']-data_merge['提交日期']
data_merge['year'] = data_merge['提交日期'].dt.year
# 转换日期间隔为数字
data_merge['date_interval'] = data_merge['date_interval'].apply(lambda x: x.days)
data_merge.head()
```

<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>会员ID</th>
      <th>订单号</th>
      <th>提交日期</th>
      <th>订单金额</th>
      <th>max_year_date</th>
      <th>date_interval</th>
      <th>year</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>15278002468</td>
      <td>3000304681</td>
      <td>2015-01-01</td>
      <td>499.0</td>
      <td>2015-12-31</td>
      <td>364</td>
      <td>2015</td>
    </tr>
    <tr>
      <th>1</th>
      <td>39236378972</td>
      <td>3000305791</td>
      <td>2015-01-01</td>
      <td>2588.0</td>
      <td>2015-12-31</td>
      <td>364</td>
      <td>2015</td>
    </tr>
    <tr>
      <th>2</th>
      <td>38722039578</td>
      <td>3000641787</td>
      <td>2015-01-01</td>
      <td>498.0</td>
      <td>2015-12-31</td>
      <td>364</td>
      <td>2015</td>
    </tr>
    <tr>
      <th>3</th>
      <td>11049640063</td>
      <td>3000798913</td>
      <td>2015-01-01</td>
      <td>1572.0</td>
      <td>2015-12-31</td>
      <td>364</td>
      <td>2015</td>
    </tr>
    <tr>
      <th>4</th>
      <td>35038752292</td>
      <td>3000821546</td>
      <td>2015-01-01</td>
      <td>10.1</td>
      <td>2015-12-31</td>
      <td>364</td>
      <td>2015</td>
    </tr>
  </tbody>
</table>

- 基本添加了时间间隔以及年份字段之后， 我们就可以计算r, f,m的原始数据了


```python
# 按会员ID做汇总
rfm_gb = data_merge.groupby(['year','会员ID'],as_index=False).agg(
    {'date_interval': 'min',  # 计算最近一次订单时间
     '提交日期': 'count', # 计算订单频率
     '订单金额': 'sum'})  # 计算订单总金额
# 重命名列名
rfm_gb.columns =  ['year','会员ID','r','f','m']
rfm_gb.head()
```

<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>year</th>
      <th>会员ID</th>
      <th>r</th>
      <th>f</th>
      <th>m</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>2015</td>
      <td>267</td>
      <td>197</td>
      <td>2</td>
      <td>105.0</td>
    </tr>
    <tr>
      <th>1</th>
      <td>2015</td>
      <td>282</td>
      <td>251</td>
      <td>1</td>
      <td>29.7</td>
    </tr>
    <tr>
      <th>2</th>
      <td>2015</td>
      <td>283</td>
      <td>340</td>
      <td>1</td>
      <td>5398.0</td>
    </tr>
    <tr>
      <th>3</th>
      <td>2015</td>
      <td>343</td>
      <td>300</td>
      <td>1</td>
      <td>118.0</td>
    </tr>
    <tr>
      <th>4</th>
      <td>2015</td>
      <td>525</td>
      <td>37</td>
      <td>3</td>
      <td>213.0</td>
    </tr>
  </tbody>
</table>

- 上面代码框中的第一行代码，是基于年份和会员ID，分别做RFM原始值的聚合计算
- 这里使用groupby，对year和会员ID进行分组，设置as_index=False意味着year和会员ID不作为index列，而是作为结果列。后面使用agg方法实现了对date_interval、提交日期、订单金额三列分别以min、count、sum做聚合计算

#### 3.2.5 RFM区间划分并保存RFM标签

- 在做RFM划分时，基本逻辑是分别对R、F、M做离散化操作，然后再计算RFM。
- 在做RFM划分之前，先看下数据的基本分布状态


```python
# 查看数据分布
desc_pd = rfm_gb.iloc[:,2:].describe().T
desc_pd
```

<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>count</th>
      <th>mean</th>
      <th>std</th>
      <th>min</th>
      <th>25%</th>
      <th>50%</th>
      <th>75%</th>
      <th>max</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>r</th>
      <td>148591.0</td>
      <td>165.524043</td>
      <td>101.988472</td>
      <td>0.0</td>
      <td>79.0</td>
      <td>156.0</td>
      <td>255.0</td>
      <td>365.0</td>
    </tr>
    <tr>
      <th>f</th>
      <td>148591.0</td>
      <td>1.365002</td>
      <td>2.626953</td>
      <td>1.0</td>
      <td>1.0</td>
      <td>1.0</td>
      <td>1.0</td>
      <td>130.0</td>
    </tr>
    <tr>
      <th>m</th>
      <td>148591.0</td>
      <td>1323.741329</td>
      <td>3753.906883</td>
      <td>1.5</td>
      <td>69.0</td>
      <td>189.0</td>
      <td>1199.0</td>
      <td>206251.8</td>
    </tr>
  </tbody>
</table>

- 从describe结果看出
  - 汇总后的数据总共有14万条
  - r和m的数据分布相对较为离散，表现在min、25%、50%、75%和max的数据没有特别集中
  - 而从f（购买频率）则可以看出，大部分用户的分布都趋近于1，表现是从min到75%的分段值都是1且mean（均值）才为1.365
  - 计划选择25%和75%作为区间划分的2个边界值
- f的分布情况说明
  - r和m本身能较好地区分用户特征，而f则无法区分（大量的用户只有1个订单）
  - 行业属性（家电）原因，1年购买1次比较普遍（其中包含新客户以及老客户在当年的第1次购买）
  - 与业务部门沟通，划分时可以使用2和5来作为边界
    - 业务部门认为当年购买>=2次可被定义为复购用户（而非累计订单的数量计算复购用户）
    - 业务部门认为普通用户购买5次已经是非常高的次数，超过该次数就属于非常高价值用户群体
    - 该值是基于业务经验和日常数据报表获得的
- 区间边界的基本原则如下
  - 中间2个边界值：r和m是分别通过25%和75%的值获取的，f是业务与数据部门定义的。
  - 最小值边界：比各个维度的最小值小即可。
  - 最大值边界：大于等于各个维度的最大值即可
  - 最小值边界为什么要小于各个维度的最小值: 
    - 这是由于在边界上的数据归属有一个基本准则，要么属于区间左侧，要么属于区间右侧。如，f_bins中的2处于边界上，要么属于左侧区间，要么属于右侧区间
    - 在后续使用pd.cut方法中，对于自定义边界实行的是左开右闭的原则，即数据属于右侧区间，f_bins中的2就属于右侧区间。最左侧的值是无法划分为任何区间的，因此，在定义最小值时，一定要将最小值的边界值
    - 举例：[1，2，3，4，5]，假如数据划分的区间边界是[1，3，5]，即划分为2份
      - 其中的2/3被划分到(1，3]区间中
      - 3/4/5被划分到(3，5]区间中
      - 1无法划分到任何一个正常区间内


```python
# 定义区间边界
r_bins = [-1,79,255,365] # 注意起始边界小于最小值
f_bins = [0,2,5,130] 
m_bins = [0,69,1199,206252]
```

- RFM 划分计算


```python
# RFM分箱得分,也可以使用apply方法
rfm_gb['r_score'] = pd.cut(rfm_gb['r'], r_bins, labels=[i for i in range(len(r_bins)-1,0,-1)])  # 计算R得分
rfm_gb['f_score'] = pd.cut(rfm_gb['f'], f_bins, labels=[i+1 for i in range(len(f_bins)-1)])  # 计算F得分
rfm_gb['m_score'] = pd.cut(rfm_gb['m'], m_bins, labels=[i+1 for i in range(len(m_bins)-1)])  # 计算M得分
```

- 每个rfm的过程使用了pd.cut方法，基于自定义的边界区间做划分
- labels用来显示每个离散化后的具体值。F和M的规则是值越大，等级越高
- 而R的规则是值越小，等级越高，因此labels的规则与F和M相反
- 在labels指定时需要注意，4个区间的结果是划分为3份


```python
rfm_gb
```

<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>year</th>
      <th>会员ID</th>
      <th>r</th>
      <th>f</th>
      <th>m</th>
      <th>r_score</th>
      <th>f_score</th>
      <th>m_score</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>2015</td>
      <td>267</td>
      <td>197</td>
      <td>2</td>
      <td>105.0</td>
      <td>2</td>
      <td>1</td>
      <td>2</td>
    </tr>
    <tr>
      <th>1</th>
      <td>2015</td>
      <td>282</td>
      <td>251</td>
      <td>1</td>
      <td>29.7</td>
      <td>2</td>
      <td>1</td>
      <td>1</td>
    </tr>
    <tr>
      <th>2</th>
      <td>2015</td>
      <td>283</td>
      <td>340</td>
      <td>1</td>
      <td>5398.0</td>
      <td>1</td>
      <td>1</td>
      <td>3</td>
    </tr>
    <tr>
      <th>3</th>
      <td>2015</td>
      <td>343</td>
      <td>300</td>
      <td>1</td>
      <td>118.0</td>
      <td>1</td>
      <td>1</td>
      <td>2</td>
    </tr>
    <tr>
      <th>4</th>
      <td>2015</td>
      <td>525</td>
      <td>37</td>
      <td>3</td>
      <td>213.0</td>
      <td>3</td>
      <td>2</td>
      <td>2</td>
    </tr>
    <tr>
      <th>...</th>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
    </tr>
    <tr>
      <th>148586</th>
      <td>2018</td>
      <td>39538034299</td>
      <td>272</td>
      <td>1</td>
      <td>49.0</td>
      <td>1</td>
      <td>1</td>
      <td>1</td>
    </tr>
    <tr>
      <th>148587</th>
      <td>2018</td>
      <td>39538034662</td>
      <td>189</td>
      <td>1</td>
      <td>3558.0</td>
      <td>2</td>
      <td>1</td>
      <td>3</td>
    </tr>
    <tr>
      <th>148588</th>
      <td>2018</td>
      <td>39538035729</td>
      <td>179</td>
      <td>1</td>
      <td>3699.0</td>
      <td>2</td>
      <td>1</td>
      <td>3</td>
    </tr>
    <tr>
      <th>148589</th>
      <td>2018</td>
      <td>39545237824</td>
      <td>275</td>
      <td>1</td>
      <td>49.0</td>
      <td>1</td>
      <td>1</td>
      <td>1</td>
    </tr>
    <tr>
      <th>148590</th>
      <td>2018</td>
      <td>39546136285</td>
      <td>163</td>
      <td>1</td>
      <td>19.9</td>
      <td>2</td>
      <td>1</td>
      <td>1</td>
    </tr>
  </tbody>
</table>
<p>148591 rows × 8 columns</p>

- 将rfm值合并得到rfm标签


```python
#计算RFM组合
rfm_gb['r_score'] = rfm_gb['r_score'].astype(str)
rfm_gb['f_score'] = rfm_gb['f_score'].astype(str)
rfm_gb['m_score'] = rfm_gb['m_score'].astype(str)
rfm_gb['rfm_group'] = rfm_gb['r_score'].str.cat(rfm_gb['f_score']).str.cat(rfm_gb['m_score'])
```

- 将3列作为字符串组合为新的分组

  - 代码中，先针对3列使用astype方法将数值型转换为字符串型
  - 然后使用pandas的字符串处理库str中的cat方法做字符串合并，该方法可以将右侧的数据合并到左侧
  - 再连续使用两个str.cat方法得到总的R、F、M字符串组合

- Series.str.cat(others=None, sep=None, na_rep=None) 
  - 参数: 
  - others : 列表或复合列表,默认为None,如果为None则连接本身的元素 
  - sep : 字符串 或者None,默认为None 
  - na_rep : 字符串或者 None, 默认 None。如果为None缺失值将被忽略。 
  - 返回值: concat : 序列(Series)/索引(Index)/字符串(str)


```python
rfm_gb
```

<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>year</th>
      <th>会员ID</th>
      <th>r</th>
      <th>f</th>
      <th>m</th>
      <th>r_score</th>
      <th>f_score</th>
      <th>m_score</th>
      <th>rfm_group</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>2015</td>
      <td>267</td>
      <td>197</td>
      <td>2</td>
      <td>105.0</td>
      <td>2</td>
      <td>1</td>
      <td>2</td>
      <td>212</td>
    </tr>
    <tr>
      <th>1</th>
      <td>2015</td>
      <td>282</td>
      <td>251</td>
      <td>1</td>
      <td>29.7</td>
      <td>2</td>
      <td>1</td>
      <td>1</td>
      <td>211</td>
    </tr>
    <tr>
      <th>2</th>
      <td>2015</td>
      <td>283</td>
      <td>340</td>
      <td>1</td>
      <td>5398.0</td>
      <td>1</td>
      <td>1</td>
      <td>3</td>
      <td>113</td>
    </tr>
    <tr>
      <th>3</th>
      <td>2015</td>
      <td>343</td>
      <td>300</td>
      <td>1</td>
      <td>118.0</td>
      <td>1</td>
      <td>1</td>
      <td>2</td>
      <td>112</td>
    </tr>
    <tr>
      <th>4</th>
      <td>2015</td>
      <td>525</td>
      <td>37</td>
      <td>3</td>
      <td>213.0</td>
      <td>3</td>
      <td>2</td>
      <td>2</td>
      <td>322</td>
    </tr>
    <tr>
      <th>...</th>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
    </tr>
    <tr>
      <th>148586</th>
      <td>2018</td>
      <td>39538034299</td>
      <td>272</td>
      <td>1</td>
      <td>49.0</td>
      <td>1</td>
      <td>1</td>
      <td>1</td>
      <td>111</td>
    </tr>
    <tr>
      <th>148587</th>
      <td>2018</td>
      <td>39538034662</td>
      <td>189</td>
      <td>1</td>
      <td>3558.0</td>
      <td>2</td>
      <td>1</td>
      <td>3</td>
      <td>213</td>
    </tr>
    <tr>
      <th>148588</th>
      <td>2018</td>
      <td>39538035729</td>
      <td>179</td>
      <td>1</td>
      <td>3699.0</td>
      <td>2</td>
      <td>1</td>
      <td>3</td>
      <td>213</td>
    </tr>
    <tr>
      <th>148589</th>
      <td>2018</td>
      <td>39545237824</td>
      <td>275</td>
      <td>1</td>
      <td>49.0</td>
      <td>1</td>
      <td>1</td>
      <td>1</td>
      <td>111</td>
    </tr>
    <tr>
      <th>148590</th>
      <td>2018</td>
      <td>39546136285</td>
      <td>163</td>
      <td>1</td>
      <td>19.9</td>
      <td>2</td>
      <td>1</td>
      <td>1</td>
      <td>211</td>
    </tr>
  </tbody>
</table>
<p>148591 rows × 9 columns</p>

- 保存RFM结果到Excel


```python
rfm_gb.to_excel('sales_rfm_score1.xlsx')  # 保存数据为Excel
```

- 保存结果到数据库


```python
from sqlalchemy import create_engine
# 创建数据库引擎，传入uri规则的字符串
engine = create_engine('mysql+pymysql://root:root12345@127.0.0.1:3306/test?charset=utf8')
rfm_gb.to_sql('rfm',engine)
```

#### 3.2.6 RFM数据可视化


```python
# 图形数据汇总
display_data = rfm_gb.groupby(['rfm_group','year'],as_index=False)['会员ID'].count()
display_data.columns = ['rfm_group','year','number']
display_data['rfm_group'] = display_data['rfm_group'].astype(int)
display_data.head()
```

<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>rfm_group</th>
      <th>year</th>
      <th>number</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>111</td>
      <td>2015</td>
      <td>2180</td>
    </tr>
    <tr>
      <th>1</th>
      <td>111</td>
      <td>2016</td>
      <td>1498</td>
    </tr>
    <tr>
      <th>2</th>
      <td>111</td>
      <td>2017</td>
      <td>3169</td>
    </tr>
    <tr>
      <th>3</th>
      <td>111</td>
      <td>2018</td>
      <td>2271</td>
    </tr>
    <tr>
      <th>4</th>
      <td>112</td>
      <td>2015</td>
      <td>3811</td>
    </tr>
  </tbody>
</table>

```python
from pyecharts.charts import Bar3D
from pyecharts import options as opts
```


```python
from pyecharts.commons.utils import JsCode
range_color = ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf',
               '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
range_max = int(display_data['number'].max())
c = (
    Bar3D()#设置了一个3D柱形图对象
    .add(
        "",#标题
        [d.tolist() for d in display_data.values],#数据
        xaxis3d_opts=opts.Axis3DOpts( type_="category",name='分组名称'),#x轴数据类型，名称
        yaxis3d_opts=opts.Axis3DOpts( type_="category",name='年份'),#y轴数据类型，名称
        zaxis3d_opts=opts.Axis3DOpts(type_="value",name='会员数量'),#z轴数据类型，名称
        
    )
    .set_global_opts(#设置颜色，及不同取值对应的颜色
        visualmap_opts=opts.VisualMapOpts(max_=range_max,range_color=range_color),
        title_opts=opts.TitleOpts(title="RFM分组结果"))#设置标题 
    
)
c.render() 
```

## 4 内容小结

Seaborn绘图

- 蜂巢图/KDE图/箱线图/提琴图
- Seaborn api   sns.XXXplot(data,x='列名',y='列名', hue=)