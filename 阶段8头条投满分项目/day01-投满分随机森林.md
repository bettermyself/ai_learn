## 1 项目背景

字节跳动拥有众多产品线，其中**抖音**与**今日头条**是最具代表性的两大核心产品：

- **抖音**：基于短视频的推荐系统，融合计算机视觉（CV）、推荐算法、大数据等技术。
- **今日头条**：基于短文本的推荐系统，是自然语言处理（NLP）、推荐系统、大数据等技术的集大成者。

在今日头条中，用户面对海量新闻与资讯内容，兴趣点存在显著差异：

- **男性用户**可能更偏好：历史、军事、足球等内容；
- **女性用户**可能更偏好：财经、八卦、美妆等内容。

👉 若能**自动识别用户兴趣类别**，并将相关新闻精准推荐，将显著提升：

- 点击量
- 订阅量
- 付费转化率

因此，在今日头条的推荐系统中，需内嵌一个子任务：

> **将短文本自动进行多分类，实现精准“投递”至对应频道。**

该子任务被命名为：**“投满分”**。

![image-20231106173055716](assets/image-20231106173055716.png)

## 2 数据集

### 2.1 数据集介绍

#### 2.1.1 数据来源分类

项目的数据来源可分为以下三大类：

| 类别                     | 子情况 | 描述                                 |
| :----------------------- | :----- | :----------------------------------- |
| **第一类：公司内部数据** | 情况1  | 数据平台已预处理，提供“成品数据”     |
|                          | 情况2  | 仅提供数据路径，需自行处理           |
|                          | 情况3  | 无原始数据，需跨部门沟通获取         |
| **第二类：甲方提供数据** | 情况1  | 提供预处理后的半成品数据             |
|                          | 情况2  | 仅提供“埋点”，后续处理由开发团队完成 |
|                          | 情况3  | 数据缺失或严重不足                   |
| **第三类：蓝图阶段**     | ——     | 无数据、无GPU，仅有需求展望          |

> ✅ **本项目数据属于第一类情况1**：已由字节跳动数据平台完成预处理与标注，开发者可直接使用。



#### 2.1.2 数据文件结构

数据路径：`02-data/data/`

| 文件名      | 类型     | 样本数     | 描述                   |
| :---------- | :------- | :--------- | :--------------------- |
| `train.txt` | 训练集   | 180,000 条 | 每行格式：`文本\t标签` |
| `dev.txt`   | 验证集   | 10,000 条  | 同上                   |
| `test.txt`  | 测试集   | 10,000 条  | 同上                   |
| `class.txt` | 类别标签 | 10 个      | 每行一个英文类别名     |



**数据样本示例**

📘 训练集（train.txt）

```properties
中华女子学院：本科层次仅1专业招男生	3
两天价网站背后重重迷雾：做个网站究竟要多少钱	4
卡佩罗：告诉你德国脚生猛的原因不希望英德战踢点球	7
82岁老太为学生做饭扫地44年获授港大荣誉院士	5
```

> 每行包含两列，以 `\t` 分隔：第一列为中文文本，第二列为对应的数字标签。



📙 测试集（test.txt）

```properties
词汇阅读是关键08年考研暑期英语复习全指南	3
中国人民公安大学2012年硕士研究生目录及书目	3
教育部回应“取消高考户籍限制”	3
```



📗 验证集（dev.txt）

```properties
体验2D巅峰倚天屠龙记十大创新概览	8
2岁男童爬窗台不慎7楼坠下获救（图）	5
《口袋妖怪黑白》日本首周贩售255万	8
```



#### 2.1.3 类别标签说明（class.txt）

共 10 个类别，具体如下：

```properties
finance
realty
stocks
education
science
society
politics
sports
game
entertainment
```



### 2.2 数据分析与处理

对短文本分类项目的数据进行：

- 读数据并统计分类数量
- 分析样本分布
- 进行分词预处理
- 验证集与测试集同步处理



#### 2.2.1 导入工具包

```python
import pandas as pd
from collections import Counter
import numpy as np
import jieba
```



#### 2.2.2 读取数据并统计分类数量

```python
# 读取训练集数据，假设以制表符分隔
content = pd.read_csv('./data/data/train.txt', sep='\t', names=['sentence', 'label'])

# 查看前10行
print(content.head(10))

# 输出总样本数
print("总样本数：", len(content))

# 统计每个类别的样本数量
count = Counter(content['label'].values)
print("类别分布：", count)
print("类别总数：", len(count))
```

> **📊 输出结果整理**
>
> ✅ 前10行数据示例：
>
> | 索引 | sentence（文本）                                 | label（标签） |
> | :--- | :----------------------------------------------- | :------------ |
> | 0    | 中华女子学院：本科层次仅1专业招男生              | 3             |
> | 1    | 两天价网站背后重重迷雾：做个网站究竟要多少钱     | 4             |
> | 2    | 东5环海棠公社230-290平2居准现房98折优惠          | 1             |
> | 3    | 卡佩罗：告诉你德国脚生猛的原因不希望英德战踢点球 | 7             |
> | 4    | 82岁老太为学生做饭扫地44年获授港大荣誉院士       | 5             |
> | 5    | 记者回访地震中可乐男孩：将受邀赴美国参观         | 5             |
> | 6    | 冯德伦徐若隔空传情默认其是女友                   | 9             |
> | 7    | 传郭晶晶欲落户香港战伦敦奥运装修别墅当婚房       | 1             |
> | 8    | 《赤壁OL》攻城战诸侯战硝烟又起                   | 8             |
> | 9    | “手机钱包”亮相科博会                             | 4             |
>
> ✅ 样本总量：
>
> ```
> 总样本数量：180000
> ```
>
> ✅ 类别分布：
>
> | 类别 | 样本数 |
> | :--- | :----- |
> | 0    | 18000  |
> | 1    | 18000  |
> | 2    | 18000  |
> | 3    | 18000  |
> | 4    | 18000  |
> | 5    | 18000  |
> | 6    | 18000  |
> | 7    | 18000  |
> | 8    | 18000  |
> | 9    | 18000  |
>
> > 🔍 共 **10 个类别**，每类 **18,000 条样本**，分布均衡。



#### 2.2.3 分析样本分布与文本长度

```python
# 统计样本总量
total = 0
# 遍历每个类别的样本数量并累加
for i, v in count.items():
    total += v
print("总样本数：", total)

# 打印每个类别的样本比例
print("各类别样本比例：")
for i, v in count.items():
    print(f"类别 {i}: {v / total * 100:.1f}%")

print("****************************************")

# 使用 apply 函数计算每行文本的长度（字符数）
content['sentence_len'] = content['sentence'].apply(len)

# 查看前10行（含长度）
print("前10行样本（含文本长度）：")
print(content.head(10))

# 计算文本长度的均值与标准差
length_mean = np.mean(content['sentence_len'])
length_std = np.std(content['sentence_len'])

print("文本长度均值：", length_mean)
print("文本长度标准差：", length_std)
```

> **📊 输出结果整理**
>
> ✅ 总样本数与类别比例
>
> ```
> 总样本数：180000
> ```
>
> | 类别 | 占比  |
> | :--- | :---- |
> | 0    | 10.0% |
> | 1    | 10.0% |
> | 2    | 10.0% |
> | 3    | 10.0% |
> | 4    | 10.0% |
> | 5    | 10.0% |
> | 6    | 10.0% |
> | 7    | 10.0% |
> | 8    | 10.0% |
> | 9    | 10.0% |
>
> ✅ 前10行样本（含文本长度）
>
> | 索引 | sentence（文本内容）                             | label | sentence_len |
> | :--- | :----------------------------------------------- | :---- | :----------- |
> | 0    | 中华女子学院：本科层次仅1专业招男生              | 3     | 18           |
> | 1    | 两天价网站背后重重迷雾：做个网站究竟要多少钱     | 4     | 22           |
> | 2    | 东5环海棠公社230-290平2居准现房98折优惠          | 1     | 25           |
> | 3    | 卡佩罗：告诉你德国脚生猛的原因不希望英德战踢点球 | 7     | 25           |
> | 4    | 82岁老太为学生做饭扫地44年获授港大荣誉院士       | 5     | 23           |
> | 5    | 记者回访地震中可乐男孩：将受邀赴美国参观         | 5     | 20           |
> | 6    | 冯德伦徐若隔空传情默认其是女友                   | 9     | 17           |
> | 7    | 传郭晶晶欲落户香港战伦敦奥运装修别墅当婚房       | 1     | 22           |
> | 8    | 《赤壁OL》攻城战诸侯战硝烟又起                   | 8     | 16           |
> | 9    | “手机钱包”亮相科博会                             | 4     | 11           |
>
> ✅ 文本长度统计结果
>
> | 指标     | 数值         |
> | :------- | :----------- |
> | 平均长度 | 19.21 个字符 |
> | 标准差   | 3.86 个字符  |



#### 2.2.4中文分词预处理（使用 jieba）

```python
import jieba

# 定义分词函数：将句子切成词列表
def cut_sentence(sentence):
    return list(jieba.cut(sentence))

# 添加新列：存储分词结果（列表形式）
content['words'] = content['sentence'].apply(cut_sentence)

# 打印前10行，查看分词效果
print("前10行分词结果：")
print(content.head(10))

# 将分词结果转为字符串（用空格连接）
content['words'] = content['sentence'].apply(lambda s: ' '.join(cut_sentence(s)))

# 只保留前30个词（按空格分割后取前30个）
content['words'] = content['words'].apply(lambda s: ' '.join(s.split()[:30])) # 这里一个词算一个长度

# 保存处理后的数据为新的CSV文件
content.to_csv('./data/data/train_new.csv', index=False)
```



#### 2.2.5 处理验证集与测试集

> 同上方式处理验证集与测试集



## 3 模型训练与测试

### 3.1 随机森林-baseline

#### 3.1.1 导入工具包

```python
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier  
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import accuracy_score, recall_score, precision_score, f1_score

from icecream import ic
```



#### 3.1.2 设置文件路径与字段名

```python
# 数据集路径（已分词的训练集）
TRAIN_CORPUS = './data/data/train_new.csv'

# 停用词路径
STOP_WORDS = './data/data/stopwords.txt'  # 转化为向量的时候忽略无意义词

# 分词结果所在列名
WORDS_COLUMN = 'words'
```



#### 3.1.3 读取数据集并构建语料库

```python
# 读取训练集（包含分词后的文本）
content = pd.read_csv(TRAIN_CORPUS)

# 提取分词结果列，构建语料库
corpus = content[WORDS_COLUMN].values

# 可选：查看前5行分词结果
print("语料库前5条样本：")
for i in range(5):
    print(f"{i}: {corpus[i]}")
```



✅ 小结

| 项目       | 内容                              |
| :--------- | :-------------------------------- |
| 数据文件   | `train_new.csv`（已分词）         |
| 停用词     | `stopwords.txt`                   |
| 语料库字段 | `words`                           |
| 数据类型   | `pandas.Series` → `numpy.ndarray` |

> ✅ 至此，语料库构建完成，可进入下一步：**TF-IDF 特征提取**。



#### 3.1.4 将文本转换为数值特征（TF-IDF）

🎯 目标

使用 **TF-IDF** 将分词后的中文文本转换为数值特征向量，供随机森林等机器学习模型使用。



📘 TF-IDF 原理回顾（简明版）

| 组成                  | 含义                       | 公式                                               |
| :-------------------- | :------------------------- | :------------------------------------------------- |
| **TF**（词频）        | 词语在文档中出现的频率     | `TF = 词在文档中出现次数 / 文档总词数`             |
| **IDF**（逆文档频率） | 词语在语料库中的稀有程度   | `IDF = log(语料库文档总数 / (含该词的文档数 + 1))` |
| **TF-IDF**            | 综合衡量词语对文档的重要性 | `TF-IDF = TF × IDF`                                |

> ✅ 思想：**越常见 → TF 高；越稀有 → IDF 高；两者乘积高 → 区分度强**



🧑‍💻 代码实现（含注释）

```python
from sklearn.feature_extraction.text import TfidfVectorizer

# 读取停用词（已提前准备好）
stop_words = open(STOP_WORDS, encoding='utf-8').read().split()

# 初始化 TF-IDF 向量化器
tfidf = TfidfVectorizer(
    stop_words=stop_words  # 过滤无意义词
)

# 将语料库（已分词文本）转为 TF-IDF 特征矩阵（稀疏矩阵）
text_vectors = tfidf.fit_transform(corpus)

# 查看特征矩阵形状
print("TF-IDF 特征矩阵形状：", text_vectors.shape)
```

> 📊 输出示例（假设）
>
> ```
> TF-IDF 特征矩阵形状： (180000, 30000)
> ```
>
> > ✅ 表示 **18 万条样本**，每条样本被编码为 **3 万维的 TF-IDF 向量**。
> >
> > ⏭ 下一步
> >
> > 将 `text_vectors` 与标签 `targets` 一起传入 `train_test_split`，进入 **模型训练与评估** 阶段。



#### 3.1.5 划分数据集、模型训练与评估（随机森林）

🎯 目标

- 将 **TF-IDF** 特征向量划分为训练集与测试集；
- 训练随机森林分类器；
- 评估模型准确率，建立基线模型（Baseline）。



🧑‍💻 代码实现（含详细注释）

```python
# 提取标签列（目标值）
targets = content['label']

# 划分训练集与测试集（80% 训练，20% 测试，stratify 保证类别比例一致）
x_train, x_test, y_train, y_test = train_test_split(
    text_vectors,        # TF-IDF 特征
    targets,             # 标签
    test_size=0.2,       # 测试集比例
    random_state=42,     # 固定随机种子，保证可复现
    stratify=targets     # 按标签分层采样
)

# 初始化随机森林分类器（默认参数）
model = RandomForestClassifier()

# 训练模型
model.fit(x_train, y_train)

# 预测测试集
y_pred = model.predict(x_test)

# 计算准确率
accuracy = accuracy_score(y_test, y_pred)

# 打印评估结果
ic(accuracy)
```

📊 输出结果

```
ic| accuracy: 0.8148333333333333
```



✅ 结论

| 指标                   | 数值       | 说明                  |
| :--------------------- | :--------- | :-------------------- |
| **准确率（Accuracy）** | **81.48%** | 10 分类任务中表现良好 |

> ✅ 随机森林模型构建简单、训练快速，在 **未调参、无特征工程** 的前提下达到 **80%+ 准确率**，可作为 **基线模型（Baseline 1.0）** 使用。
> ✅ 后续可通过 **调参、特征工程、模型升级（如 SVM、XGBoost、BERT）** 进一步提升性能。