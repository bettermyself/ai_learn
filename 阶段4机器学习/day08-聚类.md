## 1、聚类算法简介

### 1.1 聚类算法介绍

聚类算法是一种典型的**无监督学习算法**，主要用于将相似的样本自动归到一个类别中。

在聚类算法中，根据样本之间的**相似性**，将样本划分到不同的类别中。不同的相似度计算方法会产生不同的聚类结果，常用的相似度计算方法包括**欧式距离法**。

![image-20230907095150331](assets/day08/image-20230907095150331.png)



### 1.2 聚类算法在现实中的应用

- 用户画像，广告推荐，Data Segmentation，搜索引擎的流量推荐，恶意流量识别
- 基于位置信息的商业推送，新闻聚类，筛选排序
- 图像分割，降维，识别；离群点检测；信用卡异常消费；发掘相同功能的基因片段

![image-20230907095330384](assets/day08/image-20230907095330384.png)



### 1.3 分类

聚类算法可以按照不同的标准进行分类，主要包括以下两种方式：

#### **1. 根据聚类颗粒度分类**

- **细聚类**：将数据划分为更细致、更具体的类别，适用于需要高精度的场景。
- **粗聚类**：将数据划分为较宽泛的类别，适用于快速分析或初步分类的场景。

![image-20250703172143485](assets\image-20250703172143485.png)



#### **2. 根据实现方法分类**

- **K-means**：
  - 基于质心（Centroid）的聚类方法，通过迭代优化质心位置进行分类。
  - 特点：简单、通用，适用于大多数常规数据集。
- **层次聚类**：
  - 通过逐层划分（自上而下或自下而上）构建树状聚类结构，直到满足类别数量要求。
  - 特点：无需预设类别数，但计算复杂度较高。
- **DBSCAN（基于密度的聚类）**：
  - 通过样本分布的紧密程度划分类别，能够发现任意形状的簇并识别噪声点。
  - 特点：适合非球形分布数据，对噪声鲁棒性强。
- **谱聚类**：
  - 基于图论，利用数据相似度矩阵的特征向量进行降维和聚类。
  - 特点：适合处理复杂结构数据，但对相似度矩阵构建敏感。



## 2、聚类API的初步使用

### 2.1 api介绍

- sklearn.cluster.KMeans(n_clusters=8)
  - 参数:
    - n_clusters:开始的聚类中心数量
      - 整型，缺省值=8，生成的聚类数，即产生的质心（centroids）数。
  - 方法:
    - estimator.fit(x)
    - estimator.predict(x)
    - estimator.fit_predict(x)
      - 计算聚类中心并预测每个样本属于哪个类别,相当于先调用fit(x),然后再调用predict(x)

###  2.2 案例

随机创建不同二维数据集作为训练集，并结合k-means算法将其聚类，你可以尝试分别聚类不同数量的簇，并观察聚类效果：

<img src="assets/day08/image-20230907102501138.png" alt="image-20230907102501138" style="zoom:50%;" />

1.创建数据集

```python
import matplotlib.pyplot as plt
from sklearn.datasets.samples_generator import make_blobs
from sklearn.cluster import KMeans
from sklearn.metrics import calinski_harabaz_score

# 创建数据集
# X为样本特征，Y为样本簇类别， 共1000个样本，每个样本2个特征，共4个簇，
# 簇中心在[-1,-1], [0,0],[1,1], [2,2]， 簇方差分别为[0.4, 0.2, 0.2, 0.2]
X, y = make_blobs(n_samples=1000, n_features=2, centers=[[-1, -1], [0, 0], [1, 1], [2, 2]],
                  cluster_std=[0.4, 0.2, 0.2, 0.2],
                  random_state=9)

# 数据集可视化
plt.scatter(X[:, 0], X[:, 1], marker='o')
plt.show()
```

2.使用k-means进行聚类,并使用CH方法评估

```python
y_pred = KMeans(n_clusters=2, random_state=9).fit_predict(X)
# 分别尝试n_cluses=2\3\4,然后查看聚类效果
plt.scatter(X[:, 0], X[:, 1], c=y_pred)
plt.show()

# 用Calinski-Harabasz Index评估的聚类分数
print(calinski_harabasz_score(X, y_pred))
```



## 3、Kmeans算法流程

### 3.1 k-means聚类流程

1、随机设置K个特征空间内的点作为初始的聚类中心

2、对于其他每个点计算到K个中心的距离，未知的点选择最近的一个聚类中心点作为标记类别

3、接着对着标记的聚类中心之后，重新计算出每个聚类的新中心点（平均值）

4、如果计算得出的新中心点与原中心点一样（质心不再移动），那么结束，否则重新进行第二步过程

通过下图解释实现流程：

<img src="assets/day08/image-20230907103735327.png" alt="image-20230907103735327" style="zoom:50%;" />

k-means聚类动态效果图：

<img src="assets/day08/image-20230907103801026.png" alt="image-20230907103801026" style="zoom: 67%;" />

### 3.2 案例练习

- 案例：

<img src="assets/day08/image-20230907103836985.png" alt="image-20230907103836985" style="zoom: 67%;" />

1、随机设置K个特征空间内的点作为初始的聚类中心（本案例中设置p1和p2）

<img src="assets/day08/image-20230907103854967.png" alt="image-20230907103854967" style="zoom: 67%;" />

2、对于其他每个点计算到K个中心的距离，未知的点选择最近的一个聚类中心点作为标记类别

<img src="assets/day08/image-20230907104250565.png" alt="image-20230907104250565" style="zoom: 67%;" />

<img src="assets/day08/image-20230907104255878.png" alt="image-20230907104255878" style="zoom:50%;" />

3、接着对着标记的聚类中心之后，重新计算出每个聚类的新中心点（平均值）

<img src="assets/day08/image-20230907104345786.png" alt="image-20230907104345786" style="zoom:67%;" />

注意：这里P2′=(2.3,3.3)，下同。

4、如果计算得出的新中心点与原中心点一样（质心不再移动），那么结束，否则重新进行第二步过程

<img src="assets/day08/image-20230907104603930.png" alt="image-20230907104603930" style="zoom:67%;" />

<img src="assets/day08/image-20230907104612455.png" alt="image-20230907104612455" style="zoom:67%;" />

5、当每次迭代结果不变时，认为算法收敛，聚类完成，**K-Means一定会停下，不可能陷入一直选质心的过程。**

<img src="assets/day08/image-20230907104715886.png" alt="image-20230907104715886" style="zoom:67%;" />



## 4、评价指标


### 4.1 SSE-误差平方和

<img src="assets/day08/image-20230907110141764.png" alt="image-20230907110141764" style="zoom:67%;" />

1. K 表示聚类中心的个数

2. C<sub>i</sub> 表示簇

3. p 表示样本

4. m<sub>i</sub> 表示簇的质心

   <img src="assets/day08/image-20230907110135000.png" alt="image-20230907110135000" style="zoom:67%;" />

SSE 越小，表示数据点越接近它们的中心，聚类效果越好。

### 4.2 SC 系数

结合了聚类的凝聚度（Cohesion）和分离度（Separation），用于评估聚类的效果。

<img src="assets/day08/image-20230907111546495.png" alt="image-20230907111546495" style="zoom: 33%;" />

其计算过程如下：

1. 计算每一个样本 i 到同簇内其他样本的平均距离 a<sub>i</sub>，该值越小，说明簇内的相似程度越大
2. 计算每一个样本 i 到最近簇 j 内的所有样本的平均距离 b<sub>ij</sub>，该值越大，说明该样本越不属于其他簇 j
3. 计算所有样本的平均轮廓系数
4. 轮廓系数的范围为：[-1, 1]，值越大聚类效果越好

###   4.3 肘部法

肘部法可以用来确定 K 值.

- 对于n个点的数据集，迭代计算 k from 1 to n，每次聚类完成后计算 SSE 

- SSE 是会逐渐变小的，因为每个点都是它所在的簇中心本身。

- SSE 变化过程中会出现一个拐点，下降率突然变缓时即认为是最佳 n_clusters 值。

- 在决定什么时候停止训练时，肘形判据同样有效，数据通常有更多的噪音，在增加分类无法带来更多回报时，我们停止增加类别。

<img src="assets/day08/image-20230907113314803.png" alt="image-20230907113314803" style="zoom:50%;" />



### 4.4 CH 系数

CH 系数结合了聚类的凝聚度（Cohesion）和分离度（Separation）、质心的个数，希望用最少的簇进行聚类。

<img src="assets/day08/image-20230907111524608.png" alt="image-20230907111524608" style="zoom:50%;" />

SSW 的含义：

1. C<sub>pi</sub> 表示质心
2. x<sub>i</sub> 表示某个样本
3. SSW 值是计算每个样本点到质心的距离，并累加起来
4. SSW 表示表示簇内的内聚程度，越小越好
5. m 表示样本数量
6. k 表示质心个数

SSB 的含义：

1. C<sub>j</sub> 表示质心，X 表示质心与质心之间的中心点，n<sub>j</sub> 表示样本的个数
2. SSB 表示簇与簇之间的分离度，SSB 越大越好

### 4.5 聚类评估的使用

```python
from sklearn.datasets import make_blobs
from sklearn.cluster import KMeans
import matplotlib.pyplot as plt
from sklearn.metrics import silhouette_score
from sklearn.metrics import calinski_harabasz_score


if __name__ == '__main__':
    x, y = make_blobs(n_samples=1000,
                      n_features=2,
                      centers=[[-1, -1], [0, 0], [1, 1], [2, 2]],
                      cluster_std=[0.4, 0.2, 0.2, 0.2],
                      random_state=9)

    plt.figure(figsize=(18, 8), dpi=80)
    plt.scatter(x[:, 0], x[:, 1], c=y)
    plt.show()

    estimator = KMeans(n_clusters=4, random_state=0)
    estimator.fit(x)
    y_pred = estimator.predict(x)

    # 1. 计算 SSE 值
    print('SSE:', estimator.inertia_)

    # 2. 计算 SC 系数
    print('SC:', silhouette_score(x, y_pred))

    # 3. 计算 CH 系数
    print('CH:', calinski_harabasz_score(x, y_pred))
```



## 案例

### 案例介绍

已知：客户性别、年龄、年收入、消费指数

需求：对客户进行分析，找到业务突破口，寻找黄金客户

<img src="assets/day08/image-20230907112055346.png" alt="image-20230907112055346" style="zoom:50%;" />

数据集共包含顾客的数据, 数据共有 4 个特征, 数据共有 200 条。接下来，使用聚类算法对具有相似特征的的顾客进行聚类，并可视化聚类结果。

### 案例实现

```python
import matplotlib.colors
import matplotlib.pyplot as plt
from sklearn.cluster import KMeans
import pandas as pd
from sklearn.manifold import TSNE
from sklearn.preprocessing import StandardScaler


pd.set_option('display.max_columns', None)
pd.set_option('display.max_rows', None)
pd.set_option('display.width', 1000)


if __name__ == '__main__':

    # 1. 读取顾客数据
    data = pd.read_csv('data/customers.csv')
    data.columns = ['CustomerID', 'Gender', 'Age', 'Annual Income', 'Spending Score']
    # print(data.head())

    # 2. 对 Gender 特征进行独热编码
    data = pd.get_dummies(data, columns=['Gender'])
    # print(data.head())

    # 3. 数据标准化
    scaler = StandardScaler()
    data = scaler.fit_transform(data)
    print(data)

    # 4. 去除非 ID 列进行聚类分析
    data = data[:, 1:]
    # print(data[:5])

    # 5. 肘部法寻找质心个数
    sse = []
    for k in range(1, 20):
        estimator = KMeans(n_clusters=k, random_state=0)
        estimator.fit(data)
        sse.append(estimator.inertia_)

    plt.plot(range(1, 20), sse)
    plt.show()

    # 6. 确定质心的个数
    estimator = KMeans(n_clusters=10, n_init=10, random_state=0)
    y_pred = estimator.fit_predict(data)

    # 7. 聚类结果可视化
    plt.scatter(X.values[y_kmeans == 0, 0], X.values[y_kmeans == 0, 1], s=100, c='red', label='Standard')    		
    plt.scatter(X.values[y_kmeans == 1, 0], X.values[y_kmeans == 1, 1], s=100, c='blue', label='Traditional')  
    plt.scatter(X.values[y_kmeans == 2, 0], X.values[y_kmeans == 2, 1], s=100, c='green', label='Normal')  
    plt.scatter(X.values[y_kmeans == 3, 0], X.values[y_kmeans == 3, 1], s=100, c='cyan', label='Youth')
    plt.scatter(X.values[y_kmeans == 4, 0], X.values[y_kmeans == 4, 1], s=100, c='magenta', label='TA')
    plt.scatter(mykeans.cluster_centers_[:, 0], mykeans.cluster_centers_[:, 1], s=300, c='black', label='Centroids’)
    
    plt.title('Clusters of customers')
    plt.xlabel('Annual Income (k$)')
    plt.ylabel('Spending Score (1-100)')   
    plt.legend() 
    plt.show()
```

## 作业

1.使用思维导图总结聚类算法部分的内容



2.动手实现课程中的代码



## 课堂笔记

![image-20240806182538976](assets/day08/image-20240806182538976.png)

