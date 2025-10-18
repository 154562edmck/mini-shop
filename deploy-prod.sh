#!/bin/bash

echo "🚀 生产环境部署脚本"
echo "================================"

# 检查是否在服务器上运行
if [ ! -f "env.prod.example" ]; then
    echo "❌ 请在项目根目录运行此脚本"
    exit 1
fi

# 检查环境变量文件
if [ ! -f ".env.prod" ]; then
    echo "📝 创建生产环境配置文件..."
    cp env.prod.example .env.prod
    echo "✅ 请编辑 .env.prod 文件，填入您的实际配置"
    echo "   重要：请修改以下配置："
    echo "   - 数据库密码"
    echo "   - 域名配置"
    echo "   - 微信/支付宝密钥"
    echo "   - SSL证书路径"
    exit 1
fi

# 加载环境变量
source .env.prod

echo "🔍 检查配置..."
echo "   域名: $BASE_URL"
echo "   数据库: $MYSQL_DATABASE"
echo ""

# 创建必要的目录
echo "📁 创建必要目录..."
mkdir -p logs/nginx
mkdir -p ssl
mkdir -p mysql

# 检查SSL证书
if [ ! -f "ssl/cert.pem" ] || [ ! -f "ssl/key.pem" ]; then
    echo "⚠️  SSL证书未找到，请将证书文件放入 ssl/ 目录："
    echo "   - ssl/cert.pem (证书文件)"
    echo "   - ssl/key.pem (私钥文件)"
    echo ""
    echo "💡 可以使用 Let's Encrypt 免费证书："
    echo "   certbot certonly --standalone -d your-domain.com"
    exit 1
fi

# 停止现有服务
echo "🛑 停止现有服务..."
docker-compose -f docker-compose.prod.yml down

# 构建并启动服务
echo "🔨 构建并启动服务..."
docker-compose -f docker-compose.prod.yml up --build -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 30

# 检查服务状态
echo "🔍 检查服务状态..."
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "✅ 部署完成！"
echo ""
echo "🌐 访问地址："
echo "   网站: $BASE_URL"
echo "   管理后台: $BASE_URL/admin/"
echo ""
echo "📋 常用命令："
echo "   查看日志: docker-compose -f docker-compose.prod.yml logs -f"
echo "   停止服务: docker-compose -f docker-compose.prod.yml down"
echo "   重启服务: docker-compose -f docker-compose.prod.yml restart"
echo ""
echo "🔧 首次使用："
echo "   1. 访问管理后台完成安装"
echo "   2. 配置支付接口"
echo "   3. 导入商品数据"

