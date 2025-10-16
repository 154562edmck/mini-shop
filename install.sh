#!/bin/bash

# 检查是否为root用户（仅在Linux系统下检查）
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    if [ "$EUID" -ne 0 ]; then
        echo -e "\033[0;31m错误: 请使用root权限运行此脚本 (sudo ./install.sh)\033[0m"
        exit 1
    fi

    # Linux系统特定的设置
    echo -e "\033[0;34m正在配置Linux系统环境...\033[0m"

    # 设置系统字符集为UTF-8
    export LANG=en_US.UTF-8
    export LC_ALL=en_US.UTF-8

    # 确保文件系统使用UTF-8
    mount -o remount,iocharset=utf8 / 2>/dev/null || true
    # 如果是ext4文件系统，添加utf8选项
    # mount -o remount,utf8 / 2>/dev/null || true

    # 设置文件名编码
    export LESSCHARSET=utf-8
    export NLS_LANG=AMERICAN_AMERICA.AL32UTF8
fi

# 设置颜色变量
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 清屏函数
clear_screen() {
    clear
}

# 打印带颜色的标题
print_title() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}   Mini-Shop 安装向导${NC}"
    echo -e "${BLUE}   Author: Evan${NC}"
    echo -e "${BLUE}   本项目仅供学习和测试使用、禁止用于任何非法用途，后果自己负责。${NC}"
    # 版本
    echo -e "${YELLOW}   Version: 2.0.0${NC}"
    echo -e "${BLUE}================================${NC}"
    echo ""
}

# 检查并安装 Node.js 环境
check_and_install_nodejs() {
    echo -e "${YELLOW}正在检查 Node.js 环境...${NC}"

    # 检查 Node.js
    if ! check_command "node"; then
        echo -e "${YELLOW}未检测到 Node.js，尝试自动安装...${NC}"

        # 检查系统类型
        if [ -f "/etc/debian_version" ]; then
            # Debian/Ubuntu 系统
            echo -e "${YELLOW}检测到 Debian/Ubuntu 系统，正在安装 Node.js 18.x...${NC}"
            if curl -fsSL https://deb.nodesource.com/setup_18.x | sudo bash - &&
                sudo apt-get install -y nodejs; then
                echo -e "${GREEN}✓ Node.js 安装成功！${NC}"
            else
                echo -e "${RED}× Node.js 自动安装失败${NC}"
                print_nodejs_guide
                return 1
            fi
        elif [ -f "/etc/redhat-release" ]; then
            # CentOS/OpenCloud 系统
            echo -e "${YELLOW}检测到 CentOS/OpenCloud 系统，正在安装 Node.js 18.x...${NC}"
            if curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash - &&
                sudo yum install -y nodejs; then
                echo -e "${GREEN}✓ Node.js 安装成功！${NC}"
            else
                # 如果脚本方法失败，尝试直接安装 rpm 包
                echo -e "${YELLOW}脚本安装失败，尝试直接安装 rpm 包...${NC}"
                if sudo yum install -y https://rpm.nodesource.com/pub_18.x/el/7/x86_64/nodesource-release-el7-1.noarch.rpm &&
                    sudo yum install -y nodejs; then
                    echo -e "${GREEN}✓ Node.js 安装成功！${NC}"
                else
                    echo -e "${RED}× Node.js 自动安装失败${NC}"
                    print_nodejs_guide
                    return 1
                fi
            fi
        else
            echo -e "${RED}× 无法识别的系统类型${NC}"
            print_nodejs_guide
            return 1
        fi
    fi

    # 检查版本
    NODE_VERSION=$(node -v)
    if [[ "${NODE_VERSION}" =~ ^v18\.[2-9][0-9]\.[0-9]+$ || "${NODE_VERSION}" =~ ^v18\.18\.[0-9]+$ || "${NODE_VERSION}" =~ ^v18\.19\.[0-9]+$ || "${NODE_VERSION}" =~ ^v18\.20\.[0-9]+$ ]]; then
        echo -e "${GREEN}✓ Node.js 版本符合要求 (${NODE_VERSION})${NC}"
        echo -e "${YELLOW}建议使用 v18.20.0 或更高版本以获得最佳体验${NC}"
    else
        echo -e "${RED}× Node.js 版本不符合要求 (当前: ${NODE_VERSION}, 需要: v18.18.0 或更高版本)${NC}"
        print_nodejs_guide
        return 1
    fi

    # 检查 npm
    if ! check_command "npm"; then
        echo -e "${RED}× npm 未安装，请重新安装 Node.js${NC}"
        print_nodejs_guide
        return 1
    fi
    echo -e "${GREEN}✓ npm 已安装 ($(npm -v))${NC}"

    echo ""
    return 0
}

# 更新安装指南，增加 CentOS 相关说明
print_nodejs_guide() {
    echo ""
    echo -e "${YELLOW}请按照以下方式安装 Node.js：${NC}"
    echo ""
    echo -e "${CYAN}推荐方式：使用宝塔面板${NC}"
    echo "1. 登录宝塔面板"
    echo "2. 打开【软件商店】"
    echo "3. 搜索并安装【Node版本管理器】"
    echo "4. 在【Node版本管理器】中安装 v18.18.0 或更高版本"
    echo -e "   ${YELLOW}(建议使用 v18.20.0 或更高版本)${NC}"
    echo ""
    echo -e "${CYAN}手动安装方式：${NC}"
    echo "Debian/Ubuntu 系统："
    echo "   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo bash -"
    echo "   sudo apt-get install -y nodejs"
    echo ""
    echo "CentOS/OpenCloud 系统："
    echo "方法 1："
    echo "   curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -"
    echo "   sudo yum install -y nodejs"
    echo ""
    echo "方法 2："
    echo "   sudo yum install -y https://rpm.nodesource.com/pub_18.x/el/7/x86_64/nodesource-release-el7-1.noarch.rpm"
    echo "   sudo yum install -y nodejs"
    echo ""
    echo -e "${YELLOW}注意：安装完成后，请重新运行此安装向导${NC}"
    echo ""
}

# 检查命令是否存在
check_command() {
    if ! command -v $1 &>/dev/null; then
        return 1
    fi
    return 0
}

# 检查环境
check_environment() {
    echo -e "${YELLOW}正在检查环境...${NC}"

    # 检查 Node.js
    if ! check_command "node"; then
        print_nodejs_guide
    fi
    echo -e "${GREEN}✓ Node.js 已安装 ($(node -v))${NC}"

    # 检查 npm
    if ! check_command "npm"; then
        echo -e "${RED}未检测到 npm，请重新安装 Node.js${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ npm 已安装 ($(npm -v))${NC}"

    echo ""
}

# 配置 npm 源
configure_npm() {
    echo -e "${YELLOW}是否需要配置国内 npm 源？[y/N]${NC}"
    read -r answer
    if [[ "$answer" =~ ^[Yy]$ ]]; then
        npm config set registry https://registry.npmmirror.com
        echo -e "${GREEN}✓ npm 源已配置为淘宝源${NC}"
    fi
    echo ""
}

# 安装后端
install_backend() {
    echo -e "${YELLOW}开始安装后端...${NC}"

    # 进入后端目录
    cd server || exit

    # 安装依赖
    echo -e "${YELLOW}正在安装依赖...${NC}"
    npm install --force

    if [ $? -eq 0 ]; then
        clear_screen
        print_title
        echo -e "${GREEN}✓ 后端依赖安装成功！${NC}"
        echo -e "${GREEN}✓ 后端安装完成！${NC}"
        echo ""
        print_startup_guide
    else
        echo -e "${RED}× 安装失败，请检查错误信息${NC}"
    fi
}

# 打印启动指南
print_startup_guide() {
    echo -e "${YELLOW}项目启动说明：${NC}"
    echo ""
    echo -e "${CYAN}方式一：宝塔面板用户${NC}"
    echo "1. 登录宝塔面板"
    echo "2. 点击【网站】-【Node项目】"
    echo "3. 点击【添加Node项目】"
    echo "4. 项目目录选择：server 目录"
    echo "5. 项目名称：mini-shop"
    echo "6. 启动文件：server.js"
    echo "7. 运行用户：www"
    echo "8. 点击【提交】完成创建"
    echo ""
    echo -e "${CYAN}方式二：其他用户${NC}"
    echo "1. 安装 PM2 进程管理器："
    echo "   npm install -g pm2"
    echo ""
    echo "2. 使用 PM2 启动项目："
    echo "   pm2 start server.js --name mini-shop"
    echo ""
    echo "3. 常用 PM2 命令："
    echo "   查看状态：pm2 status"
    echo "   查看日志：pm2 logs mini-shop"
    echo "   重启项目：pm2 restart mini-shop"
    echo "   停止项目：pm2 stop mini-shop"
    echo ""
    echo -e "${GREEN}项目启动后内网访问地址：http://localhost:3000${NC}"
    echo -e "${GREEN}公网访问需要配置Nginx反向代理${NC}"
    echo -e "${YELLOW}注意：首次访问需要进行数据库配置${NC}"
    echo ""
}

# 生成build
build_server() {
    echo -e "${YELLOW}开始生成后端build...${NC}"

    # 进入后端目录
    cd server || {
        echo -e "${RED}× 无法进入 server 目录${NC}"
        return 1
    }

    # 安装依赖（如果需要）
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}正在安装依赖...${NC}"
        npm install --force
    fi

    # 删除dist
    if [ -d "dist" ]; then
        echo -e "${YELLOW}正在删除dist...${NC}"
        rm -rf dist
    fi

    # 执行构建
    echo -e "${YELLOW}正在构建...${NC}"
    npm run build

    if [ $? -eq 0 ]; then
        # 检查 dist 目录是否存在
        if [ ! -d "dist" ]; then
            echo -e "${RED}× 构建后的 dist 目录不存在${NC}"
            return 1
        fi

        # 返回上级目录
        cd ..

        # 创建build目录（使用绝对路径）
        BUILD_DIR="$(pwd)/build"
        SERVER_BUILD_DIR="${BUILD_DIR}/server"

        echo -e "${YELLOW}正在创建目录: ${BUILD_DIR}${NC}"
        mkdir -p "${SERVER_BUILD_DIR}" || {
            echo -e "${RED}× 无法创建build目录${NC}"
            return 1
        }

        # 清空目标目录（如果存在）
        if [ -d "${SERVER_BUILD_DIR}" ]; then
            echo -e "${YELLOW}清理已存在的build目录...${NC}"
            rm -rf "${SERVER_BUILD_DIR:?}"/*
        fi

        # 复制dist内容到build目录
        echo -e "${YELLOW}正在复制文件到: ${SERVER_BUILD_DIR}${NC}"
        cp -r server/dist/* "${SERVER_BUILD_DIR}/" || {
            echo -e "${RED}× 复制文件失败${NC}"
            return 1
        }

        # 验证文件复制
        if [ -z "$(ls -A "${SERVER_BUILD_DIR}")" ]; then
            echo -e "${RED}× build目录为空，复制可能失败${NC}"
            return 1
        fi

        clear_screen
        print_title
        echo -e "${GREEN}✓ build生成成功！${NC}"
        echo -e "${GREEN}✓ build位置：${BUILD_DIR}/server/${NC}"
        echo ""
        print_build_guide
    else
        echo -e "${RED}× 构建失败，请检查错误信息${NC}"
        return 1
    fi
}

# 打印build说明
print_build_guide() {
    echo -e "${YELLOW}build使用说明：${NC}"
    echo ""
    echo -e "${CYAN}1. build特点${NC}"
    echo "   - 代码已经过混淆加密处理"
    echo "   - 可以直接部署到生产环境"
    echo "   - 需要自行安装 node_modules"
    echo ""
    echo -e "${CYAN}2. 部署步骤${NC}"
    echo "   a) 复制 build/server 目录到服务器"
    echo "   b) 进入目录执行：npm install --production"
    echo "   c) 按照之前的启动说明运行项目"
    echo ""
    echo -e "${YELLOW}注意：请妥善保管build，避免泄露${NC}"
    echo ""

    # 显示实际路径
    echo -e "${CYAN}当前build完整路径：${NC}"
    echo "$(pwd)/build/server"
    echo ""
}

# 安装前端
install_frontend() {
    echo -e "${YELLOW}开始安装前端...${NC}"

    # 进入前端目录
    cd client || exit

    # 安装依赖
    echo -e "${YELLOW}正在安装依赖...${NC}"
    npm install --force

    # 执行构建
    echo -e "${YELLOW}正在构建前端...${NC}"
    npm run build

    if [ $? -eq 0 ]; then
        clear_screen
        print_title
        echo -e "${GREEN}✓ 前端依赖安装成功！${NC}"
        echo -e "${GREEN}✓ 前端构建完成！${NC}"
        echo ""
        print_frontend_startup_guide
    else
        echo -e "${RED}× 安装失败，请检查错误信息${NC}"
    fi
}

# 打印前端启动指南
print_frontend_startup_guide() {
    echo -e "${YELLOW}前端项目启动说明：${NC}"
    echo ""
    echo -e "${CYAN}方式一：宝塔面板用户${NC}"
    echo "1. 登录宝塔面板"
    echo "2. 点击【网站】-【Node项目】"
    echo "3. 点击【添加Node项目】"
    echo "4. 项目目录选择：client 目录"
    echo "5. 项目名称：mini-shop-frontend"
    echo "6. 启动命令：next start --port 3001"
    echo "7. 运行用户：www"
    echo "8. 点击【提交】完成创建"
    echo ""
    echo -e "${CYAN}方式二：其他用户${NC}"
    echo "1. 使用 PM2 启动项目："
    echo "   pm2 start 'npm run start' --name mini-shop-frontend"
    echo ""
    echo "2. 常用 PM2 命令："
    echo "   查看状态：pm2 status"
    echo "   查看日志：pm2 logs mini-shop-frontend"
    echo "   重启项目：pm2 restart mini-shop-frontend"
    echo "   停止项目：pm2 stop mini-shop-frontend"
    echo ""
    echo -e "${GREEN}项目启动后访问地址：http://localhost:3001${NC}"
    echo -e "${GREEN}公网访问需要配置Nginx反向代理${NC}"
    echo ""
}

# 生成前端build
build_frontend() {
    echo -e "${YELLOW}开始生成前端build...${NC}"

    # 进入前端目录
    cd client || {
        echo -e "${RED}× 无法进入 client 目录${NC}"
        return 1
    }

    # 安装依赖（如果需要）
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}正在安装依赖...${NC}"
        npm install --force
    fi

    # 删除.next
    if [ -d ".next" ]; then
        echo -e "${YELLOW}正在删除.next...${NC}"
        rm -rf .next
    fi

    # 执行构建
    echo -e "${YELLOW}正在构建...${NC}"
    npm run build

    if [ $? -eq 0 ]; then
        # 检查 .next 目录是否存在
        if [ ! -d ".next" ]; then
            echo -e "${RED}× 构建后的 .next 目录不存在${NC}"
            return 1
        fi

        # 返回上级目录
        cd ..

        # 创建前端build目录
        BUILD_DIR="$(pwd)/build"
        FRONTEND_BUILD_DIR="${BUILD_DIR}/client"

        echo -e "${YELLOW}正在创建目录: ${FRONTEND_BUILD_DIR}${NC}"
        mkdir -p "${FRONTEND_BUILD_DIR}" || {
            echo -e "${RED}× 无法创建build目录${NC}"
            return 1
        }

        # 清空目标目录（如果存在）
        if [ -d "${FRONTEND_BUILD_DIR}" ]; then
            echo -e "${YELLOW}清理已存在的build目录...${NC}"
            rm -rf "${FRONTEND_BUILD_DIR:?}"/*
        fi

        # 复制 standalone 目录内容
        echo -e "${YELLOW}正在复制 standalone 文件...${NC}"
        cp -r client/.next/standalone/* "${FRONTEND_BUILD_DIR}/" || {
            echo -e "${RED}× 复制 standalone 文件失败${NC}"
            return 1
        }

        mkdir -p "${FRONTEND_BUILD_DIR}/.next" || {
            echo -e "${RED}× 无法创建/.next/目录${NC}"
            return 1
        }

        # 复制 .next 目录内容
        echo -e "${YELLOW}正在复制 .next 文件...${NC}"
        cp -r client/.next/standalone/.next/* "${FRONTEND_BUILD_DIR}/.next/" || {
            echo -e "${RED}× 复制 .next 文件失败${NC}"
            return 1
        }

        # 复制 static 目录到 .next 下
        echo -e "${YELLOW}正在复制 static 文件...${NC}"
        cp -r client/.next/static "${FRONTEND_BUILD_DIR}/.next/" || {
            echo -e "${RED}× 复制 static 文件失败${NC}"
            return 1
        }

        # 复制 public 目录
        echo -e "${YELLOW}正在复制 public 文件...${NC}"
        cp -r client/public "${FRONTEND_BUILD_DIR}/" || {
            echo -e "${RED}× 复制 public 文件失败${NC}"
            return 1
        }

        clear_screen
        print_title
        echo -e "${GREEN}✓ 前端build生成成功！${NC}"
        echo -e "${GREEN}✓ build位置：${BUILD_DIR}/client/${NC}"
        echo ""
        print_frontend_build_guide
    else
        echo -e "${RED}× 构建失败，请检查错误信息${NC}"
        return 1
    fi
}

# 打印前端build说明
print_frontend_build_guide() {
    echo -e "${YELLOW}前端build使用说明：${NC}"
    echo ""
    echo -e "${CYAN}1. build特点${NC}"
    echo "   - 使用 Next.js standalone 模式构建"
    echo "   - 已包含必要的运行时依赖"
    echo "   - 可以直接部署到生产环境"
    echo ""
    echo -e "${CYAN}2. 部署步骤${NC}"
    echo "   a) 复制整个 build/client 目录到服务器"
    echo "   b) 直接使用 node server.js 启动或参考之前的启动说明"
    echo ""
    echo -e "${YELLOW}注意：build已经包含了所需的依赖，无需额外安装${NC}"
    echo ""

    # 显示实际路径
    echo -e "${CYAN}当前build完整路径：${NC}"
    echo "$(pwd)/build/client"
    echo ""
}

# 打印未编译包说明
print_source_package_guide() {
    echo -e "${YELLOW}未编译包使用说明：${NC}"
    echo ""
    echo -e "${CYAN}1. 包含内容${NC}"
    echo "   - 完整的前端源代码（不含node_modules和.next）"
    echo "   - 完整的后端源代码（不含node_modules和config.json）"
    echo "   - 安装脚本和说明文档"
    echo ""
    echo -e "${CYAN}2. 使用步骤${NC}"
    echo "   a) 复制整个dist目录到目标位置"
    echo "   b) 分别在client和server目录下运行 npm install"
    echo "   c) 按照开发环境配置进行相应设置"
    echo ""
    echo -e "${YELLOW}注意：此包用于开发环境或二次开发，不建议直接用于生产环境${NC}"
    echo ""

    # 显示实际路径
    echo -e "${CYAN}当前未编译包完整路径：${NC}"
    echo "$(pwd)/dist"
    echo ""
}

# 通用压缩函数
compress_directory() {
    local DIR_TO_COMPRESS="$1"
    local PACKAGE_TYPE="$2" # 用于区分是编译包还是未编译包

    # 检查目录是否存在
    if [ ! -d "${DIR_TO_COMPRESS}" ]; then
        echo -e "${RED}× 目录不存在：${DIR_TO_COMPRESS}${NC}"
        return 1
    fi

    # 检查目录是否为空
    if [ -z "$(ls -A ${DIR_TO_COMPRESS})" ]; then
        echo -e "${RED}× 目录为空：${DIR_TO_COMPRESS}${NC}"
        return 1
    fi

    # 创建压缩包名称
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    TAR_NAME="${PACKAGE_TYPE}_${TIMESTAMP}.tar.gz"

    echo -e "${YELLOW}正在创建压缩包: ${TAR_NAME}${NC}"

    # 进入父目录进行压缩
    cd "$(dirname "${DIR_TO_COMPRESS}")" || {
        echo -e "${RED}× 无法进入目录${NC}"
        return 1
    }

    # 压缩目录
    tar -czf "${TAR_NAME}" "$(basename "${DIR_TO_COMPRESS}")" || {
        echo -e "${RED}× 压缩失败${NC}"
        return 1
    }

    if [ -f "${TAR_NAME}" ]; then
        clear_screen
        print_title
        echo -e "${GREEN}✓ 压缩包创建成功！${NC}"
        echo -e "${GREEN}✓ 压缩包位置：$(pwd)/${TAR_NAME}${NC}"
        echo ""
        print_compress_guide "${PACKAGE_TYPE}"
        return 0
    else
        echo -e "${RED}× 压缩包创建失败${NC}"
        return 1
    fi
}

# 更新压缩包说明函数
print_compress_guide() {
    local PACKAGE_TYPE="$1"

    echo -e "${YELLOW}压缩包说明：${NC}"
    echo ""
    echo -e "${CYAN}1. 压缩包内容${NC}"
    if [ "${PACKAGE_TYPE}" = "build" ]; then
        echo "   - 包含完整的前端和后端build"
    else
        echo "   - 包含完整的前端和后端源代码"
    fi
    echo "   - 文件名包含创建时间戳以便区分"
    echo ""
    echo -e "${CYAN}2. 使用说明${NC}"
    echo "   a) 复制压缩包到目标服务器"
    echo "   b) 使用命令解压：tar -xzf ${TAR_NAME}"
    if [ "${PACKAGE_TYPE}" = "build" ]; then
        echo "   c) 按照部署说明进行部署"
    else
        echo "   c) 按照开发环境配置进行相应设置"
    fi
    echo ""
    echo -e "${YELLOW}注意：请妥善保管压缩包，避免泄露${NC}"
    echo ""
}

# 修改生成编译包函数
generate_build_package() {
    echo -e "${YELLOW}开始生成编译包...${NC}"

    # 生成后端build
    echo -e "${YELLOW}第 1 步：生成后端build${NC}"
    build_server || {
        echo -e "${RED}× 后端build生成失败${NC}"
        return 1
    }

    # 生成前端build
    echo -e "${YELLOW}第 2 步：生成前端build${NC}"
    build_frontend || {
        echo -e "${RED}× 前端build生成失败${NC}"
        return 1
    }

    # 询问是否需要压缩
    echo -e "${YELLOW}是否需要将编译包压缩？[y/N]${NC}"
    read -r answer
    if [[ "$answer" =~ ^[Yy]$ ]]; then
        compress_directory "$(pwd)/build" "build" || {
            echo -e "${RED}× 压缩失败${NC}"
            return 1
        }
    fi
}

# 修改生成未编译包函数
generate_source_package() {
    echo -e "${YELLOW}开始生成未编译包...${NC}"

    # 创建目标目录
    DIST_DIR="$(pwd)/dist"

    # 清理已存在的dist目录
    if [ -d "${DIST_DIR}" ]; then
        echo -e "${YELLOW}清理已存在的dist目录...${NC}"
        rm -rf "${DIST_DIR}"
    fi

    # 创建新的目录结构
    mkdir -p "${DIST_DIR}/client" "${DIST_DIR}/server"

    # 复制client文件
    echo -e "${YELLOW}正在复制前端源文件...${NC}"
    cd client || {
        echo -e "${RED}× 无法进入client目录${NC}"
        return 1
    }

    # 使用find命令复制需要的文件
    find . -type f \
        ! -path "./node_modules/*" \
        ! -path "./.next/*" \
        ! -path "./.git/*" \
        ! -name ".gitignore" \
        -exec bash -c '
            mkdir -p "'"${DIST_DIR}"'/client/$(dirname "{}")"
            cp "{}" "'"${DIST_DIR}"'/client/{}"
        ' \;

    # 返回根目录
    cd ..

    # 复制server文件
    echo -e "${YELLOW}正在复制后端源文件...${NC}"
    cd server || {
        echo -e "${RED}× 无法进入server目录${NC}"
        return 1
    }

    # 使用find命令复制需要的文件
    find . -type f \
        ! -path "./node_modules/*" \
        ! -path "./dist/*" \
        ! -path "./.git/*" \
        ! -name "config.json" \
        ! -name ".gitignore" \
        -exec bash -c '
            mkdir -p "'"${DIST_DIR}"'/server/$(dirname "{}")"
            cp "{}" "'"${DIST_DIR}"'/server/{}"
        ' \;

    # 返回根目录
    cd ..

    # 复制根目录下的文件
    echo -e "${YELLOW}正在复制安装脚本和说明文档...${NC}"
    cp install.sh "${DIST_DIR}/" || {
        echo -e "${RED}× 复制 install.sh 失败${NC}"
        return 1
    }
    cp "请你看我.md" "${DIST_DIR}/" || {
        echo -e "${RED}× 复制 请你看我.md 失败${NC}"
        return 1
    }

    # 检查是否成功生成
    if [ -d "${DIST_DIR}" ] && [ "$(ls -A ${DIST_DIR})" ]; then
        clear_screen
        print_title
        echo -e "${GREEN}✓ 未编译包生成成功！${NC}"
        echo -e "${GREEN}✓ 位置：${DIST_DIR}${NC}"
        echo ""
        print_source_package_guide

        # 询问是否需要压缩
        echo -e "${YELLOW}是否需要将未编译包压缩？[y/N]${NC}"
        read -r answer
        if [[ "$answer" =~ ^[Yy]$ ]]; then
            compress_directory "${DIST_DIR}" "source" || {
                echo -e "${RED}× 压缩失败${NC}"
                return 1
            }
        fi
    else
        echo -e "${RED}× 生成未编译包失败${NC}"
        return 1
    fi
}

# 更新前后端默认内容配置指南函数
print_frontend_guide() {
    clear_screen
    print_title
    echo -e "${CYAN}🎨 前后端默认内容配置指南${NC}"
    echo -e "${YELLOW}----------------------------------------${NC}"
    echo ""

    # 前端配置部分
    echo -e "${CYAN}前端配置：${NC}"
    echo -e "${YELLOW}----------------------------------------${NC}"

    # 1. 网站标题
    echo -e "${CYAN}1. 修改网站标题${NC}"
    echo -e "文件路径：${GREEN}$(pwd)/client/src/app/layout.tsx${NC}"
    echo "修改内容：找到 title 配置项并更新"
    echo -e "${YELLOW}注意：修改后需要重新执行步骤3(配置前端环境)并重启项目${NC}"
    echo ""

    # 2. 分享页面配置
    echo -e "${CYAN}2. 修改分享页面配置${NC}"
    echo -e "文件路径：${GREEN}$(pwd)/client/src/app/share/[shareCode]/page.tsx${NC}"
    echo "修改内容：更新页面标题和跳转URL"
    echo -e "${YELLOW}注意：修改后需要重新执行步骤3(配置前端环境)并重启项目${NC}"
    echo ""

    # 3. 分享卡片图片
    echo -e "${CYAN}3. 修改分享卡片图片${NC}"
    echo -e "文件路径：${GREEN}$(pwd)/client/src/app/order/confirm/page.tsx${NC}"
    echo "修改内容：更新分享卡片图片URL"
    echo -e "${YELLOW}注意：修改后需要重新执行步骤3(配置前端环境)并重启项目${NC}"
    echo ""

    # 4. 域名和AppID配置
    echo -e "${CYAN}4. 更新域名和AppID配置${NC}"
    echo -e "文件路径：${GREEN}$(pwd)/client/public/config.js${NC}"
    echo "可修改内容："
    echo "· API_URL：后端接口域名"
    echo "· ASSET_PREFIX：前端资源前缀"
    echo "· WECHAT_APP_ID：微信公众号AppID"
    echo -e "${YELLOW}注意：修改后无需重新构建，如未生效请手动重启服务${NC}"
    echo ""

    # 后端配置部分
    echo -e "${CYAN}后端配置：${NC}"
    echo -e "${YELLOW}----------------------------------------${NC}"

    # 5. 订单过期时间配置
    echo -e "${CYAN}5. 修改订单默认过期时间${NC}"
    echo -e "文件路径：${GREEN}$(pwd)/server/controllers/orderController.js${NC}"
    echo "修改内容：找到以下过期时间配置并按需更新"
    echo "· 携程订单：30分钟 (30 * 60 * 1000)"
    echo "· 美团订单：15分钟 (15 * 60 * 1000)"
    echo "· 京东订单：24小时 (24 * 60 * 60 * 1000)"
    echo "· 拼多多订单：24小时 (24 * 60 * 60 * 1000)"
    echo "· 滴滴订单：24小时 (24 * 60 * 60 * 1000)"
    echo -e "${YELLOW}注意：修改后需要重启后端服务生效${NC}"
    echo ""

    # 6. 后端其他配置
    echo -e "${CYAN}6. 其他后端配置${NC}"
    echo "· 所有其他后端配置均可通过管理后台页面更新"
    echo "· 更新后自动生效，如未生效请手动重启后端服务"
    echo ""

    echo -e "${YELLOW}按回车键返回主菜单...${NC}"
    read -r
    show_menu
}

# 更新使用指南函数
print_usage_guide() {
    clear_screen
    print_title

    echo -e "${CYAN}🚀 Mini-Shop 使用指南${NC}"
    echo -e "${YELLOW}----------------------------------------${NC}"
    echo ""

    # 第一步：环境检查与初始化
    echo -e "${CYAN}1. 环境检查与初始化${NC}"
    echo "   执行安装向导中的选项 1："
    echo "   · 自动检查并安装 Node.js 环境"
    echo "   · 配置 npm 源加速"
    echo -e "   ${YELLOW}注意：如果自动安装失败，请按照提示手动安装${NC}"
    echo ""

    # 第二步：项目配置
    echo -e "${CYAN}2. 项目配置${NC}"
    echo "   环境初始化成功后，依次执行："
    echo "   a) 选项 2：配置后端环境"
    echo "   b) 选项 3：配置前端环境"
    echo -e "   ${YELLOW}注意：请确保按顺序执行，避免依赖问题${NC}"
    echo ""

    # 第三步：后端配置
    echo -e "${CYAN}3. 后端配置${NC}"
    echo "   a) 登录宝塔面板"
    echo "   b) 打开【网站】-【Node项目】"
    echo "   c) 点击【添加Node项目】，填写："
    echo -e "      - 项目目录：${GREEN}$(pwd)/server${NC}"
    echo "      - 项目名称：mini-shop-server"
    echo "      - 项目端口：3000"
    echo "      - 运行用户：root"
    echo "      - 启动文件：server.js"
    echo "      - 启动命令：npm run start"
    echo -e "   ${YELLOW}注意：确保端口 3000 未被占用${NC}"
    echo ""

    # 第四步：前端配置
    echo -e "${CYAN}4. 前端配置${NC}"
    echo -e "   a) 编辑配置文件：${GREEN}$(pwd)/client/public/config.js${NC}"
    echo "      修改以下参数："
    echo "      - API_URL: 后端接口地址"
    echo "        示例：'https://api.example.com/v1' 或 'http://localhost:3000/v1'"
    echo "      - ASSET_PREFIX: 前端资源前缀"
    echo "        示例：'https://www.example.com' 或留空"
    echo "      - WECHAT_APP_ID: 微信公众号 AppID"
    echo -e "   ${YELLOW}注意：请确保配置正确，否则可能影响功能${NC}"
    echo ""
    echo "   b) 在宝塔【Node项目】中添加前端项目："
    echo -e "      - 项目目录：${GREEN}$(pwd)/client${NC}"
    echo "      - 项目名称：mini-shop-frontend"
    echo "      - 项目端口：3001"
    echo "      - 运行用户：root"
    echo "      - 启动文件：server.js"
    echo "      - 启动命令：npm run start"
    echo -e "   ${YELLOW}注意：确保端口 3001 未被占用${NC}"
    echo ""

    # 第五步：系统配置
    echo -e "${CYAN}5. 系统配置${NC}"
    echo "   a) 访问后端管理页面：http(s)://您的域名/admin"
    echo "   b) 首次访问自动进入安装向导："
    echo "      - 配置数据库连接信息"
    echo "      - 设置管理员账号和密码"
    echo "   c) 配置完成后重启后端服务"
    echo "   d) 刷新页面进入登录界面"
    echo "   e) 登录后进入【系统设置】完善其他参数"
    echo -e "   ${YELLOW}注意：请妥善保管管理员账号密码${NC}"
    echo ""

    echo -e "${CYAN}🔔 重要提示：${NC}"
    echo "1. 域名配置："
    echo "   · 确保域名已正确解析到服务器"
    echo "   · 建议使用 HTTPS 协议（需配置 SSL 证书）"
    echo ""
    echo "2. 安全配置："
    echo "   · 检查服务器安全组/防火墙设置"
    echo "   · 确保必要端口（3000、3001）已开放"
    echo "   · 建议配置反向代理，隐藏真实端口"
    echo ""
    echo "3. 运维建议："
    echo "   · 定期备份数据库"
    echo "   · 监控服务器资源使用情况"
    echo "   · 及时更新系统安全补丁"
    echo ""

    echo -e "${YELLOW}按回车键返回主菜单...${NC}"
    read -r
    show_menu
}

# 清理编译文件和包
clean_files() {
    clear_screen
    print_title
    echo -e "${YELLOW}清理操作将删除以下内容：${NC}"
    echo "1. build 目录"
    echo "2. dist 目录"
    echo "3. build_*.tar.gz 压缩包"
    echo "4. source_*.tar.gz 压缩包"
    echo ""
    echo -e "${RED}警告：此操作不可恢复！${NC}"
    echo -e "${YELLOW}是否继续？[y/N]${NC}"

    read -r answer
    if [[ "$answer" =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}开始清理...${NC}"

        # 删除 build 目录
        if [ -d "build" ]; then
            echo -e "${YELLOW}正在删除 build 目录...${NC}"
            rm -rf build
        fi

        # 删除 dist 目录
        if [ -d "dist" ]; then
            echo -e "${YELLOW}正在删除 dist 目录...${NC}"
            rm -rf dist
        fi

        # 删除压缩包
        echo -e "${YELLOW}正在删除压缩包...${NC}"
        rm -f build_*.tar.gz source_*.tar.gz

        clear_screen
        print_title
        echo -e "${GREEN}✓ 清理完成！${NC}"
        echo ""
        sleep 2
    else
        echo -e "${YELLOW}已取消清理操作${NC}"
        sleep 2
    fi
}

# 新增环境初始化函数
init_environment() {
    clear_screen
    print_title
    echo -e "${YELLOW}开始环境检查和初始化...${NC}"
    echo ""

    # 检查并安装 Node.js
    check_and_install_nodejs || return 1

    # 配置 npm 源
    configure_npm

    clear_screen
    print_title
    echo -e "${GREEN}✓ 环境初始化完成！${NC}"
    echo ""
    sleep 2
    show_menu
}

# 配置Node.js环境变量
configure_nodejs_env() {
    clear_screen
    print_title
    echo -e "${YELLOW}配置 Node.js 环境变量${NC}"
    echo -e "${YELLOW}----------------------------------------${NC}"
    echo ""

    # 检查操作系统类型
    if [[ "$OSTYPE" != "linux-gnu"* ]]; then
        echo -e "${RED}此功能仅支持 Linux 系统${NC}"
        echo ""
        echo -e "${CYAN}Windows 系统配置环境变量步骤：${NC}"
        echo "1. 右键点击【此电脑】，选择【属性】"
        echo "2. 点击【高级系统设置】"
        echo "3. 点击【环境变量】按钮"
        echo "4. 在系统变量区域，新建变量 NODE_HOME，值为 Node.js 安装目录"
        echo "   例如：C:\\Program Files\\nodejs"
        echo "5. 编辑系统变量中的 Path，添加 %NODE_HOME%\\bin"
        echo "6. 点击【确定】保存设置"
        echo ""
        echo -e "${YELLOW}按回车键返回主菜单...${NC}"
        read -r
        return 0
    fi

    # 提示用户输入 Node.js 安装目录
    echo -e "${YELLOW}请输入 Node.js 安装目录路径：${NC}"
    echo -e "${CYAN}例如：/usr/local/node 或 /www/server/nodejs/v18.20.0${NC}"
    read -r nodejs_path

    # 验证目录是否存在
    if [ ! -d "$nodejs_path" ]; then
        echo -e "${RED}错误：目录 '$nodejs_path' 不存在${NC}"
        echo -e "${YELLOW}按回车键返回主菜单...${NC}"
        read -r
        return 1
    fi

    # 验证目录是否包含bin/node
    if [ ! -f "$nodejs_path/bin/node" ]; then
        echo -e "${RED}错误：无法在 '$nodejs_path/bin' 目录下找到 node 可执行文件${NC}"
        echo -e "${YELLOW}请确认这是有效的 Node.js 安装目录${NC}"
        echo -e "${YELLOW}按回车键返回主菜单...${NC}"
        read -r
        return 1
    fi

    # 检查用户权限
    local profile_file="/etc/profile"
    if [ ! -w "$profile_file" ]; then
        echo -e "${RED}错误：没有写入 $profile_file 的权限${NC}"
        echo -e "${YELLOW}请使用 sudo 重新运行此脚本${NC}"
        echo -e "${YELLOW}按回车键返回主菜单...${NC}"
        read -r
        return 1
    fi

    # 准备环境变量配置
    local env_config="
# Node.js 环境变量配置 - 由 Mini-Shop 安装脚本添加
export NODE_HOME=$nodejs_path
export PATH=\$NODE_HOME/bin:\$PATH
"

    # 写入配置到 /etc/profile
    echo -e "${YELLOW}正在写入环境变量配置...${NC}"
    echo "$env_config" >>"$profile_file"

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ 环境变量配置已写入 $profile_file${NC}"

        # 应用配置
        echo -e "${YELLOW}正在应用新的环境变量配置...${NC}"
        source "$profile_file"

        # 验证配置
        echo -e "${GREEN}✓ Node.js 环境变量已配置${NC}"
        echo -e "${CYAN}配置信息：${NC}"
        echo "NODE_HOME=$NODE_HOME"
        echo "PATH 已更新，包含 Node.js bin 目录"
        echo ""
        echo -e "${YELLOW}重要提示：${NC}"
        echo "1. 要在当前会话中生效，请运行："
        echo "   source $profile_file"
        echo ""
        echo "2. 新的终端会话将自动加载这些设置"
        echo ""
    else
        echo -e "${RED}× 写入环境变量配置失败${NC}"
    fi

    echo -e "${YELLOW}按回车键返回主菜单...${NC}"
    read -r
    return 0
}

# 安装 NVM (Node Version Manager)
install_nvm() {
    clear_screen
    print_title
    echo -e "${YELLOW}开始安装 NVM (Node Version Manager)...${NC}"
    echo ""
    
    # 检查 NVM 是否已安装
    if command -v nvm &>/dev/null; then
        echo -e "${GREEN}✓ NVM 已经安装在您的系统上 ($(nvm --version))${NC}"
        echo -e "${YELLOW}如需更新或重新安装，请先手动卸载${NC}"
        echo ""
        echo -e "${YELLOW}按回车键返回主菜单...${NC}"
        read -r
        return 0
    fi
    
    echo -e "${YELLOW}正在下载 NVM 安装脚本...${NC}"
    if wget -qO- https://raw.bgithub.xyz/nvm-sh/nvm/v0.40.2/install.sh | bash; then
        echo -e "${GREEN}✓ NVM 安装脚本执行成功${NC}"
        
        # 加载 NVM
        echo -e "${YELLOW}正在加载 NVM 环境...${NC}"
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # 加载 nvm
        [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # 加载 bash 补全
        
        # 应用变更到当前会话
        source ~/.bashrc
        
        # 验证安装
        if command -v nvm &>/dev/null; then
            echo -e "${GREEN}✓ NVM 安装成功! ($(nvm --version))${NC}"
            echo -e "${YELLOW}是否要立即安装 Node.js 18.x? [y/N]${NC}"
            read -r answer
            if [[ "$answer" =~ ^[Yy]$ ]]; then
                echo -e "${YELLOW}正在安装 Node.js 18.20.0...${NC}"
                
                # 安装Node.js
                if nvm install 18.20.0; then
                    nvm use 18.20.0
                    nvm alias default 18.20.0
                    echo -e "${GREEN}✓ Node.js 18.20.0 安装完成! ($(node -v))${NC}"
                    
                    # 定义源路径和目标路径
                    SRC_DIR="/root/.nvm/versions/node/v18.20.0"
                    DEST_DIR="/www/server/nodejs/v18.20.0"  # 保持版本号一致性
                    
                    # 检查源目录是否存在
                    if [ -d "$SRC_DIR" ]; then
                        # 创建目标目录（强制使用sudo处理权限）
                        sudo mkdir -p "$DEST_DIR"
                        
                        # 复制文件并检查结果
                        if sudo cp -r "$SRC_DIR"/* "$DEST_DIR"/; then
                            echo -e "${GREEN}✓ Node.js 文件已复制到 $DEST_DIR${NC}"
                        else
                            echo -e "${RED}✗ 文件复制失败，请检查权限或路径${NC}" >&2
                        fi
                    else
                        echo -e "${RED}✗ 源目录 $SRC_DIR 不存在，安装可能失败${NC}" >&2
                    fi
                else
                    echo -e "${RED}✗ Node.js 安装失败，请检查网络或日志${NC}" >&2
                fi
            fi
        else
            echo -e "${RED}× NVM 安装成功但未能正确加载${NC}"
            echo -e "${YELLOW}请尝试关闭并重新打开您的终端，然后运行 'nvm --version' 验证安装${NC}"
        fi
    else
        echo -e "${RED}× NVM 安装失败${NC}"
        echo -e "${YELLOW}可能原因:${NC}"
        echo "1. 网络连接问题"
        echo "2. 缺少依赖项 (curl 或 git)"
        echo "3. 无法写入 ~/.bashrc 文件"
        echo ""
        echo -e "${YELLOW}建议尝试手动安装:${NC}"
        echo "curl -o- https://raw.bgithub.xyz/nvm-sh/nvm/v0.40.2/install.sh | bash"
        echo "或使用国内镜像:"
        echo "curl -o- https://gitee.com/mirrors/nvm/raw/v0.40.2/install.sh | bash"
    fi
    
    echo ""
    echo -e "${YELLOW}按回车键返回主菜单...${NC}"
    read -r
    return 0
}

# 更新show_menu函数
show_menu() {
    clear_screen
    print_title

    # 环境初始化
    echo -e "${CYAN}🔧 环境初始化${NC}"
    echo -e "${YELLOW}----------------------------------------${NC}"
    echo -e "1) 📦 安装 NVM (Node 版本管理器)"
    echo "   · 支持多版本 Node.js 共存"
    echo "   · 便于在无root权限时安装Node.js"
    echo "   · 轻松切换不同Node.js版本"
    echo ""
    echo -e "2) ⚙️ 检查并初始化环境"
    echo "   · 检查 Node.js 环境"
    echo "   · 安装必要组件"
    echo "   · 配置 npm 源"
    echo ""
    echo -e "3) 🔄 配置 Node.js 环境变量"
    echo "   · 设置 NODE_HOME 变量"
    echo "   · 更新 PATH 环境变量"
    echo -e "${YELLOW}----------------------------------------${NC}"
    echo ""

    # 开发环境配置
    echo -e "${CYAN}📦 开发环境配置${NC}"
    echo -e "${YELLOW}----------------------------------------${NC}"
    echo -e "4) 🔧 配置后端环境"
    echo "   · 安装后端依赖"
    echo "   · 配置开发环境"
    echo ""
    echo -e "5) 🎨 配置前端环境"
    echo "   · 安装前端依赖"
    echo "   · 构建前端资源"
    echo -e "${YELLOW}----------------------------------------${NC}"
    echo ""

    # 打包选项
    echo -e "${CYAN}📦 打包选项${NC}"
    echo -e "${YELLOW}----------------------------------------${NC}"
    echo -e "6) 📦 生成编译包"
    echo "   · 后端代码加密混淆"
    echo "   · 前端资源编译打包"
    echo "   · 适用于生产环境部署"
    echo ""
    echo -e "7) 💻 生成未编译包"
    echo "   · 包含完整源代码"
    echo "   · 适用于开发环境或二次开发（仅对后端）"
    echo -e "${YELLOW}----------------------------------------${NC}"
    echo ""

    # 系统工具
    echo -e "${CYAN}🛠️  系统工具${NC}"
    echo -e "${YELLOW}----------------------------------------${NC}"
    echo -e "8) 🧹 清理编译文件"
    echo "   · 清理所有编译文件和压缩包"
    echo ""
    echo -e "9) 🎨 前后端默认内容配置指南"
    echo "   · 查看前后端内容更新方法"
    echo "   · 包含文件路径和注意事项"
    echo ""
    echo -e "10) 📖 使用指南"
    echo "   · 查看详细的使用步骤"
    echo ""
    echo -e "0) 🚪 退出程序"
    echo -e "${YELLOW}----------------------------------------${NC}"
    echo ""

    echo -e "${YELLOW}请输入选项编号 [0-10]:${NC} "
    read -r choice

    case $choice in
    1)
        install_nvm
        show_menu
        ;;
    2)
        init_environment
        ;;
    3)
        configure_nodejs_env
        show_menu
        ;;
    4)
        install_backend
        ;;
    5)
        install_frontend
        ;;
    6)
        generate_build_package
        ;;
    7)
        generate_source_package
        ;;
    8)
        clean_files
        show_menu
        ;;
    9)
        print_frontend_guide
        ;;
    10)
        print_usage_guide
        ;;
    0)
        echo -e "${BLUE}👋 感谢使用！${NC}"
        # 作者提示
        echo -e "${YELLOW}本项目仅供学习和测试使用、禁止用于任何非法用途，后果自己负责。${NC}"
        echo -e "${BLUE}按回车键退出...${NC}"
        read -r
        exit 0
        ;;
    *)
        echo -e "${RED}❌ 无效的选项，请重试${NC}"
        sleep 2
        show_menu
        ;;
    esac
}

# 启动安装向导
show_menu
