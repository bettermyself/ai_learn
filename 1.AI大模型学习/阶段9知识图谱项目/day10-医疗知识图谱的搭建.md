## 1. 图数据库选型

### 1.1 主流方案对比

| 数据库类型       | 代表产品          | 适用场景               | 核心优势                           |
| :--------------- | :---------------- | :--------------------- | :--------------------------------- |
| **属性图数据库** | Neo4j             | 医疗知识图谱、社交网络 | Cypher查询简洁、社区活跃、性能优异 |
| **RDF三元组库**  | GraphDB, Virtuoso | 语义网、科学文献图谱   | 支持OWL/RDF标准、强推理能力        |

**决策建议**：医疗领域关系复杂且查询模式多变，**Neo4j**是首选方案。



### 1.2 图数据库 vs 关系型数据库

| 对比维度     | Neo4j图数据库                  | MySQL关系型数据库              |
| :----------- | :----------------------------- | :----------------------------- |
| **关系处理** | 原生支持多跳关系查询，性能恒定 | 多表Join性能随关系深度急剧下降 |
| **数据模型** | 无模式(Schema-free)，灵活演进  | 表结构固定，变更成本高         |
| **查询语言** | Cypher语法直观，聚焦关系       | SQL复杂，关系查询表达繁琐      |
| **扩展性**   | 水平扩展支持海量关联数据       | 垂直扩展为主，分片复杂         |
| **推理能力** | 内置路径算法、图分析           | 需应用层实现，开发成本高       |

💡 **医疗场景典型需求**：查询"某疾病的禁忌食物→推荐替代食谱→相关并发症"这类3-4跳关联查询，Neo4j性能比MySQL快**10-100倍**。



## 2. 图谱搭建实战

### 2.1 数据准备

#### 2.1.1 数据集说明

**⚠️ 数据来源**：由于企业数据隐私限制，本次使用开源医疗数据集`medical.json`

| 属性         | 说明                                          |
| :----------- | :-------------------------------------------- |
| **存储位置** | `./NLP/MedicalKB/graph_data/medical.json`     |
| **数据规模** | 8,808条疾病记录                               |
| **单条格式** | JSON Lines（每行一个独立JSON对象）            |
| **核心内容** | 疾病名称、症状、药品、食物、检查等20+维度信息 |



#### 2.1.2 数据结构预览

```python
# 定义：数据探查函数
# 功能：读取并格式化展示JSON数据的前5条样本
# 参数：data_path - JSON文件路径
def print_data_info(data_path):
    """
    展示medical.json数据格式与样本内容
    
    Args:
        data_path (str): JSON文件路径
        
    Returns:
        None: 直接打印数据概览
    """
    i = 0
    # 以utf8编码读取文件，确保中文字符正常解析
    with open(data_path, 'r', encoding='utf8') as f:
        lines = f.readlines()
        print(f'数据长度：{len(lines)}')  # 输出：8808条样本
    
    # 逐行解析JSON并格式化打印前5条
    for line in lines:
        data = json.loads(line)
        # 使用indent=4美化输出，ensure_ascii=False保留中文字符
        print(json.dumps(data, sort_keys=True, indent=4, 
                        separators=(', ',': '), ensure_ascii=False))
        i += 1
        if i >= 5:  # 仅展示5条样本后跳出
            break

# 执行数据探查
data_path = "./graph_data/medical.json"
print_data_info(data_path)
```



#### 2.1.3 核心字段语义映射表

| 字段名           | 数据类型     | 业务含义 | 图谱角色        |
| :--------------- | :----------- | :------- | :-------------- |
| `name`           | String       | 疾病名称 | **核心实体**    |
| `symptom`        | List[String] | 临床表现 | 关系：疾病→症状 |
| `recommand_drug` | List[String] | 治疗药品 | 关系：疾病→药品 |
| `do_eat`         | List[String] | 宜吃食物 | 关系：疾病→食物 |
| `not_eat`        | List[String] | 禁忌食物 | 关系：疾病→食物 |
| `acompany`       | List[String] | 并发症   | 关联疾病实体    |
| `desc`           | String       | 疾病描述 | 实体属性        |



### 2.2 三元组提取

#### 2.2.1 设计思路

**目标**：将JSON数据转换为**实体-关系-实体**三元组(SPO)格式，适配Neo4j导入规范。

**💡 核心设计原则**：

- **实体归一化**：同一实体在全局只创建一次节点
- **关系去重**：避免重复边导致数据膨胀
- **批量处理**：使用tqdm展示进度，支持断点续传



#### 2.2.2 实体与关系定义

**实体类型表**

| 实体中文名 | 代码标识   | 来源字段                        | 节点标签(Label) |
| :--------- | :--------- | :------------------------------ | :-------------- |
| 疾病       | `diseases` | `name`, `acompany`              | 疾病            |
| 症状       | `symptoms` | `symptom`                       | 症状            |
| 食物       | `foods`    | `do_eat`, `not_eat`             | 食物            |
| 药品       | `drugs`    | `recommand_drug`, `drug_detail` | 药品            |

**关系类型表**

| 关系类型      | Cypher关系类型   | 头实体 | 尾实体 | 业务含义     |
| :------------ | :--------------- | :----- | :----- | :----------- |
| 疾病-症状     | `has_symptom`    | 疾病   | 症状   | 临床表现关联 |
| 疾病-忌吃食物 | `not_eat`        | 疾病   | 食物   | 饮食禁忌     |
| 疾病-宜吃食物 | `do_eat`         | 疾病   | 食物   | 饮食推荐     |
| 疾病-推荐药品 | `recommand_drug` | 疾病   | 药品   | 治疗方案     |



#### 2.2.3 核心实现代码

```python
from py2neo import Graph
from tqdm import tqdm

class MedicalExtractor:
    """
    医疗知识图谱三元组提取与Neo4j写入引擎
    
    功能：
    1. 解析medical.json原始数据
    2. 抽取四类实体与四组关系
    3. 批量写入Neo4j图数据库
    """
    
    def __init__(self):
        """
        初始化图数据库连接与数据容器
        
        连接配置：
        - URI: http://localhost:7474
        - 用户名: neo4j
        - 密码: 12345678
        """
        # 初始化Neo4j连接，auth参数为用户名密码认证
        self.graph = Graph("neo4j://localhost:7687", auth=("neo4j", "12345678"))
        
        # 初始化实体容器（使用列表存储，后续会去重）
        self.drugs = []      # 药品实体池
        self.foods = []      # 食物实体池
        self.diseases = []   # 疾病实体池
        self.symptoms = []   # 症状实体池
        
        # 初始化关系容器（每个元素为[头实体, 关系, 尾实体]）
        self.rels_noteat = []          # 疾病-忌吃食物关系
        self.rels_doeat = []           # 疾病-宜吃食物关系
        self.rels_recommanddrug = []   # 疾病-推荐药品关系
        self.rels_symptom = []         # 疾病-症状关系
    
    def extract_triples(self, data_path):
        """
        从JSON文件抽取实体与关系三元组
        
        Args:
            data_path (str): medical.json文件路径
            
        处理逻辑：
        1. 逐行读取（支持大文件）
        2. 提取疾病名称作为主实体
        3. 遍历各字段抽取关联实体与关系
        4. 使用set自动去重
        """
        print("从json文件中转换抽取三元组")
        
        # 使用tqdm显示进度条，ncols=80固定宽度
        with open(data_path, 'r', encoding='utf8') as f:
            for line in tqdm(f.readlines(), ncols=80):
                data_json = json.loads(line)
                disease = data_json['name']  # 疾病名称作为中心节点
                
                # 疾病实体加入疾病池（允许重复，后续统一去重）
                self.diseases.append(disease)
                
                # 1. 处理症状关系
                if 'symptom' in data_json:
                    # 将症状列表扩展到全局症状池
                    self.symptoms += data_json['symptom']
                    # 为每个症状构建[disease, 'has_symptom', symptom]三元组
                    for symptom in data_json['symptom']:
                        self.rels_symptom.append([disease, 'has_symptom', symptom])
                
                # 2. 处理并发症（作为独立疾病节点）
                if 'acompany' in data_json:
                    for acompany in data_json['acompany']:
                        self.diseases.append(acompany)  # 并发症也作为疾病实体
                
                # 3. 处理推荐药品关系
                if 'recommand_drug' in data_json:
                    recommand_drug = data_json['recommand_drug']
                    self.drugs += recommand_drug  # 扩展药品实体池
                    for drug in recommand_drug:
                        self.rels_recommanddrug.append([disease, 'recommand_drug', drug])
                
                # 4. 处理饮食关系（忌吃+宜吃）
                if 'not_eat' in data_json:
                    not_eat = data_json['not_eat']
                    self.foods += not_eat  # 禁忌食物加入食物实体池
                    for _not in not_eat:
                        self.rels_noteat.append([disease, 'not_eat', _not])             
                
                if 'do_eat' in data_json:
                    do_eat = data_json['do_eat']
                    self.foods += do_eat  # 推荐食物加入食物实体池
                    for _do in do_eat:
                        self.rels_doeat.append([disease, 'do_eat', _do])
                
                # 5. 处理药品详情（解析括号格式）
                if 'drug_detail' in data_json:
                    for det in data_json['drug_detail']:
                        # 解析格式："品牌名(通用名)" 或 "药品名"
                        det_spilt = det.split('(')
                        if len(det_spilt) == 2:
                            # 提取通用名并去除右括号
                            p, d = det_spilt
                            d = d.rstrip(')')
                            self.drugs.append(d)
                        else:
                            d = det_spilt[0]
                            self.drugs.append(d)
```



### 2.3 实体插入Neo4j

#### 2.3.1 写入策略

**批量写入原则**：

- **MERGE语法**：确保实体唯一性（存在则忽略，不存在则创建）
- **Label分类**：为不同实体类型创建独立标签（疾病、症状、食物、药品）
- **异常捕获**：单条失败不影响整体流程，打印日志便于排查

#### 2.3.2 核心实现代码

```python
    def write_nodes(self, entitys, entity_type):
        """
        将实体批量写入Neo4j（带自动去重）
        
        Args:
            entitys (list): 实体名称列表
            entity_type (str): 实体类型（中文标签名）
            
        Cypher语句说明：
        MERGE(n:疾病{name:'苯中毒'}) 
        - MERGE：无则创建，有则跳过（避免重复）
        - 标签：使用中文Label便于后续查询理解
        - name属性：作为实体的主标识
        """
        print("写入 {0} 实体".format(entity_type))
        
        # 使用set去重，避免重复创建节点
        for node in tqdm(set(entitys), ncols=80):
            # 转义单引号防止Cypher语法错误
            safe_name = node.replace("'", "")
            
            # 构造MERGE语句（高效的去重插入方式）
            cql = """MERGE(n:{label}{{name:'{entity_name}'}})""".format(
                label=entity_type, entity_name=safe_name)
            
            try:
                self.graph.run(cql)  # 执行Cypher语句
            except Exception as e:
                # 异常处理：打印错误语句便于调试
                print(e)
                print(cql)
    
    def create_entitys(self):
        """
        统一调度四类实体的写入任务
        
        执行顺序：药品 → 症状 → 食物 → 疾病
        原因：关系创建时依赖头尾实体已存在
        """
        self.write_nodes(self.drugs, '药品')
        self.write_nodes(self.symptoms, '症状')  # ⚠️ 注意：原文本为'菜谱'，此处修正为'症状'
        self.write_nodes(self.foods, '食物')
        self.write_nodes(self.diseases, '疾病')
```



### 2.4 关系插入Neo4j

#### 2.4.1 写入策略

**关系创建要点**：

- **MATCH先行**：先定位头尾实体节点（确保实体已存在）
- **MERGE关系**：避免重复关系边
- **方向性**：统一采用`疾病→目标`的有向关系（符合业务逻辑）

#### 2.4.2 核心实现代码

```python
    def write_edges(self, triples, head_type, tail_type):
        """
        将关系三元组写入Neo4j
        
        Args:
            triples (list): [[头实体, 关系, 尾实体], ...]
            head_type (str): 头实体类型（Label）
            tail_type (str): 尾实体类型（Label）
            
        Cypher语句说明：
        MATCH(p:疾病),(q:症状)
        WHERE p.name='苯中毒' AND q.name='恶心'
        MERGE (p)-[r:has_symptom]->(q)
        
        执行步骤：
        1. MATCH定位头尾节点（要求实体已创建）
        2. WHERE通过name属性精确匹配
        3. MERGE创建有向关系（幂等操作）
        """
        print("写入 {0} 关系".format(triples[0][1]))
        
        for head, relation, tail in tqdm(triples, ncols=80):
            # 转义特殊字符，避免Cypher语法错误
            safe_head = head.replace("'", "")
            safe_tail = tail.replace("'", "")
            
            # 构造MATCH...MERGE复合语句
            cql = """MATCH(p:{head_type}),(q:{tail_type})
                    WHERE p.name='{head}' AND q.name='{tail}'
                    MERGE (p)-[r:{relation}]->(q)""".format(
                        head_type=head_type, tail_type=tail_type,
                        head=safe_head, tail=safe_tail, relation=relation)
            
            try:
                self.graph.run(cql)
            except Exception as e:
                print(e)
                print(cql)  # 打印失败语句便于问题排查
    
    def create_relations(self):
        """
        统一调度四组关系的写入任务
        
        依赖前提：create_entitys()已执行完成
        """
        # 写入饮食禁忌关系（疾病→食物）
        self.write_edges(self.rels_noteat, '疾病', '食物')
        
        # 写入饮食推荐关系（疾病→食物）
        self.write_edges(self.rels_doeat, '疾病', '食物')
        
        # 写入症状关系（疾病→症状）
        self.write_edges(self.rels_symptom, '疾病', '症状')
        
        # 写入药品推荐关系（疾病→药品）
        self.write_edges(self.rels_recommanddrug, '疾病', '药品')
```

------

### 2.5 完整执行流程

> **💡 推荐执行顺序**：
>
> ```python
> extractor = MedicalExtractor()          # Step 1: 初始化连接
> extractor.extract_triples(data_path)    # Step 2: 抽取三元组（耗时较长）
> extractor.create_entitys()              # Step 3: 写入实体（约2-5分钟）
> extractor.create_relations()            # Step 4: 写入关系（约5-10分钟）
> ```

> **拓展1：python的拆包机制**
>
> Python的**拆包机制（Unpacking）** 是一种将可迭代对象中的元素赋值给多个变量的简洁语法。这是Python中非常强大且常用的特性，能让代码更简洁、可读性更强。
>
> ### 一、基本拆包
>
> #### 1. 元组/列表拆包
>
> ```python
> # 元组拆包
> coordinates = (10, 20)
> x, y = coordinates
> print(x, y)  # 输出: 10 20
> 
> # 列表拆包
> numbers = [1, 2, 3]
> a, b, c = numbers
> print(a, b, c)  # 输出: 1 2 3
> ```
>
> #### 2. 字符串拆包
>
> ```python
> word = "abc"
> first, second, third = word
> print(first, second, third)  # 输出: a b c
> ```
>
> ### 二、高级拆包技巧
>
> #### 1. 扩展拆包（Python 3+）
>
> 使用 `*` 捕获剩余的多个元素：
>
> ```python
> # 捕获开头和剩余
> first, *rest = [1, 2, 3, 4, 5]
> print(first)  # 1
> print(rest)   # [2, 3, 4, 5]
> 
> # 捕获中间和两端
> first, *middle, last = [1, 2, 3, 4, 5]
> print(middle)  # [2, 3, 4]
> 
> # 仅捕获两端
> first, *_, last = [1, 2, 3, 4, 5]  # _ 是惯例，表示不关心的值
> ```
>
> #### 2. 嵌套拆包
>
> ```python
> data = (1, (2, 3), 4)
> a, (b, c), d = data
> print(b, c)  # 输出: 2 3
> ```
>
> ### 三、常见应用场景
>
> #### 1. 函数返回多个值
>
> ```python
> def get_user_info():
>  return "Alice", 25, "alice@example.com"
> 
> name, age, email = get_user_info()
> ```
>
> #### 2. 遍历字典
>
> ```python
> for key, value in {"name": "Bob", "age": 30}.items():
>  print(f"{key}: {value}")
> ```
>
> #### 3. 交换变量（Pythonic方式）
>
> ```python
> a, b = 1, 2
> a, b = b, a  # 无需临时变量
> ```
>
> #### 4. 处理可迭代对象
>
> ```python
> first, second, *rest, last = range(10)
> ```
>
> ### 四、注意事项
>
> 1.**数量必须匹配**：变量数量要与元素数量一致，除非使用 `*`
>
> ```python
> # 错误示例
> # a, b = [1, 2, 3]  # ValueError: too many values to unpack
> ```
>
> 
>
> 2.**`\*` 只能用一个**  ：在赋值表达式中只能有一个 `*` 表达式
>
> Python
>
> 复制
>
> ```python
> # 错误示例
> # a, *b, *c = [1, 2, 3, 4]  # SyntaxError
> ```
>
> 3.**空的可迭代对象**：使用 `*` 时可能得到空列表
>
> ```python
> first, *rest = [1]  # rest -> []
> ```
>
> 4.**类型灵活**：拆包适用于任何可迭代对象（元组、列表、字符串、集合、生成器等）
>
> ### 五、Python 3.5+ 的扩展
>
> #### 拆包在函数调用中
>
> ```python
> def add(a, b, c):
>  return a + b + c
> 
> nums = (1, 2, 3)
> result = add(*nums)  # 等价于 add(1, 2, 3)
> 
> # 字典拆包（用于关键字参数）
> config = {"host": "localhost", "port": 8080}
> connect(**config)  # 等价于 connect(host="localhost", port=8080)
> ```
>
> 💡拆包机制是Python简洁哲学的重要体现，合理使用可以让代码更优雅、更易读。
>
> ---
>
> **拓展2：python中的不可变数据类型**
>
> Python中的**不可变数据类型**是指对象一旦创建，其值就不能被修改的数据类型。尝试"修改"不可变对象时，实际上会创建一个新的对象。
>
> ### 一、核心不可变类型
>
> #### 1. **数字类型**
>
> - `int`（整数）
> - `float`（浮点数）
> - `complex`（复数）
> - `bool`（布尔值，属于`int`的子类）
>
> ```python
> x = 100
> print(id(x))  # 查看内存地址
> x += 1        # 创建新对象，而不是修改原对象
> print(id(x))  # 内存地址已改变
> ```
>
> #### 2. **字符串（str）**
>
> ```python
> s = "hello"
> print(id(s))
> s = s.upper()  # 返回新字符串，原字符串不变
> print(id(s))   # 内存地址改变
> 
> # 字符串操作都不会修改原字符串
> new_s = s.replace('l', 'L')  # 返回新字符串
> ```
>
> #### 3. **元组（tuple）**
>
> ```python
> t = (1, 2, 3)
> # t[0] = 10  # TypeError: 'tuple' object does not support item assignment
> 
> # 但元组中的可变对象可以被修改
> t2 = (1, [2, 3], 4)
> t2[1].append(5)  # 合法！元组本身未变，但列表元素变了
> print(t2)        # (1, [2, 3, 5], 4)
> ```
>
> #### 4. **冻结集合（frozenset）**
>
> ```python
> fs = frozenset([1, 2, 3])
> # fs.add(4)  # AttributeError: 'frozenset' object has no attribute 'add'
> ```
>
> #### 5. **字节（bytes）**
>
> ```python
> b = b"hello"
> # b[0] = 104  # TypeError: 'bytes' object does not support item assignment
> ```
>
> ### 二、不可变性的核心特征
>
> #### 1. **内存地址变化**
>
> ```python
> a = 1000
> print(f"原地址: {id(a)}")
> a = a + 1
> print(f"新地址: {id(a)}")  # 地址不同，说明是新对象
> ```
>
> #### 2. **可哈希（Hashable）**
>
> 不可变对象可以作为字典键和集合元素：
>
> ```python
> # 合法
> d = {1: "one", "two": 2, (3, 4): "tuple"}
> s = {1, 2, "hello", (3, 4)}
> 
> # 非法（列表是可变的）
> # d = {[1, 2]: "value"}  # TypeError: unhashable type: 'list'
> ```
>
> ### 三、不可变 vs 可变类型对比
>
> | 不可变类型  | 可变类型    | 关键区别                 |
> | :---------- | :---------- | :----------------------- |
> | `int`       | -           | 赋值即创建新对象         |
> | `float`     | -           | 数值不可修改             |
> | `str`       | -           | 修改操作返回新字符串     |
> | `tuple`     | `list`      | 元组不能增删改元素       |
> | `frozenset` | `set`       | 冻结集合不能修改         |
> | `bytes`     | `bytearray` | 字节不可变，字节数组可变 |
>
> ```python
> # 对比示例
> # 列表（可变）
> lst = [1, 2, 3]
> lst[0] = 100  # 原地修改，id不变
> 
> # 元组（不可变）
> tup = (1, 2, 3)
> # tup[0] = 100  # 报错！
> ```
>
> ### 四、不可变性的优势
>
> 1. **线程安全**：多线程环境下无需加锁
> 2. **字典键**：可作为字典的键
> 3. **性能优化**：Python可缓存和复用不可变对象
> 4. **逻辑清晰**：值不会被意外修改，减少bug
>
> ```python
> # Python的小整数缓存
> a = 100
> b = 100
> print(a is b)  # True（-5到256的整数会被缓存）
> 
> c = 1000
> d = 1000
> print(c is d)  # False（大整数不缓存）
> ```
>
> ### 五、重要注意事项
>
> #### 1. **元组的"可变"陷阱**
>
> ```python
> t = (1, 2, [3, 4])
> print(id(t))
> t[2].append(5)  # 合法！修改了元组内的列表
> print(id(t))    # 元组id未变，但内容已"变"
> print(t)        # (1, 2, [3, 4, 5])
> ```
>
> #### 2. **字符串拼接的性能问题**
>
> ```python
> # 低效方式（频繁创建新对象）
> result = ""
> for i in range(1000):
>     result += str(i)  # 每次循环都创建新字符串
> 
> # 高效方式（使用列表）
> parts = []
> for i in range(1000):
>     parts.append(str(i))
> result = "".join(parts)
> ```
>
> #### 3. **函数默认参数陷阱**
>
> ```python
> # 错误示范（使用可变默认参数）
> def add_item(item, lst=[]):
>     lst.append(item)
>     return lst
> 
> # 正确示范（使用不可变默认参数）
> def add_item(item, lst=None):
>     if lst is None:
>         lst = []
>     lst.append(item)
>     return lst
> ```
>
> ---
>
> **拓展3：魔法方法与私有化方法**
>
> Python中**魔法方法**和**私有化方法**是两种完全不同的概念，虽然它们都使用下划线命名，但目的、机制和使用场景截然不同。
>
> ### 一、魔法方法 (Magic Methods)
>
> #### 核心特征
>
> - **命名格式**：`__名字__`（双下划线开头**和结尾**）
> - **调用机制**：由Python解释器**自动调用**，而非手动调用
> - **设计目的**：实现Python的**协议和运算符重载**
>
> #### 常见魔法方法
>
> ```python
> class MagicDemo:
>     def __init__(self, name):      # 构造方法，创建对象时自动调用
>         self.name = name
>     
>     def __str__(self):             # str(obj)时自动调用
>         return f"Magic: {self.name}"
>     
>     def __len__(self):             # len(obj)时自动调用
>         return len(self.name)
>     
>     def __add__(self, other):      # obj + other时自动调用
>         return MagicDemo(self.name + other.name)
>     
>     def __getitem__(self, index):  # obj[index]时自动调用
>         return self.name[index]
> 
> # 使用示例
> obj1 = MagicDemo("Hello")   # 自动调用 __init__
> print(obj1)                 # 自动调用 __str__
> print(len(obj1))            # 自动调用 __len__
> obj2 = obj1 + MagicDemo(" World")  # 自动调用 __add__
> print(obj2[0])              # 自动调用 __getitem__
> ```
>
> #### 本质
>
> 魔法方法是Python的**钩子函数**（hook），让你能自定义对象的行为，使其"像内置类型一样工作"。
>
> 
>
> ### 二、私有化方法 (Private Methods)
>
> #### 核心特征
>
> - **命名格式**：`_名字` 或 `__名字`（双下划线开头，**单下划线结尾或没有**）
> - **调用机制**：需要**手动调用**
> - **设计目的**：**隐藏实现细节**，防止外部直接访问
>
> #### 1. 单下划线（"保护"方法）
>
> ```python
> class PrivateDemo:
>     def _internal_helper(self):  # 约定为内部使用，但可以被外部访问
>         return "内部方法"
> 
> obj = PrivateDemo()
> obj._internal_helper()  # 可以调用，但IDE会警告
> ```
>
> #### 2. 双下划线（真正私有化）
>
> ```python
> class PrivateDemo:
>     def __private_method(self):  # 触发名称改写
>         return "真正的私有方法"
>     
>     def public_method(self):
>         return self.__private_method()  # 类内部可以正常调用
> 
> obj = PrivateDemo()
> # obj.__private_method()  # AttributeError: 'PrivateDemo' object has no attribute '__private_method'
> 
> # 实际上被改写为：
> obj._PrivateDemo__private_method()  # 可以强制访问（不推荐）
> ```
>
> #### 本质
>
> 私有化是**命名约定 + 名称改写机制**，Python没有真正的访问控制，而是通过**名称改写（name mangling）** 让外部难以访问。
>
> 
>
> ### 三、核心区别对比
>
> | 特性             | 魔法方法                     | 私有化方法                    |
> | :--------------- | :--------------------------- | :---------------------------- |
> | **命名**         | `__init__`, `__str__`        | `_private`, `__private`       |
> | **调用方式**     | 解释器自动调用               | 手动调用                      |
> | **目的**         | 实现协议/运算符重载          | 隐藏实现细节                  |
> | **能否手动调用** | 可以但不推荐                 | 必须手动调用                  |
> | **名称改写**     | 不会改写                     | `__name` → `_ClassName__name` |
> | **访问性**       | 公开，鼓励使用               | 限制外部访问                  |
> | **示例**         | `len(obj)` → `obj.__len__()` | `obj.__method()` → 报错       |
>
> 
>
> ### 四、实际应用示例
>
> #### 魔法方法：自定义列表类
>
> ```python
> class MyList:
>     def __init__(self, items):
>         self._data = list(items)
>     
>     def __len__(self):
>         return len(self._data)
>     
>     def __getitem__(self, index):
>         return self._data[index]
>     
>     def __repr__(self):
>         return f"MyList({self._data})"
> 
> ml = MyList([1, 2, 3])
> print(len(ml))      # 3
> print(ml[1])        # 2
> print(ml)           # MyList([1, 2, 3])
> ```
>
> #### 私有化方法：内部实现保护
>
> ```python
> class BankAccount:
>     def __init__(self, balance):
>         self.__balance = balance  # 私有属性
>     
>     def __calculate_fee(self, amount):  # 私有方法
>         """内部手续费计算逻辑，不希望外部调用"""
>         return amount * 0.01
>     
>     def withdraw(self, amount):
>         fee = self.__calculate_fee(amount)  # 内部使用
>         if self.__balance >= amount + fee:
>             self.__balance -= amount + fee
>             return True
>         return False
> 
> account = BankAccount(1000)
> # account.__calculate_fee(100)  # 报错！外部无法直接访问
> account.withdraw(100)           # 合法，通过公开方法操作
> ```
>
> 
>
> ### 五、关键总结
>
> 1. **魔法方法是Python的"接口"**，定义对象如何与语言特性交互（如`+`, `len()`, `print()`）
> 2. **私有化方法是"封装"工具**，用于隐藏内部实现，遵守"约定优于强制"的原则
> 3. **魔法方法名是固定的**（如`__add__`），私有化方法名由开发者自定义
> 4. **魔法方法不是真的"魔法"**，只是Python在特定场景下自动调用的普通方法