#!/bin/bash
# 最终修复脚本 - 解决Volume挂载覆盖构建产物的问题

set -e

echo "🎯 最终修复：移除Frontend volume挂载"
echo "========================================"
echo ""
echo "问题：docker-compose.prod.yml 中的 ./client:/app 挂载"
echo "      覆盖了镜像内构建好的文件（包含正确环境变量）"
echo ""
echo "解决：使用镜像内构建好的文件，不挂载本地源代码"
echo ""

cd /opt/mini-shop

echo "📥 拉取最新配置..."
git pull

echo ""
echo "🛑 停止所有容器..."
docker-compose -f docker-compose.prod.yml --env-file .env.prod down

echo ""
echo "🗑️ 删除旧镜像..."
docker rmi mini-shop-frontend mini-shop-backend || true

echo ""
echo "🔨 重新构建所有镜像..."
echo "   - Backend: 使用volume挂载（需要访问public/静态文件）"
echo "   - Frontend: 不使用volume（使用镜像内构建好的文件）✨"
echo ""
docker-compose -f docker-compose.prod.yml --env-file .env.prod build --no-cache

echo ""
echo "🚀 启动所有服务..."
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d

echo ""
echo "⏳ 等待服务启动（40秒）..."
sleep 40

echo ""
echo "📊 服务状态："
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "🔍 Frontend日志（检查API URL）："
docker logs shop-frontend-prod 2>&1 | grep "getBaseUrl" || echo "未找到getBaseUrl日志"

echo ""
echo "🔍 Backend日志（检查数据库连接）："
docker logs shop-backend-prod 2>&1 | grep -E "(Successfully connected|Installation status)" | tail -5

echo ""
echo "🔍 MySQL状态："
docker-compose -f docker-compose.prod.yml ps mysql

echo ""
echo "🧪 测试API端点..."
echo "-------------------"
echo "测试 /v1/shop/categories ..."
curl -s http://localhost:4000/v1/shop/categories | head -c 150
echo ""

echo ""
echo "测试 /admin/ 静态文件..."
curl -I http://localhost:4000/admin/ 2>&1 | grep -E "(HTTP|Content-Type)"

echo ""
echo ""
echo "✅ 部署完成！"
echo ""
echo "🌐 请在浏览器中测试（**务必清除缓存！**）："
echo "   1. 按 Ctrl+Shift+Delete 清除浏览器缓存"
echo "   2. 或使用无痕模式（Ctrl+Shift+N）"
echo "   3. 访问 https://waimaimeituan.dpdns.org"
echo "   4. 按 F12 查看Console，确认："
echo "      - APP_CONFIG 显示正确的URL"
echo "      - API请求发送到 https://waimaimeituan.dpdns.org/v1"
echo ""
echo "🔍 如果还有问题："
echo "   1. 运行诊断脚本：./test-all-endpoints.sh"
echo "   2. 查看详细日志："
echo "      docker logs shop-frontend-prod"
echo "      docker logs shop-backend-prod"
echo "   3. 查看浏览器诊断文档：浏览器诊断步骤.md"

