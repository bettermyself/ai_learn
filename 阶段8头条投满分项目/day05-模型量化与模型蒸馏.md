## 1 模型量化

### 1.1 什么是模型的量化

- **通俗理解**：
  模型量化就是将模型参数的精度降低，用更少的比特位（如 `torch.qint8`）代替原来的高精度（如 `torch.float32`），从而**减小模型体积**并**加快推理速度**。
- **类比说明**：
  就像图像压缩一样，原始模型（float32）像素高、看得清晰；量化模型（int8）像素低、模糊，但仍能准确识别内容。

<img src="assets/image-20251020193359200.png" alt="image-20251020193359200" style="zoom:67%;" />

- **PyTorch 支持**：
  使用动态量化（`DynamicQuantization`）即可快速实现。



### 1.2 PyTorch 中的模型量化流程（以 BERT 为例）

#### 1.2.1 修改配置文件：设置设备为 CPU

> ❗ **量化操作只能在 CPU 上进行**，若在 GPU 上运行会报错：
>
> ```properties
> RuntimeError: Could not run 'quantized::linear_prepack' with arguments from the 'cuda' backend
> ```

**文件路径**：`04-bert/src/models/bert.py`

```python
class Config:
    def __init__(self):
        # 模型训练/预测时使用 GPU（默认注释掉）
        # self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

        # 模型量化时必须使用 CPU
        self.device = 'cpu'
```



#### 1.2.2 模型量化实现代码

**文件路径**：`04-bert/src/run1.py`

✅ 导入必要模块

```python
import torch
import numpy as np
from train_eval import test
from importlib import import_module
import argparse
from utils import build_dataset, build_iterator
```

✅ 主函数：加载模型并量化

```python
# 命令行参数解析：指定模型类型，默认为 bert
parser = argparse.ArgumentParser(description="Chinese Text Classification")
parser.add_argument("--model", type=str, default="bert", help="choose a model: bert")
args = parser.parse_args()

if __name__ == "__main__":
    if args.model == "bert":
        model_name = "bert"
        x = import_module("models." + model_name)
        config = x.Config()

        # 设置随机种子，保证实验可重复
        np.random.seed(1)
        torch.manual_seed(1)
        torch.cuda.manual_seed_all(1)
        torch.backends.cudnn.deterministic = True

        # 加载数据集并构建迭代器
        print("Loading data for Bert Model...")
        train_data, dev_data, test_data = build_dataset(config)
        train_iter = build_iterator(train_data, config)
        dev_iter = build_iterator(dev_data, config)
        test_iter = build_iterator(test_data, config)

        # 实例化模型并加载预训练参数（注意：必须加载到 CPU）
        model = x.Model(config)
        print(model)
        model.load_state_dict(torch.load(config.save_path, map_location='cpu'))

        # 对模型进行动态量化（仅量化 Linear 层）
        quantized_model = torch.quantization.quantize_dynamic(
            model, {torch.nn.Linear}, dtype=torch.qint8
        )
        print(quantized_model)

        # 测试量化模型性能
        test(config, quantized_model, test_iter)

        # 保存量化后的模型
        torch.save(quantized_model, config.save_path2)
```



### 1.3 量化效果展示

#### 1.3.1 模型结构变化（Linear → DynamicQuantizedLinear）

| 模块名         | 量化前                                      | 量化后                                           |
| :------------- | :------------------------------------------ | :----------------------------------------------- |
| `pooler.dense` | `Linear(in_features=768, out_features=768)` | `DynamicQuantizedLinear(..., dtype=torch.qint8)` |
| `fc`           | `Linear(in_features=768, out_features=10)`  | `DynamicQuantizedLinear(..., dtype=torch.qint8)` |



#### 1.3.2 模型性能对比

| 指标        | 量化前 | 量化后                |
| :---------- | :----- | :-------------------- |
| **F1 分数** | 93.64% | 91.92%                |
| **准确率**  | 高     | 91.92%（下降不到 2%） |

> ✅ 虽然性能略有下降，但仍在可接受范围内，说明 **BERT 模型鲁棒性较强**。



#### 1.3.3 模型大小对比

| 模型文件                     | 大小        |
| :--------------------------- | :---------- |
| 原始模型 `bert.pt`           | **409.2MB** |
| 量化模型 `bert_quantized.pt` | **152.6MB** |

> ✅ 模型体积减少 **256.6MB**，压缩效果显著！



## 2 模型蒸馏

### 2.1 什么是模型蒸馏？

在工业级应用中，除了要求模型具备良好的预测效果外，还希望其**资源消耗尽可能小**，包括：

- 存储空间
- 算力需求

为了提升模型效果，通常采用以下两种方案：

- **使用更大规模的参数**
- **使用集成模型**（将多个弱模型组合）

> ⚠️ 但上述方法往往**计算开销大**，不利于线上部署。



**模型压缩的动机**：我们希望得到一个**体积小、速度快**的模型，同时**保持甚至提升性能**。



**模型蒸馏（Knowledge Distillation）：**

- 是一种**知识迁移**方法：将复杂模型（教师模型）学到的知识，传递给简单模型（学生模型）。
- 由 **Hinton 于 2015 年提出**，2019 年后广泛应用。
- 目前已成为**既前沿又实用**的模型压缩与部署优化手段。

<img src="assets/image-20251020202211572.png" alt="image-20251020202211572" style="zoom:67%;" />



### 2.2 知识蒸馏的原理与算法

#### **2.2.1 教师模型（Teacher Model）**

- **定义**：复杂、高性能的大型深度神经网络。
- **特点**：参数量大，能学习复杂的特征和关系。



#### **2.2.2 学生模型（Student Model）**

- **定义**：结构简化、参数较少的小型模型。
- **特点**：适合部署在资源受限的环境中（如移动端、嵌入式设备）。



#### 2.2.3 蒸馏过程（Distillation）

蒸馏过程包含两个分支：

- **软标签分支**：教师模型通过 softmax 输出“软目标”（soft targets），作为学生模型的学习对象。
- **硬标签分支**：真实标签（ground truth）用于指导学生模型的训练。



**蒸馏架构图：**

![img](assets/3_2.png)



### 2.3 损失函数与公式推导

#### 2.3.1 总体损失函数：

我们对知识蒸馏进行公式化处理：先训练好一个精度较高的 **Teacher** 网络（一般是复杂度较高的大规模预测训练模型），然后将 **Teacher** 网络的预测结果 $q$ 作为 **Student** 网络的“学习目标”，来训练 **Student** 网络（一般是速度较快的小规模模型），最终使得 Student 网络的结果 $p$ 接近于 $q$。蒸馏训练的总损失函数如下：

$$
L = (1 - \alpha) \cdot \text{CE}(y, p) + \alpha \cdot \text{CE}(q, p)
$$

- 上式中 $\text{CE}$ 是**交叉熵损失**（Cross Entropy）
- $y$ 是真实标签
- $q$ 是 Teacher 网络的输出结果
- $p$ 是 Student 网络的输出结果
- *α*：平衡两项损失的权重系数（通常取 0.8）



#### 2.3.2 Softmax-T：温度缩放机制

为了生成“软标签”，引入**温度参数 T**对 softmax 进行平滑处理
$$
p_i = \frac{\exp\left(\frac{z_i}{T}\right)}{\sum_{j} \exp\left(\frac{z_j}{T}\right)}
$$

其中：

- $z_i$ 是神经网络 softmax 前的输出 logits
- $p_i$：软化后的概率分布（软目标）

- *T*：温度参数，控制分布的**平滑程度**



温度 *T* 的影响：

| 温度 *T* 值 | 效果说明                                   |
| :---------- | :----------------------------------------- |
| *T*=1       | 原始 softmax，输出标准概率分布             |
| *T*→0       | 分布趋于 one-hot，最大值趋近 1，其余趋近 0 |
| *T* 越大    | 分布越平缓，保留更多类别间相似性信息       |
| *T*→∞       | 分布趋于均匀分布，所有类别概率接近相等     |

> ✅ 实际应用中，*T* 通常设置为 **3~5**，以生成更有信息量的软标签。



## 3 模型蒸馏的实践

### 3.1 项目结构

```
05-bert_distil/
├── data/                      # 数据集与预训练模型
│   ├──bert_pretrain/          # BERT预训练相关文件
│   ├──data/          				 # 数据集
├── src/
│   ├── models/
│   │   ├── bert.py            # BERT模型结构
│   │   └── textCNN.py         # TextCNN模型结构
│   ├── saved_dict/            # 模型权重保存路径
│   ├── run.py                 # 主函数入口
│   ├── train_eval.py          # 训练与评估逻辑
│   └── utils.py               # 工具函数（重点）
```



### 3.2 数据准备

> 数据集和预训练模型与 BERT 章节一致，此处不再赘述。



### 3.3 工具类函数（`utils.py`）

#### 3.3.1 构建词汇表：`build_vocab()`

✅ 功能说明：

- 将文本中的单词映射为索引，构建词汇表。
- 支持按词频筛选高频词，按词频降序排序，仅保留出现次数 ≥ min_freq 的词汇
- 添加特殊符号：`[UNK]`、`[PAD]`、`[CLS]`。



📌 特殊符号定义：

```python
UNK, PAD, CLS = "[UNK]", "[PAD]", "[CLS]"  # 未知词、填充符、分类符
MAX_VOCAB_SIZE = 10000  # 限制词汇表最大容量
```



✅函数实现：

```python
def build_vocab(file_path, tokenizer, max_size, min_freq):
    """
    构建词汇表函数。

    参数：
        file_path (str): 文本数据路径
        tokenizer (function): 分词器函数
        max_size (int): 词汇表最大容量
        min_freq (int): 最小词频阈值

    返回：
        vocab_dic (dict): 单词到索引的映射字典
    """
    vocab_dic = {}  # 存储词频

    with open(file_path, "r", encoding="UTF-8") as f:
        for line in tqdm(f):
            line = line.strip()
            if not line:
                continue
            content = line.split("\t")[0]  # 取第一列文本内容
            for word in tokenizer(content):
                vocab_dic[word] = vocab_dic.get(word, 0) + 1

    # 按词频排序并筛选高频词
    vocab_list = sorted(
        [item for item in vocab_dic.items() if item[1] >= min_freq],
        key=lambda x: x[1],
        reverse=True
    )[:max_size]

    # 构建词汇索引字典
    vocab_dic = {word_count[0]: idx for idx, word_count in enumerate(vocab_list)}

    # 添加特殊符号
    vocab_dic.update({
        UNK: len(vocab_dic),
        PAD: len(vocab_dic) + 1,
        CLS: len(vocab_dic) + 2
    })

    return vocab_dic
```



#### 3.3.2 构建 CNN 数据集：`build_dataset_CNN()`

✅ 功能说明：

- 为 TextCNN 模型构建训练和测试数据集。
- 支持字符级分词。
- 自动填充或截断序列。



✅ 函数实现：

```python
def build_dataset_CNN(config):
    """
    构建适用于 TextCNN 的数据集。

    参数：
        config: 配置对象，包含路径、参数等

    返回：
        vocab, train, dev, test: 词汇表及三个数据集
    """
    # 字符级分词器
    tokenizer = lambda x: [y for y in x]

    # 若词汇表已存在则加载，否则重新构建
    if os.path.exists(config.vocab_path):
        vocab = pkl.load(open(config.vocab_path, "rb"))
    else:
        vocab = build_vocab(
            config.train_path,
            tokenizer=tokenizer,
            max_size=MAX_VOCAB_SIZE,
            min_freq=1
        )
        pkl.dump(vocab, open(config.vocab_path, "wb"))
        print(f"Vocab size: {len(vocab)}")

    # 加载数据集的辅助函数
    def load_dataset(path, pad_size=32):
        contents = []
        with open(path, "r", encoding="UTF-8") as f:
            for line in tqdm(f):
                line = line.strip()
                if not line:
                    continue
                content, label = line.split("\t")
                token = tokenizer(content)
                seq_len = len(token)

                # 填充或截断
                if pad_size:
                    if len(token) < pad_size:
                        token.extend([PAD] * (pad_size - len(token)))
                    else:
                        token = token[:pad_size]
                    		seq_len = pad_size

                # 转换为索引
                words_line = [vocab.get(word, vocab.get(UNK)) for word in token]
                contents.append((words_line, int(label), seq_len))
        return contents

    # 加载训练集、验证集、测试集
    train = load_dataset(config.train_path, config.pad_size)
    dev = load_dataset(config.dev_path, config.pad_size)
    test = load_dataset(config.test_path, config.pad_size)

    return vocab, train, dev, test
```



#### 3.3.3 其他工具函数（略）

> 其余函数如 `build_dataset()`、`build_iterator()`、`get_time_dif()` 与 BERT 章节一致，此处不再赘述。













