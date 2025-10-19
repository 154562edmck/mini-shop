#!/bin/bash

# 🚀 自动化部署脚本
# 服务器IP: 194.163.139.211
# 域名: waimaimeituan.dpdns.org

set -e

echo "🚀 开始部署网站到服务器..."
echo "服务器: 194.163.139.211"
echo "域名: waimaimeituan.dpdns.org"
echo "================================"

# 检查是否在项目根目录
if [ ! -f "docker-compose.prod.yml" ]; then
    echo "❌ 错误: 请在项目根目录运行此脚本"
    exit 1
fi

# 检查环境变量文件
if [ ! -f ".env.prod" ]; then
    echo "📝 创建环境变量文件..."
    cp env.prod .env.prod
    echo "✅ 请编辑 .env.prod 文件，填入正确的配置信息"
    echo "   特别是数据库密码和网站URL"
    read -p "按回车键继续..."
fi

# 检查SSL证书
if [ ! -f "ssl/cert.pem" ] || [ ! -f "ssl/key.pem" ]; then
    echo "🔒 SSL证书不存在，需要先申请证书"
    echo "请按照以下步骤操作："
    echo "1. 确保域名 waimaimeituan.dpdns.org 已解析到服务器IP"
    echo "2. 在服务器上运行: certbot certonly --standalone -d waimaimeituan.dpdns.org"
    echo "3. 复制证书到项目目录"
    echo ""
    read -p "证书准备完成后，按回车键继续..."
fi

echo "🐳 启动Docker服务..."
docker-compose -f docker-compose.prod.yml up -d

echo "⏳ 等待服务启动..."
sleep 30

echo "🔍 检查服务状态..."
docker-compose -f docker-compose.prod.yml ps

echo "📊 检查服务日志..."
echo "=== Nginx日志 ==="
docker-compose -f docker-compose.prod.yml logs nginx | tail -10

echo "=== Backend日志 ==="
docker-compose -f docker-compose.prod.yml logs backend | tail -10

echo "=== Frontend日志 ==="
docker-compose -f docker-compose.prod.yml logs frontend | tail -10

echo "=== MySQL日志 ==="
docker-compose -f docker-compose.prod.yml logs mysql | tail -10

echo "🌐 测试网站访问..."
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
echo "🔧 如果网站无法访问，请检查:"
echo "   1. 域名解析是否正确"
echo "   2. 防火墙是否开放80和443端口"
echo "   3. SSL证书是否正确"
echo "   4. 服务是否正常运行"
