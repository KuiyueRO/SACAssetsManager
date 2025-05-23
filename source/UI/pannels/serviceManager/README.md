# 服务管理面板

## 简介
服务管理面板提供了一个直观的界面来监控和管理SACAssetsManager插件的后台服务。通过这个面板，您可以轻松查看服务状态、启动或重启服务，以及打开开发者控制台进行调试。

## 功能特点
- 实时监控主服务和静态服务的运行状态
- 查看服务端口号和运行时间
- 一键启动和重启服务
- 快速访问服务开发者控制台
- 定期自动刷新状态信息

## 使用方法

### 查看服务状态
打开服务管理面板后，您可以立即看到主服务和静态服务的当前状态。每个服务卡片都会显示：
- 服务状态（运行中/已停止）
- 服务端口信息
- 服务运行时间

状态信息每30秒自动更新一次。您也可以点击面板顶部的刷新按钮手动刷新状态。

### 启动服务
如果某个服务未在运行，您可以：
1. 点击对应服务卡片上的"启动"按钮
2. 若两个服务都未运行，可以点击"启动服务"按钮同时启动所有服务

### 重启服务
对于正在运行的服务，您可以：
1. 点击对应服务卡片上的"重启"按钮重启单个服务
2. 点击面板顶部的"重启全部"按钮重启所有服务

### 打开开发者控制台
当服务正在运行时，您可以点击服务卡片上的"控制台"按钮打开对应服务的开发者工具，用于查看日志和调试信息。

## 故障排除

如果遇到以下问题，请尝试相应解决方案：

### 服务状态显示不正确
- 尝试点击刷新按钮手动更新状态
- 检查控制台是否有错误信息
- 重启整个插件

### 服务无法启动
- 检查控制台错误信息
- 确认端口是否被其他程序占用
- 尝试重启思源笔记

### 无法打开开发者控制台
- 确认您使用的是桌面版思源笔记
- 检查是否有权限问题
- 尝试重启思源笔记

## 技术支持
如有其他问题，请参考插件文档或在思源笔记社区中寻求帮助。 