#!/bin/bash
# 全面测试所有端点

echo "🧪 全面测试网站功能"
echo "===================="
echo ""

# 测试1: Nginx是否正常转发
echo "📌 测试1: Nginx配置"
echo "-------------------"
echo "测试HTTP重定向..."
curl -I http://localhost:80 2>&1 | head -5

echo ""
echo "测试HTTPS..."
curl -I https://localhost:443 -k 2>&1 | head -5

echo ""
echo ""

# 测试2: Backend静态文件
echo "📌 测试2: Backend静态文件（管理后台资源）"
echo "-------------------------------------------"
echo "测试 /admin/libs/vue.global.js ..."
curl -I http://localhost:4000/admin/libs/vue.global.js 2>&1 | head -8

echo ""
echo "测试 /admin/libs/index.css ..."
curl -I http://localhost:4000/admin/libs/index.css 2>&1 | head -8

echo ""
echo "测试 /admin/ (index.html) ..."
curl -I http://localhost:4000/admin/ 2>&1 | head -8

echo ""
echo ""

# 测试3: Backend API
echo "📌 测试3: Backend API"
echo "---------------------"
echo "测试 /v1/shop/categories ..."
curl -s http://localhost:4000/v1/shop/categories | head -c 200
echo ""

echo ""
echo "测试 /v1/products ..."
curl -s http://localhost:4000/v1/products | head -c 200
echo ""

echo ""
echo ""

# 测试4: Frontend
echo "📌 测试4: Frontend服务"
echo "---------------------"
echo "测试 Frontend首页..."
curl -I http://localhost:4001/ 2>&1 | head -8

echo ""
echo ""

# 测试5: 通过Nginx代理访问
echo "📌 测试5: 通过Nginx代理访问（最重要！）"
echo "---------------------------------------"
echo "测试 / (Frontend通过Nginx) ..."
curl -I http://localhost:80/ 2>&1 | head -10

echo ""
echo "测试 /v1/shop/categories (Backend API通过Nginx) ..."
curl -s http://localhost:80/v1/shop/categories 2>&1 | head -c 200
echo ""

echo ""
echo "测试 /admin/ (Backend静态文件通过Nginx) ..."
curl -I http://localhost:80/admin/ 2>&1 | head -10

echo ""
echo ""

# 测试6: 容器内部连通性
echo "📌 测试6: 容器内部网络"
echo "---------------------"
echo "Frontend → Backend连通性..."
docker exec shop-frontend-prod wget -O- http://backend:4000/v1/shop/categories 2>&1 | head -c 200
echo ""

echo ""
echo ""

# 测试7: MySQL状态
echo "📌 测试7: MySQL数据库"
echo "---------------------"
docker-compose -f /opt/mini-shop/docker-compose.prod.yml ps mysql

echo ""
echo "MySQL日志（最后20行）："
docker logs shop-mysql-prod 2>&1 | tail -20

echo ""
echo ""

echo "✅ 测试完成！"
echo ""
echo "💡 如果发现问题："
echo "  - Nginx返回502 → Backend服务有问题"
echo "  - Nginx返回404 → Nginx配置路径错误"
echo "  - Backend静态文件404 → public目录未挂载或路径错误"
echo "  - API返回空或错误 → 数据库连接或数据问题"

