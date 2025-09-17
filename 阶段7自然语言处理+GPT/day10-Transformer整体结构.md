# Day10_Transformer模型架构

------

## 六、子层连接结构

结构图：

![image-20230611235106582](img/image-20230611235106582.png)

代码实现：

```properties
class SublayerConnection(nn.Module):
    def __init__(self, size, dropout=0.1):
        # 参数size 词嵌入维度尺寸大小
        # 参数dropout 置零比率

        super(SublayerConnection, self).__init__()
        # 定义norm层
        self.norm = LayerNorm(size)
        # 定义dropout
        self.dropout = nn.Dropout(dropout)

    def forward(self, x, sublayer):
        # 参数x 代表数据
        # sublayer 函数入口地址 子层函数(前馈全连接层 或者 注意力机制层函数的入口地址)
        # 方式1 # 数据self.norm() -> sublayer()->self.dropout() + x
        myres = x + self.dropout(sublayer(self.norm(x)))
        # 方式2 # 数据sublayer() -> self.norm() ->self.dropout() + x
        # myres = x + self.dropout(self.norm(sublayer(x)))
        return myres
```

------

## 七、编码器层

结构图：

![image-20230611235248501](img/image-20230611235248501.png)

作用：

```properties
, 每个编码器层完成一次对输入的特征提取过程, 即编码过程.
```

代码实现：

```properties

class EncoderLayer(nn.Module):
    def __init__(self, size, self_atten, feed_forward, dropout):

        super(EncoderLayer, self).__init__()
        # 实例化多头注意力层对象
        self.self_attn = self_atten

        # 前馈全连接层对象feed_forward
        self.feed_forward = feed_forward

        # size词嵌入维度512
        self.size = size

        # clones两个子层连接结构 self.sublayer = clones(SublayerConnection(size,dropout),2)
        self.sublayer = clones(SublayerConnection(size, dropout) ,2)

    def forward(self, x, mask):

        # 数据经过第1个子层连接结构
        # 参数x：传入的数据  参数lambda x... : 子函数入口地址
        x = self.sublayer[0](x, lambda x:self.self_attn(x, x, x, mask))

        # 数据经过第2个子层连接结构
        # 参数x：传入的数据  self.feed_forward子函数入口地址
        x = self.sublayer[1](x, self.feed_forward)
        return  x
```

## 八、编码器

![image-20230611235404513](img/image-20230611235404513.png)

代码实现：

```properties

class Encoder(nn.Module):
    def __init__(self, layer, N):
        # 参数layer 1个编码器层
        # 参数 编码器层的个数

        super(Encoder, self).__init__()

        # 实例化多个编码器层对象
        self.layers = clones(layer, N)

        # 实例化规范化层
        self.norm = LayerNorm(layer.size)

    def forward(self, x, mask):
        # 数据经过N个层 x = layer(x, mask)
        for layer in self.layers:
            x = layer(x, mask)

        #  返回规范化后的数据 return self.norm(x)
        return self.norm(x)
```

## 九、解码器部分

结构图：

![image-20230611235709413](img/image-20230611235709413.png)

组成部分：

```properties
1、N个解码器层堆叠而成
2、每个解码器层由三个子层连接结构组成
3、第一个子层连接结构：多头自注意力（masked）层+ 规范化层+残差连接
4、第二个子层连接结构：多头注意力层+ 规范化层+残差连接
5、第三个子层连接结构：前馈全连接层+ 规范化层+残差连接
```

## 十、解码器层

作用：

```properties
作为解码器的组成单元, 每个解码器层根据给定的输入向目标方向进行特征提取操作
```

代码实现：

```properties
class DecoderLayer(nn.Module):
    def __init__(self, size, self_attn, src_attn, feed_forward, dropout):
        super(DecoderLayer, self).__init__()
        # 词嵌入维度尺寸大小
        self.size = size
        # 自注意力机制层对象 q=k=v
        self.self_attn = self_attn
        # 一遍注意力机制对象 q!=k=v
        self.src_attn = src_attn
        # 前馈全连接层对象
        self.feed_forward = feed_forward
        # clones3子层连接结构
        self.sublayer = clones(SublayerConnection(size, dropout), 3)

    def forward(self, x, memory, source_mask, target_mask):
        m = memory
        # 数据经过子层连接结构1
        x = self.sublayer[0](x, lambda x:self.self_attn(x, x, x, target_mask))
        # 数据经过子层连接结构2
        x = self.sublayer[1](x, lambda x:self.src_attn (x, m, m, source_mask))
        # 数据经过子层连接结构3
        x = self.sublayer[2](x, self.feed_forward)
        return  x
```

## 十一、解码器

作用：

```properties
根据编码器的结果以及上一次预测的结果, 对下一次可能出现的'值'进行特征表示
```

代码实现：

```properties

class Decoder(nn.Module):

    def __init__(self, layer, N):
        # 参数layer 解码器层对象
        # 参数N 解码器层对象的个数

        super(Decoder, self).__init__()

        # clones N个解码器层
        self.layers = clones(layer, N)

        # 定义规范化层
        self.norm = LayerNorm(layer.size)

    def forward(self, x, memory, source_mask, target_mask):

        # 数据以此经过各个子层
        for layer in self.layers:
            x = layer(x, memory, source_mask, target_mask)

        # 数据最后经过规范化层
        return self.norm(x)
```

## 十二、输出部分

```pro
作用：通过线性变化得到指定维度的输出
```

代码

```properties
class Generator(nn.Module):
    def __init__(self, d_model, vocab_size):
        # 参数d_model 线性层输入特征尺寸大小
        # 参数vocab_size 线层输出尺寸大小
        super(Generator, self).__init__()
        # 定义线性层
        self.project = nn.Linear(d_model, vocab_size)

    def forward(self, x):
        # 数据经过线性层 最后一个维度归一化 log方式
        x = F.log_softmax(self.project(x), dim=-1)
        return x
```



## 十三、Transformer模型搭建

完整的编码器-解码器结构：

![image-20230611235828839](img/image-20230611235828839.png)

### 1、编码器-解码器结构的代码：

```properties
class EncoderDecoder(nn.Module):
    def __init__(self, encoder, decoder, src_embed, tgt_embed, generator):
        super().__init__()
        # 编码器对象
        self.encoder = encoder
        # 解码器对象
        self.decoder = decoder
        # 编码器输入部分对象：wordEmbedding+positionEncoding
        self.src_embed = src_embed
        # 解码器输入部分对象：wordEmbedding+positionEncoding
        self.tgt_embed = tgt_embed
        # 输出部分对象
        self.generator = generator

    def forward(self, source, target, source_mask, target_mask):
        # source代表原始编码器的输入：比如[2, 4]
        # target代表原始解码器的输入：比如[2, 4]
        # source_mask[8, 4, 4]本质代表是padding——mask，用在编码器的多头自注意力计算以及，解码器第二个子层的多头注意力计算
        # target_mask[8, 4, 4] 本质代表是sentence-mask,用在解码器的第一个子层的多头自注意力计算
        # 将source送入编码器输入部分对象：wordEmbedding+positionEncoding
        encoder_embed_x = self.src_embed(source) # [2, 4, 512]
        # 将embed_x送入encoder
        encoder_result = self.encoder(encoder_embed_x, source_mask) # [2, 4, 512]
        # 将target送入编码器输入部分对象：wordEmbedding+positionEncoding
        decoder_embed_x = self.tgt_embed(target)
        #将数据送入解码器，得到解码结果
        decoder_result = self.decoder(decoder_embed_x, encoder_result, source_mask, target_mask)
        # 将解码器的输出送入输出层
        output = self.generator(decoder_result)
        return output
```

### 2、Tansformer模型构建代码：

```properties
def make_model(source_vocab, target_vocab, N=6, d_model=512, d_ff=1024, head=8, dropout_p=0.1):
    # 得到深拷贝函数的对象
    c = copy.deepcopy
    # 实例化多头注意力机制对象
    attn = MutiHeadAttention(embed_dim=d_model, head=head, dropout_p=dropout_p)
    # 实例化前馈全连接层对象
    ff = FeedForward(d_model=d_model, d_ff=d_ff, dropout_p=dropout_p)
    # 文本嵌入层实例化对象:编码器
    encode_embed = Embeddings(vocab_size=source_vocab, d_model=d_model)
    # 位置编码实例化对象
    position = PositionEncoding(d_model=d_model, dropout=dropout_p, max_len=2000)
    # 文本嵌入层实例化对象:解码器
    decode_embed = Embeddings(vocab_size=target_vocab, d_model=d_model)
    # 实例化输出层
    generator = Generator(d_model=d_model, vocab_size=target_vocab)
    # 实例化encoder_decoder模型
    model = EncoderDecoder(encoder=Encoder(EncoderLayer(d_model, c(attn), c(ff),dropout_p), N),
                           decoder=Decoder(DecoderLayer(d_model, c(attn), c(attn), c(ff), dropout_p), N),
                           src_embed=nn.Sequential(encode_embed, c(position)),
                           tgt_embed=nn.Sequential(decode_embed,c(position)),
                           generator=generator)

    # 对参数进行初始化
    for p in model.parameters():
        if p.dim() > 1:
            nn.init.xavier_uniform_(p)
    return model
```

```properties
 nn.Sequential（）理解
 import torch
import torch.nn as nn

class My_Model(nn.Module):
    # def __init__(self, vocab_size, d_model, output_size=10):
    #     super().__init__()
    #     self.embed = nn.Embedding(vocab_size, d_model)
    #     self.linear1 = nn.Linear(d_model, 8)
    #     self.linear2 = nn.Linear(8, output_size)

    def __init__(self, vocab_size, d_model, output_size=10):
        super().__init__()
        self.sqeuen = nn.Sequential( nn.Embedding(vocab_size, d_model),
                                     nn.Linear(d_model, 8),
                                     nn.Linear(8, output_size))


    # def forward(self, x):
    #     x = self.embed(x)
    #     x = self.linear1(x)
    #     x = self.linear2(x)
    #     return x

    def forward(self, x):
        x = self.sqeuen(x)
        return x


if __name__ == '__main__':
    x = torch.tensor([[1,2,3],[4,5,6]], dtype=torch.long)
    my_model = My_Model(20, 4)
    result = my_model(x)
    print(result)
    print(result.shape)
```

