"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const publicPaths = ["/", "/auth/callback", "/auth/share-callback", "/share"]; // 不需要登录的页面

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // 检查是否是分享页面
        const isSharePage = pathname.startsWith('/share/');
        // 检查当前路径是否在公开路径列表中
        const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

        if (!isLoading && !user && !isPublicPath && !isSharePage) {
            router.push("/?redirect=" + encodeURIComponent(pathname));
        }
    }, [user, isLoading, pathname, router]);

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                {/* <h1 className="text-xl font-bold mb-4">Loading...</h1> */}
            </div>
        </div>;
    }

    return <div suppressHydrationWarning>{children}</div>;
} 