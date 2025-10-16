"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import apiClient from "@/utils/axiosUtils";
import { useAuth } from "@/contexts/AuthContext";
import { SHOW_TOAST_MESSAGES } from "@/utils/orderStatus"; // 导入提示控制开关
import { basePath } from "@/config/config";

export default function AuthCallback() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { forceUpdate } = useAuth();

    useEffect(() => {
        const handleCallback = async () => {
            const code = searchParams.get("code");
            if (!code) {
                if (SHOW_TOAST_MESSAGES) toast.error("授权失败");
                router.replace("/");
                return;
            }

            try {
                // 检查 sessionStorage 中是否已经处理过这个 code
                const processedCode = sessionStorage.getItem('processed_code');
                if (processedCode === code) {
                    // 如果是已处理过的 code，直接跳转到重定向页面
                    const redirectPath = localStorage.getItem('loginRedirect') || '/';
                    router.replace(redirectPath);
                    return;
                }

                const response = await apiClient.post("/user/login", { code });
                if (response.data.code === 200) {
                    const { token, ...userData } = response.data.data;
                    localStorage.setItem('accessToken', token);
                    localStorage.setItem('userInfo', JSON.stringify(userData));

                    // 记录已处理的 code
                    sessionStorage.setItem('processed_code', code);

                    // 获取重定向路径并处理
                    let redirectPath = localStorage.getItem('loginRedirect') || '/';
                    console.log('原始重定向路径:', redirectPath);
                    
                    // 确保路径以斜杠开头
                    if (!redirectPath.startsWith('/')) {
                        redirectPath = '/' + redirectPath;
                    }
                    
                    // 如果路径只是一个斜杠，直接重定向到首页
                    if (redirectPath === '/') {
                        redirectPath = '/';
                    } 
                    // 避免重复的基础路径
                    else if (redirectPath.startsWith(`${basePath}/`)) {
                        redirectPath = redirectPath.substring(basePath.length);
                    }

                    console.log('最终重定向路径:', redirectPath);
                    localStorage.removeItem('loginRedirect');

                    if (SHOW_TOAST_MESSAGES) toast.success("登录成功");
                    forceUpdate();
                    router.replace(redirectPath);
                } else {
                    console.error("登录失败:", response.data.message);
                    router.replace("/");
                }

            } catch (error) {
                console.error("Login failed:", error);
                sessionStorage.removeItem('processed_code');
                localStorage.removeItem('loginRedirect');
                router.replace("/");
            }
        };

        if (searchParams.get("code")) {
            handleCallback();
        }
    }, []);

    return (
        <div className="flex h-screen items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
        </div>
    );
} 