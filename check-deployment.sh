#!/bin/bash

# 🔍 网站部署问题排查脚本
# 用于快速诊断网站无法访问的问题

echo "🔍 网站部署问题排查"
echo "服务器: 194.163.139.211"
echo "域名: waimaimeituan.dpdns.org"
echo "================================"

# 检查Docker服务状态
echo "🐳 检查Docker服务状态..."
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "📊 检查容器日志..."
echo "=== Nginx日志 (最后10行) ==="
docker-compose -f docker-compose.prod.yml logs nginx | tail -10

echo ""
echo "=== Backend日志 (最后10行) ==="
docker-compose -f docker-compose.prod.yml logs backend | tail -10

echo ""
echo "=== Frontend日志 (最后10行) ==="
docker-compose -f docker-compose.prod.yml logs frontend | tail -10

echo ""
echo "=== MySQL日志 (最后10行) ==="
docker-compose -f docker-compose.prod.yml logs mysql | tail -10

echo ""
echo "🌐 检查端口占用..."
echo "端口80:"
netstat -tulpn | grep :80 || echo "端口80未被占用"

echo "端口443:"
netstat -tulpn | grep :443 || echo "端口443未被占用"

echo ""
echo "🔒 检查SSL证书..."
if [ -f "ssl/cert.pem" ] && [ -f "ssl/key.pem" ]; then
    echo "✅ SSL证书文件存在"
    echo "证书有效期:"
    openssl x509 -in ssl/cert.pem -noout -dates
else
    echo "❌ SSL证书文件不存在"
fi

echo ""
echo "🌍 检查域名解析..."
echo "域名解析结果:"
nslookup waimaimeituan.dpdns.org || echo "域名解析失败"

echo ""
echo "🔥 检查防火墙状态..."
if command -v ufw >/dev/null 2>&1; then
    echo "UFW状态:"
    ufw status
elif command -v firewall-cmd >/dev/null 2>&1; then
    echo "Firewalld状态:"
    firewall-cmd --list-all
else
    echo "未检测到防火墙管理工具"
fi

echo ""
echo "🧪 测试本地访问..."
echo "测试HTTP (localhost:80):"
curl -s -o /dev/null -w "HTTP状态码: %{http_code}, 响应时间: %{time_total}s\n" http://localhost || echo "HTTP访问失败"

echo "测试HTTPS (localhost:443):"
curl -s -o /dev/null -w "HTTP状态码: %{http_code}, 响应时间: %{time_total}s\n" https://localhost || echo "HTTPS访问失败"

echo ""
echo "🌐 测试外部访问..."
echo "测试HTTP (waimaimeituan.dpdns.org:80):"
curl -s -o /dev/null -w "HTTP状态码: %{http_code}, 响应时间: %{time_total}s\n" http://waimaimeituan.dpdns.org || echo "外部HTTP访问失败"

echo "测试HTTPS (waimaimeituan.dpdns.org:443):"
curl -s -o /dev/null -w "HTTP状态码: %{http_code}, 响应时间: %{time_total}s\n" https://waimaimeituan.dpdns.org || echo "外部HTTPS访问失败"

echo ""
echo "📋 系统资源检查..."
echo "磁盘使用情况:"
df -h

echo ""
echo "内存使用情况:"
free -h

echo ""
echo "CPU负载:"
uptime

echo ""
echo "🔧 常见问题解决方案:"
echo "1. 如果容器未启动: docker-compose -f docker-compose.prod.yml up -d"
echo "2. 如果端口被占用: 检查并停止占用端口的服务"
echo "3. 如果SSL证书问题: 重新申请证书并复制到ssl/目录"
echo "4. 如果防火墙阻止: 开放80和443端口"
echo "5. 如果域名解析问题: 检查DNS设置"
echo ""
echo "📞 如需帮助，请提供以上输出信息"
