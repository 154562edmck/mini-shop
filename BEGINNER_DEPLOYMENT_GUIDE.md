# 🌟 零基础网站部署完整教程

## 📚 教程说明
本教程专为**完全没有部署经验**的初学者设计，每一步都有详细说明和截图指导。

---

## 🎯 第一步：购买服务器和域名

### 1.1 购买云服务器
**推荐服务商：**
- **阿里云** (国内，速度快)
- **腾讯云** (国内，性价比高)
- **华为云** (国内，稳定)
- **AWS** (国外，功能强大)

**服务器配置建议：**
```
最低配置：
- CPU: 1核
- 内存: 2GB
- 硬盘: 40GB SSD
- 带宽: 3Mbps
- 系统: Ubuntu 20.04 LTS

推荐配置：
- CPU: 2核
- 内存: 4GB
- 硬盘: 80GB SSD
- 带宽: 5Mbps
- 系统: Ubuntu 20.04 LTS
```

**购买步骤：**
1. 注册云服务商账号
2. 选择"云服务器ECS"
3. 选择配置和系统
4. 设置密码（记住这个密码！）
5. 购买并等待服务器启动

### 1.2 购买域名
**推荐域名商：**
- **阿里云万网**
- **腾讯云**
- **GoDaddy** (国外)

**域名选择建议：**
- 选择 `.com` 或 `.cn` 后缀
- 域名要简短易记
- 避免使用特殊字符

**购买步骤：**
1. 搜索想要的域名
2. 选择可用域名
3. 添加到购物车
4. 完成支付

### 1.3 域名解析
**重要：** 将域名解析到您的服务器IP

**解析步骤：**
1. 登录域名管理后台
2. 找到"DNS解析"或"域名解析"
3. 添加A记录：
   ```
   记录类型: A
   主机记录: @ (或 www)
   记录值: 您的服务器IP地址
   TTL: 600
   ```
4. 保存设置

---

## 🖥️ 第二步：连接服务器

### 2.1 Windows用户
**使用PuTTY连接：**

1. **下载PuTTY**
   - 访问：https://www.putty.org/
   - 下载并安装

2. **连接服务器**
   ```
   Host Name: 您的服务器IP
   Port: 22
   Connection Type: SSH
   ```
   - 点击"Open"
   - 输入用户名：`root`
   - 输入密码（购买时设置的）

### 2.2 Mac/Linux用户
**使用终端连接：**
```bash
ssh root@您的服务器IP
# 输入密码
```

### 2.3 连接成功标志
看到类似这样的提示符表示连接成功：
```bash
root@your-server:~#
```

---

## 🔧 第三步：安装必要软件

### 3.1 更新系统
```bash
# 更新软件包列表
apt update

# 升级系统
apt upgrade -y
```

### 3.2 安装Docker
```bash
# 下载Docker安装脚本
curl -fsSL https://get.docker.com -o get-docker.sh

# 运行安装脚本
sh get-docker.sh

# 将当前用户添加到docker组
usermod -aG docker $USER

# 启动Docker服务
systemctl start docker
systemctl enable docker

# 验证安装
docker --version
```

**预期输出：**
```
Docker version 24.0.0, build 1234567
```

### 3.3 安装Docker Compose
```bash
# 下载Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# 添加执行权限
chmod +x /usr/local/bin/docker-compose

# 验证安装
docker-compose --version
```

**预期输出：**
```
Docker Compose version v2.20.0
```

### 3.4 安装其他必要工具
```bash
# 安装常用工具
apt install -y wget curl nano vim git unzip
```

---

## 📦 第四步：上传项目文件

### 4.1 方法一：使用SCP上传（推荐）

**Windows用户：**
1. 下载WinSCP：https://winscp.net/
2. 安装并打开WinSCP
3. 新建连接：
   ```
   文件协议: SFTP
   主机名: 您的服务器IP
   端口号: 22
   用户名: root
   密码: 您的服务器密码
   ```
4. 连接成功后，将项目文件夹拖拽到服务器的 `/opt/` 目录

**Mac/Linux用户：**
```bash
# 在本地项目目录执行
scp -r ./13合1完整版三七6.0版本 root@您的服务器IP:/opt/
```

### 4.2 方法二：使用Git（如果有Git仓库）
```bash
# 在服务器上执行
cd /opt
git clone 您的Git仓库地址 mini-shop
```

### 4.3 验证文件上传
```bash
# 进入项目目录
cd /opt/13合1完整版三七6.0版本

# 查看文件列表
ls -la
```

**应该看到：**
```
client/  server/  docker-compose.yml  deploy-prod.sh  ...
```

---

## ⚙️ 第五步：配置生产环境

### 5.1 创建环境配置文件
```bash
# 复制配置模板
cp env.prod.example .env.prod

# 编辑配置文件
nano .env.prod
```

### 5.2 重要配置项详解

**数据库配置：**
```bash
# 数据库密码（必须修改！）
MYSQL_ROOT_PASSWORD=MyStrongPassword123!
MYSQL_DATABASE=mini_shop_prod
MYSQL_USER=shop_user
MYSQL_PASSWORD=MyStrongPassword123!
```

**网站配置：**
```bash
# 替换为您的实际域名
BASE_URL=https://your-domain.com
CLIENT_URL=https://your-domain.com
```

**微信配置（必须）：**
```bash
# 从微信公众平台获取
WECHAT_APP_ID=wx1234567890abcdef
WECHAT_APP_SECRET=your_wechat_app_secret_here
```

**支付配置（可选）：**
```bash
# 微信支付（需要商户号）
MCH_ID=1234567890
SERIAL_NO=your_serial_no
CERT_CONTENT=your_cert_content
PRIVATE_KEY_CONTENT=your_private_key_content
API_V3_KEY=your_api_v3_key

# 支付宝（需要商户号）
ALIPAY_APP_ID=2021001234567890
ALIPAY_PRIVATE_KEY=your_alipay_private_key
ALIPAY_PUBLIC_KEY=your_alipay_public_key
```

### 5.3 保存配置文件
```bash
# 在nano编辑器中
# 按 Ctrl + X
# 按 Y 确认保存
# 按 Enter 确认文件名
```

---

## 🔒 第六步：配置SSL证书

### 6.1 安装Certbot（免费SSL证书）
```bash
# 安装Certbot
apt install -y certbot

# 停止可能占用80端口的服务
systemctl stop apache2 2>/dev/null || true
systemctl stop nginx 2>/dev/null || true
```

### 6.2 申请SSL证书
```bash
# 申请证书（替换为您的域名）
certbot certonly --standalone -d your-domain.com -d www.your-domain.com
```

**填写信息：**
```
Enter email address: your-email@example.com
Please read the Terms of Service: A
Would you like to share your email address: N
```

### 6.3 复制证书到项目目录
```bash
# 创建SSL目录
mkdir -p ssl

# 复制证书文件
cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ssl/cert.pem
cp /etc/letsencrypt/live/your-domain.com/privkey.pem ssl/key.pem

# 设置权限
chown root:root ssl/*
chmod 600 ssl/key.pem
chmod 644 ssl/cert.pem
```

### 6.4 设置证书自动续期
```bash
# 添加定时任务
crontab -e

# 添加以下行（每天检查续期）
0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 🌐 第七步：配置Nginx

### 7.1 修改Nginx配置
```bash
# 编辑Nginx配置
nano nginx/conf.d/default.conf
```

### 7.2 替换域名
```bash
# 将配置中的域名替换为您的实际域名
sed -i 's/your-domain.com/your-actual-domain.com/g' nginx/conf.d/default.conf
```

**配置示例：**
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    location / {
        proxy_pass http://frontend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /v1/ {
        proxy_pass http://backend:4000/v1/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /admin/ {
        proxy_pass http://backend:4000/admin/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 🚀 第八步：启动服务

### 8.1 给脚本添加执行权限
```bash
chmod +x deploy-prod.sh
chmod +x switch-env.sh
```

### 8.2 运行部署脚本
```bash
./deploy-prod.sh
```

**部署过程：**
```
🚀 生产环境部署脚本
================================
🔍 检查配置...
   域名: https://your-domain.com
   数据库: mini_shop_prod
   
📁 创建必要目录...
🔨 构建并启动服务...
⏳ 等待服务启动...
🔍 检查服务状态...
✅ 部署完成！
```

### 8.3 检查服务状态
```bash
# 查看所有服务状态
docker-compose -f docker-compose.prod.yml ps
```

**正常输出：**
```
NAME                    IMAGE               STATUS
shop-mysql-prod         mysql:8.0          Up 2 minutes
shop-backend-prod       server:latest      Up 2 minutes  
shop-frontend-prod      client:latest      Up 2 minutes
shop-nginx-prod         nginx:alpine       Up 2 minutes
```

---

## 🎉 第九步：完成安装

### 9.1 访问管理后台
1. 打开浏览器
2. 访问：`https://your-domain.com/admin/`
3. 使用默认账号登录：
   ```
   用户名: admin
   密码: 123456
   ```

### 9.2 完成系统配置
1. **修改管理员密码**
2. **配置网站信息**
3. **设置支付接口**（如果需要）
4. **导入商品数据**

### 9.3 测试网站功能
1. 访问：`https://your-domain.com/h5`
2. 测试用户注册/登录
3. 测试商品浏览
4. 测试支付流程

---

## 🔧 第十步：日常管理

### 10.1 查看服务状态
```bash
./switch-env.sh
# 选择 4
```

### 10.2 查看日志
```bash
./switch-env.sh
# 选择 5，然后选择要查看的服务
```

### 10.3 重启服务
```bash
# 重启所有服务
docker-compose -f docker-compose.prod.yml restart

# 重启特定服务
docker-compose -f docker-compose.prod.yml restart backend
```

### 10.4 更新代码
```bash
# 1. 停止服务
docker-compose -f docker-compose.prod.yml down

# 2. 更新代码（如果有Git）
git pull

# 3. 重新构建并启动
docker-compose -f docker-compose.prod.yml up --build -d
```

---

## 🆘 常见问题解决

### 问题1：无法连接服务器
**解决方案：**
1. 检查服务器IP是否正确
2. 检查防火墙是否开放22端口
3. 确认服务器密码是否正确

### 问题2：Docker安装失败
**解决方案：**
```bash
# 重新安装Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

### 问题3：SSL证书申请失败
**解决方案：**
1. 确保域名已解析到服务器
2. 确保80端口未被占用
3. 检查域名是否正确

### 问题4：服务启动失败
**解决方案：**
```bash
# 查看详细错误信息
docker-compose -f docker-compose.prod.yml logs

# 检查配置文件
nano .env.prod
```

### 问题5：网站无法访问
**解决方案：**
1. 检查防火墙设置
2. 检查域名解析
3. 检查SSL证书
4. 查看Nginx日志

---

## 📞 获取帮助

### 检查清单
部署前请确认：
- [ ] 服务器已购买并启动
- [ ] 域名已购买并解析
- [ ] 服务器密码已记录
- [ ] 微信AppID已获取
- [ ] 支付接口已申请（可选）

### 技术支持
如果遇到问题：
1. 查看错误日志
2. 检查配置文件
3. 确认网络连接
4. 验证域名解析

### 重要提醒
- 🔒 **安全第一**：使用强密码，定期更新
- 💾 **数据备份**：定期备份数据库和文件
- 📊 **监控运行**：关注服务器资源使用情况
- ⚖️ **合规使用**：遵守相关法律法规

---

**🎊 恭喜！** 如果您按照本教程完成了所有步骤，您的网站应该已经成功部署并运行了！

**下一步：** 开始配置您的业务功能，导入商品数据，设置支付接口，然后就可以正式运营了！

