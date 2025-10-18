#!/bin/bash

echo "🚀 启动外卖系统开发环境"
echo "================================"

# 检查 Docker 是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker 未运行，请先启动 Docker"
    exit 1
fi

# 检查 docker-compose 是否安装
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose 未安装"
    exit 1
fi

echo "📦 构建并启动所有服务..."
docker-compose up --build -d

echo "⏳ 等待服务启动..."
sleep 10

echo "🔍 检查服务状态..."
docker-compose ps

echo ""
echo "✅ 开发环境启动完成！"
echo ""
echo "🌐 访问地址："
echo "   管理后台: http://localhost:4000/admin/"
echo "   前端页面: http://localhost:4001/h5/"
echo "   数据库: localhost:3306"
echo ""
echo "📋 常用命令："
echo "   查看日志: docker-compose logs -f [service_name]"
echo "   停止服务: docker-compose down"
echo "   重启服务: docker-compose restart [service_name]"
echo "   进入容器: docker-compose exec [service_name] sh"
echo ""
echo "🔧 首次使用请访问管理后台完成安装配置"
