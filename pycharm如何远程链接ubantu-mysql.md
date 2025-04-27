## `ubantu`虚拟机安装`MySQL`及`pycharm`远程链接`MySQL`数据库设置指南

### 一、安装前准备

#### （1） 更新系统

1.在安装`MySQL` 之前，需要确保你的软件包是最新的，这能避免因软件包版本问题导致的安装错误，并获取最新的安全补丁。打开终端，执行以下两条命令：

```shell
sudo apt update  # 更新软件包索引，让系统知晓可用软件包的最新版本信息
sudo apt upgrade -y  # 自动安装系统中已安装软件包的可用更新，-y参数表示自动回答 “是”，避免逐个确认的麻烦。
```



#### （2） 检查是否已安装`MySQL`

有些情况下，系统可能已经预装了`MySQL`或者之前安装过残留文件。通过以下命令检查:

```shell
dpkg -l | grep mysql
```

如果有相关软件包列出，可能需要先卸载。例如，若要卸载`mysql-server`，可执行:

```shell
sudo apt remove mysql-server
```

若要彻底清除包括配置文件在内的所有内容，使用:

```shell
sudo apt purge mysql-server
```

卸载后，还需手动删除可能残留的相关目录，如`/etc/mysql`和`/var/lib/mysql`等(操作时需谨慎，确认无重要数据留存)。



### 二、安装`MySQL`



接下来，使用以下命令安装`MySQL`服务器：

```shell
sudo apt install mysql-server
```

在`ubantu`虚拟机上安装`MySQL`过程中，系统不会提示设置`MySQL`的root用户密码，因为`MySQL`在Unix系统中默认使用`auth_socket`插件用于本地身份验证，它允许用户通过Unix socket文件进行身份验证，而无需密码。这意味着当用户在本地使用`sudo mysql -u root`登录时，系统会验证操作系统用户是否有权限，而不是通过密码验证。（**这解释了为什么用户可能在本地无需密码就能登录，但远程连接时会失败，因为远程连接无法使用socket认证，必须使用密码。**）



### 三、启动与配置`MySQL` 服务

#### （1）启动 `MySQL`服务：

安装完成后，`MySQL`服务默认自动启动，但如果安装后未自动启动，或者你手动停止了服务，可通过以下命令启动:

```shell
sudo systemctl start mysql
```



#### （2）设置开机自启：

为确保系统每次启动时`MySQL` 服务都能自动运行，执行:

```shell
sudo systemctl enable mysql
```



#### （3）检查服务状态：

使用以下命令查看`MySQL`服务是否正常运行:

```shell
sudo systemctl status mysql
```



### 四、`MySQL`初始设置与安全加固

#### （1）`MySQL`初始设置（一）

因为目前root账户无需密码就能登录，为了实现远程登录，需要给root账户指定一个密码：

```mysql
-- 修改本地 root 用户密码
ALTER USER 'root'@'localhost' IDENTIFIED WITH`MySQL`_native_password BY 'new_password';

-- 修改远程 root 用户密码（如果存在）
ALTER USER 'root'@'%' IDENTIFIED WITH`MySQL`_native_password BY 'new_password';
```



遇到 **"Your password does not satisfy the current policy requirements"** 错误时，说明设置的密码不符合 `MySQL` 的密码策略要求。以下是解决方案：

**1. 查看当前密码策略**

- **步骤1：登录 `MySQL`**

```shell
sudo mysql -u root -p
```



- **步骤2：查看密码策略参数**

```mysql
SHOW VARIABLES LIKE 'validate_password%';
```

输出示例：

```
+--------------------------------------+--------+
| Variable_name                        | Value  |
+--------------------------------------+--------+
| validate_password.check_user_name    | ON     |
| validate_password.dictionary_file    |        |
| validate_password.length             | 8      |  -- 密码最小长度
| validate_password.mixed_case_count   | 1      |  -- 至少包含1个大写和1个小写字母
| validate_password.number_count       | 1      |  -- 至少包含1个数字
| validate_password.policy             | MEDIUM |  -- 密码策略等级
| validate_password.special_char_count | 1      |  -- 至少包含1个特殊字符
+--------------------------------------+--------+
```



**2. 调整密码策略（临时生效）**

- **方法1：降低密码策略等级**

```mysql
-- 将策略改为 LOW（只检查密码长度）
SET GLOBAL validate_password.policy = LOW;
```

- **方法2：完全禁用密码策略（仅限测试环境）**

```mysql
-- 卸载密码验证插件（需谨慎操作！）
UNINSTALL PLUGIN validate_password;

-- 重启 MySQL 服务
sudo systemctl restart mysql
```



**3. 设置符合策略的密码**

- **根据策略要求设置密码**
  - **示例密码**（满足不同策略等级）：
    - **LOW 策略**：密码长度 ≥ 6（如 **`123456`**）。
    - **MEDIUM 策略**：长度 ≥ 8，包含大小写字母、数字和特殊字符（如 **`Passw0rd!`**）。
    - **STRONG 策略**：长度 ≥ 12，包含字典文件外的字符。

- **修改 root 用户密码**

  按照上面操作设置root账户密码。

 

#### （2）`MySQL`初始设置（二）

```shell
sudo mysql_secure_installation
```

执行该脚本后，会被提示执行以下操作：

- 输入当前root密码：使用上一步骤中获取的密码。
- 设置新root密码：根据提示设置一个强密码，例如包含大写字母、小写字母、数字和特殊字符的组合。
- 移除匿名用户：建议选择移除，以提高安全性。
- 禁止远程root登录：建议禁止，减少安全风险。
- 移除测试数据库：建议移除，避免不必要的安全隐患。
- 重新加载权限表：选择“是”以应用更改。



### 五、配置防火墙

如果你的 `Ubuntu` 系统启用了防火墙，且需要通过网络访问 `MySQL`，确保防火墙允许 `MySQL`服务的端口(默认为 3306)的流量。

```shell
# 允许3306端口
sudo ufw allow 3306

# 检查防火墙状态
sudo ufw status
```



### 六、远程访问设置

默认情况下，`MySQL`只允许本地访问。如果需要从远程主机访问 `MySQL`，除了配置防火墙允许 3306 端口流量外，还需修改 `MySQL`的配置文件。

#### （1）**确保`MySQL`配置允许外部连接：**

- 打开`MySQL`配置文件：

```shell
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
```

- 确认 `bind-address` 设置为 `0.0.0.0`：

```shell
bind-address = 0.0.0.0 # 表示允许来自任何IP 地址的连接(生产环境中应谨慎设置，建议只允许受信任的 IP 地址连接)
```

- 重启`MySQL`服务：

```shell
sudo systemctl restart mysql
```



此外，还需在`MySQL`中为远程访问用户授权，例如创建一个新用户并授予其远程访问权限：

#### （2）设置远程登录账户



- **方案一：创建新用户并授权远程访问（推荐）**

在`MySQL`中创建新用户（示例用户 `remote_user`）

```mysql
-- 登录MySQL（在Ubuntu虚拟机中执行）
sudo mysql -u root -p

-- 创建用户并允许从任何IP访问（'%'表示所有IP）
CREATE USER 'remote_user'@'%' IDENTIFIED BY 'your_password';

-- 授予所有权限（根据需求调整权限范围）
GRANT ALL PRIVILEGES ON *.* TO 'remote_user'@'%' WITH GRANT OPTION;

-- 刷新权限
FLUSH PRIVILEGES;
```



- **方案二：允许root用户远程访问（不推荐，仅限测试环境）**

```mysql
-- 登录MySQL
sudo mysql -u root -p

-- 修改root用户的host为任意IP
UPDATE mysql.user SET host='%' WHERE user='root';

-- 刷新权限
FLUSH PRIVILEGES;

-- 退出MySQL
EXIT;
```

**重启`MySQL`服务**

```shell
sudo systemctl restart mysql
```

