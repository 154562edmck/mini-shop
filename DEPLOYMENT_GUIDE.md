# 🚀 服务器部署完整指南

## 📋 部署前准备

### 1. 服务器要求
- **操作系统**: Ubuntu 20.04+ / CentOS 7+
- **内存**: 最少 2GB，推荐 4GB+
- **存储**: 最少 20GB 可用空间
- **网络**: 公网IP，开放 80/443 端口

### 2. 域名准备
- 已购买域名
- 域名已解析到服务器IP
- SSL证书（推荐使用 Let's Encrypt 免费证书）

## 🔧 服务器环境配置

### 1. 安装Docker和Docker Compose
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker $USER

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. 配置代理（如果需要）
```bash
# 创建Docker代理配置
sudo mkdir -p /etc/systemd/system/docker.service.d
sudo tee /etc/systemd/system/docker.service.d/http-proxy.conf > /dev/null << 'EOF'
[Service]
Environment="HTTP_PROXY=http://127.0.0.1:7890/"
Environment="HTTPS_PROXY=http://127.0.0.1:7890/"
Environment="NO_PROXY=localhost,127.0.0.1"
EOF

sudo systemctl daemon-reload
sudo systemctl restart docker
```

## 📦 项目部署

### 1. 上传项目文件
```bash
# 使用scp上传项目
scp -r ./13合1完整版三七6.0版本 root@your-server-ip:/opt/

# 或使用git克隆
git clone your-repo-url /opt/mini-shop
```

### 2. 配置生产环境
```bash
cd /opt/mini-shop

# 复制环境变量模板
cp env.prod.example .env.prod

# 编辑配置文件
nano .env.prod
```

### 3. 重要配置项
```bash
# 数据库配置
MYSQL_ROOT_PASSWORD=your_strong_password_here
MYSQL_DATABASE=mini_shop_prod
MYSQL_USER=shop_user
MYSQL_PASSWORD=your_strong_password_here

# 网站配置
BASE_URL=https://your-domain.com
CLIENT_URL=https://your-domain.com

# 微信配置（必须）
WECHAT_APP_ID=your_wechat_app_id
WECHAT_APP_SECRET=your_wechat_app_secret

# 支付配置（根据需要配置）
MCH_ID=your_mch_id
SERIAL_NO=your_serial_no
# ... 其他支付配置
```

### 4. 配置SSL证书
```bash
# 使用Let's Encrypt免费证书
sudo apt install certbot
sudo certbot certonly --standalone -d your-domain.com

# 复制证书到项目目录
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ./ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ./ssl/key.pem
sudo chown $USER:$USER ./ssl/*
```

### 5. 修改Nginx配置
```bash
# 编辑Nginx配置
nano nginx/conf.d/default.conf

# 将 your-domain.com 替换为您的实际域名
sed -i 's/your-domain.com/your-actual-domain.com/g' nginx/conf.d/default.conf
```

### 6. 启动服务
```bash
# 给脚本执行权限
chmod +x deploy-prod.sh
chmod +x switch-env.sh

# 部署生产环境
./deploy-prod.sh
```

## 🔄 开发和生产环境分离

### 本地开发环境
```bash
# 启动开发环境
./switch-env.sh
# 选择 1

# 访问开发环境
# 前端: http://localhost:3001/h5
# 后端: http://localhost:4000/admin/
```

### 生产环境
```bash
# 启动生产环境
./switch-env.sh
# 选择 2

# 访问生产环境
# 网站: https://your-domain.com
# 管理后台: https://your-domain.com/admin/
```

## 🛠️ 常用管理命令

### 查看服务状态
```bash
./switch-env.sh
# 选择 4
```

### 查看日志
```bash
./switch-env.sh
# 选择 5，然后选择要查看的服务
```

### 重启服务
```bash
# 重启所有服务
docker-compose -f docker-compose.prod.yml restart

# 重启特定服务
docker-compose -f docker-compose.prod.yml restart backend
```

### 更新代码
```bash
# 1. 停止服务
docker-compose -f docker-compose.prod.yml down

# 2. 更新代码
git pull

# 3. 重新构建并启动
docker-compose -f docker-compose.prod.yml up --build -d
```

## 🔒 安全建议

### 1. 数据库安全
- 使用强密码
- 限制数据库访问IP
- 定期备份数据

### 2. 服务器安全
- 配置防火墙
- 定期更新系统
- 使用SSH密钥登录

### 3. 应用安全
- 定期更新依赖
- 监控日志
- 配置备份策略

## 📊 监控和维护

### 1. 日志监控
```bash
# 实时查看日志
docker-compose -f docker-compose.prod.yml logs -f

# 查看特定服务日志
docker-compose -f docker-compose.prod.yml logs -f backend
```

### 2. 性能监控
```bash
# 查看容器资源使用
docker stats

# 查看磁盘使用
df -h
```

### 3. 备份策略
```bash
# 备份数据库
docker exec shop-mysql-prod mysqldump -u root -p$MYSQL_ROOT_PASSWORD $MYSQL_DATABASE > backup_$(date +%Y%m%d).sql

# 备份项目文件
tar -czf project_backup_$(date +%Y%m%d).tar.gz /opt/mini-shop
```

## 🆘 故障排除

### 1. 服务无法启动
```bash
# 查看详细错误信息
docker-compose -f docker-compose.prod.yml logs

# 检查端口占用
netstat -tlnp | grep :80
netstat -tlnp | grep :443
```

### 2. 数据库连接失败
```bash
# 检查数据库状态
docker-compose -f docker-compose.prod.yml ps mysql

# 查看数据库日志
docker-compose -f docker-compose.prod.yml logs mysql
```

### 3. SSL证书问题
```bash
# 检查证书有效期
openssl x509 -in ssl/cert.pem -text -noout | grep "Not After"

# 更新证书
sudo certbot renew
```

## 📞 技术支持

如果遇到问题，请检查：
1. 服务器资源是否充足
2. 网络连接是否正常
3. 配置文件是否正确
4. 日志中的错误信息

---

**⚠️ 重要提醒：**
- 请确保所有敏感信息（密码、密钥等）的安全性
- 定期备份数据
- 监控系统运行状态
- 遵守相关法律法规

