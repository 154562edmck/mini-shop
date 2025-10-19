#!/bin/bash

# 🔧 React版本冲突修复脚本
# 解决ahooks与React 19的兼容性问题

echo "🔧 修复React版本冲突问题..."
echo "问题: ahooks@3.8.4 不支持 React 19"
echo "解决方案: 使用 --legacy-peer-deps 选项"
echo "================================"

# 检查是否在项目根目录
if [ ! -f "client/package.json" ]; then
    echo "❌ 错误: 请在项目根目录运行此脚本"
    exit 1
fi

echo "📝 方案一: 使用 --legacy-peer-deps (推荐)"
echo "已更新Dockerfile，使用 npm ci --legacy-peer-deps"
echo ""

echo "📝 方案二: 升级ahooks到最新版本"
echo "检查ahooks最新版本..."

# 检查ahooks最新版本
LATEST_AHOOKS=$(npm view ahooks version 2>/dev/null || echo "无法获取")
echo "ahooks最新版本: $LATEST_AHOOKS"

echo ""
echo "📝 方案三: 替换ahooks为其他React Hooks库"
echo "推荐替代方案:"
echo "1. @tanstack/react-query (已安装)"
echo "2. usehooks-ts"
echo "3. react-use"

echo ""
echo "🎯 推荐操作步骤:"
echo "1. 使用方案一 (已自动应用)"
echo "2. 重新运行部署脚本"
echo "3. 如果仍有问题，考虑替换ahooks"

echo ""
echo "🚀 现在可以重新运行部署脚本:"
echo "./server-deploy.sh"
