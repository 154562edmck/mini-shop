#!/bin/bash
# 终极修复脚本 - 解决所有404问题

set -e

echo "🎯 终极修复：解决所有404错误"
echo "================================"
echo ""
echo "修复内容："
echo "  1. ✅ Frontend basePath从 /h5 改为空（config.ts）"
echo "  2. ✅ Nginx路由优先级修正（先匹配/admin/，再匹配静态文件）"
echo "  3. ✅ 移除Frontend volume挂载（使用镜像内构建好的文件）"
echo "  4. ✅ 传递正确的构建环境变量"
echo ""

cd /opt/mini-shop

echo "📥 1/8 拉取最新代码..."
git pull

echo ""
echo "🛑 2/8 停止所有容器..."
docker-compose -f docker-compose.prod.yml --env-file .env.prod down

echo ""
echo "🗑️ 3/8 清理旧镜像和缓存..."
docker rmi mini-shop-frontend mini-shop-backend || true
docker system prune -f

echo ""
echo "🔨 4/8 重新构建Backend..."
docker-compose -f docker-compose.prod.yml --env-file .env.prod build --no-cache backend

echo ""
echo "🔨 5/8 重新构建Frontend（关键：basePath已修改为空）..."
docker-compose -f docker-compose.prod.yml --env-file .env.prod build --no-cache frontend

echo ""
echo "🚀 6/8 启动所有服务..."
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d

echo ""
echo "⏳ 7/8 等待服务启动（40秒）..."
sleep 40

echo ""
echo "🧪 8/8 测试验证..."
echo "================================"
echo ""

echo "📊 容器状态："
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "🔍 Frontend日志："
echo "-------------------"
docker logs shop-frontend-prod 2>&1 | tail -10

echo ""
echo "🔍 Backend日志："
echo "-------------------"
docker logs shop-backend-prod 2>&1 | tail -10

echo ""
echo "🔍 Nginx日志："
echo "-------------------"
docker logs shop-nginx-prod 2>&1 | tail -10

echo ""
echo "🧪 测试关键端点："
echo "================================"
echo ""

echo "1. 测试Frontend首页..."
STATUS=$(curl -o /dev/null -s -w "%{http_code}" http://localhost:80/)
if [ "$STATUS" -eq 301 ] || [ "$STATUS" -eq 200 ]; then
    echo "   ✅ Frontend可访问 (状态码: $STATUS)"
else
    echo "   ❌ Frontend异常 (状态码: $STATUS)"
fi

echo ""
echo "2. 测试Backend API..."
STATUS=$(curl -o /dev/null -s -w "%{http_code}" http://localhost:4000/v1/shop/categories)
if [ "$STATUS" -eq 200 ]; then
    echo "   ✅ Backend API正常 (状态码: $STATUS)"
    curl -s http://localhost:4000/v1/shop/categories | head -c 100
    echo "..."
else
    echo "   ❌ Backend API异常 (状态码: $STATUS)"
fi

echo ""
echo "3. 测试Backend静态文件（关键！）..."
STATUS=$(curl -o /dev/null -s -w "%{http_code}" http://localhost:4000/admin/libs/vue.global.js)
if [ "$STATUS" -eq 200 ]; then
    echo "   ✅ Backend静态文件正常 (状态码: $STATUS)"
else
    echo "   ❌ Backend静态文件404 (状态码: $STATUS)"
    echo "   检查 server/public/admin/libs/ 目录是否存在文件"
fi

echo ""
echo "4. 测试通过Nginx访问Backend静态文件（关键！）..."
STATUS=$(curl -o /dev/null -s -w "%{http_code}" http://localhost:80/admin/libs/vue.global.js)
if [ "$STATUS" -eq 301 ] || [ "$STATUS" -eq 200 ]; then
    echo "   ✅ Nginx → Backend静态文件正常 (状态码: $STATUS)"
else
    echo "   ❌ Nginx → Backend静态文件异常 (状态码: $STATUS)"
    echo "   检查Nginx配置路由优先级"
fi

echo ""
echo "5. 测试Frontend config.js（应该不再是/h5/config.js）..."
STATUS=$(curl -o /dev/null -s -w "%{http_code}" http://localhost:4001/config.js)
if [ "$STATUS" -eq 200 ]; then
    echo "   ✅ config.js可访问 (状态码: $STATUS)"
    echo "   内容预览："
    curl -s http://localhost:4001/config.js | grep "API_URL"
else
    echo "   ❌ config.js异常 (状态码: $STATUS)"
fi

echo ""
echo ""
echo "================================"
echo "✅ 部署完成！"
echo "================================"
echo ""
echo "🌐 浏览器测试步骤（非常重要！）："
echo "-----------------------------------"
echo ""
echo "1. ⚠️  清除浏览器缓存（必须！）"
echo "   - 按 Ctrl+Shift+Delete"
echo "   - 选择\"缓存的图片和文件\""
echo "   - 点击\"清除数据\""
echo "   - 或使用无痕模式：Ctrl+Shift+N"
echo ""
echo "2. 📱 访问主页："
echo "   https://waimaimeituan.dpdns.org"
echo "   "
echo "   按F12查看Console，应该看到："
echo "   ✅ APP_CONFIG {API_URL: 'https://waimaimeituan.dpdns.org/v1', ...}"
echo "   ✅ getBaseUrl https://waimaimeituan.dpdns.org/v1"
echo "   "
echo "   ❌ 不应该看到："
echo "   ❌ /h5/config.js 404"
echo "   ❌ getBaseUrl http://localhost:..."
echo ""
echo "3. 🖥️  访问后台："
echo "   https://waimaimeituan.dpdns.org/admin"
echo "   "
echo "   按F12查看Network，应该看到："
echo "   ✅ /admin/libs/vue.global.js - 200"
echo "   ✅ /admin/libs/index.css - 200"
echo "   ✅ /admin/js/api.js - 200"
echo "   "
echo "   ❌ 不应该看到："
echo "   ❌ 所有文件都404"
echo ""
echo "4. 🔐 测试登录："
echo "   用户名: admin"
echo "   密码: 123456"
echo ""
echo "================================"
echo ""
echo "📋 如果还有问题："
echo "-----------------------------------"
echo ""
echo "1. 查看详细日志："
echo "   docker logs shop-frontend-prod"
echo "   docker logs shop-backend-prod"
echo "   docker logs shop-nginx-prod"
echo ""
echo "2. 检查Backend静态文件是否存在："
echo "   ls -la server/public/admin/libs/"
echo ""
echo "3. 进入容器内部检查："
echo "   docker exec -it shop-backend-prod ls -la /app/public/admin/libs/"
echo ""
echo "4. 测试容器内部网络："
echo "   docker exec shop-nginx-prod wget -O- http://backend:4000/admin/libs/vue.global.js | head -c 100"
echo ""
echo "================================"
echo "🎉 祝部署成功！"
echo "================================"

