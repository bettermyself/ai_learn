# SeqSeq英译法案例

## 1、任务目的：

```properties
目的: 给定一段英文，翻译为法文
典型的文本分类任务: 每个时间步去预测应该属于哪个法文单词
```

### 2 数据格式

- 注意：两列数据，第一列是英文文本，第二列是法文文本，中间用制表符号"\t"隔开

```properties
i am from brazil .  je viens du bresil .
i am from france .  je viens de france .
i am from russia .  je viens de russie .
i am frying fish .  je fais frire du poisson .
i am not kidding .  je ne blague pas .
```

### 3 任务实现流程

```properties
1. 获取数据:案例中是直接给定的
2. 数据预处理: 脏数据清洗、数据格式转换、数据源Dataset的构造、数据迭代器Dataloader的构造
3. 模型搭建: 编码器和解码器等一系列模型
4. 模型评估（测试）
5. 模型上线---API接口
```

### 4 数据预处理

#### 4.0 导入工具包及设置全局变量

```python
# ==========================
# 1. 导入必要的工具包和模块
# ==========================

import re                 # 正则表达式处理
import random             # 随机数生成
import time               # 时间相关操作
import matplotlib.pyplot as plt  # 绘图工具

import torch              # PyTorch 主库
import torch.nn as nn     # 神经网络模块
import torch.nn.functional as F  # 激活函数等
import torch.optim as optim      # 优化器
from torch.utils.data import Dataset, DataLoader  # 数据加载工具

# ==========================
# 2. 设置设备（GPU 或 CPU）
# ==========================

# 如果可用，优先使用 GPU 加速训练
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# ==========================
# 3. 定义特殊标记常量
# ==========================

SOS_token = 0  # 起始标记（Start Of Sequence）
EOS_token = 1  # 结束标记（End Of Sequence）

# ==========================
# 4. 设置最大句子长度
# ==========================

MAX_LENGTH = 10  # 句子最大长度（包括标点）

# ==========================
# 5. 数据文件路径
# ==========================

data_path = './data/eng-fra-v2.txt'  # 英法语平行语料文件路径
```



#### 4.1 定义样本清洗函数和构建字典

目的：

```properties
样本清洗函数: 将脏数据进行清洗，以免影响模型训练
构建字典:一方面是为了将文本进行数字表示，还有一方面进行解码的时候将预测索引数字映射为真实的文本
```

✅样本清洗函数代码实现

```python
# ==========================
# 6. 文本预处理函数
# ==========================

def normalize_string(s):
    """
    对输入字符串进行规范化处理：
    - 转换为小写
    - 去除首尾空格
    - 在标点符号前加空格
    - 移除非字母和标点的字符

    参数:
        s (str): 原始字符串

    返回:
        str: 清洗后的字符串
    """
    s = s.lower().strip()  # 转为小写并去除首尾空格

    # 在 . ! ? 前加一个空格，便于分词，这里的\1表示第一个分组   正则中的\num
    s = re.sub(r"([.!?])", r" \1", s)

    # 将非字母和非标点的字符替换为空格
    s = re.sub(r"[^a-zA-Z.!?]+", r" ", s)

    return s
```

✅构建字典代码实现

```python
# ==========================
# 构建字典函数：读取数据并生成词汇映射
# ==========================

def my_getdata():
    """
    读取英法语平行语料文件，构建词汇到索引的映射（word2index）和索引到词汇的映射（index2word）。

    返回:
        english_word2index (dict): 英语词汇到索引的映射
        english_index2word (dict): 英语索引到词汇的映射
        english_word_n (int): 英语词汇总数
        french_word2index (dict): 法语词汇到索引的映射
        french_index2word (dict): 法语索引到词汇的映射
        french_word_n (int): 法语词汇总数
        my_pairs (list): 清洗后的英法语句子对
    """

    # --------------------------
    # 1. 读取原始数据文件
    # --------------------------
    with open(data_path, 'r', encoding='utf-8') as fr:
        sentences_str = fr.read()

    # 按行分割（假设每行是一个句子对）
    sentences = sentences_str.strip().split('\n')

    # --------------------------
    # 2. 清洗并构建句子对
    # --------------------------
    # 每行用制表符分隔英语和法语，分别清洗
    my_pairs = [[normalize_string(s) for s in line.split('\t')] for line in sentences]

    # --------------------------
    # 3. 初始化字典
    # --------------------------
    english_word2index = {"SOS": 0, "EOS": 1}
    english_word_n = 2

    french_word2index = {"SOS": 0, "EOS": 1}
    french_word_n = 2

    # --------------------------
    # 4. 遍历句子对，构建词汇表
    # --------------------------
    for pair in my_pairs:
        # 处理英语句子
        for word in pair[0].split(' '):
            if word not in english_word2index:
                english_word2index[word] = english_word_n
                english_word_n += 1

        # 处理法语句子
        for word in pair[1].split(' '):
            if word not in french_word2index:
                french_word2index[word] = french_word_n
                french_word_n += 1

    # --------------------------
    # 5. 构建反向映射（索引到词汇）
    # --------------------------
    english_index2word = {v: k for k, v in english_word2index.items()}
    french_index2word = {v: k for k, v in french_word2index.items()}

    # --------------------------
    # 6. 返回所有需要的对象
    # --------------------------
    return (
        english_word2index,
        english_index2word,
        english_word_n,
        french_word2index,
        french_index2word,
        french_word_n,
        my_pairs
    )
```

#### 4.2 构建自己的数据源DataSet

目的：

```properties
使用Pytorch框架，一般遵从一个规矩：使用DataSet方法构造数据源，来让模型进行使用
构造数据源的过程中:必须继承torch.utils.data.Dataset类，必须构造两个魔法方法：__len__(), __getitem__()
__len__(): 一般返回的是样本的总个数，我们可以直接len(dataset对象)直接就可以获得结果
__getitem__(): 可以根据某个索引取出样本值，我们可以直接用dataset对象[index]来直接获得结果
```

代码实现：

```python
# 3.构建数据源Dataset
class Seq2SeqDaset(Dataset):
    def __init__(self, my_pairs):
        self.my_pairs = my_pairs
        self.sample_len = len(my_pairs)

    def __len__(self):
        return self.sample_len

    def __getitem__(self, index):
        # 1.index异常值处理[0, self.sample_len-1]
        index = min(max(index, 0), self.sample_len-1)

        # 2. 根据index取出样本数据
        x = self.my_pairs[index][0]
        y = self.my_pairs[index][1]

        # 3.进行文本数据数字化的转换
        x1 = [english_word2index[word] for word in x.split(' ')]
        tensor_x = torch.tensor(x1, dtype=torch.long, device=device)

        y1 = [french_word2index[word] for word in y.split(' ')]
        y1.append(EOS_token)
        tensor_y = torch.tensor(y1, dtype=torch.long, device=device)

        return tensor_x, tensor_y
# ==========================
# 构建 Dataset 类，用于加载英法语句子对
# ==========================

class Seq2SeqDataset(Dataset):
    def __init__(self, my_pairs):
        """
        初始化数据集

        参数:
            my_pairs (list): 英法语句子对列表，每个元素是 [英语句子, 法语句子]
        """
        self.my_pairs = my_pairs
        self.sample_len = len(my_pairs)

    def __len__(self):
        """
        返回数据集大小
        """
        return self.sample_len

    def __getitem__(self, index):
        """
        根据索引获取一个样本，并将其转换为张量

        参数:
            index (int): 样本索引

        返回:
            tensor_x (Tensor): 英语句子对应的索引序列
            tensor_y (Tensor): 法语句子对应的索引序列（包含 EOS）
        """
        # --------------------------
        # 1. 异常值处理：限制索引范围
        # --------------------------
        index = min(max(index, 0), self.sample_len - 1)

        # --------------------------
        # 2. 获取英语和法语句子
        # --------------------------
        x = self.my_pairs[index][0]  # 英语句子
        y = self.my_pairs[index][1]  # 法语句子

        # --------------------------
        # 3. 英语句子 -> 单词列表 -> 索引列表 -> 张量
        # --------------------------
        x_list = [english_word2index[word] for word in x.split(' ')]
        tensor_x = torch.tensor(x_list, dtype=torch.long, device=device)

        # --------------------------
        # 4. 法语句子 -> 单词列表 -> 索引列表 -> 添加 EOS -> 张量
        # --------------------------
        y_list = [french_word2index[word] for word in y.split(' ')]
        y_list.append(EOS_TOKEN)  # 添加结束符
        tensor_y = torch.tensor(y_list, dtype=torch.long, device=device)

        return tensor_x, tensor_y
```

> 拓展：为什么`y_list.append(EOS_TOKEN)`，而`x_list`不需要
>
> ✅ 一句话回答：
>
> > **因为模型需要知道“什么时候停止生成”，而输入不需要结束信号，输出需要。**
>
> 🔍 详细解释：
>
> | 项目         | 输入（x）                                    | 输出（y）                                                    |
> | ------------ | -------------------------------------------- | ------------------------------------------------------------ |
> | 作用         | 作为 Encoder 的输入                          | 作为 Decoder 的训练目标                                      |
> | 是否需要 EOS | ❌ 不需要                                     | ✅ 需要                                                       |
> | 原因         | Encoder 只需要完整句子即可，不需要“结束”信号 | Decoder 必须学会在生成完句子后**输出 EOS**，否则模型会**永远不停**地生成 |



#### 4.3 构建数据源Dataloader

目的：

```properties
为了将Dataset我们上一步构建的数据源，进行再次封装，变成一个迭代器，可以进行for循环，而且，可以自动为我们dataset里面的数据进行增维（bath_size）,也可以随机打乱我们的取值顺序
```

代码实现：

```python
# ==========================================
# 4. 构建数据迭代器 DataLoader
# ==========================================

def get_dataloader(batch_size: int = 1, shuffle: bool = True):
    """
    根据清洗后的英-法句子对 my_pairs，生成可供训练/验证使用的 DataLoader。

    参数
    ----
    batch_size : int, optional
        每个批次加载的样本数，默认 1（单条样本）。
    shuffle : bool, optional
        是否在每个 epoch 开始时打乱数据顺序，默认 True。

    返回
    ----
    DataLoader
        已封装好的 PyTorch 数据迭代器，可直接用于训练循环。
    """

    # 1. 实例化自定义 Dataset
    my_dataset = Seq2SeqDataset(my_pairs)

    # 2. 实例化 DataLoader
    my_dataloader = DataLoader(
        dataset=my_dataset,   # 数据源
        batch_size=batch_size,  # 批次大小
        shuffle=shuffle       # 是否打乱
    )

    return my_dataloader
```

### 5 模型搭建

#### 5.1 搭建编码器GRU模型

- 注意事项

```properties
GRU模型在实例化的时候，默认batch_first=False，因此，需要小心输入数据的形状
因为: dataloader返回的结果x---》shape--〉[batch_size, seq_len, input_size], 所以课堂上代码和讲义稍微有点不同，讲义是默认的batch_first=False，而我们的代码是batch_first=True，这样做的目的，可以直接承接x的输入。
```

- 代码实现

```python
# 5. 构建GRU编码器模型
class EncoderGRU(nn.Module):
    def __init__(self, vocab_size, hidden_size):
        super().__init__()
        # 1.vocab_size代表英文单词的总个数（去重）
        self.vocab_size = vocab_size
        # 2. hidden_size词嵌入维度/隐藏层输出维度（我们让他相等）
        self.hidden_size = hidden_size
        # 3.定义Embedding层，目的：将每个词汇进行向量表示
        self.embed = nn.Embedding(self.vocab_size, self.hidden_size)
        # 4.定义GRU层第一个self.hidden_size实际上是embedding的输出结果词嵌入维度
        # 4.定义GRU层第二个self.hidden_size实是我们指定的GRU模型的输出维度，只不过这里GRU输入和输出一样
        self.gru = nn.GRU(self.hidden_size, self.hidden_size, batch_first=True)
    def forward(self, input, hidden):
        # 1.input-->[1, 6]需要经过embedding--》[1,6, 256]
        input_x = self.embed(input)
        # 2.将input_x和hidden送入GRU模型
        output, hidden = self.gru(input_x, hidden)
        return output, hidden

    def inithidden(self):
        return torch.zeros(1, 1, self.hidden_size, device=device)
```

编码器模型测试

```python
# 测试编码器模型
def test_EncoderGRU():
    # 获取数据
    my_dataloader = get_dataloader()
    # 实例化模型
    my_encoder = EncoderGRU(vocab_size=english_word_n, hidden_size=256)
    my_encoder.to(device)
    # 初始化h0
    h0 = my_encoder.inithidden()

    for i, (x, y) in enumerate(my_dataloader):
        print(f'x---》{x.shape}')
        output, hn = my_encoder(x, h0)
        print(f'output--》{output.shape}')
        print(f'hn--》{hn.shape}')
        break
```

#### 5.2 搭建解码器无Attention模型

- 代码实现

```python
#6. 构建没有attention的GRU解码器
class DecoderGRU(nn.Module):
    def __init__(self, vocab_size, hidden_size):
        super().__init__()
        # vocab_size代表解码器中法语单词的词汇总量（去重）
        self.vocab_size = vocab_size
        # hidden_size词嵌入维度
        self.hidden_size = hidden_size
        # Embedding层
        self.embed = nn.Embedding(self.vocab_size, self.hidden_size)

        # GRU层:这里定义GRU模型的输入和输出形状一样
        self.gru = nn.GRU(self.hidden_size,  self.hidden_size, batch_first=True)

        # 定义输出层:判断法语单词属于self.vocab_size里面的哪一个
        self.out = nn.Linear(self.hidden_size, self.vocab_size)

        # 定义softmax层
        self.softmax = nn.LogSoftmax(dim=-1)

    def forward(self, input, hidden):
        # input输入一般是一个字，解码的时候，是一个字符一个字符解码的
        # 1. input-->[1, 1]-->embeding之后--》[1, 1, hidden_size]-->[1, 1, 256]
        input_x = self.embed(input)
        # 2. relu激活函数使用
        input_x = F.relu(input_x)
        # 3. 将数据送入GRU模型:input_x-->[1,1,256],hidden:[1, 1, 256]
        # output-->[1, 1, 256]
        output, hidden = self.gru(input_x, hidden)

        # 4. 将output结果取最后一个词隐藏层输出送入linear层
        # output-->[1, vocab_size]-->[1, 4345]
        output = self.out(output[0])
        return self.softmax(output), hidden

    def inithidden(self):
        return torch.zeros(1, 1, self.hidden_size, device=device)
```

代码测试

```python
# 测试没有attention的解码器
def test_DecoderGRU():
    # 1.实例化dataset
    mydataset = Seq2SeqDaset(my_pairs)
    # 2.实例化dataloader
    my_dataloader = DataLoader(dataset=mydataset, batch_size=1, shuffle=True)

    # 3.实例化编码器模型
    my_encoder = EncoderGRU(vocab_size=english_word_n, hidden_size=256)
    # my_encoder = EncoderGRU(vocab_size=english_word_n, hidden_size=256).to(device)
    my_encoder.to(device)
    # 4. 实例化解码器模型
    my_decoder = DecoderGRU(vocab_size=french_word_n, hidden_size=256)
    my_decoder.to(device)

    # 5.将数据送入模型
    for x, y in my_dataloader:
        print(x)
        print(f'x--->{x.shape}')
        print(f'y--->{y.shape}')
        print(f'y--->{y}')
        # 5.1将x英文原始输入送入编码器模型得到编码结果;hidden就是C
        output, hidden = my_encoder(input=x, hidden=my_encoder.inithidden())
        # 5.2基于C开始一个字符一个字符的去解码
        for i in range(y.shape[1]):
            # print(f'y[0]-->{y[0]}')
            # print(f'y[0][i]-->{y[0][i]}')
            temp = y[0][i].view(1, -1)
            output, hidden = my_decoder(input=temp, hidden=hidden)
            print(f'output--》{output.shape}')
        break
```

#### 5.3 搭建解码器带Attention模型

- 注意事项

```properties
带Attention:需要有三个参数：Q、K、V，在本次案例中Q上一时间步预测的真实结果；K：上一时间步隐藏层输出的结果；V代表编码器的输出结果
```

- 代码实现

```python
# 7.带attention的解码器
class AttentionDecoderGRU(nn.Module):
    def __init__(self, vocab_size, hidden_size, dropout_p=0.1, max_length=MAX_LENGTH):
        super().__init__()
        # vocab_size：属于解码器端，代表法语的总的单词个数
        self.vocab_size = vocab_size
        # hidden_size:代表词嵌入的维度
        self.hidden_size = hidden_size
        # 随机失活概率
        self.dropout_p = dropout_p
        # 最大句子长度：因为训练语料里面不管英文还是法文最大句子长度都不超过10，我们这里限定最大长度，目的是方便计算注意力
        self.max_length = max_length

        # 定义Embedding层
        self.embed = nn.Embedding(self.vocab_size, self.hidden_size)
        # 计算注意力的第一个全连接层：得到权重分数
        self.attn = nn.Linear(self.hidden_size*2, self.max_length)
        # 随机失活层
        self.droupout = nn.Dropout(p=self.dropout_p)
        # 计算注意力的第二个全连接层：让注意力按照指定维度输出
        self.attn_combin = nn.Linear(self.hidden_size*2, self.hidden_size)
        # 定义GRU层
        self.gru = nn.GRU(self.hidden_size, self.hidden_size, batch_first=True)
        # 定义输出层
        self.out = nn.Linear(self.hidden_size, self.vocab_size)

        # 定义softmax层
        self.softmax = nn.LogSoftmax(dim=-1)

    def forward(self, input, hidden, encoder_output):
        # input-->query--》解码器输入某个词[1, 1]
        # hidden-->key--》上一时间步隐藏层输出[1, 1, 256]
        # encoder_output--->value-->编码器的输出结果[10, 256]--[max_length, 256]
        # 1. 将input送入embedding-->input_x-->[1,1,256]--query(真正)
        input_x = self.embed(input)
        # 1.1对input_x进行dropout
        input_x = self.droupout(input_x)
        # 2. 计算注意力权重分数self.attn_weight-->[1, 10]-->[1, max_length]
        attn_weight = F.softmax(self.attn(torch.cat((input_x[0], hidden[0]), dim=-1)), dim=-1)
        # 3. 将注意力权重和Value相乘:[1, 1,10]*[1,10,256]-->self.attn_applied-->[1, 1,256]
        attn_applied = torch.bmm(attn_weight.unsqueeze(0), encoder_output.unsqueeze(0))
        # 4.将query和self.attn_applied结果拼接之后，再经过线性的变换self.output1-->[1, 1, 256]
        output1 = self.attn_combin(torch.cat((input_x[0], attn_applied[0]), dim=-1)).unsqueeze(0)
        # 5. 经过relu激活函数
        relu_output = F.relu(output1)
        # 6. 将self.relu_output，以及hidden送入GRU模型中-->gru_output-->[1, 1,256]
        gru_output, hidden = self.gru(relu_output , hidden)

        # 7.将gru的结果送入输出层，得到最后的预测结果output-->[1, 4345]
        output = self.out(gru_output[0])
        return self.softmax(output), hidden, attn_weight

    def inithidden(self):
        return torch.zeros(1, 1, self.hidden_size, device=device)
```

模型测试

```python
# 测试带attention的解码器
def test_AttenDecoder():
    # 1.实例化dataset
    mydataset = Seq2SeqDaset(my_pairs)
    # 2.实例化dataloader
    my_dataloader = DataLoader(dataset=mydataset, batch_size=1, shuffle=True)

    # 3.实例化编码器模型
    my_encoder = EncoderGRU(vocab_size=english_word_n, hidden_size=256)
    # my_encoder = EncoderGRU(vocab_size=english_word_n, hidden_size=256).to(device)
    my_encoder.to(device)

   # 4.实例化解码器模型
    my_attenDecoder = AttentionDecoderGRU(vocab_size=french_word_n, hidden_size=256)
    my_attenDecoder.to(device)

    #5.循环数据送入模型
    for x, y in my_dataloader:
        print(f'x--》{x.shape}')
        print(f'y--》{y.shape}')
        # 1.将x送入编码器模型得到结果
        h0 = my_encoder.inithidden()
        encoder_output, hidden = my_encoder(input=x, hidden=h0)
        # print(f'encoder_output--》{encoder_output.shape}')
        # 2.将编码的结果进行处理，统一长度，方便计算注意力
        encoder_output_c = torch.zeros(MAX_LENGTH, my_encoder.hidden_size, device=device)
        # print(f'encoder_output_c--》{encoder_output_c.shape}')

        # 2.1将真实的编码的输出 结果赋值到encoder_output_c中，多余的都是用0来表示
        for i in range(encoder_output.shape[1]):
            # print(f'encoder_output[0][i]-->{encoder_output[0][i].shape}')
            # print(f'encoder_output[0, i]-->{encoder_output[0, i].shape}')
            encoder_output_c[i] = encoder_output[0][i]
        # 3.测试:进行解码应用
        for j in range(y.shape[1]):
            temp = y[0][j].view(1, -1)
            output, hidden, attn_weight = my_attenDecoder(temp, hidden, encoder_output_c)
            print(f'output--》{output.shape}')
            print(f'hidden--》{hidden.shape}')
            print(f'attn_weight--》{attn_weight.shape}')
            print("*"*80)
        break
```

------

### 6 模型训练

基本过程

```properties
1.获取数据
2.构建数据源Dataset
3.构建数据迭代器Dataloader
4.实例化自定义的模型: 编码器模型和解码器模型
5.实例化损失函数对象
6.实例化优化器对象: 编码器优化器和解码器优化器
7.定义打印日志参数
8.开始训练
8.1 实现外层大循环epoch
(可以在这构建数据迭代器Dataloader)
8.2 内部遍历数据迭代球dataloader
8.3 将数据送入模型得到输出结果
8.4 计算损失
8.5 梯度清零: optimizer.zero_grad()
8.6 反向传播: loss.backward()
8.7 参数更新（梯度更新）: optimizer.step()
8.8 打印训练日志
9. 保存模型: torch.save(model.state_dict(), "model_path")
```

6.1 模型训练代码实现

```python
# 8.构建模型的训练函数
def train_seq2seq():
    # 1.实例化dataset
    mydataset = Seq2SeqDaset(my_pairs)
    # 2.实例化dataloader
    my_dataloader = DataLoader(dataset=mydataset, batch_size=1, shuffle=True)

    # 3.实例化编码器模型
    my_encoder = EncoderGRU(vocab_size=english_word_n, hidden_size=256)
    # my_encoder = EncoderGRU(vocab_size=english_word_n, hidden_size=256).to(device)
    my_encoder.to(device)

    # 4.实例化解码器模型
    my_attenDecoder = AttentionDecoderGRU(vocab_size=french_word_n, hidden_size=256)
    my_attenDecoder.to(device)

    # 5.实例化优化器
    encoder_optimizer = optim.Adam(my_encoder.parameters(), lr=mylr)
    decoder_optimizer = optim.Adam(my_attenDecoder.parameters(), lr=mylr)

    # 6.实例化损失对象
    crossentropy = nn.NLLLoss()

    # 7.定义一个空列表list--》存储损失值，画图
    plot_loss_list = []

    # 8. 进入外层循环
    for epoch_idx in range(epochs):
        # 初始化损失值为0
        print_loss_total, plot_loss_total = 0.0, 0.0
        start_time = time.time()
        # 进入内部循环
        for i, (x, y) in enumerate(tqdm(my_dataloader), start=1):
            myloss = Train_Iters(x, y, my_encoder,
                                 my_attenDecoder,encoder_optimizer,
                                 decoder_optimizer,crossentropy)
            # print(f'主训练了函数的myloss--》{myloss}')
            print_loss_total += myloss
            plot_loss_total += myloss

            # 打印日志
            # 每隔1000步打印损失
            if i % 10 == 0:
                print_loss_avg = print_loss_total / 1000

                print_loss_total = 0
                use_time = time.time() - start_time
                print(f'当前的轮次%d,平均损失%.4f,时间%.2f'%(epoch_idx+1, print_loss_avg.item()*100, use_time))

            # 每隔100步保留损失，画图
            if i % 10 == 0:
                plot_loss_avg = plot_loss_total / 100
                # 如果画图报错：放到CPU--》plot_loss_avg.cpu().detach().numpy()
                plot_loss_list.append(plot_loss_avg.cpu().detach().numpy())
                plot_loss_total = 0

        # 保存模型
        torch.save(my_encoder.state_dict(), './ai19_model/my_encoder_%s.pth'%(epoch_idx+1))
        torch.save(my_attenDecoder.state_dict(), './ai19_model/my_decoder_%s.pth'%(epoch_idx+1))


    # 画图
    plt.figure()
    plt.plot(plot_loss_list)
    plt.savefig("./ai19_seq2se1_loss.png")
    plt.show()

    return plot_loss_list
```

6.2 模型训练内部迭代函数代码实现

```python
# 定义内部迭代函数
def Train_Iters(x, y, my_encoder, my_attenDecoder, encoder_optimizer, decoder_optimizer, crossentropy):
    # 1.将x送入编码器得到编码的结果
    # print(f'x-->{x.shape}')
    # print(f'y-->{y.shape}')
    h0 = my_encoder.inithidden()
    encoder_output, encoder_hidden = my_encoder(x, h0)
    # print(f'encoder_output--》{encoder_output.shape}')
    # print(f'encoder_hidden--》{encoder_hidden.shape}')
    # 2. 定义解码器的参数
    # 2.1 中间语意张量C：value
    encoder_output_c = torch.zeros(MAX_LENGTH, my_encoder.hidden_size, device=device)
    for i in range(x.shape[1]):
        encoder_output_c[i] = encoder_output[0][i]
    # 2.2 解码器的初始化的hidden, key
    decoder_hidden = encoder_hidden
    # 2.3 解码器的初始化输出：query
    input_y = torch.tensor([[SOS_token]], dtype=torch.long, device=device)

    # 3.定义一个初始化的损失
    my_loss = 0.0
    # 4.选择性的使用teacher_forcing策略
    teacher_forcing = True if random.random() < teacher_forcing_ratio else False
    # 5.开始计算损失
    if teacher_forcing:
        for i in range(y.shape[1]):
            # output_y--》[1, 4345]
            output_y, decoder_hidden, attn_weight =my_attenDecoder(input_y, decoder_hidden, encoder_output_c)
            # 根据预测结果计算损失
            target_y = y[0][i].view(1)
            # print(f'target_y--》{target_y}')

            my_loss = my_loss + crossentropy(output_y, target_y)
            # print(f'my_loss--》{my_loss}')
            # 将真实的下一个单词当作input_y
            input_y = y[0][i].view(1, -1)
            # print(f'input_y--》{input_y}')
    else:
        for i in range(y.shape[1]):
            # output_y--》[1, 4345]
            output_y, decoder_hidden, attn_weight = my_attenDecoder(input_y, decoder_hidden, encoder_output_c)
            # 根据预测结果计算损失
            target_y = y[0][i].view(1)
            my_loss = my_loss + crossentropy(output_y, target_y)
            topv, topi = output_y.topk(1)
            # 如果output_y预测的最大值对应的索引刚好等EOS，直接终止
            if topi.squeeze().item() == EOS_token:
                break
            # 将预测结果的当作下一个input_y
            input_y = topi.detach()

    # 6. 梯度清零
    encoder_optimizer.zero_grad()
    decoder_optimizer.zero_grad()
    # 7. 反向传播
    my_loss.backward()
    # 8.梯度更新
    encoder_optimizer.step()
    decoder_optimizer.step()

    return my_loss / y.shape[1]
```

### 7 模型预测

基本过程

```properties
1.获取数据
2.数据预处理
3.实例化模型: 编码器和解码器
4.加载模型训练好的参数: model.load_state_dict(torch.load("model_path"))
5.with torch.no_grad():
6.将数据送入模型进行预测（注意:张量的形状变换）
```

主代码实现

```python
# 9.定义模型评估/预测函数
def test_Seq2Seq_Evaluate():
    # 1.加载训练好的编码器模型
    my_encoder = EncoderGRU(vocab_size=english_word_n, hidden_size=256).to(device)
    my_encoder.load_state_dict(torch.load("./ai19_model/my_encoder_1.pth"))
    # my_encoder.to(device)
    print(my_encoder)
    # 2.加载训练好的解码器模型
    my_decoder = AttentionDecoderGRU(vocab_size=french_word_n, hidden_size=256).to(device)
    my_decoder.load_state_dict(torch.load("./ai19_model/my_decoder_1.pth"))
    # my_decoder.load_state_dict(torch.load("./ai19_model/my_decoder_1.pth", map_location="cpu"), strict=False)
    print(my_decoder)
    print('*'*80)
    # 3.准备样本

    my_samplepairs =[['i m impressed with your french .', 'je suis impressionne par votre francais .'],
                     ['i m more than a friend .', 'je suis plus qu une amie .'],
                     ['she is beautiful like her mother .', 'elle est belle comme sa mere .']]
    print('my_samplepairs--->', len(my_samplepairs))

    # 4. 将样本输入模型得到结果
    for index, pair in enumerate(my_samplepairs[2:]):
        x = pair[0]
        y = pair[1]
        # 需要对x英文文本进行处理
        x_word2id = [english_word2index[word] for word in x.split(' ')]
        # print(f'x_word2id--》{x_word2id}')
        tensor_x = torch.tensor([x_word2id], dtype=torch.long, device=device)
        # print(f'tensor_x-->{tensor_x}')
        decoder_words, attention_weights = evaluate_seq2seq(tensor_x, my_encoder, my_decoder)
        decoder_french = ' '.join(decoder_words)
        print("*"*80)
        print(f'原始的英文输入文本是---》{x}')
        print(f'原始的法文标签文本是---》{y}')
        print(f'模型预测的法文---》{decoder_french}')
```

内部评估代码实现

```python
def evaluate_seq2seq(x, encoder, decoder):
    # x代表当前需要翻译的英文文本
    # encoder代表编码器模型
    # decoder代表解码器模型
    # 1. 将x送入编码器得到编码结果
    # print(f'x---》{x.shape}')
    with torch.no_grad():
      h0 = encoder.inithidden()
      encoder_outputs, encoder_hidden = encoder(x, h0)
      # 2. 准备解码的参数
      # 2.1 编码器结果--Value
      encoder_outputs_c = torch.zeros(MAX_LENGTH, encoder.hidden_size, device=device)
      for index in range(x.shape[1]):
          encoder_outputs_c[index] = encoder_outputs[0][index]
      # 2.2 解码器的key
      decode_hidden = encoder_hidden

      # 2.3 解码器的原始输入
      input_y = torch.tensor([[SOS_token]], dtype=torch.long, device=device)

      # 3.准备变量
      # 3.1 存储模型的预测结果
      decoder_words = []
      # 3.2 初始化一个全0的权重矩阵：存储每一步解码出来的注意力权重
      attention_weights = torch.zeros(MAX_LENGTH, MAX_LENGTH, device=device)
      # 4.进行模型的预测
      index = 0

      for i in range(MAX_LENGTH):
          output_y, decode_hidden, atten = decoder(input_y, decode_hidden, encoder_outputs_c)
          # 获取output_y预测的最大概率值对应索引
          topv, topi  = output_y.topk(1)
          # print(f'topi--》{topi}')
          # print(f'atten-->{atten}')
          # 将真实的注意力权重赋值给attention_weights
          # print(f' attention_weights[i]-->{ attention_weights[i]}')
          attention_weights[i] = atten
          if topi.item() == EOS_token:
              decoder_words.append("<EOS>")
              break
          else:
              decoder_words.append(french_index2word[topi.item()])
          input_y = topi.detach()
          index = i

      print(f'attention_weights--》{attention_weights}')
      return decoder_words, attention_weights[:index+1]

```

注意力图

```python
# 10.注意力图展示
def test_attention_plot():
    # 1.加载训练好的编码器模型
    my_encoder = EncoderGRU(vocab_size=english_word_n, hidden_size=256).to(device)
    my_encoder.load_state_dict(torch.load("./ai19_model/my_encoder_1.pth"))
    # my_encoder.to(device)
    print(my_encoder)
    # 2.加载训练好的解码器模型
    my_decoder = AttentionDecoderGRU(vocab_size=french_word_n, hidden_size=256).to(device)
    my_decoder.load_state_dict(torch.load("./ai19_model/my_decoder_1.pth"))
    # my_decoder.load_state_dict(torch.load("./ai19_model/my_decoder_1.pth", map_location="cpu"), strict=False)
    print(my_decoder)
    print('*' * 80)
    sentence = "we re both teachers ."
    # 需要对x英文文本进行处理
    x_word2id = [english_word2index[word] for word in sentence.split(' ')]
    # print(f'x_word2id--》{x_word2id}')
    tensor_x = torch.tensor([x_word2id], dtype=torch.long, device=device)
    # print(f'tensor_x-->{tensor_x}')
    decoder_words, attention_weights = evaluate_seq2seq(tensor_x, my_encoder, my_decoder)

    plt.matshow(attention_weights.cpu().detach().numpy())
    plt.savefig('./ai19_attention.png')
    plt.show()
```

