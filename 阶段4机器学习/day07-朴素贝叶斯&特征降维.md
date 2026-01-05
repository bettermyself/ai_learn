## 1、朴素贝叶斯

### 1.1 朴素贝叶斯介绍

####  1.1.1 常见的概率公式

| 样本数 | 职业   | 体型 | 是否喜欢 |
| ------ | ------ | ---- | -------- |
| 1      | 程序员 | 超重 | 不喜欢   |
| 2      | 产品   | 匀称 | 喜欢     |
| 3      | 程序员 | 匀称 | 喜欢     |
| 4      | 程序员 | 超重 | 喜欢     |
| 5      | 美工   | 匀称 | 不喜欢   |
| 6      | 美工   | 超重 | 不喜欢   |
| 7      | 产品   | 匀称 | 喜欢     |

**条件概率：**  表示事件$A$在另外一个事件$B$已经发生条件下的发生概率，记为$P(A|B)$。

> **示例：** 在女神喜欢的条件下，职业是程序员的概率？  
>
> - 女神喜欢条件下，有样本2、3、4、7共4个  
> - 其中职业为程序员的样本有3、4共2个  
> - 则 $P(\text{程序员}|\text{喜欢}) = \frac{2}{4} = 0.5$  



**联合概率：**  表示多个条件同时成立的概率，记为$P(AB) = P(A) P(B|A)$。  特征条件独立性假设下：$P(AB) = P(A) P(B)$。

> **示例：** 职业是程序员并且体型匀称的概率？  
> 1. 数据集中共有7个样本  
> 2. 职业是程序员的样本有1、3、4共3个，概率为$\frac{3}{7}$  
> 3. 在职业为程序员的样本中，体型匀称的样本有3共1个，概率为$\frac{1}{3}$  
> 4. 则联合概率为$\frac{3}{7} \times \frac{1}{3} = \frac{1}{7}$  



**联合概率 + 条件概率：**  计算$P(AB|C) = P(A|C) P(B|AC)$。

> **示例：** 在女神喜欢的条件下，职业是程序员、体重超重的概率？  
> 1. 女神喜欢条件下，有样本2、3、4、7共4个  
> 2. 其中职业为程序员的样本有3、4共2个，概率为$\frac{2}{4}=0.5$  
> 3. 在这2个样本中，体型超重的样本有4共1个，概率为$\frac{1}{2}=0.5$  
> 4. 则 $P(\text{程序员}, \text{超重}|\text{喜欢}) = 0.5 \times 0.5 = 0.25$  



**简言之：**  

- **条件概率**：在限定条件下某事件发生的概率，记为$P(B|A)$。  
- **联合概率**：多个事件同时发生的概率，记为$P(AB) = P(B) \times P(A|B)$。



#### 1.1.2 贝叶斯公式

$$
P(C | W) = \frac{P(W | C)P(C)}{P(W)}=\frac{P(C \cap W)}{P(W)}
$$

- $P(C)$ 表示 $C$ 出现的概率  
- $P(W|C)$ 表示 $C$ 条件下 $W$ 出现的概率  
- $P(W)$ 表示 $W$ 出现的概率  



**示例计算**

| 编号 | 职业   | 体型 | 喜欢的概率？ |
| ---- | ------ | ---- | ------------ |
| 1    | 程序员 | 超重 | ?            |

- 目标：计算 $P(\text{喜欢} \mid \text{程序员}, \text{超重})$  
- 分解：  
   - $P(W \mid C) = P(\text{程序员}, \text{超重} \mid \text{喜欢})$  
   - $P(C) = P(\text{喜欢})$  
   - $P(W) = P(\text{程序员}, \text{超重})$  



**计算步骤**

- **先验概率** $P(\text{喜欢})$：  $$\frac{4}{7} \quad (\text{样本2,3,4,7共4个喜欢})$$

- **条件概率** $P(\text{程序员}, \text{超重} \mid \text{喜欢})$：  $$\frac{1}{4} \quad (\text{喜欢样本中，编号4满足条件})$$  。调整先验概率：  $$P(\text{程序员}, \text{超重} \mid \text{喜欢}) \times P(\text{喜欢}) = \frac{1}{4} \times \frac{4}{7} = \frac{1}{7}$$

- **联合概率** $P(\text{程序员}, \text{超重})$：  $$P(\text{程序员}) \times P(\text{超重} \mid \text{程序员}) = \frac{3}{7} \times \frac{2}{3} = \frac{2}{7}$$  （程序员样本3个，其中超重2个）

- **后验概率** $P(\text{喜欢} \mid \text{程序员}, \text{超重})$：  $$\frac{\frac{1}{7}}{\frac{2}{7}} = 0.5$$



**结论**

对于“职业=程序员，体型=超重”的样本，被分类为“喜欢”的概率为 **50%**。



#### 1.1.3 朴素贝叶斯

朴素贝叶斯在贝叶斯定理的基础上引入**特征条件独立假设**，即假设特征之间相互独立。这一假设显著简化了联合概率的计算：

- **条件联合概率**的简化：  
   $$
   P(\text{程序员}, \text{超重} \mid \text{喜欢}) = P(\text{程序员} \mid \text{喜欢}) \times P(\text{超重} \mid \text{喜欢})
   $$

- **联合概率**的简化：  
   $$
   P(\text{程序员}, \text{超重}) = P(\text{程序员}) \times P(\text{超重})
   $$

#### 1.1.4 拉普拉斯平滑系数
为解决训练样本不足导致的概率为0的问题，引入拉普拉斯平滑：

$$
P(F_1 \mid C) = \frac{N_t + \alpha}{N + \alpha m}
$$

- $\alpha$：拉普拉斯平滑系数，一般指定为 1
- $N_t$：$F_1$ 中符合条件 $C$ 的样本数量
- $N$：在条件 $C$ 下所有样本的总数  
- $m$：**所有独立样本**的总数

**作用**：通过在分子和分母添加平滑项，避免零概率问题，提升模型鲁棒性。



**示例说明**  

若某特征在训练集中未出现（如“职业=设计师”），传统计算会得$P(\text{设计师} \mid \text{喜欢})=0$，但平滑后：  
$$
P(\text{设计师} \mid \text{喜欢}) = \frac{0 + 1}{4 + 1 \times 3} = \frac{1}{7} \quad (\text{假设}m=3)
$$



### 1.2 情感分析

#### 1.2.1 api介绍

```python
from sklearn.naive_bayes import MultinomialNB
# 初始化朴素贝叶斯分类器
model = MultinomialNB(alpha=1.0)  # alpha为拉普拉斯平滑系数
```



#### 1.2.2 商品评论情感分析

已知商品评论数据，根据数据进行情感分类（好评、差评)

| 编号 | 内容                                                 | 评价 |
| :--- | :--------------------------------------------------- | :--- |
| 0    | 从编程小白的角度看，入门极佳。                       | 好评 |
| 1    | 很好的入门书，简洁全面，适合小白。                   | 好评 |
| 2    | 讲解全面，许多小细节都有顾及，三个小项目受益匪浅。   | 好评 |
| 3    | 前半部分讲概念深入浅出，要言不烦，很赞               | 好评 |
| 4    | 看了一遍还是不会写，有个概念而已                     | 差评 |
| 5    | 中规中矩的教科书，零基础的看了依旧看不懂             | 差评 |
| 6    | 内容太浅显，个人认为不适合有其它语言编程基础的人     | 差评 |
| 7    | 破书一本                                             | 差评 |
| 8    | 适合完完全全的小白读，有其他语言经验的可以去看别的书 | 差评 |
| 9    | 基础知识写的挺好的！                                 | 好评 |
| 10   | 太基础                                               | 差评 |
| 11   | 略_嗦。。适合完全没有编程经验的小白                  | 差评 |
| 12   | 真的真的不建议买                                     | 差评 |



**步骤分析**

- 获取数据
- 数据基本处理
  - 取出内容列，对数据进行分析
  - 判定评判标准
  - 选择停用词
  - 把内容处理，转化成标准格式
  - 统计词的个数
  - 准备训练集和测试集
- 模型训练
- 模型评估

​	

**代码实现**

```python
import pandas as pd
import numpy as np
import jieba
import matplotlib.pyplot as plt
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
```

- 获取数据

```python
# 加载数据
data = pd.read_csv("./data/书籍评价.csv", encoding="gbk")
data
```

- 2）数据基本处理

```python
# 2.1） 取出内容列，对数据进行分析
content = data["内容"]
content.head()

# 2.2） 判定评判标准 -- 1好评;0差评
data.loc[data.loc[:, '评价'] == "好评", "评论标号"] = 1  # 把好评修改为1
data.loc[data.loc[:, '评价'] == '差评', '评论标号'] = 0

good_or_bad = data['评价'].values  # 获取数据
print(good_or_bad)
# ['好评' '好评' '好评' '好评' '差评' '差评' '差评' '差评' '差评' '好评' '差评' '差评' '差评']

# 2.3） 选择停用词
# 加载停用词
stopwords=[]
with open('./data/stopwords.txt','r',encoding='utf-8') as f:
    lines=f.readlines()
    print(lines)
    for tmp in lines:
        line=tmp.strip()
        print(line)
        stopwords.append(line)
# stopwords  # 查看新产生列表

#对停用词表进行去重
stopwords=list(set(stopwords))#去重  列表形式
print(stopwords)

# 2.4） 把“内容”处理，转化成标准格式
comment_list = []
for tmp in content:
    print(tmp)
    # 对文本数据进行切割
    # cut_all 参数默认为 False,所有使用 cut 方法时默认为精确模式
    seg_list = jieba.cut(tmp, cut_all=False)
    print(seg_list)  # <generator object Tokenizer.cut at 0x0000000007CF7DB0>
    seg_str = ','.join(seg_list)  # 拼接字符串
    print(seg_str)
    comment_list.append(seg_str)  # 目的是转化成列表形式
# print(comment_list)  # 查看comment_list列表。

# 2.5） 统计词的个数
# 进行统计词个数
# 实例化对象
# CountVectorizer 类会将文本中的词语转换为词频矩阵
#stop_words=stopwords 这个参数的作用是让 CountVectorizer 在分词统计时自动过滤掉 stopwords 列表中的停用词（如“的”、“了”、“和”等无实际意义的词），从而只统计有意义的词语，提高文本特征的质量
con = CountVectorizer(stop_words=stopwords)
# 进行词数统计
#x 是由 CountVectorizer 处理后的稀疏矩阵，表示每条评论中各词语（去除停用词后）出现的次数。它的每一行对应一条评论，每一列对应一个词，元素值为该词在该评论中出现的次数。类型为 scipy.sparse.csr_matrix，可用 x.toarray() 查看具体的词频数组。
X = con.fit_transform(comment_list)  # 它通过 fit_transform 函数计算各个词语出现的次数
name = con.get_feature_names_out()  # 通过 get_feature_names_out()可获取词袋中所有文本的关键字
print(X.toarray())  # 通过 toarray()可看到词频矩阵的结果
print(name)

# 2.6）准备训练集和测试集
# 准备训练集   这里将文本前10行当做训练集  后3行当做测试集
x_train = X.toarray()[:10, :]
y_train = good_or_bad[:10]
# 准备测试集
x_text = X.toarray()[10:, :]
y_text = good_or_bad[10:]
```

- 3）模型训练

```python
# 构建贝叶斯算法分类器
mb = MultinomialNB(alpha=1)  # alpha 为可选项，默认 1.0，添加拉普拉修/Lidstone 平滑参数
# 训练数据
mb.fit(x_train, y_train)
# 预测数据
y_predict = mb.predict(x_text)
#预测值与真实值展示
print('预测值：',y_predict)
print('真实值：',y_text)
```

- 4）模型评估

```python
mb.score(x_text, y_text)
```



### 1.3 朴素贝叶斯预测规则

**实例演示：垃圾邮件分类**

假设特征：$X = (x_1 = \text{点击}, x_2 = \text{链接})$，类别 $y \in \{\text{垃圾邮件}, \text{正常邮件}\}$



**问题设定**

我们有一个二分类问题：
- **类别($y$)**：垃圾邮件($y=1$)或正常邮件($y=0$)
- **特征($X$)**：每个邮件有两个特征
  - $x_1$：是否包含"点击"这个词
  - $x_2$：是否包含"链接"这个词



**训练数据统计**：

| 概率项                       | 垃圾邮件 ($y=1$) | 正常邮件 ($y=0$) |
| ---------------------------- | ---------------- | ---------------- |
| 先验概率 $P(y)$              | 0.6              | 0.4              |
| $P(x_1 = \text{点击}\mid y)$ | 0.9              | 0.1              |
| $P(x_2 = \text{链接}\mid y)$ | 0.8              | 0.2              |

> 根据训练数据数据得出以上概率。



**分类过程**

根据贝叶斯定理：$$P(y \mid X) = P(y) \times P(X \mid y)$$

由于朴素贝叶斯的"朴素"假设(特征条件独立)：$$P(y \mid X) = P(y) \times P(x_1 \mid y) \times P(x_2 \mid y)$$



**计算后验概率**：

1. **对垃圾邮件 ($y=1$)**：  
   $$
   P(y=1|X) = P(y=1) \cdot P(x_1|y=1) \cdot P(x_2|y=1) = 0.6 \times 0.9 \times 0.8 = 0.432
   $$

2. **对正常邮件 ($y=0$)**：  
   $$
   P(y=0|X) = P(y=0) \cdot P(x_1|y=0) \cdot P(x_2|y=0) = 0.4 \times 0.1 \times 0.2 = 0.008
   $$

**预测结果**：  

$0.432 > 0.008 \quad \Rightarrow \quad \hat{y} = \text{垃圾邮件}$



## 2、特征降维

### 2.1 特征降维简介

用于训练的数据集特征对模型的性能有着极其重要的作用。如果训练数据中包含一些不重要的特征，可能导致模型的泛化性能不佳。例如：

- 某些特征的取值较为接近，其包含的信息较少。  
- 我们希望特征独立存在并对预测产生影响。具有相关性的特征可能并不会给模型带来更多的信息（但相关性并非完全无用）。



**降维**是指在某些限定条件下降低特征个数。接下来介绍几种特征降维的方法：  

- 低方差过滤法  
- 相关系数法  
- PCA（主成分分析）降维法  



### 2.2 低方差过滤法

定义：  
- 特征方差小：某个特征大多样本的值比较相近，即 $\text{Var}(X) \approx 0$。  
- 特征方差大：某个特征很多样本的值差别较大，即 $\text{Var}(X) \gg 0$。  



**低方差过滤法**通过删除方差低于设定阈值的特征来实现降维。  

```python
from sklearn.feature_selection import VarianceThreshold

# 初始化方差阈值选择器，默认 threshold=0.0（删除零方差特征）
selector = VarianceThreshold(threshold=0.0)  

# 拟合并转换数据，X 为 numpy array 格式 [n_samples, n_features]
X_filtered = selector.fit_transform(X)  
```

> 在数据集中，删除方差低于 threshold 的特征将被删除，默认值是保留所有非零方差特征，即删除所有样本中具有相同值的特征。



**示例：垃圾邮件分类数据降维**

```python
from sklearn.feature_selection import VarianceThreshold
import pandas as pd

# 1. 读取数据集
data = pd.read_csv('data/垃圾邮件分类数据.csv')
print("原始数据维度:", data.shape)  # 输出: (971, 25734)

# 2. 应用方差过滤（阈值=0.1）
transformer = VarianceThreshold(threshold=0.1)
data_filtered = transformer.fit_transform(data)
print("降维后数据维度:", data_filtered.shape)  # 输出: (971, 1044)
```

> 结果说明
>
> - 原始数据含 25,734 个特征，经低方差过滤后保留 1,044 个特征。
> - 阈值 `threshold=0.1` 删除了方差 < 0.1 的冗余特征，显著降低维度。



### 2.3 主成分分析（PCA）

<img src="assets/day07\16.png" style="zoom: 33%;" />

通过线性变换将高维数据投影到低维空间，保留最大方差的方向（主成分）。数学表示为：
$$
X_{\text{PCA}} = X \cdot W
$$
其中 $W$ 是特征向量矩阵，按特征值降序排列。

> PCA 通过对数据维数进行压缩，尽可能降低原数据的维数（复杂度），损失少量信息，在此过程中可能会舍弃原有数据、创造新的变量。

```python
from sklearn.decomposition import PCA
from sklearn.datasets import load_iris

# 1. 加载数据集
x, y = load_iris(return_X_y=True)
print(x[:5])

# [[5.1 3.5 1.4 0.2]
#  [4.9 3.  1.4 0.2]
#  [4.7 3.2 1.3 0.2]
#  [4.6 3.1 1.5 0.2]
#  [5.  3.6 1.4 0.2]]

# 2. 保留指定比例的信息
transformer = PCA(n_components=0.95)
x_pca = transformer.fit_transform(x)
print(x_pca[:5])
# [[-2.68412563  0.31939725]
#  [-2.71414169 -0.17700123]
#  [-2.88899057 -0.14494943]
#  [-2.74534286 -0.31829898]
#  [-2.72871654  0.32675451]]


# 3. 保留指定数量特征
transformer = PCA(n_components=2)
x_pca = transformer.fit_transform(x)
print(x_pca[:5])

# [[-2.68412563  0.31939725]
# [-2.71414169 -0.17700123]
# [-2.88899057 -0.14494943]
# [-2.74534286 -0.31829898]
# [-2.72871654  0.32675451]]
```



###  2.4 相关系数法

- 通过计算特征间的相关系数衡量其关系强度：
  - **皮尔逊相关系数**：衡量线性相关（$r \in [-1,1]$）
  - **斯皮尔曼相关系数**：衡量单调相关（$\rho \in [-1,1]$）



#### 2.4.1 皮尔逊相关系数
**公式**
$$
r = \frac{n\sum xy - (\sum x)(\sum y)}{\sqrt{n\sum x^2 - (\sum x)^2} \cdot \sqrt{n\sum y^2 - (\sum y)^2}}
$$


![image-20250703165409780](assets\image-20250703165409780-1751532857272-1.png)

计算：
$$
r = \frac{10 \times 16679.09 - 346.2 \times 422.5}{\sqrt{10 \times 14304.52 - 346.2^2} \sqrt{10 \times 19687.81 - 422.5^2}} = 0.994
$$

**结论**：$r \approx 0.99$（高度线性相关）



#### 2.4.2 斯皮尔曼相关系数
**公式**
$$
\rho = 1 - \frac{6 \sum d_i^2}{n(n^2 - 1)}
$$
（$d_i$ 为两变量秩次差）



上面的公式中， $d_i$为样本中不同特征在数据中排序的序号差值，计算举例如下所示

<img src="assets/day07\spm.png" />

计算：
$$
\rho = 1 - \frac{6 \times 25.5}{7 \times 48} \approx -0.23
$$

**结论**：$\rho \approx -0.23$（弱单调负相关）



**示例**

```python
import pandas as pd
from sklearn.feature_selection import VarianceThreshold
from scipy.stats import pearsonr
from scipy.stats import spearmanr
from sklearn.datasets import load_iris


# 1. 读取数据集(鸢尾花数据集)
data = load_iris()
data = pd.DataFrame(data.data, columns=data.feature_names)

# 2. 皮尔逊相关系数
corr = pearsonr(data['sepal length (cm)'], data['sepal width (cm)'])
print(corr, '皮尔逊相关系数:', corr[0], '不相关性概率:', corr[1])
# (-0.11756978413300204, 0.15189826071144918) 皮尔逊相关系数: -0.11756978413300204 不相关性概率: 0.15189826071144918

# 3. 斯皮尔曼相关系数
corr = spearmanr(data['sepal length (cm)'], data['sepal width (cm)'])
print(corr, '斯皮尔曼相关系数:', corr[0], '不相关性概率:', corr[1])
# SpearmanrResult(correlation=-0.166777658283235, pvalue=0.04136799424884587) 斯皮尔曼相关系数: -0.166777658283235 不相关性概率: 0.04136799424884587
```
