#!/bin/bash

# 🚀 服务器端一键部署脚本
# 在服务器上运行此脚本来快速部署网站

set -e

echo "🚀 服务器端一键部署脚本"
echo "服务器: 194.163.139.211"
echo "域名: waimaimeituan.dpdns.org"
echo "================================"

# 检查是否为root用户
if [ "$EUID" -ne 0 ]; then
    echo "❌ 请使用root用户运行此脚本"
    exit 1
fi

# 更新系统
echo "📦 更新系统..."
apt update && apt upgrade -y

# 安装必要软件
echo "🔧 安装必要软件..."
apt install -y curl wget git vim unzip nginx certbot

# 安装Docker
echo "🐳 安装Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    systemctl start docker
    systemctl enable docker
fi

# 安装Docker Compose
echo "🐳 安装Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# 创建项目目录
echo "📁 创建项目目录..."
mkdir -p /opt/mini-shop
cd /opt/mini-shop

# 检查项目文件是否存在
if [ ! -f "docker-compose.prod.yml" ]; then
    echo "❌ 项目文件不存在，请先上传项目文件到 /opt/mini-shop"
    echo "可以使用以下方法上传："
    echo "1. 使用SCP: scp -r 项目目录 root@194.163.139.211:/opt/mini-shop"
    echo "2. 使用Git: git clone 仓库地址 /opt/mini-shop"
    exit 1
fi

# 配置环境变量
echo "⚙️ 配置环境变量..."
if [ ! -f ".env.prod" ]; then
    if [ -f "env.prod" ]; then
        cp env.prod .env.prod
        echo "✅ 已复制环境变量模板"
        echo "📝 请编辑 .env.prod 文件，填入正确的配置信息"
    else
        echo "❌ 环境变量文件不存在"
        exit 1
    fi
fi

# 申请SSL证书
echo "🔒 申请SSL证书..."
if [ ! -f "ssl/cert.pem" ] || [ ! -f "ssl/key.pem" ]; then
    echo "申请SSL证书..."
    
    # 停止可能运行的Nginx
    systemctl stop nginx 2>/dev/null || true
    
    # 申请证书
    certbot certonly --standalone -d waimaimeituan.dpdns.org -d www.waimaimeituan.dpdns.org --non-interactive --agree-tos --email admin@waimaimeituan.dpdns.org
    
    # 创建SSL目录
    mkdir -p ssl
    
    # 复制证书
    cp /etc/letsencrypt/live/waimaimeituan.dpdns.org/fullchain.pem ssl/cert.pem
    cp /etc/letsencrypt/live/waimaimeituan.dpdns.org/privkey.pem ssl/key.pem
    
    echo "✅ SSL证书申请完成"
fi

# 配置防火墙
echo "🔥 配置防火墙..."
ufw allow 22
ufw allow 80
ufw allow 443
ufw --force enable

# 启动Docker服务
echo "🐳 启动Docker服务..."
docker-compose -f docker-compose.prod.yml up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 30

# 检查服务状态
echo "🔍 检查服务状态..."
docker-compose -f docker-compose.prod.yml ps

# 设置证书自动续期
echo "🔄 设置证书自动续期..."
cat > /etc/cron.d/certbot-renew << EOF
0 12 * * * root certbot renew --quiet && docker-compose -f /opt/mini-shop/docker-compose.prod.yml restart nginx
EOF

# 测试网站访问
echo "🧪 测试网站访问..."
echo "测试HTTP访问..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost | grep -q "200\|301\|302"; then
    echo "✅ HTTP访问正常"
else
    echo "❌ HTTP访问异常"
fi

echo "测试HTTPS访问..."
if curl -s -o /dev/null -w "%{http_code}" https://localhost | grep -q "200\|301\|302"; then
    echo "✅ HTTPS访问正常"
else
    echo "❌ HTTPS访问异常"
fi

echo ""
echo "🎉 部署完成！"
echo ""
echo "🌐 网站地址:"
echo "   主站: https://waimaimeituan.dpdns.org"
echo "   管理后台: https://waimaimeituan.dpdns.org/admin"
echo ""
echo "📋 常用命令:"
echo "   查看服务状态: docker-compose -f docker-compose.prod.yml ps"
echo "   查看日志: docker-compose -f docker-compose.prod.yml logs"
echo "   重启服务: docker-compose -f docker-compose.prod.yml restart"
echo "   停止服务: docker-compose -f docker-compose.prod.yml down"
echo ""
echo "🔧 如果网站无法访问，请运行: ./check-deployment.sh"
echo ""
echo "📞 部署完成！请访问网站测试功能"
