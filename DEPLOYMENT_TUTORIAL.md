# 🚀 网站部署教程 - 完整版

## 📋 部署信息
- **服务器IP**: 194.163.139.211
- **域名**: waimaimeituan.dpdns.org
- **项目**: 外卖美团系统

---

## 🎯 部署前准备

### 1. 服务器要求
- Ubuntu 20.04+ 或 CentOS 7+
- 至少 2GB RAM
- 至少 20GB 硬盘空间
- 开放端口: 80, 443, 22

### 2. 本地准备
- 确保项目已清理完成
- 准备好域名解析到服务器IP

---

## 🔧 第一步：服务器环境准备

### 1.1 连接服务器
```bash
ssh root@194.163.139.211
```

### 1.2 更新系统
```bash
# Ubuntu/Debian
apt update && apt upgrade -y

# CentOS/RHEL
yum update -y
```

### 1.3 安装必要软件
```bash
# Ubuntu/Debian
apt install -y curl wget git vim unzip

# CentOS/RHEL
yum install -y curl wget git vim unzip
```

### 1.4 安装Docker
```bash
# 安装Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 启动Docker服务
systemctl start docker
systemctl enable docker

# 安装Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# 验证安装
docker --version
docker-compose --version
```

---

## 📁 第二步：上传项目文件

### 2.1 方法一：使用Git（推荐）
```bash
# 在服务器上创建项目目录
mkdir -p /opt/mini-shop
cd /opt/mini-shop

# 克隆项目（需要先在GitHub创建仓库）
git clone https://github.com/你的用户名/mini-shop.git .

# 或者使用压缩包上传
```

### 2.2 方法二：使用SCP上传
```bash
# 在本地执行（压缩项目）
tar -czf mini-shop.tar.gz --exclude=node_modules --exclude=.git --exclude=docs .

# 上传到服务器
scp mini-shop.tar.gz root@194.163.139.211:/opt/

# 在服务器上解压
cd /opt
tar -xzf mini-shop.tar.gz
mv 13合1完整版三七6.0版本 mini-shop
cd mini-shop
```

---

## ⚙️ 第三步：配置环境变量

### 3.1 创建生产环境配置
```bash
# 复制环境变量模板
cp env.prod .env.prod

# 编辑环境变量
vim .env.prod
```

### 3.2 配置内容
```bash
# 生产环境配置
MYSQL_ROOT_PASSWORD=MyStrongPassword123!
MYSQL_DATABASE=mini_shop_prod
MYSQL_USER=shop_user
MYSQL_PASSWORD=MyStrongPassword123!

# 网站配置
BASE_URL=https://waimaimeituan.dpdns.org
CLIENT_URL=https://waimaimeituan.dpdns.org

# 微信配置（暂时留空，后续配置）
WECHAT_APP_ID=your_wechat_app_id
WECHAT_APP_SECRET=your_wechat_app_secret

# 微信支付配置（暂时留空，后续配置）
MCH_ID=your_mch_id
SERIAL_NO=your_serial_no
CERT_CONTENT=your_cert_content
PRIVATE_KEY_CONTENT=your_private_key_content
API_V3_KEY=your_api_v3_key

# 支付宝配置（暂时留空，后续配置）
ALIPAY_APP_ID=your_alipay_app_id
ALIPAY_PRIVATE_KEY=your_alipay_private_key
ALIPAY_PUBLIC_KEY=your_alipay_public_key

# 易支付配置（暂时留空，后续配置）
EASYPAY_DOMAIN=https://your-easypay-domain.com
EASYPAY_PID=your_easypay_pid
EASYPAY_KEY=your_easypay_key
EASYPAY_PUBLIC_KEY=your_easypay_public_key
EASYPAY_PRIVATE_KEY=your_easypay_private_key
```

---

## 🐳 第四步：启动Docker服务

### 4.1 启动生产环境
```bash
# 启动所有服务
docker-compose -f docker-compose.prod.yml up -d

# 查看服务状态
docker-compose -f docker-compose.prod.yml ps

# 查看日志
docker-compose -f docker-compose.prod.yml logs
```

### 4.2 等待服务启动
```bash
# 等待MySQL启动
sleep 30

# 检查服务状态
docker ps
```

---

## 🔒 第五步：配置SSL证书

### 5.1 安装Certbot
```bash
# Ubuntu/Debian
apt install -y certbot

# CentOS/RHEL
yum install -y certbot
```

### 5.2 申请SSL证书
```bash
# 停止Nginx（如果正在运行）
docker-compose -f docker-compose.prod.yml stop nginx

# 申请证书
certbot certonly --standalone -d waimaimeituan.dpdns.org -d www.waimaimeituan.dpdns.org

# 创建SSL目录
mkdir -p ssl

# 复制证书
cp /etc/letsencrypt/live/waimaimeituan.dpdns.org/fullchain.pem ssl/cert.pem
cp /etc/letsencrypt/live/waimaimeituan.dpdns.org/privkey.pem ssl/key.pem
```

### 5.3 设置证书自动续期
```bash
# 创建续期脚本
cat > /etc/cron.d/certbot-renew << EOF
0 12 * * * root certbot renew --quiet && docker-compose -f /opt/mini-shop/docker-compose.prod.yml restart nginx
EOF
```

---

## 🌐 第六步：配置防火墙

### 6.1 开放必要端口
```bash
# Ubuntu/Debian (UFW)
ufw allow 22
ufw allow 80
ufw allow 443
ufw --force enable

# CentOS/RHEL (firewalld)
firewall-cmd --permanent --add-port=22/tcp
firewall-cmd --permanent --add-port=80/tcp
firewall-cmd --permanent --add-port=443/tcp
firewall-cmd --reload
```

---

## 🚀 第七步：启动网站

### 7.1 重新启动所有服务
```bash
# 启动所有服务
docker-compose -f docker-compose.prod.yml up -d

# 查看服务状态
docker-compose -f docker-compose.prod.yml ps
```

### 7.2 检查服务状态
```bash
# 检查端口
netstat -tulpn | grep :80
netstat -tulpn | grep :443

# 检查Docker容器
docker ps

# 查看日志
docker-compose -f docker-compose.prod.yml logs nginx
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs frontend
```

---

## ✅ 第八步：验证部署

### 8.1 测试网站访问
```bash
# 测试HTTP
curl -I http://waimaimeituan.dpdns.org

# 测试HTTPS
curl -I https://waimaimeituan.dpdns.org

# 测试本地访问
curl -I http://localhost
```

### 8.2 浏览器访问
- 打开浏览器访问: https://waimaimeituan.dpdns.org
- 检查网站是否正常加载
- 测试基本功能

---

## 🔧 常见问题排查

### 问题1：网站无法访问
```bash
# 检查服务状态
docker-compose -f docker-compose.prod.yml ps

# 检查端口
netstat -tulpn | grep :80

# 检查防火墙
ufw status

# 查看日志
docker-compose -f docker-compose.prod.yml logs
```

### 问题2：SSL证书问题
```bash
# 检查证书
ls -la ssl/

# 重新申请证书
certbot certonly --standalone -d waimaimeituan.dpdns.org

# 复制证书
cp /etc/letsencrypt/live/waimaimeituan.dpdns.org/fullchain.pem ssl/cert.pem
cp /etc/letsencrypt/live/waimaimeituan.dpdns.org/privkey.pem ssl/key.pem
```

### 问题3：数据库连接问题
```bash
# 检查MySQL容器
docker logs mini-shop-mysql-prod

# 重启MySQL
docker-compose -f docker-compose.prod.yml restart mysql
```

---

## 📱 第九步：配置支付功能（可选）

### 9.1 微信支付配置
1. 登录微信商户平台
2. 获取商户号、证书等信息
3. 更新 `.env.prod` 文件中的微信支付配置

### 9.2 支付宝配置
1. 登录支付宝开放平台
2. 创建应用并获取密钥
3. 更新 `.env.prod` 文件中的支付宝配置

### 9.3 易支付配置
1. 联系易支付服务商
2. 获取商户ID和密钥
3. 更新 `.env.prod` 文件中的易支付配置

---

## 🔄 第十步：日常维护

### 10.1 更新网站
```bash
# 进入项目目录
cd /opt/mini-shop

# 拉取最新代码
git pull

# 重新构建并启动
docker-compose -f docker-compose.prod.yml up -d --build
```

### 10.2 备份数据
```bash
# 备份数据库
docker exec mini-shop-mysql-prod mysqldump -u root -p mini_shop_prod > backup_$(date +%Y%m%d).sql

# 备份项目文件
tar -czf project_backup_$(date +%Y%m%d).tar.gz /opt/mini-shop
```

### 10.3 监控日志
```bash
# 查看实时日志
docker-compose -f docker-compose.prod.yml logs -f

# 查看特定服务日志
docker-compose -f docker-compose.prod.yml logs -f nginx
```

---

## 🎉 部署完成！

恭喜！您的网站已经成功部署到服务器上。

### 🌐 访问地址
- **主站**: https://waimaimeituan.dpdns.org
- **管理后台**: https://waimaimeituan.dpdns.org/admin

### 📞 技术支持
如果遇到问题，请检查：
1. 服务状态: `docker-compose -f docker-compose.prod.yml ps`
2. 服务日志: `docker-compose -f docker-compose.prod.yml logs`
3. 端口状态: `netstat -tulpn | grep :80`

---

## 📝 重要提醒

1. **定期备份**: 建议每周备份数据库和项目文件
2. **更新证书**: SSL证书会自动续期，但建议定期检查
3. **监控资源**: 定期检查服务器CPU、内存、磁盘使用情况
4. **安全更新**: 定期更新系统和Docker镜像

祝您使用愉快！🎊
