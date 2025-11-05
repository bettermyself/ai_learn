# Transformer精选问答

## 1 Transformer各自模块作用

- Encoder模块
  - 经典的Transformer架构中的Encoder模块包含6个Encoder Block.
  - 每个Encoder Block包含两个子模块, 分别是多头自注意力层, 和前馈全连接层.
    - 多头自注意力层采用的是一种Scaled Dot-Product Attention的计算方式, 实验结果表明, Mul ti-head可以在更细致的层面上提取不同head的特征, 比单一head提取特征的效果更佳.
    - 前馈全连接层是由两个全连接层组成, 线性变换中间增添一个Relu激活函数, 具体的维度采用4倍关系, 即多头自注意力的d_model=512, 则层内的变换维度d_ff=2048.
- Decoder模块
  - 经典的Transformer架构中的Decoder模块包含6个Decoder Block.
  - 每个Decoder Block包含3个子模块, 分别是多头自注意力层, Encoder-Decoder Attention层, 和前馈全连接层.
    - 多头自注意力层采用和Encoder模块一样的Scaled Dot-Product Attention的计算方式, 最大的 区别在于需要添加look-ahead-mask, 即遮掩"未来的信息".
    - Encoder-Decoder Attention层和上一层多头自注意力层最主要的区别在于Q != K = V, 矩阵Q来源于上一层Decoder Block的输出, 同时K, V来源于Encoder端的输出.
    - 前馈全连接层和Encoder中完全一样.
- Add & Norm模块
  - Add & Norm模块接在每一个Encoder Block和Decoder Block中的每一个子层的后面.
  - 对于每一个Encoder Block, 里面的两个子层后面都有Add & Norm.
  - 对于每一个Decoder Block, 里面的三个子层后面都有Add & Norm.
  - Add表示残差连接, 作用是为了将信息无损耗的传递的更深, 来增强模型的拟合能力.
  - Norm表示LayerNorm, 层级别的数值标准化操作, 作用是防止参数过大过小导致的学习过程异常, 模型收敛特别慢的问题.
- 位置编码器Positional Encoding
  - Transformer中采用三角函数来计算位置编码.
  - 因为三角函数是周期性函数, 不受序列长度的限制, 而且这种计算方式可以对序列中不同位置的编码的重要程度同等看待.
- 本节常见问答
  - Transformer的结构是什么样的? 各个子模块各有什么作用?

## 2 Transformer Decode模块

- 在Transformer结构中的Decoder模块的输入, 区分于不同的Block, 最底层的Block输入有其特殊的地方. 第二层到第六层的输入一致, 都是上一层的输出和Encoder的输出.
- 最底层的Block在训练阶段, 每一个time step的输入是上一个time step的输入加上真实标签序列向后移一位. 具体来看, 就是每一个time step的输入序列会越来越长, 不断的将之前的输入融合进来.
- 最底层的Block在训练阶段, 真实的代码实现中, 采用的是MASK机制来模拟输入序列不断添加的过程.
- 最底层的Block在预测阶段, 每一个time step的输入是从time step=0开始, 一直到上一个time step的预测值的累积拼接张量. 具体来看, 也是随着每一个time step的输入序列会越来越长. 相比于训练阶段最大的不同是这里不断拼接进来的token是每一个time step的预测值, 而不是训练阶段每一个time step取得的groud truth值.

## 3 self attention机制详解

- self-attention机制的重点是使用三元组(Q, K, V)参与规则运算, 这里面Q=K=V.
- self-attention最大的优势是可以方便有效的提取远距离依赖的特征和结构信息, 不必向RNN那样依次计算产生传递损耗.
- 关于self-attention采用三元组的原因, 经典实现的方式数学意义明确, 理由充分, 至于其他方式的可行性暂时没有论文做充分的对比试验研究.
- 学习了softmax函数的输入是如何影响输出分布的.
  - softmax函数本质是对输入的数据分布做一次归一化处理, 但是输入元素的数量级对softmax最终的分布影响非常之大.
  - 在输入元素的数量级较大时, softmax函数几乎将全部的概率分布都分配给了最大值分量所对应的标签.
- 学习了softmax函数在反向传播的过程中是如何梯度求导的.
  - 具体的推导过程见讲义正文部分, 注意要分两种情况讨论, 分别处理.
- 学习了softmax函数出现梯度消失现象的原因.
  - 结合第一步, 第二步的结论, 可以很清楚的看到最终的梯度矩阵接近于零矩阵, 这样在进行参数更新的时候就会产生梯度消失现象.
- 学习了维度和点积大小的关系推导.
  - 通过期望和方差的推导理解了为什么点积会造成方差变大.
  - 理解了通过数学技巧除以sqrt(d_k)就可以让方差恢复成1.

## 4 multi head attention详解

- 学习了Transformer架构采用Multi-head Attention的原因.
  - 将模型划分为多个头, 分别进行Attention计算, 可以形成多个子空间, 让模型去关注不同方面的信息特征, 更好的提升模型的效果.
  - 多头注意力有助于神经网络捕捉到更丰富的特征信息.
- 学习了Multi-head Attention的计算方式.
  - 对特征张量的最后一个维度进行了分割, 一般是对词嵌入的维度embedding_dim进行切割, 切割后的计算规则和单一head完全一致.
  - 在不同的head上应用了注意力计算规则后, 得到的结果张量直接采用拼接concat的方式进行融合, 就得到了Multi-head Attention的结果张量.

## 5 Transformer优势

- 学习了Transformer相比于RNN/LSTM的优势和原因.
  - 第一大优势是并行计算的优势.
  - 第二大优势是特征提取能力强.
- 学习了Transformer架构中Encoder模块的并行化机制.
  - Encoder模块在训练阶段和测试阶段都可以实现完全相同的并行化.
  - Encoder模块在Embedding层, Feed Forward层, Add & Norm层都是可以并行化的.
  - Encoder模块在self-attention层, 因为各个token之间存在依赖关系, 无法独立计算, 不是真正意义上的并行化.
  - Encoder模块在self-attention层, 因为采用了矩阵运算的实现方式, 可以一次性的完成所有注意力张量的计算, 也是另一种"并行化"的体现.
- 学习了Transformer架构中Decoder模块的并行化机制.
  - Decoder模块在训练阶段可以实现并行化.
  - Decoder模块在训练阶段的Embedding层, Feed Forward层, Add & Norm层都是可以并行化的.
  - Decoder模块在self-attention层, 以及Encoder-Decoder Attention层, 因为各个token之间存在依赖关系, 无法独立计算, 不是真正意义上的并行化.
  - Decoder模块在self-attention层, 以及Encoder-Decoder Attention层, 因为采用了矩阵运算的实现方式, 可以一次性的完成所有注意力张量的计算, 也是另一种"并行化"的体现.
  - Decoder模块在预测计算不能并行化处理.
- 学习了seq2seq架构的两大缺陷.
  - 第一个缺陷是Encoder端的所有信息被压缩成一个固定的输出张量, 当序列长度较长时会造成比较严重的信息损耗.
  - 第二个缺陷是无法并行计算.
- 学习了Transformer架构对seq2seq两大缺陷的改进.
  - Transformer应用Multi-head Attention机制让编码器信息可以更好的展示给解码器.
  - Transformer可以实现Encoder端的并行计算.