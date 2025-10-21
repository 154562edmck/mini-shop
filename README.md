# 🍔 外卖订单系统

> 一个基于 Next.js + Node.js + MySQL 的全栈外卖订单管理系统，支持多平台订单模板、支付集成和后台管理。

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.1.4-black.svg)](https://nextjs.org/)
[![Docker](https://img.shields.io/badge/Docker-支持-blue.svg)](https://docker.com/)

## 📋 目录

- [功能特性](#-功能特性)
- [技术栈](#-技术栈)
- [系统架构](#-系统架构)
- [快速开始](#-快速开始)
- [部署指南](#-部署指南)
- [生产环境配置](#-生产环境配置)
- [脚本说明](#-脚本说明)
- [故障排除](#-故障排除)
- [安全注意事项](#-安全注意事项)
- [维护指南](#-维护指南)

---

## ✨ 功能特性

### 🎨 前端功能
- **多平台订单模板**：美团、饿了么、京东、拼多多等主流外卖平台样式
- **响应式设计**：支持手机、平板、桌面端访问
- **支付集成**：微信支付、支付宝、易支付多种支付方式
- **用户中心**：订单管理、地址管理、个人信息
- **实时更新**：订单状态实时同步

### 🛠️ 后台管理
- **商品管理**：商品CRUD、批量导入CSV、分类管理
- **订单管理**：订单查看、状态更新、数据统计
- **用户管理**：用户信息、权限管理
- **系统配置**：支付配置、基础设置
- **数据统计**：销售报表、用户分析

### 🔧 技术特性
- **容器化部署**：Docker + Docker Compose
- **反向代理**：Nginx负载均衡和SSL
- **数据库**：MySQL 8.0数据持久化
- **安全防护**：HTTPS、CORS、SQL注入防护
- **日志监控**：完整的操作日志记录

---

## 🛠️ 技术栈

### 前端技术
| 技术 | 版本 | 说明 |
|------|------|------|
| **Next.js** | 15.1.4 | React全栈框架 |
| **React** | 19.0.0 | 用户界面库 |
| **TypeScript** | 5.x | 类型安全 |
| **TailwindCSS** | 3.4.17 | 样式框架 |
| **NextUI** | 2.6.11 | UI组件库 |
| **Axios** | 1.7.9 | HTTP客户端 |

### 后端技术
| 技术 | 版本 | 说明 |
|------|------|------|
| **Node.js** | 18+ | 运行时环境 |
| **Express.js** | 4.21.2 | Web框架 |
| **MySQL** | 8.0 | 关系型数据库 |
| **Multer** | - | 文件上传处理 |
| **CSV-Parse** | - | CSV文件解析 |

### 支付集成
| 支付方式 | SDK | 说明 |
|----------|-----|------|
| **微信支付** | wechatpay-node-v3 | 官方SDK |
| **支付宝** | alipay-sdk | 官方SDK |
| **易支付** | 自定义实现 | 第三方支付 |

### 部署技术
| 技术 | 说明 |
|------|------|
| **Docker** | 容器化部署 |
| **Docker Compose** | 多容器编排 |
| **Nginx** | 反向代理和SSL |
| **Certbot** | SSL证书自动续期 |

---

## 🏗️ 系统架构

```
┌─────────────────────────────────────────────────────────┐
│                        用户层                            │
│  (微信浏览器/普通浏览器访问虚假外卖订单页面)              │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                      前端层 (Next.js)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  订单模板    │  │  支付页面    │  │  用户中心    │  │
│  │  - 美团      │  │  - 微信支付  │  │  - 订单列表  │  │
│  │  - 饿了么    │  │  - 支付宝    │  │  - 地址管理  │  │
│  │  - 京东      │  │  - 易支付    │  │              │  │
│  │  - 拼多多... │  │              │  │              │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS/API
                     ▼
┌─────────────────────────────────────────────────────────┐
│                    后端层 (Express.js)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  商品管理    │  │  订单管理    │  │  用户管理    │  │
│  │  - CRUD      │  │  - 状态更新  │  │  - 权限控制  │  │
│  │  - 分类管理  │  │  - 数据统计  │  │  - 信息维护  │  │
│  │  - 批量导入  │  │  - 报表生成  │  │  - 安全验证  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │ SQL
                     ▼
┌─────────────────────────────────────────────────────────┐
│                      数据层 (MySQL)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  商品数据    │  │  订单数据    │  │  用户数据    │  │
│  │  - 基础信息  │  │  - 订单详情  │  │  - 用户信息  │  │
│  │  - 规格信息  │  │  - 支付状态  │  │  - 权限信息  │  │
│  │  - 分类关系  │  │  - 时间记录  │  │  - 操作日志  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 详细架构说明

#### 🌐 前端架构 (Next.js)
```
client/
├── src/
│   ├── app/                 # App Router页面
│   ├── components/          # 可复用组件
│   ├── contexts/           # React Context
│   ├── hooks/              # 自定义Hooks
│   ├── utils/              # 工具函数
│   └── types/              # TypeScript类型
├── public/                  # 静态资源
└── next.config.ts          # Next.js配置
```

#### ⚙️ 后端架构 (Express.js)
```
server/
├── admin/                  # 后台管理
│   ├── controllers/        # 控制器
│   ├── routes/            # 路由
│   └── middleware/        # 中间件
├── common/                # 公共模块
├── config/                # 配置文件
├── public/                # 静态文件
└── server.js              # 入口文件
```

#### 🐳 容器架构
```
├── frontend (Next.js)     # 前端容器
├── backend (Express.js)   # 后端容器
├── mysql (MySQL 8.0)      # 数据库容器
└── nginx (Nginx)          # 代理容器
```

---

## 🚀 快速开始

### 环境要求

- **Node.js**: 18.0+
- **Docker**: 20.0+
- **Docker Compose**: 2.0+
- **Git**: 2.0+

### 本地开发

#### 1. 克隆项目
```bash
git clone https://github.com/your-username/mini-shop.git
cd mini-shop
```

#### 2. 安全清理（重要！）
```bash
# 运行安全清理脚本
chmod +x docs/安全清理脚本.sh
./docs/安全清理脚本.sh
```

#### 3. 启动开发环境
```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps
```

#### 4. 访问应用
- **前端**: http://localhost:3001
- **后台**: http://localhost:4000/admin
- **API**: http://localhost:4000/v1

### 默认账户
- **管理员**: admin / 123456

---

## 🌐 部署指南

### 服务器要求

- **CPU**: 2核心+
- **内存**: 4GB+
- **存储**: 20GB+
- **网络**: 公网IP + 域名

### 一键部署

#### 1. 准备服务器
```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### 2. 部署应用
```bash
# 克隆项目
git clone https://github.com/your-username/mini-shop.git
cd mini-shop

# 配置环境变量
cp env.prod.example env.prod
nano env.prod  # 编辑配置

# 一键部署
chmod +x ultimate-fix.sh
./ultimate-fix.sh
```

#### 3. 配置域名和SSL
```bash
# 安装Certbot
sudo apt install certbot python3-certbot-nginx

# 申请SSL证书
sudo certbot --nginx -d yourdomain.com

# 设置自动续期
sudo crontab -e
# 添加: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## ⚙️ 生产环境配置

### 环境变量配置

#### `.env.prod` 文件说明
```bash
# 数据库配置
MYSQL_ROOT_PASSWORD=YourStrongPassword123!
MYSQL_DATABASE=mini_shop_prod
MYSQL_USER=shop_user
MYSQL_PASSWORD=YourStrongPassword123!

# 应用配置
BASE_URL=https://yourdomain.com
CLIENT_URL=https://yourdomain.com
NODE_ENV=production

# 微信支付配置
WECHAT_APP_ID=your_wechat_app_id
WECHAT_APP_SECRET=your_wechat_app_secret
MCH_ID=your_merchant_id
SERIAL_NO=your_serial_no
CERT_CONTENT=your_cert_content
PRIVATE_KEY_CONTENT=your_private_key
API_V3_KEY=your_api_v3_key

# 支付宝配置
ALIPAY_APP_ID=your_alipay_app_id
ALIPAY_PRIVATE_KEY=your_alipay_private_key
ALIPAY_PUBLIC_KEY=your_alipay_public_key

# 易支付配置
EASYPAY_DOMAIN=your_easypay_domain
EASYPAY_PID=your_easypay_pid
EASYPAY_KEY=your_easypay_key
EASYPAY_PUBLIC_KEY=your_easypay_public_key
EASYPAY_PRIVATE_KEY=your_easypay_private_key
```

### 性能优化

#### 1. Nginx优化
```nginx
# nginx/conf.d/default.conf
server {
    listen 443 ssl http2;
    
    # 启用gzip压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
    
    # 静态文件缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # 安全头
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
}
```

#### 2. MySQL优化
```sql
-- 创建索引
CREATE INDEX idx_product_category ON product(category_id);
CREATE INDEX idx_order_user ON orders(user_id);
CREATE INDEX idx_order_status ON orders(status);

-- 优化配置
SET innodb_buffer_pool_size = 1G;
SET max_connections = 200;
```

#### 3. Docker资源限制
```yaml
# docker-compose.prod.yml
services:
  mysql:
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '1.0'
  
  backend:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
```

### 监控和日志

#### 1. 日志配置
```bash
# 查看应用日志
docker logs -f shop-backend-prod
docker logs -f shop-frontend-prod

# 查看Nginx日志
docker logs -f shop-nginx-prod

# 查看MySQL日志
docker logs -f shop-mysql-prod
```

#### 2. 健康检查
```bash
# 检查服务状态
docker-compose -f docker-compose.prod.yml ps

# 检查端口
netstat -tlnp | grep :80
netstat -tlnp | grep :443

# 检查磁盘空间
df -h
```

---

## 🔧 脚本说明

### 部署脚本

#### `ultimate-fix.sh` - 终极修复脚本
```bash
# 功能：解决所有部署问题
# 用法：./ultimate-fix.sh
# 作用：
#   - 拉取最新代码
#   - 重新构建镜像
#   - 启动所有服务
#   - 测试关键端点
```

#### `fix-upload-permission.sh` - 修复上传权限
```bash
# 功能：修复文件上传权限问题
# 用法：./fix-upload-permission.sh
# 作用：
#   - 创建upload目录
#   - 设置777权限
#   - 重启Backend容器
```

### 诊断脚本

#### `test-all-endpoints.sh` - 全面测试
```bash
# 功能：测试所有API端点
# 用法：./test-all-endpoints.sh
# 作用：
#   - 测试Nginx配置
#   - 测试Backend API
#   - 测试Frontend服务
#   - 测试数据库连接
```

#### `check-upload-dir.sh` - 检查上传目录
```bash
# 功能：检查上传目录权限
# 用法：./check-upload-dir.sh
# 作用：
#   - 检查目录存在性
#   - 检查读写权限
#   - 测试文件操作
```

### 安全脚本

#### `docs/安全清理脚本.sh` - 安全清理
```bash
# 功能：清理后门和恶意代码
# 用法：./docs/安全清理脚本.sh
# 作用：
#   - 删除monitor.js后门
#   - 清理敏感信息
#   - 重置默认密码
```

---

## 🔍 故障排除

### 常见问题

#### 1. 网站无法访问
```bash
# 检查服务状态
docker-compose ps

# 检查端口占用
netstat -tlnp | grep :80

# 检查防火墙
sudo ufw status

# 检查Nginx配置
docker exec shop-nginx-prod nginx -t
```

#### 2. 数据库连接失败
```bash
# 检查MySQL状态
docker logs shop-mysql-prod

# 检查数据库配置
docker exec shop-mysql-prod mysql -u root -p -e "SHOW DATABASES;"

# 重置数据库密码
docker exec shop-mysql-prod mysql -u root -p -e "ALTER USER 'shop_user'@'%' IDENTIFIED BY 'MyStrongPassword123!';"
```

#### 3. CSV导入失败
```bash
# 检查上传目录权限
./check-upload-dir.sh

# 修复权限
./fix-upload-permission.sh

# 查看Backend日志
docker logs shop-backend-prod --tail 100
```

#### 4. SSL证书问题
```bash
# 检查证书状态
sudo certbot certificates

# 重新申请证书
sudo certbot --nginx -d yourdomain.com --force-renewal

# 检查证书有效期
openssl x509 -in /etc/letsencrypt/live/yourdomain.com/cert.pem -text -noout | grep "Not After"
```

### 日志分析

#### Backend日志关键词
```bash
# 成功连接数据库
grep "Successfully connected" docker logs shop-backend-prod

# 导入成功
grep "导入成功" docker logs shop-backend-prod

# 错误信息
grep "ERROR\|error" docker logs shop-backend-prod
```

#### Frontend日志关键词
```bash
# API URL配置
grep "getBaseUrl" docker logs shop-frontend-prod

# 构建成功
grep "Ready in" docker logs shop-frontend-prod
```

---

## 🔒 安全注意事项

### 生产环境安全清单

#### 1. 密码安全
- [ ] 修改默认管理员密码
- [ ] 使用强密码策略
- [ ] 定期更换密码
- [ ] 启用双因素认证

#### 2. 网络安全
- [ ] 配置防火墙规则
- [ ] 启用HTTPS
- [ ] 设置安全头
- [ ] 限制API访问频率

#### 3. 数据安全
- [ ] 定期备份数据库
- [ ] 加密敏感数据
- [ ] 限制文件上传类型
- [ ] 清理临时文件

#### 4. 系统安全
- [ ] 定期更新系统
- [ ] 监控异常访问
- [ ] 设置日志轮转
- [ ] 限制容器权限

### 安全配置示例

#### 1. 防火墙配置
```bash
# 只开放必要端口
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

#### 2. Nginx安全头
```nginx
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff;
add_header X-XSS-Protection "1; mode=block";
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header Referrer-Policy "strict-origin-when-cross-origin";
```

#### 3. Docker安全
```yaml
# 使用非root用户
services:
  backend:
    user: "1001:1001"
  
  frontend:
    user: "1001:1001"
```

---

## 🔄 维护指南

### 日常维护

#### 1. 定期备份
```bash
# 数据库备份
docker exec shop-mysql-prod mysqldump -u root -p mini_shop_prod > backup_$(date +%Y%m%d).sql

# 文件备份
tar -czf files_backup_$(date +%Y%m%d).tar.gz server/public/

# 自动备份脚本
echo "0 2 * * * /path/to/backup.sh" | crontab -
```

#### 2. 日志管理
```bash
# 设置日志轮转
sudo nano /etc/logrotate.d/docker
# 添加：
# /var/lib/docker/containers/*/*.log {
#     daily
#     rotate 7
#     compress
#     delaycompress
#     missingok
#     notifempty
# }
```

#### 3. 性能监控
```bash
# 监控资源使用
docker stats

# 监控磁盘空间
df -h

# 监控内存使用
free -h
```

### 更新升级

#### 1. 应用更新
```bash
# 拉取最新代码
git pull origin main

# 重新构建镜像
docker-compose -f docker-compose.prod.yml build --no-cache

# 重启服务
docker-compose -f docker-compose.prod.yml up -d
```

#### 2. 系统更新
```bash
# 更新系统包
sudo apt update && sudo apt upgrade -y

# 更新Docker
sudo apt install docker-ce docker-ce-cli containerd.io

# 重启Docker服务
sudo systemctl restart docker
```

---

## 🌍 域名和服务器迁移

### 更换域名

#### 1. 更新配置文件
```bash
# 编辑环境变量
nano env.prod
# 修改：
# BASE_URL=https://newdomain.com
# CLIENT_URL=https://newdomain.com

# 更新Nginx配置
nano nginx/conf.d/default.conf
# 修改：
# server_name newdomain.com www.newdomain.com;
```

#### 2. 重新申请SSL证书
```bash
# 停止Nginx
docker-compose -f docker-compose.prod.yml stop nginx

# 申请新证书
sudo certbot certonly --standalone -d newdomain.com -d www.newdomain.com

# 更新证书路径
nano nginx/conf.d/default.conf
# 修改证书路径

# 重启服务
docker-compose -f docker-compose.prod.yml up -d
```

#### 3. 更新DNS解析
```bash
# 在域名管理后台设置A记录
# newdomain.com -> 服务器IP
# www.newdomain.com -> 服务器IP
```

### 服务器迁移

#### 1. 数据备份
```bash
# 备份数据库
docker exec shop-mysql-prod mysqldump -u root -p mini_shop_prod > database_backup.sql

# 备份文件
tar -czf files_backup.tar.gz server/public/

# 备份配置文件
tar -czf config_backup.tar.gz env.prod nginx/ ssl/
```

#### 2. 新服务器部署
```bash
# 在新服务器上安装Docker
curl -fsSL https://get.docker.com | sh

# 克隆项目
git clone https://github.com/your-username/mini-shop.git
cd mini-shop

# 恢复配置文件
tar -xzf config_backup.tar.gz

# 部署应用
./ultimate-fix.sh
```

#### 3. 数据恢复
```bash
# 恢复数据库
docker exec -i shop-mysql-prod mysql -u root -p mini_shop_prod < database_backup.sql

# 恢复文件
tar -xzf files_backup.tar.gz

# 重启服务
docker-compose -f docker-compose.prod.yml restart
```

---

## 📁 文件结构说明

### 项目根目录
```
mini-shop/
├── client/                 # Next.js前端应用
├── server/                 # Express.js后端应用
├── nginx/                  # Nginx配置文件
├── docs/                   # 项目文档
├── docker-compose.yml      # 开发环境配置
├── docker-compose.prod.yml # 生产环境配置
├── env.prod               # 生产环境变量
├── ultimate-fix.sh        # 终极修复脚本
├── test-all-endpoints.sh  # 端点测试脚本
└── README.md              # 项目说明文档
```

### Docker文件说明

#### `client/Dockerfile.prod`
- **用途**: 构建生产环境前端镜像
- **特点**: 多阶段构建，优化体积
- **环境变量**: NEXT_PUBLIC_API_URL

#### `server/Dockerfile.prod`
- **用途**: 构建生产环境后端镜像
- **特点**: 包含所有依赖和静态文件
- **端口**: 4000

#### `docker-compose.prod.yml`
- **用途**: 生产环境容器编排
- **服务**: frontend, backend, mysql, nginx
- **网络**: shop-network-prod
- **数据卷**: mysql_data_prod

### 脚本文件说明

| 脚本文件 | 功能 | 使用场景 |
|----------|------|----------|
| `ultimate-fix.sh` | 终极修复部署 | 解决所有部署问题 |
| `fix-upload-permission.sh` | 修复上传权限 | CSV导入失败时 |
| `test-all-endpoints.sh` | 测试所有端点 | 部署后验证 |
| `check-upload-dir.sh` | 检查上传目录 | 诊断上传问题 |
| `docs/安全清理脚本.sh` | 安全清理 | 首次部署前 |

### 配置文件说明

#### `env.prod`
- **用途**: 生产环境变量配置
- **包含**: 数据库、支付、域名等配置
- **安全**: 包含敏感信息，需要保护

#### `nginx/conf.d/default.conf`
- **用途**: Nginx反向代理配置
- **功能**: SSL、负载均衡、静态文件缓存
- **安全**: 安全头、CORS配置

#### `client/next.config.ts`
- **用途**: Next.js框架配置
- **功能**: 构建优化、环境变量
- **重要**: basePath配置影响路由

---

## 🤝 贡献指南

### 开发流程

1. **Fork项目**
2. **创建功能分支**: `git checkout -b feature/new-feature`
3. **提交更改**: `git commit -m "Add new feature"`
4. **推送分支**: `git push origin feature/new-feature`
5. **创建Pull Request**

### 代码规范

- 使用ESLint和Prettier格式化代码
- 遵循TypeScript类型定义
- 添加必要的注释和文档
- 编写单元测试

### 问题反馈

- 使用GitHub Issues报告Bug
- 提供详细的错误信息和复现步骤
- 包含系统环境信息

---

## 📄 许可证

本项目采用 [MIT许可证](LICENSE) - 查看LICENSE文件了解详情。

---

## 🙏 致谢

感谢所有开源项目的贡献者，特别是：
- Next.js团队
- Express.js团队
- Docker团队
- Nginx团队

---

## 📞 联系方式

- **项目地址**: https://github.com/your-username/mini-shop
- **问题反馈**: https://github.com/your-username/mini-shop/issues
- **文档**: https://github.com/your-username/mini-shop/wiki

---

**⭐ 如果这个项目对你有帮助，请给个Star支持一下！**
