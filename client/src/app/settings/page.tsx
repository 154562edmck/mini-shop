"use client";

import { useState } from "react";
import {
    Card,
    Switch,
    Button,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter
} from "@nextui-org/react";
import { FaChevronLeft, FaMoon, FaShieldAlt, FaFileAlt, FaTrash } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import ReactMarkdown from 'react-markdown';

// 隐私政策内容
const PRIVACY_POLICY = `
# 隐私政策

## 1. 信息收集
我们收集的信息包括：
- 账户信息（微信授权信息）
- 订单信息（订单内容、支付信息、配送地址）
- 设备信息（设备型号、操作系统版本、唯一设备标识符）
- 日志信息（访问时间、使用时长、错误日志）
- 位置信息（配送地址定位、商家距离计算）

## 2. 信息使用
我们使用收集的信息：
- 提供和改进服务
- 处理订单和支付
- 提供客户支持
- 发送服务通知
- 防止欺诈行为
- 进行数据分析
- 优化用户体验

## 3. 信息共享
在以下情况下，我们可能会共享您的信息：
- 经过您的明确同意
- 与服务提供商合作（如配送服务）
- 遵守法律法规要求
- 保护我们的合法权益

## 4. 信息安全
我们采取多种安全措施保护您的信息：
- 数据加密传输
- 访问控制机制
- 安全审计机制
- 数据备份机制
- 应急响应机制

## 5. 您的权利
您对您的个人信息享有：
- 访问权
- 更正权
- 删除权
- 撤回同意权
- 注销账户权

## 6. Cookie 使用
我们使用 Cookie 和类似技术：
- 记住您的偏好设置
- 提供个性化服务
- 改善用户体验
- 分析服务使用情况

## 7. 未成年人保护
- 未满18岁用户需监护人同意
- 发现误收集未成年人信息将及时删除
- 提供适当的未成年人保护措施

## 8. 隐私政策更新
- 我们可能适时更新本政策
- 更新后将在APP内显著位置通知
- 继续使用视为接受更新后的政策
`;

// 服务协议内容
const TERMS_OF_SERVICE = `
# 服务协议

## 1. 服务内容
我们提供以下服务：
- 商品浏览和购买
- 订单管理和追踪
- 支付服务
- 配送服务
- 售后服务
- 客户支持

## 2. 用户注册与账户
### 2.1 注册要求
- 需提供真实、准确信息
- 及时更新个人信息
- 妥善保管账户密码

### 2.2 账户安全
- 用户负责账户安全
- 发现异常及时报告
- 禁止共享或转让账户

## 3. 用户行为规范
### 3.1 禁止行为
- 提供虚假信息
- 侵犯他人权益
- 干扰系统运行
- 恶意评价或投诉

### 3.2 用户义务
- 遵守相关法律法规
- 尊重其他用户权益
- 按时支付订单费用
- 配合订单售后处理

## 4. 商品和定价
### 4.1 商品信息
- 以实际展示为准
- 可能存在误差说明
- 库存实时更新

### 4.2 价格说明
- 标价为实时价格
- 可能随时调整
- 特殊促销说明
- 差价退还规则

## 5. 订单和支付
### 5.1 订单处理
- 订单确认机制
- 取消订单规则
- 修改订单流程

### 5.2 支付规定
- 支持的支付方式
- 支付超时处理
- 退款处理规则

## 6. 配送服务
### 6.1 配送范围
- 支持配送区域
- 特殊区域说明
- 配送时间承诺

### 6.2 收货规则
- 验收要求
- 签收规范
- 拒收处理

## 7. 售后服务
### 7.1 退换货政策
- 支持的情形
- 办理流程
- 相关费用说明

### 7.2 投诉处理
- 投诉渠道
- 处理时限
- 补偿规则

## 8. 知识产权
- 平台内容版权声明
- 用户内容授权说明
- 侵权处理规则

## 9. 免责声明
- 不可抗力说明
- 系统维护说明
- 第三方服务说明

## 10. 协议修改
- 修改通知方式
- 生效规则
- 终止条件

## 11. 法律适用
- 适用法律
- 争议解决方式
- 管辖约定
`;

export default function Settings() {
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const [showPrivacy, setShowPrivacy] = useState(false);
    const [showTerms, setShowTerms] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);

    const clearAllCache = () => {
        try {
            // 清除 localStorage
            localStorage.clear();

            // 清除 sessionStorage
            sessionStorage.clear();

            // 清除所有 cookies
            document.cookie.split(";").forEach(function (c) {
                document.cookie = c.replace(/^ +/, "")
                    .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            });

            // 如果有使用 Service Worker，也可以注销它
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function (registrations) {
                    for (const registration of registrations) {
                        registration.unregister();
                    }
                });
            }

            toast.success("缓存已清理");
            setShowClearConfirm(false);

            // 延迟刷新页面
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error) {
            console.error('清理缓存失败:', error);
            toast.error("清理缓存失败");
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50/80">
            {/* 标题栏 */}
            <div className="sticky top-0 z-50 bg-background shadow-sm">
                <div className="flex items-center h-14 px-4">
                    <Button
                        isIconOnly
                        variant="light"
                        onPress={() => router.back()}
                        className="mr-2"
                    >
                        <FaChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-lg font-medium">设置</span>
                </div>
            </div>

            {/* 设置选项 */}
            <Card className="mx-4 mt-4 shadow-sm">
                <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center">
                        <FaMoon className="w-4 h-4 text-gray-500 mr-3" />
                        <span>深色模式</span>
                    </div>
                    <Switch
                        isSelected={theme === 'dark'}
                        onValueChange={(isSelected) => setTheme(isSelected ? 'dark' : 'light')}
                    />
                </div>
            </Card>

            {/* 清理缓存按钮 */}
            <Card className="mx-4 mt-4 shadow-sm">
                <Button
                    className="w-full h-12 justify-start px-4"
                    variant="light"
                    onPress={() => setShowClearConfirm(true)}
                    color="danger"
                >
                    <FaTrash className="w-4 h-4 text-danger mr-3" />
                    <span>清理缓存</span>
                </Button>
            </Card>

            {/* 协议按钮 */}
            <Card className="mx-4 mt-4 shadow-sm">
                <div className="divide-y divide-gray-100">
                    <Button
                        className="w-full h-12 justify-start px-4"
                        variant="light"
                        onPress={() => setShowPrivacy(true)}
                    >
                        <FaShieldAlt className="w-4 h-4 text-gray-500 mr-3" />
                        <span>隐私政策</span>
                    </Button>
                    <Button
                        className="w-full h-12 justify-start px-4"
                        variant="light"
                        onPress={() => setShowTerms(true)}
                    >
                        <FaFileAlt className="w-4 h-4 text-gray-500 mr-3" />
                        <span>服务协议</span>
                    </Button>
                </div>
            </Card>

            {/* 作者信息卡片 */}
            <div className="fixed bottom-0 left-0 right-0 pt-4 bg-gradient-to-t from-white/95 to-transparent">
                <div className="bg-white/80 backdrop-blur-sm rounded-none p-4 shadow-sm border border-gray-100">
                    <div className="flex flex-col items-center text-center">
                        <div className="text-sm text-gray-600 mb-2.5 leading-relaxed">
                            <span>本项目仅供学习和测试使用、禁止用于任何非法用途，后果自己负责。</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 隐私政策弹窗 */}
            <Modal
                isOpen={showPrivacy}
                onClose={() => setShowPrivacy(false)}
                size="full"
                scrollBehavior="inside"
            >
                <ModalContent>
                    <ModalHeader className="flex flex-col gap-1">隐私政策</ModalHeader>
                    <ModalBody>
                        <div className="prose dark:prose-invert max-w-none">
                            <ReactMarkdown>{PRIVACY_POLICY}</ReactMarkdown>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onPress={() => setShowPrivacy(false)}>
                            我知道了
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* 服务协议弹窗 */}
            <Modal
                isOpen={showTerms}
                onClose={() => setShowTerms(false)}
                size="full"
                scrollBehavior="inside"
            >
                <ModalContent>
                    <ModalHeader className="flex flex-col gap-1">服务协议</ModalHeader>
                    <ModalBody>
                        <div className="prose dark:prose-invert max-w-none">
                            <ReactMarkdown>{TERMS_OF_SERVICE}</ReactMarkdown>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onPress={() => setShowTerms(false)}>
                            我知道了
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* 清理缓存确认弹窗 */}
            <Modal
                isOpen={showClearConfirm}
                onClose={() => setShowClearConfirm(false)}
                size="xs"
            >
                <ModalContent>
                    <ModalHeader className="flex flex-col gap-1">确认清理</ModalHeader>
                    <ModalBody>
                        <p>确定要清理所有缓存数据吗？此操作不可恢复。</p>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" onPress={() => setShowClearConfirm(false)}>
                            取消
                        </Button>
                        <Button color="danger" onPress={clearAllCache}>
                            确认清理
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
} 