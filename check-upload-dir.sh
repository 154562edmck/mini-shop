#!/bin/bash
# 检查上传目录权限

echo "🔍 检查上传目录"
echo "================"
echo ""

echo "1. 检查Backend容器内的upload目录..."
docker exec shop-backend-prod ls -lah /app/public/upload/ 2>&1

echo ""
echo "2. 检查目录权限..."
docker exec shop-backend-prod stat -c "%a %n" /app/public/upload/ 2>&1

echo ""
echo "3. 测试写入权限..."
docker exec shop-backend-prod touch /app/public/upload/test_write.txt 2>&1
if [ $? -eq 0 ]; then
    echo "✅ 写入权限正常"
    docker exec shop-backend-prod rm /app/public/upload/test_write.txt
else
    echo "❌ 写入权限失败！"
fi

echo ""
echo "4. 检查本地挂载的目录..."
ls -lah server/public/upload/ 2>&1

echo ""
echo "================================"
echo "💡 解决方案："
echo "================================"
echo ""
echo "如果目录不存在或权限不足，执行："
echo ""
echo "# 创建目录"
echo "mkdir -p server/public/upload"
echo ""
echo "# 设置权限"
echo "chmod 777 server/public/upload"
echo ""
echo "# 重启Backend容器"
echo "docker restart shop-backend-prod"
echo ""

