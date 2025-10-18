#!/bin/bash

echo "🧪 快速测试登录"
echo "================================"

# 获取测试token
echo "🔑 获取测试Token..."
TOKEN_RESPONSE=$(curl -s -X POST http://localhost:4000/v1/user/test-login \
  -H "Content-Type: application/json" \
  -d '{"code": "test_code"}')

# 提取token
TOKEN=$(echo "$TOKEN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
    echo "✅ Token获取成功！"
    echo ""
    echo "🔑 Token: $TOKEN"
    echo ""
    echo "📱 使用方法："
    echo "1. 打开前端页面: http://localhost:3001/h5"
    echo "2. 按F12打开开发者工具"
    echo "3. 在控制台中执行以下代码："
    echo ""
    echo "localStorage.setItem('accessToken', '$TOKEN');"
    echo "localStorage.setItem('userInfo', JSON.stringify({"
    echo "  id: 2,"
    echo "  nickname: '测试用户',"
    echo "  avatar: 'https://evan-1304983303.cos.ap-nanjing.myqcloud.com/global/mini-shop/mt.jpg'"
    echo "}));"
    echo "location.reload();"
    echo ""
    echo "4. 执行后页面会自动刷新并登录成功"
    echo ""
    echo "🎯 现在您可以测试："
    echo "   - 商品浏览和购买"
    echo "   - 各种支付模板预览"
    echo "   - 订单管理"
    echo "   - 分享功能"
else
    echo "❌ Token获取失败"
    echo "响应: $TOKEN_RESPONSE"
fi
