#!/bin/bash

echo "🔄 开发/生产环境切换工具"
echo "================================"

# 检查当前环境
if [ -f "docker-compose.yml" ] && [ -f "docker-compose.prod.yml" ]; then
    echo "✅ 检测到开发和生产环境配置"
else
    echo "❌ 缺少环境配置文件"
    exit 1
fi

# 显示当前状态
echo "📊 当前状态："
if docker ps --format "table {{.Names}}" | grep -q "shop-"; then
    echo "   运行中的服务："
    docker ps --format "table {{.Names}}\t{{.Status}}" | grep "shop-"
else
    echo "   没有运行中的服务"
fi

echo ""
echo "🎯 选择操作："
echo "1. 启动开发环境 (localhost)"
echo "2. 启动生产环境 (域名)"
echo "3. 停止所有服务"
echo "4. 查看服务状态"
echo "5. 查看日志"
echo ""

read -p "请选择 (1-5): " choice

case $choice in
    1)
        echo "🚀 启动开发环境..."
        docker-compose down 2>/dev/null
        docker-compose -f docker-compose.prod.yml down 2>/dev/null
        docker-compose up -d
        echo "✅ 开发环境已启动"
        echo "   前端: http://localhost:3001/h5"
        echo "   后端: http://localhost:4000/admin/"
        ;;
    2)
        echo "🚀 启动生产环境..."
        docker-compose down 2>/dev/null
        docker-compose -f docker-compose.prod.yml down 2>/dev/null
        
        if [ ! -f ".env.prod" ]; then
            echo "❌ 请先配置生产环境变量文件 .env.prod"
            exit 1
        fi
        
        docker-compose -f docker-compose.prod.yml up -d
        echo "✅ 生产环境已启动"
        ;;
    3)
        echo "🛑 停止所有服务..."
        docker-compose down 2>/dev/null
        docker-compose -f docker-compose.prod.yml down 2>/dev/null
        echo "✅ 所有服务已停止"
        ;;
    4)
        echo "📊 服务状态："
        docker-compose ps 2>/dev/null
        docker-compose -f docker-compose.prod.yml ps 2>/dev/null
        ;;
    5)
        echo "📋 选择要查看的服务："
        echo "1. 开发环境 - 后端"
        echo "2. 开发环境 - 前端"
        echo "3. 开发环境 - MySQL"
        echo "4. 生产环境 - 后端"
        echo "5. 生产环境 - 前端"
        echo "6. 生产环境 - MySQL"
        echo "7. 生产环境 - Nginx"
        echo ""
        read -p "请选择 (1-7): " log_choice
        
        case $log_choice in
            1) docker-compose logs -f backend ;;
            2) docker-compose logs -f frontend ;;
            3) docker-compose logs -f mysql ;;
            4) docker-compose -f docker-compose.prod.yml logs -f backend ;;
            5) docker-compose -f docker-compose.prod.yml logs -f frontend ;;
            6) docker-compose -f docker-compose.prod.yml logs -f mysql ;;
            7) docker-compose -f docker-compose.prod.yml logs -f nginx ;;
            *) echo "❌ 无效选择" ;;
        esac
        ;;
    *)
        echo "❌ 无效选择"
        ;;
esac

