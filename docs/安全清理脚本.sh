#!/bin/bash

# 外卖系统源码安全清理脚本
# 警告：此脚本会删除恶意代码，请先备份！

echo "========================================"
echo "  外卖系统源码安全清理工具"
echo "========================================"
echo ""
echo "⚠️  警告：此脚本将删除后门代码"
echo "⚠️  请确保已备份原始文件"
echo ""
read -p "是否继续？(yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "已取消清理"
    exit 0
fi

echo ""
echo "开始清理..."
echo ""

# 1. 删除监控后门文件
echo "📝 步骤 1: 删除监控后门模块..."
if [ -f "server/common/monitor.js" ]; then
    rm -f "server/common/monitor.js"
    echo "✅ 已删除 server/common/monitor.js"
else
    echo "⚠️  monitor.js 不存在，跳过"
fi

# 2. 修改 server.js，移除监控引用
echo ""
echo "📝 步骤 2: 清理 server.js 中的监控引用..."
if [ -f "server/server.js" ]; then
    # 备份原文件
    cp server/server.js server/server.js.bak
    
    # 删除 import 语句
    sed -i "/import.*reportToMonitor.*from.*monitor/d" server/server.js
    
    # 删除调用语句
    sed -i "/reportToMonitor()/d" server/server.js
    
    echo "✅ 已清理 server.js（备份: server.js.bak）"
else
    echo "❌ server.js 不存在"
fi

# 3. 创建空的 monitor.js 以防止导入错误
echo ""
echo "📝 步骤 3: 创建安全的空 monitor.js..."
mkdir -p server/common
cat > server/common/monitor.js << 'EOF'
// 安全版本 - 所有监控功能已移除
// 此文件仅作为占位符，防止导入错误

export const reportToMonitor = async () => {
    // 已禁用：不再上报任何数据
    console.log('[SECURITY] Monitor功能已被安全禁用');
};
EOF
echo "✅ 已创建安全的 monitor.js"

# 4. 检查其他可疑代码
echo ""
echo "📝 步骤 4: 扫描其他可疑代码..."

echo "正在搜索外部域名引用..."
grep -r "s7s7s7.cn" server/ 2>/dev/null | grep -v "node_modules" | grep -v ".bak" || echo "  未发现 s7s7s7.cn 引用"

echo ""
echo "正在搜索可疑的网络请求..."
grep -r "axios.post.*http" server/ 2>/dev/null | grep -v "node_modules" | grep -v ".bak" | grep -v "weixin.qq.com" | grep -v "alipay.com" || echo "  未发现可疑请求"

# 5. 修改前端配置
echo ""
echo "📝 步骤 5: 检查前端配置..."
if [ -f "client/public/config.js" ]; then
    echo "⚠️  请手动编辑 client/public/config.js"
    echo "   将 s7s7s7.cn 域名改为你自己的域名"
fi

# 6. 生成安全配置模板
echo ""
echo "📝 步骤 6: 生成安全配置模板..."
cat > server/.env.example << 'EOF'
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_DATABASE=mini_shop

# 服务器配置
PORT=4000
BASE_URL=https://your-domain.com
CLIENT_URL=https://your-domain.com

# 管理员配置
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password

# 微信配置
WECHAT_APP_ID=your_wechat_appid
WECHAT_APP_SECRET=your_wechat_appsecret

# 微信支付配置
MCH_ID=your_mch_id
SERIAL_NO=your_serial_no
API_V3_KEY=your_api_v3_key

# 支付宝配置
ALIPAY_APP_ID=your_alipay_appid
ALIPAY_PRIVATE_KEY=your_alipay_private_key
ALIPAY_PUBLIC_KEY=your_alipay_public_key

# 易支付配置
EASYPAY_DOMAIN=your_easypay_domain
EASYPAY_PID=your_easypay_pid
EASYPAY_KEY=your_easypay_key
EOF
echo "✅ 已创建 .env.example 配置模板"

# 7. 清理日志
echo ""
echo "📝 步骤 7: 清理可能的日志文件..."
find server/ -name "*.log" -type f -delete 2>/dev/null
echo "✅ 日志文件已清理"

# 8. 安全检查
echo ""
echo "========================================"
echo "  安全清理完成！"
echo "========================================"
echo ""
echo "⚠️  重要提醒："
echo ""
echo "1. 请立即修改 client/public/config.js 中的域名配置"
echo "2. 请配置 server/.env 文件（参考 .env.example）"
echo "3. 建议进行完整的代码审查"
echo "4. 部署前使用网络监控工具检查所有外连请求"
echo "5. 定期检查系统文件变化"
echo ""
echo "📋 备份文件位置："
echo "   - server/server.js.bak"
echo ""
echo "🔍 下一步建议："
echo "   1. 运行: grep -r 'http' server/ | grep -v node_modules"
echo "   2. 手动检查所有网络请求"
echo "   3. 监控运行时的网络连接"
echo ""
echo "✅ 清理脚本执行完成"

