#!/bin/bash

echo "🎯 支付模板预览测试工具"
echo "================================"

# 获取测试token
echo "🔑 获取测试Token..."
TOKEN_RESPONSE=$(curl -s -X POST http://localhost:4000/v1/user/test-login \
  -H "Content-Type: application/json" \
  -d '{"code": "test_code"}')

TOKEN=$(echo "$TOKEN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
USER_ID=$(echo "$TOKEN_RESPONSE" | grep -o '"id":[0-9]*' | cut -d':' -f2)

if [ -z "$TOKEN" ]; then
    echo "❌ 获取Token失败"
    exit 1
fi

echo "✅ Token获取成功！"
echo "👤 用户ID: $USER_ID"
echo ""

# 使用现有订单
ORDER_NO="WX17606047451722676"
echo "📋 使用现有订单: $ORDER_NO"
echo ""

# 为每个模板创建分享订单
echo "🎨 为所有模板创建分享订单..."
TEMPLATES=("1" "2" "3" "4" "5" "6" "7" "8" "9" "10" "11")
SHARE_CODES=()

for template_id in "${TEMPLATES[@]}"; do
    echo "创建模板 $template_id 的分享订单..."
    
    SHARE_RESPONSE=$(curl -s -X POST http://localhost:4000/v1/shop/orders/$ORDER_NO/share \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d "{
        \"templateId\": $template_id,
        \"payMethod\": \"wechat\"
      }")
    
    SHARE_CODE=$(echo "$SHARE_RESPONSE" | grep -o '"share_code":"[^"]*"' | cut -d'"' -f4)
    
    if [ -n "$SHARE_CODE" ]; then
        SHARE_CODES+=("$SHARE_CODE")
        echo "✅ 模板 $template_id 分享码: $SHARE_CODE"
    else
        echo "❌ 模板 $template_id 创建失败"
        echo "响应: $SHARE_RESPONSE"
    fi
done

echo ""
echo "🎉 所有模板创建完成！"
echo ""
echo "📱 预览方法："
echo "1. 在浏览器中设置Token："
echo "   localStorage.setItem('accessToken', '$TOKEN');"
echo "   localStorage.setItem('userInfo', JSON.stringify({id: $USER_ID, nickname: '测试用户'}));"
echo ""
echo "2. 访问以下分享链接预览各种支付模板："
echo ""

# 显示所有分享链接
TEMPLATE_NAMES=("携程" "美团" "京东" "拼多多" "滴滴" "得物" "饿了么" "蚂蚁" "飞猪" "淘宝" "抖音")
for i in "${!SHARE_CODES[@]}"; do
    template_index=$((i + 1))
    template_name="${TEMPLATE_NAMES[$i]}"
    share_code="${SHARE_CODES[$i]}"
    echo "   $template_index. $template_name: http://localhost:3001/h5/share/$share_code"
done

echo ""
echo "🔧 测试步骤："
echo "1. 打开前端页面: http://localhost:3001/h5"
echo "2. 按F12打开开发者工具"
echo "3. 在控制台中执行上面的localStorage设置代码"
echo "4. 刷新页面登录"
echo "5. 点击上面的分享链接预览各种支付模板"
echo ""
echo "💡 提示：每个模板都会显示对应平台的支付界面样式"
echo ""
echo "🎯 现在您可以："
echo "   - 预览所有11种支付模板"
echo "   - 查看微信分享界面效果"
echo "   - 测试支付流程（不会真实扣费）"
echo "   - 体验完整的代付功能"
