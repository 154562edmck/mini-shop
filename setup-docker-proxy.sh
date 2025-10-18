#!/bin/bash

echo "🔧 配置Docker守护进程使用代理"
echo "================================"

# 创建Docker服务配置目录
echo "📁 创建配置目录..."
sudo mkdir -p /etc/systemd/system/docker.service.d

# 创建代理配置文件
echo "📝 创建代理配置文件..."
sudo tee /etc/systemd/system/docker.service.d/http-proxy.conf > /dev/null << 'EOF'
[Service]
Environment="HTTP_PROXY=http://127.0.0.1:7890/"
Environment="HTTPS_PROXY=http://127.0.0.1:7890/"
Environment="NO_PROXY=localhost,127.0.0.1"
EOF

# 重新加载systemd配置
echo "🔄 重新加载systemd配置..."
sudo systemctl daemon-reload

# 重启Docker服务
echo "🔄 重启Docker服务..."
sudo systemctl restart docker

# 等待Docker启动
echo "⏳ 等待Docker启动..."
sleep 5

# 验证代理配置
echo "🔍 验证代理配置..."
systemctl show --property=Environment docker

echo ""
echo "✅ Docker代理配置完成！"
echo ""
echo "🧪 测试Docker连接..."
docker pull hello-world
