# 🎯 零基础部署快速开始指南

## 🚀 3分钟快速部署

### 第一步：准备服务器
1. **购买云服务器**（推荐阿里云/腾讯云）
   - 配置：2核4GB，40GB硬盘
   - 系统：Ubuntu 20.04
   - 记录服务器IP和密码

2. **购买域名**
   - 选择 `.com` 或 `.cn` 后缀
   - 将域名解析到服务器IP

### 第二步：连接服务器
**Windows用户：**
- 下载WinSCP：https://winscp.net/
- 连接服务器（IP、用户名root、密码）

**Mac/Linux用户：**
```bash
ssh root@您的服务器IP
```

### 第三步：上传项目
**使用WinSCP：**
- 将项目文件夹拖拽到服务器的 `/opt/` 目录

**使用命令行：**
```bash
scp -r ./13合1完整版三七6.0版本 root@您的服务器IP:/opt/
```

### 第四步：一键部署
```bash
# 进入项目目录
cd /opt/13合1完整版三七6.0版本

# 运行零基础部署脚本
chmod +x beginner-deploy.sh
./beginner-deploy.sh
```

**脚本会自动完成：**
- ✅ 安装Docker和必要软件
- ✅ 配置SSL证书
- ✅ 设置生产环境
- ✅ 启动所有服务

### 第五步：访问网站
- **前台：** https://您的域名/h5
- **后台：** https://您的域名/admin/
- **默认账号：** admin / 123456

---

## 📚 详细教程

如需更详细的步骤说明，请查看：
- `BEGINNER_DEPLOYMENT_GUIDE.md` - 完整详细教程
- `DEPLOYMENT_GUIDE.md` - 技术部署指南

---

## 🆘 常见问题

### Q: 服务器连接不上？
A: 检查IP地址、密码，确认防火墙开放22端口

### Q: 域名无法访问？
A: 确认域名已解析到服务器IP，等待DNS生效（最多24小时）

### Q: SSL证书申请失败？
A: 确保80端口未被占用，域名解析正确

### Q: 服务启动失败？
A: 查看日志：`docker-compose -f docker-compose.prod.yml logs`

---

## 🔧 日常管理

```bash
# 查看服务状态
./switch-env.sh

# 重启服务
docker-compose -f docker-compose.prod.yml restart

# 查看日志
docker-compose -f docker-compose.prod.yml logs -f

# 更新代码
git pull && docker-compose -f docker-compose.prod.yml up --build -d
```

---

**🎉 恭喜！** 您的网站已成功部署！

**下一步：** 登录后台配置业务信息，导入商品数据，开始运营！

