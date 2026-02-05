pickle是 Python 原生的序列化模块，用于将 Python 对象转换为字节流（Pickling），或将字节流恢复为对象（Unpickling）。

## ⚠️ 核心安全警告

> 严禁 unpickle（反序列化）不可信的数据。
>
> pickle 模块是不安全的。构建恶意的 pickle 数据可以在解包时执行任意代码。绝对不要用它来在网络上传输数据或读取不受信任的来源生成的文件（这种场景请使用 JSON）。

---

## 一、 核心 API 详解与代码示例

pickle 的接口非常简洁，遵循了 Python 序列化库的标准命名习惯：带 s 的处理字符串/字节 (string/bytes)，不带 s 的处理文件 (file)。

### 1. `pickle.dump(obj, file)`

将对象序列化并写入打开的文件对象中。

* **注意**：文件必须以 **二进制写入模式** (`'wb'`) 打开。

```python
import pickle

# 准备数据
data = {
    'name': 'Alice',
    'age': 30,
    'scores': [85, 90, 88]
}

# 写入文件
with open('data.pkl', 'wb') as f:
    # protocol=pickle.HIGHEST_PROTOCOL 表示使用最高效的协议版本
    pickle.dump(data, f, protocol=pickle.HIGHEST_PROTOCOL)

print("数据已成功写入 data.pkl")
```

### 2. `pickle.load(file)`

从打开的文件对象中读取并反序列化对象。

* **注意**：文件必须以 **二进制读取模式** (`'rb'`) 打开。

```python
import pickle

# 从文件读取
with open('data.pkl', 'rb') as f:
    loaded_data = pickle.load(f)

print(f"读取的数据: {loaded_data}")
print(f"数据类型: {type(loaded_data)}")
# 输出: {'name': 'Alice', 'age': 30, 'scores': [85, 90, 88]}
```

### 3. `pickle.dumps(obj)`

将对象序列化为 bytes（字节对象），不写入文件。这在需要将对象存入数据库或通过网络发送（在受信任环境）时很有用。

```python
import pickle

my_list = [1, 2, 3, "Python"]

# 序列化为字节流
bytes_obj = pickle.dumps(my_list)

print(f"二进制流: {bytes_obj}")
# 输出类似于: b'\x80\x04\x95\x15\x00\x00...'
```

### 4. `pickle.loads(bytes_object)`

从字节对象中恢复 Python 对象。

```python
import pickle

# 假设这是刚才生成的字节流
bytes_obj = b'\x80\x04\x95\x15\x00\x00\x00\x00\x00\x00\x00]\x94(K\x01K\x02K\x03\x8c\x06Python\x94e.'

# 反序列化
restored_list = pickle.loads(bytes_obj)

print(f"恢复的对象: {restored_list}")
# 输出: [1, 2, 3, 'Python']
```

---

## 二、 进阶：自定义类的序列化

pickle 可以处理自定义类的实例。你可以通过实现 `__getstate__` 和 `__setstate__` 来控制序列化过程（例如，忽略某些临时属性）。

```python
import pickle
import time

class UserSession:
    def __init__(self, username):
        self.username = username
        self.login_time = time.time()
        # 假设这是一个不需要被保存的庞大连接对象或临时状态
        self.temp_connection = "DB_CONNECTION_OBJECT"

    def __getstate__(self):
        """定义 pickling 时保存什么属性"""
        print(f"正在打包用户: {self.username}")
        # self.__dict__ 是一个字典，存储了当前对象的所有实例属性（即对象的属性名和值）
        state = self.__dict__.copy()
        # 移除不希望被序列化的属性
        del state['temp_connection']
        return state

    def __setstate__(self, state):
        """定义 unpickling 时如何恢复状态"""
        print(f"正在恢复用户: {state['username']}")
        self.__dict__.update(state)
        # 恢复被忽略的属性
        self.temp_connection = "RECONNECTED_DB"

# 1. 创建对象
user = UserSession("GeminiUser")
print(f"原始连接状态: {user.temp_connection}")

# 2. 序列化
serialized_user = pickle.dumps(user)

# 3. 反序列化
new_user = pickle.loads(serialized_user)
print(f"恢复后的连接状态: {new_user.temp_connection}")
```

---

## 三、 实战小项目：RPG 游戏存档管理器

这个项目演示了如何使用 pickle 来构建一个简单的游戏存档系统。它将保存玩家的状态（包括等级、物品栏等），并在程序重启后读取。

### 项目结构

* **Player 类**：包含玩家数据。
* **GameSaveManager 类**：负责 save 和 load 操作。

### 代码实现

```python
import pickle
import os
from datetime import datetime

class Player:
    def __init__(self, name, level=1):
        self.name = name
        self.level = level
        self.inventory = []
        self.health = 100

    def add_item(self, item):
        self.inventory.append(item)
        print(f"[{self.name}] 获得了物品: {item}")

    def level_up(self):
        self.level += 1
        self.health = 100
        print(f"[{self.name}] 升级了！当前等级: {self.level}")

    def __str__(self):
        return (f"=== 玩家状态 ===\n"
                f"名字: {self.name} | 等级: {self.level} | HP: {self.health}\n"
                f"背包: {', '.join(self.inventory) if self.inventory else '空'}\n"
                f"==================")

class GameSaveManager:
    def __init__(self, save_dir="saves"):
        self.save_dir = save_dir
        if not os.path.exists(save_dir):
            os.makedirs(save_dir)

    def save_game(self, player, slot=1):
        filename = os.path.join(self.save_dir, f"save_{slot}.pkl")
        data = {
            "player_data": player,
            "save_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        
        try:
            with open(filename, 'wb') as f:
                pickle.dump(data, f)
            print(f"✅ 游戏已保存至槽位 {slot}")
        except Exception as e:
            print(f"❌ 保存失败: {e}")

    def load_game(self, slot=1):
        filename = os.path.join(self.save_dir, f"save_{slot}.pkl")
        
        if not os.path.exists(filename):
            print(f"⚠️ 存档槽位 {slot} 不存在！")
            return None

        try:
            with open(filename, 'rb') as f:
                data = pickle.load(f)
            
            print(f"📥 载入存档 (时间: {data['save_time']})")
            return data["player_data"]
        except Exception as e:
            print(f"❌ 载入失败: {e}")
            return None

# --- 模拟游戏运行 ---
if __name__ == "__main__":
    manager = GameSaveManager()
    
    # 场景 1: 第一次玩游戏
    print("--- 开始新游戏 ---")
    hero = Player("勇者", level=1)
    print(hero)
    
    # 玩了一会儿
    hero.add_item("传说之剑")
    hero.level_up()
    hero.health = 80 # 受到伤害
    
    # 保存游戏
    manager.save_game(hero, slot=1)
    
    print("\n... 退出游戏 ...\n")
    
    # 删除内存中的对象，模拟程序关闭
    del hero 
    
    # 场景 2: 重新打开游戏并读取存档
    print("--- 重新启动游戏 ---")
    loaded_hero = manager.load_game(slot=1)
    
    if loaded_hero:
        print("存档读取成功！恢复玩家状态：")
        print(loaded_hero)
        
        # 继续玩
        loaded_hero.add_item("恢复药水")
```

---

## 总结

* `dump`/`load`: 用于文件读写（记得用 `'wb'`/`'rb'`）。
* `dumps`/`loads`: 用于网络传输或数据库存储（转为 bytes）。
* **安全性**: 永远不要解包来源不明的 pickle 文件。
