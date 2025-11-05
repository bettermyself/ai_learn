## 	1 BiLSTM+CRF项目完整实现

### 1.1 整体代码架构图

```
LSTM_CRF/
├── data/                       # 数据集（训练集、标签等）
│   ├── labels.json             # 实体类别映射
│   ├── tag2id.json             # 标签到ID的映射
│   ├── train.txt               # 训练数据（BIO格式）
│   └── no_enter_train.txt      # 无换行训练数据
├── data_origin/                # 原始数据（未处理）
│   ├── 一般项目/
│   ├── 出院情况/
│   ├── 病史特点/
│   ├── 诊疗经过/
│   └── 数据说明.md
├── model/                      # 模型构建
│   ├── BiLSTM.py               # BiLSTM模型
│   └── BiLSTM_CRF.py           # BiLSTM+CRF联合模型
├── save_model/                 # 模型保存路径
├── utils/                      # 工具模块
│   ├── common.py               # 公共函数
│   ├── data_loader.py          # 数据加载器
│   └── data_process.py         # 数据处理函数
├── vocab/                      # 词表（如有）
├── api_test.py                 # 测试API接口
├── config.py                   # 模型配置文件
├── locust_file.py              # 性能压测脚本
├── ner_predict.py              # 模型预测脚本
├── train.py                    # 模型训练入口
├── slot_app.py                 # API接口服务
├── log/                        # 日志文件
└── README.md                   # 项目说明文档
```

**基本步骤**：数据预处理、构建模型、模型训练和验证、模型预测



### 1.2 数据预处理流程

#### 第一步：查看项目数据集

- **原始数据路径**：
  - `/MedicalKB/Ner/LSTM_CRF/data_origin`
- **处理后数据路径**：
  - `/MedicalKB/Ner/LSTM_CRF/data`



**📁 `data_origin` 数据说明**

- **数据来源**：医院真实病患医疗数据（数据量有限，适用于模型思想学习）

- **目录结构**：

  ```
  data_origin/
  ├── 一般项目/
  ├── 出院情况/
  ├── 病史特点/
  └── 诊疗经过/
  ```

  

- **文件类型**：

  - `.txt`：标注数据（实体名、起始、结束、类型）

    - 示例：

      ```
      右髋部 21 23 身体部位
      疼痛 27 28 症状和体征
      肿胀 29 30 症状和体征
      ```

  - `xxx.txtoriginal.txt`：原始文本

    - 示例：

      ```
      女性，88岁，农民，双滦应营子村八，主因右髋部摔伤后疼痛肿胀，活动受限5小时于2016-10...
      ```



**📁 `data` 数据说明**

- **labels.json**：实体类别映射

  ```json
  {
    "治疗": "TREATMENT",
    "身体部位": "BODY",
    "症状和体征": "SIGNS",
    "检查和检验": "CHECK",
    "疾病和诊断": "DISEASE"
  }
  ```

  

- **tag2id.json**：标签到ID的映射（BIO格式）

  ```json
  {
    "O": 0,
    "B-TREATMENT": 1,
    "I-TREATMENT": 2,
    "B-BODY": 3,
    "I-BODY": 4,
    "B-SIGNS": 5,
    "I-SIGNS": 6,
    "B-CHECK": 7,
    "I-CHECK": 8,
    "B-DISEASE": 9,
    "I-DISEASE": 10
  }
  ```

  

#### 第二步：构造序列标注数据

- **原始句子**：

  ```
  以咳嗽、咳痰、发热为主症。
  ```

  

- **标注后标签**：

  ```
  ['O', 'B-SIGNS', 'I-SIGNS', 'O', 'B-SIGNS', 'I-SIGNS', 'O', 'B-SIGNS', 'I-SIGNS', 'O', 'O']
  ```

  

- **目标**：

  - 对每个 token 打上标签
  - 统计所有 tokens（去重）并保存为词表（vocab）



代码路径：`/MedicalKB/Ner/LSTM_CRF/utils/data_process.py`

> 在data_process.py脚本中，定义一个TransferData类，实现数据格式的转换

```python
import json
import os
from collections import Counter

# 切换到项目根目录，保证后续路径统一
os.chdir('..')
CUR_DIR = os.getcwd()
print('当前数据处理默认工作目录：', CUR_DIR)


# --------------------------------------------------------------------------- #
#                                TransferData                                 #
# --------------------------------------------------------------------------- #
class TransferData:
    """
    将 data_origin 中的 *.txtoriginal 与对应标注文件
    转换为 BIO 格式的单行序列标注文件 data/train.txt
    """

    def __init__(self):
        # 1. 加载实体类别映射（中文→英文缩写）
        self.label_dict = json.load(open(os.path.join(CUR_DIR, 'data/labels.json')))

        # 2. 加载标签→ID 映射（仅做校验，本脚本未用）
        self.seq_tag_dict = json.load(open(os.path.join(CUR_DIR, 'data/tag2id.json')))

        # 3. 原始数据根目录
        self.origin_path = os.path.join(CUR_DIR, 'data_origin')

        # 4. 输出文件
        self.train_filepath = os.path.join(CUR_DIR, 'data/train.txt')

    # ------------------------- 主入口 ------------------------- #
    def transfer(self):
        """
            遍历所有 *.txtoriginal 文件，生成 BIO 标注的 train.txt
        """
        with open(self.train_filepath, 'w', encoding='utf-8') as fout:
            # 递归遍历 data_origin 下所有子目录
            for root, dirs, files in os.walk(self.origin_path):
                for file in files:
                    # 只处理原始文本文件
                    if 'original' not in file:
                        continue

                    original_path = os.path.join(root, file)
                    # 对应标注文件：去掉「original」字样
                    label_path = original_path.replace('.txtoriginal', '')

                    print(f'【处理】{original_path}  <--->  {label_path}')

                    # 解析标注 → {字符索引: BIO 标签}
                    label_dict = self._read_label_text(label_path)

                    # 按字符级写入 BIO 格式
                    with open(original_path, 'r', encoding='utf-8') as fin:
                        content = fin.read().strip()
                        for idx, char in enumerate(content):
                            tag = label_dict.get(idx, 'O')
                            fout.write(f'{char}\t{tag}\n')

    # --------------------- 解析标注文件 --------------------- #
    def _read_label_text(self, label_path):
        """
        读取单行制表符分割的标注文件，返回：
        {字符级绝对索引: BIO 标签}
        """
        res = {}
        for line in open(label_path, 'r', encoding='utf-8'):
            line = line.strip()
            if not line:
                continue

            # 格式：实体\tstart\tend\t类别
            entity, start, end, label = line.split('\t')
            start, end = int(start), int(end)

            # 映射中文类别 → 英文缩写
            label_en = self.label_dict[label]

            # 逐字符打标签
            for i in range(start, end + 1):
                if i == start:
                    tag = f'B-{label_en}'
                else:
                    tag = f'I-{label_en}'
                res[i] = tag
        return res


# --------------------------------------------------------------------------- #
#                                    main                                     #
# --------------------------------------------------------------------------- #
if __name__ == '__main__':
    handler = TransferData()
    handler.transfer()
    print('✅ 全部数据已转换完成，BIO 格式文件保存在：', handler.train_filepath)
   
```

> 经过数据转换后，我们会得到一个train.txt文档，此时，对于所有origin中的数据，都实现了BIO标注
>
> ```text
> 咳	B-SIGNS
> 痰	I-SIGNS
> ，	O
> 发	B-SIGNS
> 热	I-SIGNS
> ，	O
> 饮	O
> 食	O
> 、	O
> 睡	O
> 眠	O
> 尚	O
> 可	O
> ```



#### 第三步: 编写Config类项目文件配置代码

> `config`文件目的：配置项目常用变量，一般这些变量属于不经常改变的，比如: 训练文件路径、模型训练次数、模型超参数等等

```python
import os
import torch
import json


class Config(object):
    """训练与推理所需的全部静态配置"""
    def __init__(self):
      	# 1. 设备选择 --------------------------------------------------------- #
        #    Apple Silicon (M1/M2) 使用 mps；NVIDIA 使用 cuda；其余 fallback 到 cpu
        if torch.backends.mps.is_available():
            self.device = torch.device("mps")
        elif torch.cuda.is_available():
            self.device = torch.device("cuda:0")
        else:
            self.device = torch.device("cpu")
        
        
        # 2. 数据/词表路径 ----------------------------------------------------- #
        self.train_path   = "/MedicalKB/Ner/LSTM_CRF/data/train.txt"
        self.vocab_path   = "/MedicalKB/Ner/LSTM_CRF/vocab/vocab.txt"
        self.tag2id_path  = "/MedicalKB/Ner/LSTM_CRF/data/tag2id.json"
        self.tag2id       = json.load(open(self.tag2id_path, encoding="utf-8"))

        # 3. 模型结构 ---------------------------------------------------------- #
        self.model_name   = "BiLSTM_CRF"   # 可选: "BiLSTM" / "BiLSTM_CRF"
        self.embedding_dim = 300           # 字/词向量维度
        self.hidden_dim    = 256           # BiLSTM 隐层维度
        self.dropout       = 0.2           # 全连接层 dropout

        # 4. 训练超参数 -------------------------------------------------------- #
        self.epochs        = 5
        self.batch_size    = 8
        self.lr            = 2e-3          # 若使用 CRF，可再调小（如 1e-3）

if __name__ == '__main__':
    conf = Config()
    print(conf.train_path)
    print(conf.tag2id)
```



#### 第四步: 编写数据处理相关函数

构造数据预处理函数，分为两个步骤：

1. 构造样本 `x` 以及标签 `y` 数据对，并获取 `vocabs`
2. 构造数据迭代器



##### 4.1 构造 (X, Y) 样本对，以及获取 VOCABS

由于在第二步构造序列标注数据时，没有对样本进行明确的分割，因此这里我们采用**标点符号**作为分隔符，构造不同的 `(x, y)` 样本对。

- **代码实现路径**：
  `/MedicalKB/Ner/LSTM_CRF/utils/common.py`



📁 文件 2：代码实现（image.png）

```python
from LSTM_CRF.config import *

conf = Config()

# 构造数据集
def build_data():
    datas = []
    sample_x = []
    sample_y = []
    vocab_list = ["PAD", "UNK"]

    for line in open(conf.train_path, 'r', encoding='utf-8'):
        line = line.rstrip().split('\t')
        if not line:
            continue

        char = line[0]
        if not char:
            continue

        cate = line[-1]
        sample_x.append(char)
        sample_y.append(cate)

        if char not in vocab_list:
            vocab_list.append(char)

        # 使用标点符号作为样本分隔符
        if char in ['。', '?', '!', '！', '？']:
            datas.append([sample_x, sample_y])
            sample_x = []
            sample_y = []

    word2id = {wd: index for index, wd in enumerate(vocab_list)}
    write_file(vocab_list, conf.vocab_path)

    return datas, word2id

# 保存字典文件
def write_file(wordlist, filepath):
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write('\n'.join(wordlist))

# 主程序入口
if __name__ == "__main__":
    datas, word2id = build_data()
    print("样本数量:", len(datas))
    print("前4条样本:", datas[:4])
    print("词表映射:", word2id)
    print("词表大小:", len(word2id))
```



##### 4.2 构造数据迭代器

文件路径

```
MedicalKB/Ner/LSTM_CRF/utils/data_loader.py
```



**第一步：导入必备的工具包**

```python
import json
import torch
from common import *  # 导入自定义公共模块
from torch.utils.data import DataLoader, Dataset  # PyTorch 数据加载工具
from torch.nn.utils.rnn import pad_sequence  # 用于序列填充

# 加载数据及词汇映射表
datas, word2id = build_data()
```



**第二步：构建 Dataset 类**

```python
class NerDataset(Dataset):
    """
    自定义数据集类，用于加载 NER 数据
    """

    def __init__(self, datas):
        """
        初始化数据集
        :param datas: 数据列表，每个元素为 [文本, 标签] 的列表
        """
        super().__init__()
        self.datas = datas

    def __len__(self):
        """
        返回数据集大小
        """
        return len(self.datas)

    def __getitem__(self, item):
        """
        获取指定索引的数据
        :param item: 索引
        :return: 文本和标签的元组 (x, y)
        """
        x = self.datas[item][0]  # 文本字符列表
        y = self.datas[item][1]  # 对应标签列表
        return x, y
```



**第三步：构建自定义函数 `collate_fn`**

```python
def collate_fn(batch):
    """
    自定义的批处理函数，用于将一个 batch 的数据进行对齐和填充
    :param batch: 一个 batch 的数据列表，每个元素为 [文本, 标签] 的列表
    :return: 填充后的 input_ids, labels, attention_mask
    """
    # 将文本字符转换为对应的 ID
    x_train = [torch.tensor([word2id[char] for char in data[0]]) for data in batch]
    # 将标签转换为对应的 ID
    y_train = [torch.tensor([conf.tag2id[label] for label in data[1]]) for data in batch]

    # 使用 pad_sequence 对 input_ids 进行填充，使用 0 作为填充值
    input_ids_padded = pad_sequence(x_train, batch_first=True, padding_value=0)

    # 使用 pad_sequence 对 labels 进行填充
    labels_padded = pad_sequence(y_train, batch_first=True, padding_value=conf.tag2id["O"])

    # 创建 attention_mask，标记非填充位置（非 0 的位置为 1，填充位置为 0）
    attention_mask = (input_ids_padded != 0).long()

    return input_ids_padded, labels_padded, attention_mask
```



**第四步：构建 `get_data` 函数，获得数据迭代器**

```python
def get_data():
    """
    构建训练集和验证集的数据加载器
    :return: 训练数据加载器和验证数据加载器
    """
    # 构建训练集（前 6200 条数据）
    train_dataset = NerDataset(datas[:6200])
    train_dataloader = DataLoader(
        dataset=train_dataset,
        batch_size=conf.batch_size,  # 批大小，从配置文件读取
        collate_fn=collate_fn,       # 使用自定义的批处理函数
        drop_last=True               # 丢弃最后一个不足 batch_size 的批次
    )

    # 构建验证集（剩余数据）
    dev_dataset = NerDataset(datas[6200:])
    dev_dataloader = DataLoader(
        dataset=dev_dataset,
        batch_size=conf.batch_size,
        collate_fn=collate_fn,
        drop_last=True
    )

    return train_dataloader, dev_dataloader
```



**主函数入口**

```python
if __name__ == "__main__":
    # 获取训练和验证数据加载器
    train_dataloader, dev_dataloader = get_data()

    # 打印一个 batch 的形状信息，用于调试
    for input_ids_padded, labels_padded, attention_mask in train_dataloader:
        print("input_ids_padded shape:", input_ids_padded.shape)
        print("labels_padded shape:", labels_padded.shape)
        print("attention_mask shape:", attention_mask.shape)
        break  # 只打印第一个 batch
```



### 1.3 BiLSTM+CRF模型搭建

#### 第一步: 编写模型类的代码

**路径：** `/MedicalKB/Ner/LSTM_CRF/model/BiLSTM.py`

```python
import torch
import torch.nn as nn

class NERLSTM(nn.Module):
    """
    双向 LSTM 模型用于命名实体识别（NER）
    """

    def __init__(self, embedding_dim, hidden_dim, dropout, word2id, tag2id):
        super(NERLSTM, self).__init__()
        self.name = "BiLSTM"
        self.embedding_dim = embedding_dim
        self.hidden_dim = hidden_dim
        self.vocab_size = len(word2id) 
        self.tag_to_ix = tag2id
        self.tag_size = len(tag2id)

        # 词嵌入层
        self.word_embeds = nn.Embedding(self.vocab_size, self.embedding_dim)
        self.dropout = nn.Dropout(dropout)

        # 双向 LSTM 层
        self.lstm = nn.LSTM(
            self.embedding_dim,
            self.hidden_dim // 2,
            bidirectional=True,
            batch_first=True
        )

        # 输出层：将 LSTM 输出映射到标签空间
        self.hidden2tag = nn.Linear(self.hidden_dim, self.tag_size)

    def forward(self, x, mask):
        """
        前向传播
        :param x: 输入的字符 ID 序列，形状为 [batch_size, seq_len]
        :param mask: 掩码，形状为 [batch_size, seq_len]
        :return: 每个字符对应每个标签的得分，形状为 [batch_size, seq_len, tag_size]
        """
        # 词嵌入
        embedding = self.word_embeds(x)

        # LSTM 编码
        outputs, hidden = self.lstm(embedding)

        # 掩码无效位置（padding 部分置 0）
        outputs = outputs * mask.unsqueeze(-1)

        # Dropout
        outputs = self.dropout(outputs)

        # 映射到标签空间
        outputs = self.hidden2tag(outputs)

        return outputs
```



📁 模型文件 2：BiLSTM + CRF 模型

**路径：** `/MedicalKB/Ner/LSTM_CRF/model/BiLSTM_CRF.py`

```python
import torch
import torch.nn as nn
from TorchCRF import CRF

class NERLSTM_CRF(nn.Module):
    """
    BiLSTM + CRF 模型用于命名实体识别（NER）
    """

    def __init__(self, embedding_dim, hidden_dim, dropout, word2id, tag2id):
        super(NERLSTM_CRF, self).__init__()
        self.name = "BiLSTM_CRF"
        self.embedding_dim = embedding_dim
        self.hidden_dim = hidden_dim
        self.vocab_size = len(word2id)
        self.tag_to_ix = tag2id
        self.tag_size = len(tag2id)

        # 词嵌入层
        self.word_embeds = nn.Embedding(self.vocab_size, self.embedding_dim)
        self.dropout = nn.Dropout(dropout)

        # 双向 LSTM 层
        self.lstm = nn.LSTM(
            self.embedding_dim,
            self.hidden_dim // 2,
            bidirectional=True,
            batch_first=True
        )

        # 线性层：LSTM 输出映射到标签空间
        self.hidden2tag = nn.Linear(self.hidden_dim, self.tag_size)

        # CRF 层
        self.crf = CRF(self.tag_size)

    def forward(self, x, mask):
        """
        使用 CRF 解码最优标签序列
        :param x: 输入字符 ID 序列，形状为 [batch_size, seq_len]
        :param mask: 掩码，形状为 [batch_size, seq_len]
        :return: 预测的标签序列，形状为 [batch_size, seq_len]
        """
        # 获取 BiLSTM 输出
        outputs = self.get_lstm2linear(x)

        # 掩码无效位置
        outputs = outputs * mask.unsqueeze(-1)

        # 使用 CRF 解码最优路径
        predicted_tags = self.crf.viterbi_decode(outputs, mask)

        return predicted_tags

    def log_likelihood(self, x, tags, mask):
        """
        计算 CRF 的负对数似然损失
        :param x: 输入字符 ID 序列
        :param tags: 真实标签序列
        :param mask: 掩码
        :return: 损失值
        """
        # 获取 BiLSTM 输出
        outputs = self.get_lstm2linear(x)

        # 掩码无效位置
        outputs = outputs * mask.unsqueeze(-1)

        # 计算 CRF 损失（返回负对数似然）
        return -self.crf(outputs, tags, mask)

    def get_lstm2linear(self, x):
        """
        通过 BiLSTM 获取线性层输出（用于 CRF 输入）
        :param x: 输入字符 ID 序列
        :return: 线性层输出，形状为 [batch_size, seq_len, tag_size]
        """
        # 词嵌入
        embedding = self.word_embeds(x)

        # LSTM 编码
        outputs, hidden = self.lstm(embedding)

        # Dropout
        outputs = self.dropout(outputs)

        # 映射到标签空间
        outputs = self.hidden2tag(outputs)

        return outputs
```



#### 第二步: 编写训练函数

📁 文件路径：`/MedicalKB/Ner/LSTM_CRF/train.py`



导入必备工具包：

```python
import torch
import torch.nn as nn
import torch.optim as optim
import time
from tqdm import tqdm
from sklearn.metrics import precision_score, recall_score, f1_score, classification_report

from model.BiLSTM import NERLSTM
from model.BiLSTM_CRF import NERLSTM_CRF
from utils.data_loader import get_data
from config import Config

conf = Config()
```



✅ 训练主函数：`model2train()`

```python
def model2train():
    """
    模型训练主函数，支持 BiLSTM 和 BiLSTM+CRF 两种模型
    """
    # 加载训练和验证数据
    train_dataloader, dev_dataloader = get_data()

    # 模型选择
    models = {
        'BiLSTM': NERLSTM,
        'BiLSTM_CRF': NERLSTM_CRF
    }
    model = models[conf.model](
        conf.embedding_dim,
        conf.hidden_dim,
        conf.dropout,
        conf.word2id,
        conf.tag2id
    ).to(conf.device)

    # 优化器
    optimizer = optim.Adam(model.parameters(), lr=conf.lr)

    # 开始训练
    start_time = time.time()
    best_f1 = -1000

    if conf.model == 'BiLSTM':
        criterion = nn.CrossEntropyLoss()  # 交叉熵损失

        for epoch in range(conf.epochs):
            model.train()
            for index, (inputs, labels, mask) in enumerate(tqdm(train_dataloader, desc=f"Epoch {epoch}")):
                x = inputs.to(conf.device)
                y = labels.to(conf.device)
                mask = mask.to(conf.device)

                # 前向传播
                pred = model(x, mask)
                pred = pred.view(-1, len(conf.tag2id))
                loss = criterion(pred, y.view(-1))

                # 反向传播
                optimizer.zero_grad()
                loss.backward()
                optimizer.step()

                # 每200步验证一次
                if index % 200 == 0:
                    print(f'Epoch: {epoch:04d}, Step: {index}, Loss: {loss.item():.4f}')
            precision, recall, f1, report = model2dev(dev_dataloader, model, criterion)
            if f1 > best_f1:
                best_f1 = f1
                torch.save(model.state_dict(), "save_model/bilstm_best.pth")
                print("✅ 模型已保存（BiLSTM）")
            print(report)

    elif conf.model == 'BiLSTM_CRF':
        for epoch in range(conf.epochs):
            model.train()
            for index, (inputs, labels, mask) in enumerate(tqdm(train_dataloader, desc=f"Epoch {epoch}")):
                x = inputs.to(conf.device)
                tags = labels.to(conf.device)
                mask = mask.to(torch.bool).to(conf.device)

                # CRF 损失
                loss = model.log_likelihood(x, tags, mask).mean()

                # 反向传播
                optimizer.zero_grad()
                loss.backward()
                torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=10.0)  # 梯度裁剪
                optimizer.step()

                # 每200步验证一次
                if index % 200 == 0:
                    print(f'Epoch: {epoch:04d}, Step: {index}, Loss: {loss.item():.4f}')
            precision, recall, f1, report = model2dev(dev_dataloader, model)
            if f1 > best_f1:
                best_f1 = f1
                torch.save(model.state_dict(), "save_model/bilstm_crf_best.pth")
                print("✅ 模型已保存（BiLSTM+CRF）")
            print(report)

    end_time = time.time()
    print(f"🕒 训练总耗时：{end_time - start_time:.2f} 秒")
```



✅ 验证函数：`model2dev()`

```python
def model2dev(dev_iter, model, criterion=None):
    """
    验证模型性能，返回 precision、recall、f1 和详细报告
    """
    model.eval()
    total_loss = 0.0
    preds, golds = [], []

    with torch.no_grad():
        for inputs, labels, mask in tqdm(dev_iter, desc="验证中"):
            val_x = inputs.to(conf.device)
            val_y = labels.to(conf.device)
            mask = mask.to(conf.device)

            predict = []

            if model.name == "BiLSTM":
                pred = model(val_x, mask)
                predict = torch.argmax(pred, dim=-1).tolist()
                pred = pred.view(-1, len(conf.tag2id))
                loss = criterion(pred, val_y.view(-1))
                total_loss += loss.item()

            elif model.name == "BiLSTM_CRF":
                mask = mask.to(torch.bool)
                predict = model(val_x, mask)  # CRF 解码
                loss = model.log_likelihood(val_x, val_y, mask)
                total_loss += loss.mean().item()

            # 提取真实长度下的标签
            leng = []
        		for value in inputs:
              tmp = []
              for j in value:
                  if j.item() > 0:
                      tmp.append(j.item())
              leng.append(tmp)


              # 取出预测的真实句子长度的标签结果
              for idx, value in enumerate(predict):
                  preds.extend(value[:len(leng[idx])])

              # 提取真实长度的真实标签
              for index, i in enumerate(labels.tolist()):
                  golds.extend(i[:len(leng[index])])

    # 计算指标
    precision = precision_score(golds, preds, average='macro')
    recall = recall_score(golds, preds, average='macro')
    f1 = f1_score(golds, preds, average='macro')
    report = classification_report(golds, preds, digits=2)

    avg_loss = total_loss / len(dev_iter)
    print(f"验证损失：{avg_loss:.4f}")
    return precision, recall, f1, report
```



✅ 训练效果对比（整理版）

| 模型           | 训练时间 | Precision | Recall | F1-Score | 备注             |
| :------------- | :------- | :-------- | :----- | :------- | :--------------- |
| **BiLSTM**     | 105 秒   | 0.72      | 0.69   | 0.68     | 速度快，精度一般 |
| **BiLSTM+CRF** | 831 秒   | 0.77      | 0.70   | 0.72     | 速度慢，精度更高 |

> ✅ **结论**：BiLSTM+CRF 虽然训练耗时更长，但 macro F1 更高，尤其在中大型数据集上优势更明显。



#### 第三步: 编写模型预测函数

使用训练好的模型，随机抽取文本进行NER

📁 文件 1：`ner_predict.py`

**功能：模型加载与初始化**

```python
import torch
import torch.nn as nn
import torch.optim as optim
from model.BiLSTM import *
from model.BiLSTM_CRF import *
from utils.data_loader import *
from tqdm import tqdm

# 模型名 → 类对象 的映射表
models = {
    'BiLSTM': NERLSTM,
    'BiLSTM_CRF': NERLSTM_CRF
}

# -------------- 1. 模型实例化 --------------
model = models["BiLSTM_CRF"](
    conf.embedding_dim,
    conf.hidden_dim,
    conf.dropout,
    word2id,
    conf.tag2id
)

# -------------- 2. 加载最优权重 --------------
model.load_state_dict(torch.load('save_model/bilstm_crf_best.pth'))

# -------------- 3. 构建反向映射 --------------
id2tag = {v: k for k, v in conf.tag2id.items()}
```



📁 文件 2：`model2test` 函数

**作用：把原始字符串喂给模型，得到预测标签序列，再抽取出实体**

```python
def model2test(sample: str):
    """
    输入: 任意中文文本字符串
    输出: 字典 {实体名: 实体类型}
    """
    # ---------- 1. 字符 → id ----------
    x = []
    for char in sample:
        if char not in word2id:
            char = "UNK"
        x.append(word2id[char])
	
    # ---------- 2. 构造 tensor 与 mask ----------
    x_train = torch.tensor([x])          # shape: [1, seq_len]
    mask = (x_train != 0).long()         # 0 为 <PAD>，mask 掉填充位

    # ---------- 3. 模型预测 ----------
    model.eval()
    with torch.no_grad():
        if model.name == "BiLSTM":
            # BiLSTM: 直接 softmax 后取 argmax
            logits = model(x_train, mask)        # [1, seq_len, tag_num]
            preds_ids = torch.argmax(logits, dim=-1)[0]  # 去掉 batch 维
            tags = [id2tag[i.item()] for i in preds_ids]
        else:  # BiLSTM_CRF: 使用维特比解码
            preds_ids = model(x_train, mask)[0]  # 返回最优路径
            tags = [id2tag[i] for i in preds_ids]
	
    # ---------- 4. 字符与标签长度对齐检查 ----------
    chars = list(sample)
    assert len(chars) == len(tags), "长度不一致！"

    # ---------- 5. 抽取实体 ----------
    result = extract_entities(chars, tags)
    return result


if __name__ == "__main__":
    sample = '小明的父亲患有冠心病及糖尿病，无手术外伤史及药物过敏史'
    result = model2test(sample)
    print(result)
```



📁 文件 3：`extract_entities` 函数

**作用：根据 BIO 标签序列，抽取出实体及其类型**

```python
def extract_entities(tokens, labels):
     """
    tokens: 字符列表
    labels: BIO 标签列表
    返回: dict {实体名: 实体类型}
    """
        
    entities = []       # 最终结果: [(类型, 实体字符串), ...]
    entity = []         # 当前实体的字符缓存
    entity_type = None  # 当前实体类型

    for token, label in zip(tokens, labels):
        if label.startswith("B-"):
            # 1. 先把上一个实体存起来（如果有）
            if entity:
               entities.append((entity_type, "".join(entity)))
               entity = []
            # 2. 开始新实体
            entity.append(token)
            entity_type = label.split("-")[1]

        elif label.startswith("I-") and entity:
            # 继续当前实体
            entity.append(token)

        else:  # O 或其他无效标签
            # 非实体部分，保存上一个实体
            if entity:
                entities.append((entity_type, "".join(entity)))
                entity = []
                entity_type = None

    # 循环结束后，若缓存中还有实体，手动保存
    if entity:
        entities.append((entity_type, "".join(entity)))

    return {entity: entity_type for entity_type, entity in entities}
```