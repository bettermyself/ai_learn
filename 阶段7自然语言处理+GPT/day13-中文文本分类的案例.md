## 1 实现流程

### 1.1 获取数据集

准备训练、验证和测试所需的数据。



### 1.2 数据预处理

- 实例化 `Dataset` 和 `DataLoader`。
- 在 `DataLoader` 中使用自定义函数对文本进行张量化处理。



### 1.3 搭建模型

- 使用 **BERT 预训练模型**提取文本特征表示。
- 将 BERT 输出接入自定义网络完成分类任务。



### 1.4 模型训练

- **冻结 BERT 参数**，仅训练自定义网络部分。



### 1.5 模型测试

> ⚠️ 注意：
> 若模型在 **GPU** 上训练，但希望在 **CPU** 上加载使用，需添加参数 `map_location="cpu"`：
>
> ```python
> model.load_state_dict(torch.load(path, map_location="cpu"))
> ```

---



## 2 数据预处理

### 2.1 获取Dataset对象

我们使用第三方库 `datasets` 提供的 `load_dataset` 方法，直接从 CSV 文件加载训练、测试和验证数据集，返回 `Dataset` 对象。

✅ 代码实现

```python
def  dm_file2dataset():
    """
    从本地 CSV 文件加载训练、测试和验证数据集。

    Returns:
        train_dataset: 训练集 Dataset 对象
        test_dataset: 测试集 Dataset 对象
        valid_dataset: 验证集 Dataset 对象
    """
    
    # 1.加载训练数据集
    # 默认如果不写split的话，返回结果是DatasetDict,加上split='train',返回一个dataset对象
    train_dataset = load_dataset('csv', data_files="./data/train.csv", split="train")
    # 1.1第二种加载方式
    # train_dataset = load_dataset(path='./data', data_files="train.csv", split="train")
    
    # print(f'训练数据-->{train_dataset}')
    # print(f'训练数据取出前三行数据---》{train_dataset[:3]}')
    
    # 2.加载测试数据集
    test_dataset = load_dataset('csv', data_files="./data/test.csv", split="train")
    # print(f'test_dataset--》{test_dataset}')
    # print(f'测试数据取出前三行数据---》{test_dataset[:3]}')
    
    # 3.加载验证数据集
    valid_dataset = load_dataset('csv', data_files="./data/validation.csv", split="train")
    # print(f'valid_dataset--》{valid_dataset}')
    # print(f'验证数据取出前三行数据--》{valid_dataset[:3]}')
    
    return train_dataset, test_dataset, valid_dataset
```



### 2.2 实现自定义函数

该函数将在 `DataLoader` 中自动调用，用于将 `Dataset` 中的原始样本批量转换为模型可接受的 **张量格式**（如 `input_ids`, `attention_mask`, `token_type_ids` 和 `labels`）。

✅代码实现

```python
def collate_fn1(data):
    """
    自定义批处理函数，用于 DataLoader 中自动处理每个 batch 的数据。

    Args:
        data (list): 每个样本是字典，格式如下：
                     [{'text': 'xxx', 'label': 0}, {'text': 'yyy', 'label': 1}, ...]

    Returns:
        input_ids: 编码后的 token ID 序列，shape = [batch_size, max_length]
        token_type_ids: 句子类型编码（BERT 用），shape = [batch_size, max_length]
        attention_mask: 注意力掩码，shape = [batch_size, max_length]
        labels: 标签张量，shape = [batch_size]
    """
	# 查看传过来的数据格式
    # print(f'data-->{len(data)}')
    # print(f'data[0]-->{data[0]}')
    
    # 1. 提取文本和标签
    texts = [item["text"] for item in data]
    labels = [item["label"] for item in data]
    
     # 2. 使用 tokenizer 批量编码文本
    encoded = my_pre_tokenizer.batch_encode_plus(
        texts,
        truncation=True,          # 超长截断
        padding="max_length",     # 填充到统一长度
        max_length=500,           # 最大长度
        return_tensors="pt",      # 返回 PyTorch 张量
        return_length=True        # 返回实际长度（可选）
    )
    
    # 3. 提取编码结果
    input_ids = encoded["input_ids"]           # token ID 序列
    token_type_ids = encoded["token_type_ids"] # 句子类型（BERT 用）
    attention_mask = encoded["attention_mask"] # 注意力掩码
    
    # 4. 标签转为 LongTensor
    labels = torch.Tensor(labels, dtype=torch.long)
    return inputs_ids, token_type_ids, attention_mask, labels
```

### 2.3 得到Dataloader

该函数用于加载训练数据，并返回一个可迭代的 `DataLoader` 对象，支持自动批处理、打乱顺序和自定义样本拼接逻辑。

✅代码实现

```python
def get_dataloader():
    """
    加载训练数据集，并构建 DataLoader 对象，用于模型训练。

    Returns:
        DataLoader: 配置好的训练数据加载器
    """
    
    # 1. 加载训练集（CSV 格式）
    train_dataset = load_dataset('csv', data_files="./data/train.csv", split="train")
    
    
    # 2. 实例化 DataLoader
    my_dataloader = DataLoader(
        dataset=train_dataset,      # 数据集对象
        batch_size=8,               # 每批样本数
        shuffle=True,               # 是否打乱顺序
        collate_fn=collate_fn1,     # 自定义样本拼接函数（需提前定义）
        drop_last=True              # 舍弃最后一个不足 batch_size 的批次
    )
    #  print(f'my_dataloader-->{len(my_dataloader)}')
    
    
    # 3. 【可选】测试 DataLoader 输出格式
    # for input_ids, token_type_ids, attention_mask, labels in my_dataloader:
    #     print(f"input_ids shape: {input_ids.shape}")
    #     print(f"token_type_ids shape: {token_type_ids.shape}")
    #     print(f"attention_mask shape: {attention_mask.shape}")
    #     print(f"labels shape: {labels.shape}")
    #     break  # 只打印一个 batch 用于检查

    return my_dataloader
```

## 3 搭建模型

采用 **BERT 预训练模型 + 自定义分类层** 的架构：

- **BERT** 负责提取文本特征（冻结参数，不参与训练）
- **自定义线性层** 完成最终二分类任务

✅代码实现

```python
# 自定义下游任务模型
class AiModel(nn.Module):
    def __init__(self):
        """
        初始化分类模型。
        仅定义一个线性分类层，输入维度为 768（BERT 的 pooler_output），输出维度为 2（二分类）。
        """
        super().__init__()
        self.linear = nn.Linear(768, 2)  # 二分类输出

    def forward(self, input_ids, token_type_ids, attention_mask):
        """
        前向传播。

        Args:
            input_ids: token ID 序列，shape = [batch_size, seq_len]
            token_type_ids: 句子类型编码，shape = [batch_size, seq_len]
            attention_mask: 注意力掩码，shape = [batch_size, seq_len]

        Returns:
            logits: 分类 logits，shape = [batch_size, 2]
        """
        
        # 冻结 BERT 参数，不参与梯度更新
        # my_pre_model代表bert预训练模型的对象
        with torch.no_grad():
            bert_output = my_pre_model(input_ids=input_ids, 				  									  attention_mask=attention_mask,token_type_ids=token_type_ids)
        
        # print(f'bert模型的输出结果-->{bert_output}')
        # print(f'bert模型的last_hidden_state-->{bert_output.last_hidden_state.shape}')
        # print(f'bert模型的pooler_output-->{bert_output.pooler_output.shape}')
        # bert模型的输出结果包括：last_hidden_state，pooler_output
        # last_hidden_state（最后一层）--》[8,300,768]-->8个样本，每个样本300个单词，每个单词用768维度的向量表示
        # pooler_output--》[8,768]-->这个代表8个样本，每个样本都用768维度的向量表示。
        # bert模型输出有一个特殊的字符CLS，pooler_output的结果是每一个样本得到CLS这个token对应的向量表示，
        # 原始论文中说明：当利用bert模型去做分类任务的时候，一般直接取CLS这个token对应的向量表示当前这个样本的特征，进行实现分类
        
        # 提取 BERT 的 pooler_output（即 [CLS]  token 的表示）
        # shape: [batch_size, 768]
        pooled_output = bert_output.pooler_output
        
        # 传入分类层，得到 logits
        output = self.linear(pooled_output) # output-->[8, 2]
        
        return output
```

🔍 BERT 输出解释（供参考）

| 字段名              | 含义说明                             | 形状示例        |
| :------------------ | :----------------------------------- | :-------------- |
| `last_hidden_state` | 最后一层所有 token 的隐藏状态        | `[8, 300, 768]` |
| `pooler_output`     | [CLS] token 的进一步处理后的向量表示 | `[8, 768]`      |

> 对于分类任务，**直接使用 `pooler_output` 是最常见做法**，它已足够表达整个句子的语义。

⚠️ 注意事项

- 务必在训练前设置 `my_pre_model.eval()`，避免 Dropout/BatchNorm 影响推理。
- 若后续需 **微调 BERT**，可移除 `torch.no_grad()` 并解冻部分层。



## 4 模型训练

在使用 **BERT 预训练模型 + 自定义分类层** 时，训练阶段需特别注意以下三点：

**🔒 1. 冻结 BERT 参数（不参与训练）**

- **目的**：仅训练自定义层，避免破坏预训练权重。

- **操作**：

  ```python
  for param in my_pre_model.parameters():
      param.requires_grad = False
  ```



**🎯 2. 设置模型模式**

- **自定义模型**：

  ```python
  my_model.train()  # 启用 Dropout / BN 训练行为
  ```

- **预训练 BERT**：

  ```python
  my_pre_model.eval()  # 保持评估模式，关闭 Dropout
  ```



**🚀 3. GPU 训练必备三件套**

| 步骤                 | 操作对象       | 示例代码                           |
| :------------------- | :------------- | :--------------------------------- |
| ① 预训练模型移至 GPU | `my_pre_model` | `my_pre_model.to('cuda')`          |
| ② 自定义模型移至 GPU | `my_model`     | `my_model.to('cuda')`              |
| ③ 输入数据移至 GPU   | 每个 batch     | `input_ids = input_ids.to('cuda')` |

> ✅ 建议：统一使用 `device = torch.device("cuda" if torch.cuda.is_available() else "cpu")` 避免硬编码。



✅代码实现

```python
# 定义训练方法
def train_model():
    """完整训练流程：仅训练自定义分类层，BERT 参数冻结。"""
    
    # 1.加载训练数据集
    train_dataset = load_dataset('csv', data_files="./data/train.csv", split="train")
    
    # 2.实例化模型并移至设备
    my_model = AiModel().to(device)
    
    # 3. 冻结 BERT 参数（不计算梯度）
    for param in my_pre_model.parameters():
        param.requires_grad_(False)
 
    # p.numel()计算每个参数的元素个数
    # total_params = sum(p.numel() for p in my_pre_model.parameters())
    
    # 4.实例化损失函数对象
    # mean计算一个批次样本的平均损失，sum是损失之和，
    my_crossentropy = nn.CrossEntropyLoss(reduction='mean')
    
    # 5.实例化优化器
    my_adamw = AdamW(my_model.parameters(), lr=5e-4)
    
    # 6.设置模型为训练模型
    my_model.train()  # 训练模式（Dropout/BN 生效）
    
    # 7.开始训练
    num_epochs = 3
    for epoch_idx in range(num_epochs):
        start_time = time.time()
        
        # 每轮重新实例化 DataLoader（可实现不同的 shuffle）
        my_dataloader = DataLoader(
            dataset=train_dataset,
            batch_size=8,
            shuffle=True,
            collate_fn=collate_fn1,
            drop_last=True
        )
        
        # 8. 内部数据迭代
        for i, (inputs_ids, token_type_ids, attention_mask, labels) in enumerate(tqdm(my_dataloader), start=1):
            
            # 9. 数据移至 GPU/CPU
            inputs_ids = inputs_ids.to(device)
            token_type_ids = token_type_ids.to(device)
            attention_mask = attention_mask.to(device)
            labels = labels.to(device)
            
            # 10. 前向传播
            output = my_model(inputs_ids, token_type_ids, attention_mask,)

            # 11. 计算损失
            loss = my_crossentropy(output, labels)
            
            # 12. 反向传播 & 参数更新
            # 梯度清零
            my_adamw.zero_grad()
            # 反向传播
            loss.backward()
            # 梯度更新
            my_adamw.step()

            # 13. 打印日志：每隔5步计算平均准确率
            if i % 5 == 0:
                tem = torch.argmax(output, dim=-1)
                acc = (tem == labels).sum().item() / len(labels)
                use_time = time.time() - start_time
                print("当前训练的轮次%d,迭代的步数%d,当前的损失%.2f, 当前的准确率%.2f, 时间%d"%(epoch_idx+1, i, loss, acc, use_time))

        # 14. 每轮保存一次权重
        torch.save(my_model.state_dict(), "./AI20_model/classify_%d.bin"%(epoch_idx+1))
```

## 5 模型预测

在进行模型预测时，为确保结果正确且高效，需特别注意以下两点：

**🔒 1. 设置评估模式**

- **目的**：关闭 Dropout 和 BatchNorm 的训练行为，确保推理结果稳定。

- **操作**：

  ```python
  model.eval()
  ```

  

**🚫 2. 关闭梯度计算**

- **目的**：减少内存消耗，加速推理。

- **操作**：

  ```python
  with torch.no_grad():
      outputs = model(inputs)
  ```

  

**🔄 3. 跨设备加载模型（GPU → CPU）**

若模型在 **GPU** 上训练，但希望在 **CPU** 上进行预测，需使用 `map_location` 参数：

```python
model.load_state_dict(torch.load(path, map_location="cpu"))
```

> ✅ 作用：将模型参数映射到 CPU，避免设备不匹配错误。



✅代码实现

```python
# 定义模型评估方法
def test_model():
    """在测试集上评估模型性能，输出平均准确率并打印部分预测样例。"""
    
    # 1. 加载测试集（CSV 格式）
    test_dataset = load_dataset('csv', data_files="./data/test.csv", split="train")
    
    # 2. 构建测试 DataLoader
    test_dataloader = DataLoader(
        dataset=test_dataset,
        batch_size=8,
        shuffle=True,               # 可设为 False，保持顺序
        collate_fn=collate_fn1,     # 需提前定义
        drop_last=True
    )
    
    # 3. 加载训练好的模型（CPU）
    path = './AI20_model/classify_3.bin'
    my_model = AiModel()
    my_model.load_state_dict(torch.load(path, map_location="cpu")) #将模型放到cpu上
    # my_model = my_model.to("cpu")  # 若已 map_location，可省略
    
    # 4. 初始化评估指标
    correct = 0
    total = 0
    
    # 5.设置模型为评估模式（关闭 Dropout/BN）
    my_model.eval()
    
    # 6.迭代数据送入模型
    for i, (inputs_ids, token_type_ids, attention_mask, labels )in enumerate(tqdm(test_dataloader), start=1):
        with torch.no_grad():  # 关闭梯度，节省内存
            output = my_model(inputs_ids, token_type_ids, attention_mask,)

        # 得到预测的最大概率值的索引
        temp = torch.argmax(output, dim=-1)
        
        # 得到预测正确的个数
        correct += (temp == labels).sum().item()
        
        # 当前训练的样本个数
        total += len(labels)
        
        # 每隔5步打印测试的结果
        if i % 5 == 0:
            print(f'平均准确率-->{correct/total}')
            
            # 取出一个批次的第一个样本来查验是否预测正确
            text_list = my_pre_tokenizer.decode(inputs_ids[0],skip_special_tokens=True)
            print(f'原始的文本是--》{text_list}', end='    ')
            print(f'模型预测的结果是：{temp[0]}, 真实的结果是:{labels[0]}')
```
