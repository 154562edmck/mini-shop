"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@nextui-org/react";
import { FaAlipay } from "react-icons/fa";
import { toast } from "sonner";
import { isWeixinBrowser } from "@/utils/browserUtils";
import { SHOW_TOAST_MESSAGES } from "@/utils/orderStatus"; // 导入提示控制开关

export default function AlipayRedirect() {
    const searchParams = useSearchParams();
    const payUrl = searchParams.get('payUrl');

    useEffect(() => {
        // 如果不是微信浏览器，直接跳转支付
        if (!isWeixinBrowser() && payUrl) {
            window.location.href = payUrl;
        }
    }, [payUrl]);

    const copyToClipboard = async () => {
        try {
            // 先检查 clipboard API 是否可用
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(payUrl);
                if (SHOW_TOAST_MESSAGES) toast.success('支付链接已复制');
            } else {
                // 如果 clipboard API 不可用，直接使用降级方案
                const textArea = document.createElement('textarea');
                textArea.value = payUrl;
                // 防止滚动
                textArea.style.position = 'fixed';
                textArea.style.top = '0';
                textArea.style.left = '0';
                textArea.style.opacity = '0';

                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();

                try {
                    document.execCommand('copy');
                    if (SHOW_TOAST_MESSAGES) toast.success('支付链接已复制');
                } catch (err) {
                    console.error('降级复制失败:', err);
                    if (SHOW_TOAST_MESSAGES) toast.error('复制失败，请手动复制');
                }

                document.body.removeChild(textArea);
            }
        } catch (err) {
            console.error('复制失败:', err);
            if (SHOW_TOAST_MESSAGES) toast.error('复制失败，请手动复制');
        }
    };

    const openAlipay = () => {
        if (isWeixinBrowser()) {
            // 在微信内提示用户使用系统浏览器
            toast.info('请使用系统浏览器打开');
        } else {
            // 在普通浏览器中尝试打开支付宝
            window.location.href = `alipays://platformapi/startapp?appId=20000067&url=${encodeURIComponent(payUrl)}`;
        }
    };

    // 如果不是微信浏览器，返回空组件（因为会直接跳转）
    if (!isWeixinBrowser()) {
        return null;
    }

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-none shadow-none p-8">
                <div className="flex flex-col items-center space-y-6">
                    {/* Logo */}
                    <div className="w-20 h-20 bg-[#1677FF] rounded-2xl flex items-center justify-center">
                        <FaAlipay className="text-4xl text-white" />
                    </div>

                    {/* 标题和说明 */}
                    <div className="text-center space-y-3">
                        <h1 className="text-2xl font-medium text-gray-900">
                            支付宝支付
                        </h1>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            请点击右上角 <span className="text-[#1677FF]">⋮</span> 或 <span className="text-[#1677FF]">...</span><br />
                            选择 <span className="text-[#1677FF]">在浏览器中打开</span>
                        </p>
                    </div>

                    {/* 按钮组 */}
                    <div className="w-full space-y-3 pt-4">
                        <Button
                            className="w-full bg-[#1677FF] text-white font-normal rounded-xl h-12"
                            onClick={copyToClipboard}
                        >
                            复制支付链接
                        </Button>
                        <Button
                            className="w-full bg-white text-[#1677FF] border-[#1677FF] font-normal rounded-xl h-12"
                            variant="bordered"
                            onClick={openAlipay}
                        >
                            打开支付宝
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
} 