前言
主要记录ubuntu系统的中安装conda、jupyter lab以及基本使用过程。使用的ubuntu是20.04.

一、Conda安装
1.下载
Conda 网站
考虑下载速度，采用国内清华镜像 https://mirrors.tuna.tsinghua.edu.cn/
在下载链接下方，获取下载链接，选择应用软件，Conda，对应的版本。


2. 安装
运行脚本，开始安装

bash ./Downloads/Anaconda3-2023.03-MacOSX-x86_64.sh
AI写代码
bash
1
后面ENTER，浏览滚动许可，也可以按q健。
yes接受许可
确定安装位置
conda init ? yes，会将conda添加到系统PATH中。
如果要使用Conda 需要关闭并重新打开终端，或者执行下面命令，重新加载用户的 ~/.bashrc 文件，“.”开头文件是隐藏文件。
source ~/.bashrc
AI写代码
bash
1
更新Anaconda，执行命令：

conda update --all
AI写代码
bash
1
二、conda 使用
查看已经存在着的工作环境
创建新的工作环境
激活环境
退出当前虚拟环境
删除创建的环节

conda info --envs       			#查看已经存在着的工作环境
conda create -n myenv   			#创建新的工作环境
conda activate myenv				#激活环境
conda deactivate 					#退出当前虚拟环境
conda remove -n myenv --all			#删除创建的环节
AI写代码
bash
1
2
3
4
5
三、安装jupyterLab
先创建并激活一个虚拟环境：

  conda create -n jupyterlab-env python=3.8
  conda activate jupyterlab-env
AI写代码
bash
1
2
使用以下命令通过 Conda 安装 JupyterLab：

conda install -c conda-forge jupyterlab
AI写代码
bash
1
-c 是指定包来源的选项，c 是 channel（频道或仓库）的简写。
conda-forge 是一个非常常用的 社区驱动的 Conda 仓库（channel），它维护了许多开源的 Conda 包，包含了很多主流的数据科学、机器学习、开发工具包等。
这里的 -c conda-forge 指定了 Conda 在安装时优先从 conda-forge 仓库中查找并安装 jupyterlab，而不是从默认的 Anaconda 仓库中寻找。
安装完成后，使用以下命令启动 JupyterLab：

jupyter-lab
AI写代码
bash
1
让 JupyterLab 后台运行
nohup 可以让 JupyterLab 在后台运行，并且即使关闭终端，进程也不会被终止。

启动 JupyterLab 后台执行：

nohup jupyter-lab > jupyterlab.log 2>&1 &
AI写代码
bash
1
nohup：让命令在后台运行，即使关闭终端。
jupyter-lab：启动 JupyterLab。
> jupyterlab.log：将输出重定向到 jupyterlab.log 文件中。
> 2>&1：将错误输出也重定向到同一个日志文件中。
> 2 表示 标准错误输出（stderr）。在 Linux 和 Unix 系统中，每个进程都有三个默认的文件描述符：
> 0：标准输入（stdin） 1：标准输出（stdout） 2：标准错误输出（stderr）
> “>”是 重定向符，用于将输出重定向到某个文件或文件描述符。它表示将输出写入某个目的地。
> &1：& 表示接下来的 1 是一个文件描述符，而不是一个文件名。1 指的是 标准输出（stdout）。

&：让进程在后台执行。
检查日志文件：

你可以通过查看 jupyterlab.log 来检查 JupyterLab 的启动情况和日志：

tail -f jupyterlab.log
AI写代码
bash
1
停止 JupyterLab：

如果你想停止 JupyterLab，首先找到它的进程 ID（PID）：

ps aux | grep jupyter-lab
AI写代码
bash
1
然后使用 kill 命令终止它：

kill <PID>
AI写代码
bash
1
四、局域网访问jupyterLab
要使 JupyterLab 在局域网中的其他计算机上可访问，你需要对 JupyterLab 进行一些额外的配置。以下是步骤：

1. 确定 JupyterLab 服务器所在机器的 IP 地址
首先，你需要找到运行 JupyterLab 的计算机的局域网 IP 地址。

   ip addr show
AI写代码
bash
1
2. 修改 JupyterLab 配置文件
JupyterLab 默认只允许从本地访问，因此需要进行一些配置更改以允许从局域网访问。你可以通过生成和修改配置文件来实现这一点。

生成配置文件（如果还没有配置文件的话）：

jupyter server --generate-config
AI写代码
bash
1
这会在你的主目录下生成一个配置文件，通常路径为：
~/.jupyter/jupyter_server_config.py

编辑配置文件：

打开配置文件：

vim ~/.jupyter/jupyter_server_config.py
AI写代码
bash
1
查找并修改以下几行，确保它们没有注释掉（即没有 # 符号）：

允许局域网访问：

c.ServerApp.ip = '0.0.0.0'
AI写代码
python
运行
1
这意味着 JupyterLab 服务器将监听所有 IP 地址请求，包括来自局域网的请求。

允许无密码访问（可选，如果希望安全访问，可以设置密码，见后续步骤）：

c.ServerApp.open_browser = False
AI写代码
python
运行
1
指定端口（可选）：
你可以设置 JupyterLab 监听的端口，默认是 8888。你可以指定一个不同的端口：

c.ServerApp.port = 8888
AI写代码
python
运行
1
设置自动 token（可选）：
默认情况下，JupyterLab 会生成一个 token，这可以作为一个安全保护措施。你可以在局域网中禁用它：

c.ServerApp.token = ''
AI写代码
python
运行
1
设置密码（可选）：
默认情况下，JupyterLab 会生成一个 token，这可以作为一个安全保护措施。你可以在局域网中禁用它：

c.ServerApp.password = 'sha1:your-hashed-password这里你密码的hash值，后面说如何得到'
AI写代码
python
运行
1
3. 得到密码hash值
为了安全起见，尤其是防止未经授权的访问，建议你设置一个密码：

使用命令行设置密码：

jupyter-lab password
AI写代码
bash
1
系统会提示你输入密码并确认。会看到jupyter_server_config.json文件，里面就有密码的hash值，拷贝到前面就。

4. 启动 JupyterLab
现在，你可以启动 JupyterLab，监听所有 IP 地址：

jupyter lab
AI写代码
bash
1
5. 防火墙设置（如果适用）
如果你的系统启用了防火墙，可能需要配置防火墙规则以允许端口 8888（或你指定的其他端口）的外部访问。

使用 UFW（Ubuntu 防火墙）允许指定端口：

sudo ufw allow 8888
AI写代码
bash
1
检查防火墙状态，确保规则生效：

sudo ufw status
AI写代码
bash
1
6. 从局域网访问 JupyterLab
现在，在局域网中的其他计算机上，你可以通过浏览器访问 JupyterLab，使用 JupyterLab 服务器的局域网 IP 地址和指定的端口。例如：

http://192.168.x.x:8888
AI写代码
1
其中 192.168.x.x 是你运行 JupyterLab 服务器的计算机的局域网 IP 地址，8888 是端口号。如果你设置了密码，则在访问时需要输入密码。

7. 关闭 JupyterLab
当你不再需要访问时，可以关闭 JupyterLab 服务器，按 Ctrl + C 终止它。

总结：
获取本地 IP 地址 以供局域网中的其他设备访问。
修改 JupyterLab 配置文件，允许外部 IP 访问，并根据需要设置密码。
确保防火墙允许端口访问（如适用）。
在局域网中的其他计算机上，通过 JupyterLab 服务器的 IP 地址和端口访问服务。
————————————————

                            版权声明：本文为博主原创文章，遵循 CC 4.0 BY-SA 版权协议，转载请附上原文出处链接和本声明。

原文链接：https://blog.csdn.net/greatan/article/details/142633603