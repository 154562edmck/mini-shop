"use client";

import { Button } from "@nextui-org/react";
import Link from "next/link";
import { FaAddressBook, FaHome, FaSearch, FaTrash } from "react-icons/fa";
import { toast } from "sonner";

export default function NotFound() {
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

            // 刷新页面
            window.location.reload();

            toast.success("缓存已清理");
        } catch (error) {
            console.error('清理缓存失败:', error);
            toast.error("清理缓存失败");
        }
    };

    const locationPathname = window.location.pathname;
    console.log('当前页面根路径', locationPathname);

    if (!locationPathname.startsWith('/h5')) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full text-center">
                {/* 404 图标或图片 */}
                <div className="mb-8">
                    <h1 className="text-9xl font-bold text-gray-200">404</h1>
                </div>

                {/* 错误信息 */}
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                        页面未找到
                    </h2>
                    <p className="text-gray-600">
                        抱歉，您访问的页面不存在或已被移除
                    </p>
                </div>
            </div>
        </div>
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full text-center">
                {/* 404 图标或图片 */}
                <div className="mb-8">
                    <h1 className="text-9xl font-bold text-gray-200">404</h1>
                </div>

                {/* 错误信息 */}
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                        页面未找到
                    </h2>
                    <p className="text-gray-600">
                        抱歉，您访问的页面不存在或已被移除
                    </p>
                </div>

                {/* 操作按钮 */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                        as={Link}
                        href="/"
                        color="primary"
                        variant="flat"
                        startContent={<FaHome />}
                        className="w-full sm:w-auto"
                    >
                        返回首页
                    </Button>
                    <Button
                        as={Link}
                        href="/address"
                        variant="bordered"
                        startContent={<FaAddressBook />}
                        className="w-full sm:w-auto"
                    >
                        我的地址
                    </Button>
                    <Button
                        color="danger"
                        variant="light"
                        startContent={<FaTrash />}
                        className="w-full sm:w-auto"
                        onPress={clearAllCache}
                    >
                        清理缓存
                    </Button>
                </div>
            </div>
        </div>
    );
} 