#!/bin/bash
# 修复上传目录权限问题

echo "🔧 修复上传目录权限"
echo "===================="
echo ""

cd /opt/mini-shop

echo "1. 检查并创建upload目录..."
mkdir -p server/public/upload
echo "✅ 目录已创建"

echo ""
echo "2. 设置目录权限为777..."
chmod -R 777 server/public/upload
echo "✅ 权限已设置"

echo ""
echo "3. 验证权限..."
ls -lah server/public/upload/

echo ""
echo "4. 重启Backend容器..."
docker restart shop-backend-prod

echo ""
echo "⏳ 等待容器启动（10秒）..."
sleep 10

echo ""
echo "5. 验证容器内部权限..."
docker exec shop-backend-prod ls -lah /app/public/upload/

echo ""
echo "6. 测试写入..."
docker exec shop-backend-prod touch /app/public/upload/test.txt && \
docker exec shop-backend-prod rm /app/public/upload/test.txt && \
echo "✅ 写入测试成功！" || echo "❌ 写入测试失败！"

echo ""
echo "================================"
echo "✅ 修复完成！"
echo "================================"
echo ""
echo "🧪 现在请再次尝试导入CSV："
echo "   1. 登录后台: https://waimaimeituan.dpdns.org/admin"
echo "   2. 商品管理 → 导入商品"
echo "   3. 选择CSV文件"
echo "   4. 点击确定"
echo ""

