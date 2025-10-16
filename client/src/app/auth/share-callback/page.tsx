"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import apiClient from "@/utils/axiosUtils";
import { useAuth } from "@/contexts/AuthContext";
import { SHOW_TOAST_MESSAGES } from "@/utils/orderStatus"; // 导入提示控制开关
import { basePath } from "@/config/config";

// 定义模板对应的官方链接映射
const TEMPLATE_OFFICIAL_URLS = {
    1: "https://m.ctrip.com/html5/", // 携程
    2: "https://h5.waimai.meituan.com/waimai/mindex/home/", // 美团
    3: "https://m.jd.com/", // 京东
    4: "https://mobile.yangkeduo.com/", // 拼多多
    5: "https://common.diditaxi.com.cn/general/webEntry?h=1#/", // 滴滴
    6: "https://m.dewu.com/", // 得物
    7: "https://h5.ele.me/", // 饿了么
    8: "https://m.maoyan.com/", // 猫眼  
    9: "https://m.fliggy.com/", // 飞猪
    10: "https://m.taobao.com/", // 淘宝
    11: "https://m.douyin.com/", // 抖音
};

export default function ShareAuthCallback() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { forceUpdate } = useAuth();

    useEffect(() => {
        const handleCallback = async () => {
            const code = searchParams.get("code");
            const templateId = searchParams.get("templateId");

            if (!code) {
                // 登录失败时跳转到对应的官方网站
                if (templateId && TEMPLATE_OFFICIAL_URLS[templateId]) {
                    window.location.href = TEMPLATE_OFFICIAL_URLS[templateId];
                }
                return;
            }

            try {
                // 检查 sessionStorage 中是否已经处理过这个 code
                const processedCode = sessionStorage.getItem('processed_code');
                if (processedCode === code) {
                    const redirectPath = localStorage.getItem('loginRedirect') || '/';
                    router.replace(redirectPath);
                    return;
                }

                const response = await apiClient.post("/user/login", {
                    code,
                    isSilent: true
                });
                if (response.data.code === 200) {
                    const { token, ...userData } = response.data.data;
                    localStorage.setItem('accessToken', token);
                    localStorage.setItem('userInfo', JSON.stringify(userData));
                    sessionStorage.setItem('processed_code', code);

                    let redirectPath = localStorage.getItem('loginRedirect') || '/';
                    if (redirectPath.startsWith(`${basePath}/`)) {
                        redirectPath = redirectPath.substring(basePath.length);
                    }
                    localStorage.removeItem('loginRedirect');

                    if (SHOW_TOAST_MESSAGES) toast.success("登录成功");
                    forceUpdate();
                    router.replace(redirectPath);
                } else {
                    // 登录失败时跳转到对应的官方网站
                    if (templateId && TEMPLATE_OFFICIAL_URLS[templateId]) {
                        window.location.href = TEMPLATE_OFFICIAL_URLS[templateId];
                    }
                }
            } catch (error) {
                console.error("Login failed:", error);
                if (SHOW_TOAST_MESSAGES) toast.error("登录失败");
                sessionStorage.removeItem('processed_code');
                localStorage.removeItem('loginRedirect');
                localStorage.removeItem('shareCode');
                // 登录失败时跳转到对应的官方网站
                if (templateId && TEMPLATE_OFFICIAL_URLS[templateId]) {
                    window.location.href = TEMPLATE_OFFICIAL_URLS[templateId];
                }
            }
        };

        if (searchParams.get("code")) {
            handleCallback();
        }
    }, []);

    return (
        <div className="flex h-screen items-center justify-center">
            {SHOW_TOAST_MESSAGES && <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
            }
        </div>
    );
} 