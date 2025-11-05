## 1 项目结构（案例代码）

```
03-fast_text/
├── data/                          # 数据集目录
│   ├── preprocess.py              # 数据预处理脚本
│   ├── train.txt                  # 原始训练数据
│   ├── test.txt                   # 原始测试数据
│   ├── dev.txt                    # 原始验证数据
│   ├── train_fast.txt             # FastText 格式训练数据
│   ├── test_fast.txt              # FastText 格式测试数据
│   └── dev_fast.txt               # FastText 格式验证数据
├── app.py                         # Flask 部署服务
├── fast_text.py                   # FastText 实验脚本
├── fast_text_2.py                 # 进阶实验脚本
├── fast_text_3.py                 # 更多实验
├── test.py                        # Flask 客户端调用测试
└── toutiao_fasttext_1699862718.bin  # 训练好的模型权重
```



## 2 数据准备 

### 2.1 数据格式要求（FastText）

**FastText** 要求输入数据满足以下格式：

- 每行一个文档
- 标签以 `__label__<标签名>` 开头，放在文档前面



✅ 示例

**单标签数据**

```
__label__1 i love you
__label__0 i hate you
```

**多标签数据**

```
__label__baking __label__food-safety __label__substitutions how to substitute ingredients
__label__baking __label__oven __label__convection fan bake vs bake
```

> ⚠️ 注意：单标签与多标签在使用 FastText 时处理方式一致。



### 2.2 数据预处理流程

#### 2.2.1 获取类别映射（`class.txt` → `id_to_label`）

```python
# 存储类别信息：id → label
id_to_label = {}
idx = 0

# 读取类别文件
with open('class.txt', 'r', encoding='utf-8') as f:
    for line in f.readlines():
        line = line.strip()  # 去除换行和空白
        id_to_label[idx] = line
        idx += 1

print('id_to_label:', id_to_label)
```

**输出示例：**

```
id_to_label: {0: 'finance', 1: 'realty', 2: 'stocks', 3: 'education', 4: 'science', ...}
```



#### 2.2.2 转换训练数据格式（`train.txt` → `train_fast.txt`）

```python
train_data = []

# 打开原始训练数据
with open('train.txt', 'r', encoding='utf-8') as f:
    for line in f.readlines():
        line = line.strip()
        sentence, label = line.split('\t')  # 假设格式为：文本\t标签ID

        # 获取标签名称
        label_id = int(label)
        label_name = id_to_label[label_id]

        # 构建 FastText 标签格式
        new_label = '__label__' + label_name

        # 文本处理（可按字或按词切分）
        sent_char = ' '.join(list(sentence))  # 按字切分示例

        # 组合成 FastText 格式
        new_sentence = new_label + ' ' + sent_char

        # 添加到训练数据列表
        train_data.append(new_sentence)

# 写入 FastText 格式训练文件
with open('train_fast.txt', 'w', encoding='utf-8') as f:
    for data in train_data:  # 列表不能直接写入txt，只能遍历，逐行写入
        f.write(data + '\n')

print('FastText 训练数据预处理完成！')
```



#### 2.2.3 示例输出（`train_fast.txt`）

```
__label__education 中 华 女 子 学 院 ： 本 科 层 次 仅 1 专 业 招 男 生
__label__science 两 天 价 网 站 背 后 重 重 迷 雾 ： 做 个 网 站 究 竟 要 多 少 钱
__label__realty 东 5 环 海 棠 公 社 2 3 0 - 2 9 0 平 2 居 准 现 房 9 8 折 优 惠
__label__sports 卡 佩 罗 ： 告 诉 你 德 国 脚 生 猛 的 原 因   不 希 望 英 德 战 踢 点 球
__label__society 8 2 岁 老 太 为 学 生 做 饭 扫 地 4 4 年 获 授 港 大 荣 誉 院 士
...
```

> 同样方式处理测试集与验证集
>
> - `test.txt` → `test_fast.txt`
> - `dev.txt` → `dev_fast.txt`



## 3 模型搭建（FastText）

**代码位置：**

```
03-fast_text/fast_text.py
```

> 功能说明：使用 `fasttext.train_supervised()` 函数训练文本分类模型，并在测试集上评估模型性能。



### 3.1 示例代码（含注释）：

```python
import fasttext

# 指定训练集和测试集路径
train_data_path = './data/data/train_fast.txt'
test_data_path = './data/data/test_fast.txt'

# 使用 fastText 训练监督模型
# wordNgrams=2 表示使用 2-gram 特征
model = fasttext.train_supervised(input=train_data_path, wordNgrams=2)

# 打印模型词汇表大小
print('词的数量：', len(model.words))

# 打印模型标签列表
print('标签值：', model.labels)

# 在测试集上评估模型性能
result = model.test(test_data_path)

# 输出测试结果：包含 (样本数, 精确率, 召回率)
print(result)
```

📊 输出结果示例：

```
Read 3M words
Number of words: 4760
Number of labels: 10
Progress: 100.0% words/sec/thread: 1745187  lr: 0.000000  avg.loss: 0.284760  ETA: 0h 0m 0s

词的数量：4760
标签值：['__label__science', '__label__finance', '__label__realty', '__label__sports', ...]

(10000, 0.9165, 0.9165)
```

✅结果解读：

- **测试样本数**：10000 条
- **精确率（Precision）**：91.65%
- **召回率（Recall）**：91.65%

> 💡 结论：相比传统模型如随机森林，FastText 在文本分类任务上表现更优，准确率和召回率均达到 **91.65%**，有显著提升。



## 4 模型优化

目标：

> 不依赖人工调参，使用 **自动超参数搜索** 提升模型性能，并尝试 **不同粒度（字 vs 词）** 的输入表示。



### 4.1 优化方式一：自动超参数调优（基于字）

代码路径：

```
03-fast_text/fast_text_2.py
```

> 功能说明：使用 `autotuneValidationFile` 参数，在验证集上自动搜索最优超参数组合。



✅ 示例代码（含注释）：

```python
import fasttext
import time

# 数据集路径
train_data_path = 'data/data/train_fast.txt'  # 训练集
dev_data_path = 'data/data/dev_fast.txt'      # 验证集
test_data_path = 'data/data/test_fast.txt'    # 测试集

# 启动自动超参数搜索训练
# autotuneValidationFile：指定验证集路径，用于评估每组参数的效果
# autotuneDuration：控制搜索时间（单位：秒）
# wordNgrams：手动设置 n-gram，不参与自动调参
# verbose=3：打印每次尝试的超参数组合
model = fasttext.train_supervised(
    input=train_data_path,
    autotuneValidationFile=dev_data_path,
    autotuneDuration=6,  # 搜索 6 秒
    wordNgrams=2,
    verbose=3
)

# 在测试集上评估模型
result = model.test(test_data_path)
print(result)  # 输出：(样本数, 精确率, 召回率)

# 保存模型，文件名带时间戳
time1 = int(time.time())
model_save_path = "./toutiao_fasttext_{}.bin".format(time1)
model.save_model(model_save_path)
```

📊 实验结果（字级别）：

```
(10000, 0.9172, 0.9172)
```

> ✅ 精确率 & 召回率均为 **91.72%**，相比初始模型（91.65%）略有提升。



### 4.2 优化方式二：输入粒度升级为“词”

📂 代码路径：

- 预处理：`03-fast_text/data/data/preprocess1.py`
- 训练：`03-fast_text/fast_text_3.py`



#### 4.2.1 预处理：将文本按 **词** 切分（使用 jieba）

```python
import jieba

# 类别映射（同之前）
id_to_label = {}
idx = 0
with open('class.txt', 'r', encoding='utf-8') as f:
    for line in f.readlines():
        line = line.strip()
        id_to_label[idx] = line
        idx += 1
print('id_to_label:', id_to_label)

# 处理训练集
train_data = []
with open('train.txt', 'r', encoding='utf-8') as f:
    for line in f.readlines():
        line = line.strip()
        sentence, label = line.split('\t')

        label_id = int(label)
        label_name = id_to_label[label_id]
        new_label = '__label__' + label_name

        # 使用 jieba 分词（按词切分）
        sent_word = ' '.join(jieba.lcut(sentence))

        # 拼接成 FastText 格式
        new_sentence = new_label + ' ' + sent_word
        train_data.append(new_sentence)

# 保存处理后的训练数据
with open('train_fast1.txt', 'w', encoding='utf-8') as f:
    for data in train_data:
        f.write(data + '\n')

print('FastText 训练数据（词级）预处理完成！')
```

> ✅ 同样方式处理：
>
> - `test.txt` → `test_fast1.txt`
> - `dev.txt` → `dev_fast1.txt`



#### 4.2.2 模型训练（词级输入）

```python
import fasttext
import time

# 数据集路径（词级）
train_data_path = 'data/data/train_fast1.txt'
dev_data_path = 'data/data/dev_fast1.txt'
test_data_path = 'data/data/test_fast1.txt'

# 自动超参数搜索（词级）
model = fasttext.train_supervised(
    input=train_data_path,
    autotuneValidationFile=dev_data_path,
    autotuneDuration=6,
    wordNgrams=2,
    verbose=3
)

# 测试评估
result = model.test(test_data_path)
print(result)

# 模型保存
time1 = int(time.time())
model_save_path = "./toutiao_fasttext_{}.bin".format(time1)
model.save_model(model_save_path)
```

📊 实验结果（词级别）：

```
(10000, 0.9093, 0.9093)
```

> ⚠️ 精确率 & 召回率为 **90.93%**，**略低于字级别模型**，可能原因：

- 分词引入噪声
- 词表变大，稀疏性增加
- 数据量较小，字级别更稳健



✅ 总结对比

| 模型版本  | 输入粒度 | 精确率 | 召回率 | 是否自动调参 | 备注                   |
| :-------- | :------- | :----- | :----- | :----------- | :--------------------- |
| 初始模型  | 字       | 91.65% | 91.65% | ❌            | baseline               |
| 优化模型1 | 字       | 91.72% | 91.72% | ✅            | 自动调参后略有提升     |
| 优化模型2 | 词       | 90.93% | 90.93% | ✅            | 词级表示未带来性能提升 |



## 5 模型部署

工业界中的AI是指"**能落地的AI**", 即指在生产环境中可以部署并提供在线, 或离线作业的模型。

- 第一步: 编写主服务逻辑代码。
- 第二步: 启动Flask服务。
- 第三步: 编写测试代码。
- 第四步: 执行测试并检验结果。



### 5.1 服务端代码（Flask）

文件路径：

```
03-fast_text/app.py
```

功能说明：

- 接收 POST 请求（字段：`uid`, `text`）
- 对文本进行 **jieba 分词**
- 调用 FastText 模型预测
- 返回预测标签



✅ 服务端代码（含详细注释）：

```python
import time
import jieba
import fasttext
from flask import Flask, request

app = Flask(__name__)

# 可选：加载自定义词典（如停用词、领域词）
jieba.load_userdict('./data/data/stopwords.txt')

# 加载已训练好的 FastText 模型
model_save_path = "toutiao_fasttext_1699862718.bin"
model = fasttext.load_model(model_save_path)
print("✅ FastText 模型加载完成，准备提供服务...")

# 定义服务路由：仅支持 POST 请求
@app.route('/v1/main_server/', methods=["POST"])
def main_server():
    # 获取请求参数
    uid = request.form['uid']    # 用户ID（可选字段，可用于日志）
    text = request.form['text']  # 输入文本

    # 文本预处理：jieba 分词（与训练时保持一致）
    input_text = ' '.join(jieba.lcut(text))

    # 模型预测（返回标签和概率）
    res = model.predict(input_text)
    predict_label = res[0][0]  # 取标签字符串

    # 返回预测结果
    return predict_label

# 启动服务，监听所有地址的 5000 端口
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

▶️ 启动日志示例：

```
✅ FastText 模型加载完成，准备提供服务...
 * Serving Flask app 'app'
 * Debug mode: off
 * Running on all addresses (0.0.0.0)
 * Running on http://127.0.0.1:5000
 * Running on http://172.16.43.153:5000
```



### 5.2 客户端测试代码

文件路径：

```
03-fast_text/test.py
```

功能说明：

- 模拟用户请求
- 记录请求耗时
- 打印预测结果



✅ 客户端代码（含注释）：

```python
import requests
import time

# 服务地址
url = "http://127.0.0.1:5000/v1/main_server/"

# 构造请求数据
data = {
    "uid": "AI-6-202204",
    "text": "公共英语（PETS）写作中常见的逻辑词汇汇总"
}

# 发送请求并计时
start_time = time.time()
res = requests.post(url, data=data)
cost_time = (time.time() - start_time) * 1000  # 转为毫秒

# 打印结果
print('输入文本：', data['text'])
print('分类结果：', res.text)
print('单条样本预测耗时：%.2f ms' % cost_time)
```

▶️ 客户端输出示例：

```
输入文本：公共英语（PETS）写作中常见的逻辑词汇汇总
分类结果：__label__education
单条样本预测耗时：4.74 ms
```

> 结论：预测结果还不错, 同时更重要的是在GPU环境下预测时间仅仅不到5ms!!! 这是工业界场景下fasttext工具最大的意义!!!