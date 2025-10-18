#!/bin/bash

# 🎯 零基础部署助手脚本
# 专为完全没有部署经验的初学者设计

echo "🌟 欢迎使用零基础网站部署助手！"
echo "=================================="
echo ""

# 检查是否为root用户
if [ "$EUID" -ne 0 ]; then
    echo "❌ 请使用root用户运行此脚本"
    echo "   请执行: sudo su"
    exit 1
fi

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 函数：打印带颜色的消息
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# 函数：检查命令是否存在
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 函数：等待用户确认
wait_for_user() {
    echo ""
    read -p "按Enter键继续..." dummy
}

# 函数：获取用户输入
get_user_input() {
    local prompt="$1"
    local var_name="$2"
    local default_value="$3"
    
    if [ -n "$default_value" ]; then
        read -p "$prompt [$default_value]: " input
        eval "$var_name=\${input:-$default_value}"
    else
        read -p "$prompt: " input
        eval "$var_name=\"$input\""
    fi
}

echo "📋 部署前检查清单"
echo "=================="
echo "请确认您已经完成以下准备工作："
echo ""
echo "1. ✅ 已购买云服务器（推荐：阿里云、腾讯云）"
echo "2. ✅ 已购买域名（推荐：.com 或 .cn）"
echo "3. ✅ 已将域名解析到服务器IP"
echo "4. ✅ 已获取服务器IP和密码"
echo "5. ✅ 已申请微信小程序AppID（可选）"
echo ""

read -p "确认已完成上述准备工作？(y/N): " confirm
if [[ ! $confirm =~ ^[Yy]$ ]]; then
    echo "请先完成准备工作，然后重新运行此脚本"
    exit 1
fi

echo ""
echo "🔧 开始系统环境检查..."
echo "========================"

# 检查系统信息
print_info "系统信息："
echo "操作系统: $(lsb_release -d | cut -f2)"
echo "内核版本: $(uname -r)"
echo "架构: $(uname -m)"
echo ""

# 检查网络连接
print_info "检查网络连接..."
if ping -c 1 8.8.8.8 >/dev/null 2>&1; then
    print_success "网络连接正常"
else
    print_error "网络连接异常，请检查网络设置"
    exit 1
fi

# 检查端口占用
print_info "检查端口占用情况..."
ports=(80 443 3306 4000 3000)
for port in "${ports[@]}"; do
    if netstat -tuln | grep -q ":$port "; then
        print_warning "端口 $port 已被占用"
    else
        print_success "端口 $port 可用"
    fi
done

wait_for_user

echo ""
echo "📦 开始安装必要软件..."
echo "======================="

# 更新系统
print_info "更新系统软件包..."
apt update -y
apt upgrade -y
print_success "系统更新完成"

# 安装基础工具
print_info "安装基础工具..."
apt install -y wget curl nano vim git unzip htop
print_success "基础工具安装完成"

# 安装Docker
if command_exists docker; then
    print_success "Docker 已安装"
else
    print_info "安装Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    systemctl start docker
    systemctl enable docker
    print_success "Docker 安装完成"
fi

# 安装Docker Compose
if command_exists docker-compose; then
    print_success "Docker Compose 已安装"
else
    print_info "安装Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    print_success "Docker Compose 安装完成"
fi

# 安装Certbot
if command_exists certbot; then
    print_success "Certbot 已安装"
else
    print_info "安装Certbot（SSL证书工具）..."
    apt install -y certbot
    print_success "Certbot 安装完成"
fi

wait_for_user

echo ""
echo "📁 项目文件准备..."
echo "==================="

# 检查项目文件
if [ -d "/opt/13合1完整版三七6.0版本" ]; then
    print_success "项目文件已存在"
    cd /opt/13合1完整版三七6.0版本
else
    print_warning "项目文件不存在，请先上传项目文件到 /opt/ 目录"
    echo ""
    echo "上传方法："
    echo "1. 使用WinSCP（Windows）或SCP命令（Mac/Linux）"
    echo "2. 将项目文件夹上传到服务器的 /opt/ 目录"
    echo ""
    echo "示例命令（在本地执行）："
    echo "scp -r ./13合1完整版三七6.0版本 root@您的服务器IP:/opt/"
    echo ""
    read -p "上传完成后按Enter继续..." dummy
    
    if [ ! -d "/opt/13合1完整版三七6.0版本" ]; then
        print_error "项目文件仍未找到，请检查上传路径"
        exit 1
    fi
    
    cd /opt/13合1完整版三七6.0版本
fi

print_success "进入项目目录: $(pwd)"

wait_for_user

echo ""
echo "⚙️ 配置生产环境..."
echo "==================="

# 获取用户配置信息
echo "请提供以下配置信息："
echo ""

get_user_input "请输入您的域名（如：example.com）" DOMAIN ""
get_user_input "请输入数据库密码（建议使用强密码）" DB_PASSWORD "MyStrongPassword123!"
get_user_input "请输入微信AppID（可选，直接回车跳过）" WECHAT_APP_ID ""
get_user_input "请输入微信AppSecret（可选，直接回车跳过）" WECHAT_APP_SECRET ""

# 创建生产环境配置
print_info "创建生产环境配置文件..."
cp env.prod.example .env.prod

# 更新配置文件
sed -i "s/your-domain.com/$DOMAIN/g" .env.prod
sed -i "s/MyStrongPassword123!/$DB_PASSWORD/g" .env.prod

if [ -n "$WECHAT_APP_ID" ]; then
    sed -i "s/wx1234567890abcdef/$WECHAT_APP_ID/g" .env.prod
fi

if [ -n "$WECHAT_APP_SECRET" ]; then
    sed -i "s/your_wechat_app_secret_here/$WECHAT_APP_SECRET/g" .env.prod
fi

print_success "配置文件创建完成"

wait_for_user

echo ""
echo "🔒 配置SSL证书..."
echo "=================="

# 检查域名解析
print_info "检查域名解析..."
if nslookup $DOMAIN >/dev/null 2>&1; then
    print_success "域名解析正常"
else
    print_warning "域名解析可能有问题，请确认域名已正确解析到服务器IP"
fi

# 停止可能占用80端口的服务
print_info "停止可能占用80端口的服务..."
systemctl stop apache2 2>/dev/null || true
systemctl stop nginx 2>/dev/null || true

# 申请SSL证书
print_info "申请SSL证书..."
echo "这将为您的域名申请免费的SSL证书"
echo ""

if certbot certonly --standalone -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN; then
    print_success "SSL证书申请成功"
    
    # 复制证书到项目目录
    print_info "复制证书文件..."
    mkdir -p ssl
    cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem ssl/cert.pem
    cp /etc/letsencrypt/live/$DOMAIN/privkey.pem ssl/key.pem
    chmod 600 ssl/key.pem
    chmod 644 ssl/cert.pem
    print_success "证书文件复制完成"
    
    # 设置自动续期
    print_info "设置证书自动续期..."
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
    print_success "自动续期设置完成"
else
    print_error "SSL证书申请失败"
    echo "可能的原因："
    echo "1. 域名未正确解析到服务器"
    echo "2. 80端口被占用"
    echo "3. 防火墙阻止了80端口"
    echo ""
    echo "请检查以上问题后重新运行此脚本"
    exit 1
fi

wait_for_user

echo ""
echo "🌐 配置Nginx..."
echo "================"

# 更新Nginx配置
print_info "更新Nginx配置..."
sed -i "s/your-domain.com/$DOMAIN/g" nginx/conf.d/default.conf
print_success "Nginx配置更新完成"

wait_for_user

echo ""
echo "🚀 启动服务..."
echo "==============="

# 给脚本添加执行权限
chmod +x deploy-prod.sh
chmod +x switch-env.sh

# 运行部署脚本
print_info "运行部署脚本..."
if ./deploy-prod.sh; then
    print_success "服务启动成功"
else
    print_error "服务启动失败"
    echo "请检查错误信息并重试"
    exit 1
fi

wait_for_user

echo ""
echo "🎉 部署完成！"
echo "=============="
echo ""
echo "您的网站已成功部署！"
echo ""
echo "🌐 网站地址："
echo "   前台：https://$DOMAIN/h5"
echo "   后台：https://$DOMAIN/admin/"
echo ""
echo "👤 默认管理员账号："
echo "   用户名：admin"
echo "   密码：123456"
echo ""
echo "⚠️  重要提醒："
echo "1. 请立即登录后台修改管理员密码"
echo "2. 配置您的业务信息"
echo "3. 设置支付接口（如果需要）"
echo "4. 导入商品数据"
echo ""
echo "🔧 日常管理命令："
echo "   查看服务状态：./switch-env.sh"
echo "   查看日志：docker-compose -f docker-compose.prod.yml logs"
echo "   重启服务：docker-compose -f docker-compose.prod.yml restart"
echo ""
echo "📞 如需帮助，请查看 BEGINNER_DEPLOYMENT_GUIDE.md"
echo ""
print_success "部署完成！祝您使用愉快！"

