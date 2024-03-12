# wxwork based on wine

问题：linux系统运行企业微信，常规方式安装完后，企业微信仍然无法使用。

方案：

- 使用docker容器进行应用隔离
- 使用最新版本的wine和企业微信安装包

## 版本（已完成测试）

- wine: 9.0
- wxwork: 4.1.20.6024

> 注意：Wine-8.0安装企业微信仍存在打不开的问题！

## 安装并解决字体显示方框问题

```shell
docker build -t wxwork .
docker run -it --name wxworkapp wxwork bash
# 进入容器内部操作
# step 1. 修改系统注册表
vim ~/.wine/system.reg
# 找到[Software\\Microsoft\\Windows\\CurrentVersion\\Fonts]项，在该项尾部追加如下内容：
# 注意！该项有两处
# "Microsoft YaHei (TrueType)"="Z:\\usr\\share\\fonts\\msyh.ttc"
# "Microsoft YaHei Bold (TrueType)"="Z:\\usr\\share\\fonts\\msyhbd.ttc"
# "Microsoft YaHei Light (TrueType)"="Z:\\usr\\share\\fonts\\msyhl.ttc"
# "Microsoft YaHei UI (TrueType)"="Z:\\usr\\share\\fonts\\msyh.ttc"
# "Microsoft YaHei UI Bold (TrueType)"="Z:\\usr\\share\\fonts\\msyhbd.ttc"
# "Microsoft YaHei UI Light (TrueType)"="Z:\\usr\\share\\fonts\\msyhl.ttc"
# 找到[Software\\Microsoft\\Windows NT\\CurrentVersion\\FontSubstitutes]项，在该项尾部追加如下内容：
# "Microsoft Yahei"="Microsoft YaHei"
# step 2. 安装企业微信
wine /opt/wxwork-installer.exe
# step 3. 运行企业微信
env WINEPREFIX="/root/.wine" wine C:\\\\users\\\\Public\\\\Desktop\\\\企业微信.lnk
```
## 总结

企业微信界面字体显示方框或者部分内容显示方框，是由于编写界面时使用了多种字体。如对话框标题使用的是微软雅黑。

经差证，Wine在配置windows环境时，并未设定微软雅黑字体，导致软件界面中使用了微软雅黑的文字无法正常显示。而上述部分操作就是将该字体录入windows系统中。

