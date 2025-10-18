#!/bin/bash

echo "🧪 本地测试登录脚本"
echo "================================"

# 测试登录API
echo "🔐 执行测试登录..."
RESPONSE=$(curl -s -X POST http://localhost:4000/v1/user/test-login \
  -H "Content-Type: application/json" \
  -d '{"code": "test_code"}')

echo "📋 登录响应："
echo "$RESPONSE" | jq '.'

# 提取token
TOKEN=$(echo "$RESPONSE" | jq -r '.data.token // empty')

if [ -n "$TOKEN" ]; then
    echo ""
    echo "✅ 登录成功！"
    echo "🔑 Token: $TOKEN"
    echo ""
    echo "📱 现在您可以在浏览器中使用以下方式测试："
    echo ""
    echo "1. 打开浏览器开发者工具 (F12)"
    echo "2. 在控制台中执行："
    echo "   localStorage.setItem('token', '$TOKEN');"
    echo "3. 刷新页面，即可跳过微信登录"
    echo ""
    echo "🌐 或者直接访问以下URL测试支付页面："
    echo "   http://localhost:3001/h5"
    echo ""
else
    echo "❌ 登录失败，请检查后端服务是否正常运行"
fi
