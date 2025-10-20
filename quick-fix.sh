#!/bin/bash
# 快速修复脚本 - 在服务器上执行

set -e

echo "🔄 拉取最新代码..."
cd /opt/mini-shop
git pull

echo "🛑 停止所有容器..."
docker-compose -f docker-compose.prod.yml --env-file .env.prod down

echo "🗑️ 删除旧的Frontend镜像..."
docker rmi mini-shop-frontend || true

echo "🔨 重新构建Frontend（使用环境变量）..."
docker-compose -f docker-compose.prod.yml --env-file .env.prod build --no-cache frontend

echo "🚀 启动所有服务..."
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d

echo "⏳ 等待服务启动（30秒）..."
sleep 30

echo ""
echo "📊 服务状态："
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "🔍 检查Frontend日志（应该看到正确的API URL）："
docker logs shop-frontend-prod 2>&1 | grep "getBaseUrl" || echo "未找到getBaseUrl日志"

echo ""
echo "🧪 测试本地访问..."
curl -I http://localhost:80

echo ""
echo "✅ 部署完成！请在浏览器中测试："
echo "   主页: https://waimaimeituan.dpdns.org"
echo "   后台: https://waimaimeituan.dpdns.org/admin"
echo ""
echo "🔎 如果还有问题，查看完整日志："
echo "   docker logs shop-frontend-prod"
echo "   docker logs shop-backend-prod"

