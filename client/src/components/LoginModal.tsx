"use client";

import { Modal, ModalContent, ModalHeader, ModalBody, Button } from "@nextui-org/react";
import { FaWeixin } from "react-icons/fa";
import apiClient from "@/utils/axiosUtils";
import { basePath } from "@/config/config";

interface LoginModalProps {
    isOpen: boolean;
    onCloseAction: () => void;
    onSuccessAction: (userData: any) => void;
}

export const directWechatLogin = (templateId: number) => {
    // 获取运行时配置
    const appId = typeof window !== 'undefined' && window.APP_CONFIG
        ? window.APP_CONFIG.WECHAT_APP_ID
        : process.env.NEXT_PUBLIC_WECHAT_APP_ID;
    console.log('appId', appId);

    // 保存当前页面路径
    const currentPath = window.location.pathname + window.location.search;
    console.log('currentPath-login', currentPath);
    localStorage.setItem('loginRedirect', currentPath);

    // 跳转到微信授权页面（静默授权）
    const redirectUri = encodeURIComponent(`${window.location.origin}${basePath}/auth/share-callback?templateId=${templateId}`);
    const authUrl = `https://open.baijuju.cn/connect/oauth2/authorize?appid=${appId}&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_base#wechat_redirect`;
    window.location.href = authUrl;
};

export default function LoginModal({ isOpen, onCloseAction, onSuccessAction }: LoginModalProps) {
    const isDevelopment = false;

    const handleTestLogin = async () => {
        try {
            const response = await apiClient.post("/user/test-login");
            if (response.data.code === 200) {
                onSuccessAction(response.data.data);
                window.location.reload();
            }
        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    const handleWechatLogin = () => {
        // 获取运行时配置
        const appId = typeof window !== 'undefined' && window.APP_CONFIG
            ? window.APP_CONFIG.WECHAT_APP_ID
            : process.env.NEXT_PUBLIC_WECHAT_APP_ID;
        console.log('appId', appId);
        // 跳转到微信授权页面
        console.log('origin', window.location.origin);
        const redirectUri = encodeURIComponent(`${window.location.origin}${basePath}/auth/callback`);
        const authUrl = `https://open.baijuju.cn/connect/oauth2/authorize?appid=${appId}&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_userinfo#wechat_redirect`;
        window.location.href = authUrl;
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onCloseAction}
            size="xs"
            placement="center"
            classNames={{
                base: "bg-background/80 backdrop-blur-md",
                wrapper: "h-[100dvh] items-center justify-center",
                body: "py-6 px-4",
                closeButton: "hover:bg-white/5 active:bg-white/10",
            }}
        >
            <ModalContent className="max-w-[320px] m-auto">
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col items-center justify-center pt-8">
                            <FaWeixin className="text-[#07C160] text-5xl mb-4" />
                            <h2 className="text-xl font-semibold">微信登录</h2>
                            <p className="text-sm text-gray-500 mt-2">授权后可体验更多功能</p>
                        </ModalHeader>
                        <ModalBody className="px-8 pb-8">
                            <div className="space-y-4">
                                <Button
                                    color="success"
                                    startContent={<FaWeixin className="text-xl text-white" />}
                                    className="w-full h-12 text-base font-medium bg-[#07C160] hover:bg-[#06AE56] text-white"
                                    size="lg"
                                    onPress={isDevelopment ? handleTestLogin : handleWechatLogin}
                                >
                                    {isDevelopment ? "测试账号登录" : "微信一键登录"}
                                </Button>

                                {!isDevelopment && (
                                    <div className="text-center text-xs text-gray-500 mt-4">
                                        <p>登录即表示同意</p>
                                        <div className="mt-1">
                                            <a href="#" className="text-primary">《服务协议》</a>
                                            <span className="mx-1">和</span>
                                            <a href="#" className="text-primary">《隐私政策》</a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ModalBody>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
} 