"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@nextui-org/react";
import { FaHome, FaShoppingCart, FaUser } from "react-icons/fa";
import { motion } from "framer-motion";

export default function FooterNav(): React.ReactNode {
    const router = useRouter();
    const pathname = usePathname();
    console.log('pathname', pathname);

    const locationPathname = window.location.pathname;
    console.log('当前页面根路径', locationPathname);

    if (!locationPathname.startsWith('/h5')) {
        return null;
    }

    // 定义需要显示导航栏的路径
    const allowedPaths = ['/', '/cart', '/profile'];

    // 检查当前路径是否应该显示导航栏
    const shouldShowNav = allowedPaths.some(path => pathname === path);

    // 如果不是允许的路径，不显示导航栏
    if (!shouldShowNav) {
        return null;
    }

    // 如果是分享页面，不显示导航栏
    // if (pathname.startsWith('/share/') || pathname.startsWith('/auth/') || pathname.startsWith('/payment/')) {
    //     return null;
    // }

    const navItems = [
        { path: "/", icon: FaHome, label: "首页" },
        { path: "/cart", icon: FaShoppingCart, label: "购物车" },
        { path: "/profile", icon: FaUser, label: "我的" },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50">
            {/* 高斯模糊背景 */}
            <div className="absolute inset-0 bg-background/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-800" />

            {/* 内容区域 */}
            <div className="relative flex justify-around items-center p-3 max-w-screen-xl mx-auto">
                {navItems.map((item) => (
                    <div key={item.path} className="relative">
                        <Button
                            size="sm"
                            variant="light"
                            onClick={() => router.push(item.path)}
                            className={`flex-col h-12 min-w-16 gap-1 px-3 ${pathname === item.path ? "text-primary" : "text-foreground/70"
                                }`}
                        >
                            <item.icon className="text-xl" style={{ color: pathname === item.path ? "#000000" : "#888" }} />
                            <span className="text-xs" style={{ color: pathname === item.path ? "#000" : "#888" }}>{item.label}</span>

                            {pathname === item.path && (
                                <motion.div
                                    layoutId="activeNav"
                                    className="absolute inset-0 bg-primary/10 rounded-xl -z-10"
                                    initial={false}
                                    transition={{
                                        type: "spring",
                                        stiffness: 400,
                                        damping: 30
                                    }}
                                />
                            )}
                        </Button>
                    </div>
                ))}
            </div>

            {/* 底部安全区域 */}
            <div className="h-safe-area bg-background/80 backdrop-blur-md" />
        </div>
    );
}