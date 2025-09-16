# Transformer模型

### 1 Transformer 的诞生

2017年提出，2018年google发表了BERT模型，使得Transformer架构流行起来，BERT在许多NLP任务上，取得了Soat的成就。



### 2. Transformer 的优势

相比当时主流的 **LSTM** 和 **GRU** 模型，Transformer 具备两个显著优势：

- **并行训练能力强**：能够利用分布式 GPU 进行并行训练，显著提升模型训练效率。
- **长距离依赖建模能力强**：在分析和预测更长文本时，能更有效地捕捉间隔较远的语义关联。



### 3 Transformer的模型架构

架构图展示：

![1686470795495](assets/day09/1686470795495.png)

#### 3.1 整体架构

主要组成部分

```properties
1、输入部分
2、编码器部分
3、解码器部分
4、输出部分
```

#### 3.2 输入部分

![img](assets/5.png)

```properties
word Embeddding + Positional Encoding
词嵌入层+位置编码器层
```

#### 3.3 输出部分

![img](assets/6.png)

```properties
1、Linear层
2、softmax层
```

#### 3.4 编码器部分

结构图：

![1686470985980](assets/day09/1686470985980.png)

组成部分：

```properties
1、N个编码器层堆叠而成（原论文中，N=6）
2、每个编码器有两个子层连接结构构成
3、第一个子层连接结构：多头自注意力层+规范化层+残差连接层
4、第二个子层连接结构：前馈全连接层+规范化层+残差连接层
```

#### 3.5 解码器部分

结构图：

![image-20250916145522257](assets/image-20250916145522257.png)

组成部分：

```properties
1、N个解码器堆叠而成（原论文中，N=6）
2、每个解码器有三个子层连接结构构成
3、第一个子层连接结构：多头自注意力层+规范化层+残差连接层
4、第二个子层连接结构：多头注意力层+规范化层+残差连接层
5、第三个子层连接结构：前馈全连接层+规范化层+残差连接层
```



## 一、 输入部分

![img](assets/5-1758006055839-3.png)

#### 1.1 输入部分介绍

输入部分包含两个主要模块：

- **源文本嵌入层（Source Embedding）**
- **目标文本嵌入层（Target Embedding）**

两者都配有 **位置编码器（Positional Encoding）**，用于为词向量添加位置信息。



#### 1.2 文本嵌入层的作用

- 将词汇的 **数字索引** 转换为 **高维向量表示**。
- 在高维空间中捕捉词汇之间的语义关系。
- 提升模型对词语语义的理解能力。



#### 1.3 文本嵌入层代码实现

```python
class Embeddings(nn.Module):
    def __init__(self, d_model, vocab):
        """
        初始化词嵌入层
        :param d_model: 词嵌入维度（如512）
        :param vocab: 词汇表大小
        """
        super().__init__()
        self.d_model = d_model
        self.vocab = vocab
        # 定义嵌入层：将词汇索引映射为d_model维向量
        self.lut = nn.Embedding(vocab, d_model)

    def forward(self, x):
        """
        前向传播
        :param x: 输入的词汇索引张量，形状为 [batch_size, seq_len]
        :return: 嵌入后的张量，形状为 [batch_size, seq_len, d_model]
        """
        # 乘以 sqrt(d_model) 是为了缩放嵌入值，便于后续与位置编码相加
        return self.lut(x) * math.sqrt(self.d_model)    
```

> **注意：为什么`embedding`之后要乘以$\sqrt{d_{\text{model}}}$ ？**
>
> 这是一个非常经典的 Transformer 实现细节，embedding 后乘以 $\sqrt{d_{\text{model}}}$ 的核心原因是：
>
> **让 embedding 的尺度与后续 positional encoding 的尺度相匹配，避免 positional 信息被“淹没”。**
>
> 
>
> **1. Embedding 的初始化尺度**
>
> 在 PyTorch 中，`nn.Embedding` 默认使用 $\mathcal{N}(0, 1)$ 初始化权重，即每个维度的方差是 1。
>
> 所以，embedding 向量每个维度的**标准差**是 1，与维度无关。
>
> **2. Positional Encoding 的尺度**
>
> Transformer 中的 positional encoding 使用的是**正弦/余弦函数**：
>
> $$PE_{(pos,2i)} = \sin\left(\frac{pos}{10000^{2i/d_{\text{model}}}}\right)\quad\quad PE_{(pos,2i+1)} = \cos\left(\frac{pos}{10000^{2i/d_{\text{model}}}}\right)$$
> 
>
> 这些值的范围在 $[-1, 1]$ 之间，与维度无关，尺度大致稳定。
>
> **3. 问题：维度越大，embedding 的 L2 范数越大**
>
> 虽然每个维度的方差是 1，但 $d_{\text{model}}$ 越大，embedding 向量的 L2 范数越大（因为维度多了）。
>
> - 例如：$d_{\text{model}} = 512$ 时，embedding 向量的 L2 范数期望是 $\sqrt{512} \approx 22.6$
> - 而 positional encoding 的 L2 范数与维度无关，始终在一个较小范围
>
> **4. 结果：positional encoding 被“淹没”**
>
> 如果不做缩放，embedding 的尺度远大于 positional encoding，模型会几乎忽略掉位置信息。
>
> 
>
> **解决方案：乘以 $\sqrt{d_{\text{model}}}$**
>
> 通过乘以 $\sqrt{d_{\text{model}}}$，embedding 的每个维度尺度被放大，但整体向量的 L2 范数变得与 $d_{\text{model}}$ 无关，从而与 positional encoding 的尺度匹配。



#### 1.4 位置编码器的作用

- Transformer 没有循环结构，无法捕捉序列顺序。
- 位置编码器为每个词向量添加 **位置信息**，将词汇的位置可能代表的不同特征信息和`word_embedding`进行融合，以此来弥补位置信息的缺失。



#### 1.5 位置编码器代码实现

```properties
1、保证同一词汇随着所在位置不同它对应位置嵌入向量会发生变化
2、正弦波和余弦波的值域范围都是1到-1这又很好的控制了嵌入数值的大小, 有助于梯度的快速计算
```

```python
class PositionalEncoding(nn.Module):
    """
    Transformer 的位置编码器

    输入：
        x: [batch_size, seq_len, d_model]  已做过词嵌入的张量
    输出：
        与 x 形状相同的张量，但每一时刻都叠加了对应的位置编码
    """

    def __init__(self, d_model: int, dropout: float = 0.1, max_len: int = 5000):
        """
        参数说明
        ----------
        d_model : 词嵌入维度（也是 PE 的维度）
        dropout : Dropout 概率
        max_len : 预编码的最大序列长度，可根据任务调大/调小
        """
        super(PositionalEncoding, self).__init__()

        # ---------- 1. 预计算位置编码 ----------
        pe = torch.zeros(max_len, d_model)              # [max_len, d_model]
        position = torch.arange(0, max_len).unsqueeze(1)  # [max_len, 1]

        # 分母项：10000^(2i/d_model) 取对数后一次算完，数值更稳定
        div_term = torch.exp(
            torch.arange(0, d_model, 2) *
            -(math.log(10000.0) / d_model)
        )                                               # [d_model//2]

        # 奇数列 sin，偶数列 cos
        pe[:, 0::2] = torch.sin(position * div_term)   # 偶数索引
        pe[:, 1::2] = torch.cos(position * div_term)   # 奇数索引

        # 增加 batch 维度，方便后续广播
        pe = pe.unsqueeze(0)                           # [1, max_len, d_model]

        # 注册为 buffer：随模型保存/加载，但不参与反向传播
        # 什么是buffer: 对模型效果有帮助的，但是却不是模型结构中超参数或者参数，不参与模型训练
        self.register_buffer('pe', pe)

        # ---------- 2. Dropout ----------
        self.dropout = nn.Dropout(p=dropout)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        前向逻辑
        ----------
        x : [batch_size, seq_len, d_model]
        """
        # 按实际序列长度截取 PE，并设为不需要梯度
        # 注意：输入的x形状2*4*512  pe是1*60*512 形状 如何进行相加（广播机制）
        x = x + Variable(self.pe[:, :x.size(1)], requires_grad=False)
        return self.dropout(x)
```
> **为什么使用三角函数来进行位置编码：**
>
> 当然！这是一个非常核心且精彩的问题。Transformer 模型使用三角函数进行位置编码，是其设计中的一个神来之笔。原因可以归结为以下几个核心点：
>
> **1. 根本原因：自注意力机制的排列不变性**
>
> 这是最根本的出发点。Transformer 的核心—自注意力机制（Self-Attention）—在处理一个序列时，是**同时**查看所有词的，而不是像 RNN 那样逐个查看。
>
> - **问题**：对于自注意力机制来说，输入 `[“是”, “的”, “今天”, “好”, “天气”]` 和 `[“天气”, “好”, “是”, “今天”, “的”]` 是没有区别的。它只关心词与词之间的关联强度（通过点积计算），而完全丢失了它们在序列中的**顺序信息**。
> - **需求**：因此，我们必须**显式地**将每个词的位置信息注入到模型中，否则模型就无法理解语言的顺序结构（“狗咬人” vs “人咬狗”）。
>
> 
>
> **2. 为什么选择“正弦和余弦”函数？**
>
> 解决了“为什么需要”的问题，接下来是“为什么是它”。作者选择三角函数而不是简单的位置编号（1, 2, 3, ...）或其他方法，主要基于三角函数几个完美的数学性质：
>
> **性质一：能够编码绝对位置，同时蕴含相对位置信息**
>
> 模型不仅能知道每个词是“第几个”（绝对位置），更能轻松地学到词与词之间“相隔多远”（相对位置）。
>
> - **数学魔法**：对于某个位置 `pos` 和偏移量 `k`，位置 `pos + k` 的位置编码可以被表示为位置 `pos` 的位置编码的**线性函数**。
>   - 具体来说，存在一个线性变换矩阵 `M`，使得：
>     `PE(pos + k) = M · PE(pos)`
>   - 这意味着，模型可以通过学习这个变换 `M`，来轻松地推断出和关注到任意相对距离 `k` 的词，这比从头学习每个绝对位置要高效和泛化得多。
>
> 
>
> **性质二：值域有界且平滑，易于模型学习**
>
> 正弦和余弦函数的值域在 `[-1, 1]` 之间，这与词嵌入向量经过归一化后的值域范围是匹配的。这种有界性不会给模型带来巨大的数值波动，使得训练过程更稳定。同时，函数曲线是平滑的，相邻位置的值变化很小，符合“相邻位置应该相似”的直觉。
>
> 
>
> **性质三：可以处理任意长度的序列（外推性）**
>
> 模型在训练时可能只见过长度为 512 的句子，但在推理时可能遇到长度为 600 的句子。
>
> - 如果用**可学习的位置编码（Learned Positional Embedding）**，模型就无法处理比训练时更长的序列，因为它没见过 513、514 等位置的特征。
> - 而**正弦位置编码**是**确定性的公式计算**出来的。你可以为**任何位置**（哪怕是第 10000 位）计算出一个唯一的位置编码向量。这使得 Transformer 理论上可以处理无限长的序列，尽管在实际中由于注意力计算复杂度的限制，性能会下降，但至少从输入上是可行的。
>
> 
>
> **性质四：不同维度对应不同波长，提供了丰富的结构性信息**
>
> 公式设计得非常巧妙：
> `PE(pos, 2i) = sin(pos / 10000^(2i/d_model))`
> `PE(pos, 2i+1) = cos(pos / 10000^(2i/d_model))`
>
> - `i` 是维度索引（从 0 到 `d_model/2 - 1`）。
> - 随着维度 `i` 的增大，`10000^(2i/d_model)` 的值会越来越大，频率会越来越低（波长越来越长）。
> - **低维度**（i 小）：波长很短，函数值变化剧烈。这些维度可能编码了非常精细的、近距离的位置关系。
> - **高维度**（i 大）：波长很长，函数值变化缓慢。这些维度可能编码了粗糙的、远距离的、甚至全局的位置关系。
>
> 这种从细到粗的多尺度位置信息，为模型提供了非常丰富的结构性先验。



> **为什么奇偶位置要分别使用正弦和余弦，而不是统一用正弦？**
>
> 这是一个非常深刻和精彩的问题，它触及了Transformer位置编码设计的核心精髓。简单来说，**同时使用正弦和余弦是为了给每个位置创造一个独一无二的、可学习的“指纹”，并且让模型能够轻松地学到单词之间的相对位置关系。**
>
> 如果只使用正弦函数，这个系统就会崩溃。下面我们详细拆解原因。
>
> **1. 最根本的问题：避免不同位置编码相同**
>
> 这是最致命的问题。如果只使用正弦函数（`sin`），**不同的位置可能会产生完全相同的位置编码**。
>
> - **例子**：假设我们有一个非常简单的编码方案：`PE(pos) = sin(pos)`。
>   - 位置 1 的编码：`sin(1) ≈ 0.84`
>   - 位置 1 + 2π 的编码：`sin(1 + 2*3.14) ≈ sin(1 + 6.28) ≈ sin(7.28) ≈ 0.84`
>   - 位置 1 + 4π 的编码同样也是 ≈ 0.84。
>
> 由于正弦函数的周期性，位置 `pos` 和位置 `pos + 2kπ`（k是整数）的编码值是完全相同的。模型将无法区分这些位置，这是一个灾难性的问题。
>
> **原始方案如何解决？**
> 原始公式是 `PE(pos, 2i)=sin(pos / 10000^(2i/d))` 和 `PE(pos, 2i+1)=cos(pos / 10000^(2i/d))`。注意，分母上的 `10000^(2i/d)` 使得每个维度 `i` 都有**不同的频率**。一个维度可能周期很短（例如每2个位置重复一次），另一个维度周期可能很长（例如每10000个位置重复一次）。
>
> - **虽然单个正弦或余弦维度自身是周期性的，但将所有维度的正弦和余弦值组合成一个向量时，整个位置编码向量 `PE_pos` 在实用的序列长度内几乎是独一无二的。** 这就好比用多个不同频率的周期信号组合起来，为每个位置生成一个唯一ID。
>
> 
>
> **2. 核心优势：线性变换表达相对位置**
>
> 这是Transformer作者设计三角函数编码的“神来之笔”。**对于某个固定的偏移量 `k`，位置 `pos + k` 的位置编码可以表示为位置 `pos` 的位置编码的一个线性变换。**
>
> 这意味着，模型可以通过简单的矩阵运算，轻松地根据一个词的位置信息，计算出另一个词相对于它的位置（是下一个词？还是隔了10个词？）。
>
> **数学推导：**
> 假设我们有一个维度，频率是 `ω`。
> 我们知道：
>
> - `PE(pos, 2i) = sin(ω * pos)`
> - `PE(pos, 2i+1) = cos(ω * pos)`
>
> 我们想用 `PE(pos)` 来表示 `PE(pos + k)`。
> 根据三角函数公式：
> `sin(ω(pos + k)) = sin(ω pos)cos(ω k) + cos(ω pos)sin(ω k)`
> `cos(ω(pos + k)) = cos(ω pos)cos(ω k) - sin(ω pos)sin(ω k)`
>
> 这正好可以写成一个矩阵乘法：
> `[sin(ω(pos + k))] = [cos(ω k) sin(ω k)] [sin(ω pos)]`
> `[cos(ω(pos + k))] [-sin(ω k) cos(ω k)] [cos(ω pos)]`
>
> **你看，`PE(pos + k)` 这个向量可以通过一个只依赖于偏移量 `k` 的矩阵 `M`，乘以 `PE(pos)` 这个向量得到。** 这个线性变换的属性对于模型学习“注意力”机制至关重要（例如，学习“关注前一个词”这种模式），因为它提供了强大的**相对位置先验**。
>
> 
>
> **3. 提供丰富且互补的信息**
>
> 正弦（sin）和余弦（cos）函数是相位差为90度的函数，它们提供了互补的信息。想象一个圆：
>
> - `sin` 给你在y轴上的高度。
> - `cos` 给你在x轴上的长度。
>
> 同时知道sin和cos，你就能唯一确定一个点在这个圆上的角度（即位置信息）。如果只知道sin，你会丢失一半的信息，无法确定准确的角度（例如，sin(30°) 和 sin(150°) 的值是相同的）。
>
> 在位置编码中，每个频率的sin和cos配对，为模型提供了更完整、更稳定的位置信息表示。



## 二、编码部分

### 2.1 编码部分组成

```properties
由N个编码器层组成
1、每个编码器层由两个子层连接结构
2、第一个子层连接结构：多头自注意力机制层+残差连接层+规范化层
3、第二个子层连接结构：前馈全连接层+残差连接层+规范层
```

### 2.2 掩码张量

作用：

```properties
掩码：掩就是遮掩、码就是张量。掩码本身需要一个掩码张量，掩码张量的作用是对另一个张量进行数据信息的掩盖。一般掩码张量是由0和1两种数字组成，至于是0对应位置或是1对应位置进行掩码，可以自己设定
掩码分类：
PADDING MASK: 句子补齐的PAD,去除影响
SETENCES MASK:解码器端，防止未来信息被提前利用
```

实现方式：

```properties
# 返回下三角矩阵 torch.from_numpy(1 - my_mask )
def subsequent_mask(size):
    # 产生上三角矩阵 产生一个方阵
    subsequent_mask = np.triu(m = np.ones((1, size, size)), k=1).astype('uint8')
    # 返回下三角矩阵
    return torch.from_numpy(1 - subsequent_mask)
```

## 三、注意力机制

### 3.1 计算规则:

```properties
自注意力机制，规则：Q乘以K的转置，然后除以根号下D_K，然后再进行Softmax，最后和V进行张量矩阵相乘
```

### 3.2 注意力计算

代码实现

```properties
def attention(query, key, value, mask=None, dropout=None):
    # query, key, value：代表注意力的三个输入张量
    # mask：代表掩码张量
    # dropout：传入的dropout实例化对象

    # 1 求查询张量特征尺寸大小
    d_k = query.size()[-1]

    # 2 求查询张量q的权重分布socres  q@k^T /math.sqrt(d_k)
    # [2,4,512] @ [2,512,4] --->[2,4,4]
    scores =  torch.matmul(query, key.transpose(-2, -1) ) / math.sqrt(d_k)

   # 3 是否对权重分布scores 进行 masked_fill
    if mask is not None:
        # 根据mask矩阵0的位置 对sorces矩阵对应位置进行掩码
        scores = scores.masked_fill(mask == 0, -1e9)

    # 4 求查询张量q的权重分布 softmax
    p_attn = F.softmax(scores, dim=-1)

    # 5 是否对p_attn进行dropout
    if dropout is not None:
        p_attn = dropout(p_attn)

    # 返回 查询张量q的注意力结果表示 bmm-matmul运算, 注意力查询张量q的权重分布p_attn
    # [2,4,4]*[2,4,512] --->[2,4,512]
    return torch.matmul(p_attn, value), p_attn
```

### 3.3 多头注意力机制：

概念：

```properties
将模型分为多个头, 可以形成多个子空间, 让模型去关注不同方面的信息, 最后再将各个方面的信息综合起来得到更好的效果.
```

架构图：

![image-20230611234818330](assets/day09/image-20230611234818330.png)

代码实现：

```properties
# 深度copy模型 输入模型对象和copy的个数 存储到模型列表中
def clones(module, N):
    return nn.ModuleList([copy.deepcopy(module) for _ in range(N)])

class MultiHeadedAttention(nn.Module):

    def __init__(self, head, embedding_dim, dropout=0.1):

        super(MultiHeadedAttention, self).__init__()
        # 确认数据特征能否被被整除 eg 特征尺寸256 % 头数8
        assert embedding_dim % head == 0
        # 计算每个头特征尺寸 特征尺寸256 // 头数8 = 64
        self.d_k = embedding_dim // head
        # 多少头数
        self.head = head
        # 四个线性层
        self.linears = clones(nn.Linear(embedding_dim, embedding_dim), 4)
        # 注意力权重分布
        self.attn = None
        # dropout层
        self.dropout = nn.Dropout(p = dropout)

    def forward(self, query, key, value, mask=None):

        # 若使用掩码，则掩码增加一个维度[8,4,4] -->[1,8,4,4]
        if mask is not None:
            mask = mask.unsqueeze(0)

        # 求数据多少行 eg:[2,4,512] 则batch_size=2
        batch_size = query.size()[0]

        # 数据形状变化[2,4,512] ---> [2,4,8,64] ---> [2,8,4,64]
        # 4代表4个单词 8代表8个头 让句子长度4和句子特征64靠在一起 更有利捕捉句子特征
        query, key, value = [model(x).view(batch_size, -1, self.head, self.d_k).transpose(1,2)
            for model, x in zip(self.linears, (query, key, value) ) ]

        # myoutptlist_data = []
        # for model, x in zip(self.linears, (query, key, value)):
        #     print('x--->', x.shape) # [2,4,512]
        #     myoutput = model(x)
        #     print('myoutput--->',  myoutput.shape)  # [2,4,512]
        #     # [2,4,512] --> [2,4,8,64] --> [2,8,4,64]
        #     tmpmyoutput = myoutput.view(batch_size, -1,  self.head, self.d_k).transpose(1, 2)
        #     myoutptlist_data.append( tmpmyoutput )
        # mylen = len(myoutptlist_data)   # mylen:3
        # query = myoutptlist_data[0]     # [2,8,4,64]
        # key = myoutptlist_data[1]       # [2,8,4,64]
        # value = myoutptlist_data[2]     # [2,8,4,64]

        # 注意力结果表示x形状 [2,8,4,64] 注意力权重attn形状：[2,8,4,4]
        # attention([2,8,4,64],[2,8,4,64],[2,8,4,64],[1,8,4,4]) ==> x[2,8,4,64], self.attn[2,8,4,4]]
        x, self.attn = attention(query, key, value, mask=mask, dropout=self.dropout)

        # 数据形状变化 [2,8,4,64] ---> [2,4,8,64] ---> [2,4,512]
        x = x.transpose(1,2).contiguous().view(batch_size, -1, self.head*self.d_k)

        # 返回最后变化后的结果 [2,4,512]---> [2,4,512]
        return self.linears[-1](x)
```

------

## 四、前馈全连接层

概念：

```properties
两个全连接层
```

作用：

```properties
增强模型的拟合能力
```

代码实现：

```properties
class PositionwiseFeedForward(nn.Module):
    def __init__(self,  d_model, d_ff, dropout=0.1):
        # d_model  第1个线性层输入维度
        # d_ff     第2个线性层输出维度
        super(PositionwiseFeedForward, self).__init__()
        # 定义线性层w1 w2 dropout
        self.w1 = nn.Linear(d_model, d_ff)
        self.w2 = nn.Linear(d_ff, d_model)
        self.dropout = nn.Dropout(p= dropout)

    def forward(self, x):
        # 数据依次经过第1个线性层 relu激活层 dropout层，然后是第2个线性层
        return  self.w2(self.dropout(F.relu(self.w1(x))))
```

## 五、规范化层

作用：

```properties
随着网络深度的增加，模型参数会出现过大或过小的情况，进而可能影响模型的收敛，因此进行规范化，将参数规范致某个特征范围内，辅助模型快速收敛。
```

代码实现:

```properties
class LayerNorm(nn.Module):

    def __init__(self, features, eps=1e-6):
        # 参数features 待规范化的数据
        # 参数 eps=1e-6 防止分母为零

        super(LayerNorm, self).__init__()

        # 定义a2 规范化层的系数 y=kx+b中的k
        self.a2 = nn.Parameter(torch.ones(features))

        # 定义b2 规范化层的系数 y=kx+b中的b
        self.b2 = nn.Parameter(torch.zeros(features))

        self.eps = eps

    def forward(self, x):

        # 对数据求均值 保持形状不变
        # [2,4,512] -> [2,4,1]
        mean = x.mean(-1,keepdims=True)

        # 对数据求方差 保持形状不变
        # [2,4,512] -> [2,4,1]
        std = x.std(-1, keepdims=True)

        # 对数据进行标准化变换 反向传播可学习参数a2 b2
        # 注意 * 表示对应位置相乘 不是矩阵运算
        y = self.a2 * (x-mean)/(std + self.eps) + self.b2
        return  y
```

------



