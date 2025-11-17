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