#!/bin/bash

echo "🐳 启动 MySQL 数据库容器"
echo "================================"

# 检查 Docker 是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker 未运行，请先启动 Docker"
    exit 1
fi

# 停止并删除现有容器
echo "🧹 清理现有容器..."
docker stop shop-mysql 2>/dev/null || true
docker rm shop-mysql 2>/dev/null || true

# 启动 MySQL 容器
echo "🚀 启动 MySQL 容器..."
docker run --name shop-mysql \
  -e MYSQL_ROOT_PASSWORD=root123 \
  -e MYSQL_DATABASE=kehu2 \
  -e MYSQL_USER=kehu2 \
  -e MYSQL_PASSWORD=kehu2 \
  -p 3306:3306 \
  -d mysql:8.0 \
  --default-authentication-plugin=mysql_native_password

echo "⏳ 等待 MySQL 启动..."
sleep 10

echo "🔍 检查 MySQL 状态..."
docker ps | grep shop-mysql

echo ""
echo "✅ MySQL 启动完成！"
echo ""
echo "📋 连接信息："
echo "   主机: localhost"
echo "   端口: 3306"
echo "   数据库: kehu2"
echo "   用户名: kehu2"
echo "   密码: kehu2"
echo "   Root密码: root123"
echo ""
echo "🔧 测试连接:"
echo "   mysql -h localhost -P 3306 -u kehu2 -pkehu2 kehu2"
