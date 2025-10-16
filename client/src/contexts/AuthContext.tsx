"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import apiClient from "@/utils/axiosUtils";
import LoginModal from "@/components/LoginModal";
import { basePath } from "@/config/config";

interface AuthContextType {
    user: any;
    isLoading: boolean;
    showLoginModal: () => void;
    logout: () => Promise<void>;
    handleLoginSuccess: (userData: any) => void;
    checkAuth: () => void;
    forceUpdate: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showLogin, setShowLogin] = useState(false);
    const router = useRouter();

    const checkAuth = async () => {
        const token = localStorage.getItem('accessToken');
        const userInfo = localStorage.getItem('userInfo');

        if (token) {
            setUser(userInfo ? JSON.parse(userInfo) : null);
        } else {
            setUser(null);
        }
        setIsLoading(false);
    };

    // 初始化时检查认证状态
    useEffect(() => {
        checkAuth();
    }, []);

    // 添加事件监听
    useEffect(() => {
        const handleRequireLogin = () => {
            console.log('需要登录，显示登录弹窗');
            showLoginModal();
        };

        // 监听需要登录的事件
        window.addEventListener('auth:requireLogin', handleRequireLogin);

        return () => {
            window.removeEventListener('auth:requireLogin', handleRequireLogin);
        };
    }, []);

    const showLoginModal = () => {
        // 获取当前路径但移除 basePath 前缀
        const fullPath = window.location.pathname;
        let currentPath = fullPath;
        
        // 如果当前路径是基础路径本身，保存为 "/"
        if (fullPath === basePath || fullPath === `${basePath}/`) {
            currentPath = "/";
        } 
        // 如果以基础路径开头，移除基础路径部分
        else if (fullPath.startsWith(`${basePath}/`)) {
            currentPath = fullPath.substring(basePath.length);
        }
        
        console.log('原始路径:', fullPath, '存储路径:', currentPath);
        localStorage.setItem('loginRedirect', currentPath);
        setShowLogin(true);
    };

    const handleLoginSuccess = (userData: any) => {
        localStorage.setItem('accessToken', userData.token);
        localStorage.setItem('userInfo', JSON.stringify(userData));
        setUser(userData);
        setShowLogin(false);

        // 获取登录前的路径并跳转
        let redirect = localStorage.getItem('loginRedirect');
        console.log('redirect-before', redirect);
        if (redirect) {
            // Remove the base path if it exists at the beginning of the redirect path
            if (redirect.startsWith(`${basePath}/`)) {
                redirect = redirect.substring(basePath.length);
            }
            console.log('redirect-after', redirect);
            localStorage.removeItem('loginRedirect');
            window.location.href = redirect; // 使用完整页面刷新替代 router.push
        }
    };

    const logout = async () => {
        try {
            await apiClient.post("/user/logout");
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('userInfo');
            localStorage.removeItem('loginRedirect');
            setUser(null);
        }
    };

    const forceUpdate = () => {
        checkAuth();
        setShowLogin(false);
    };

    return (
        <AuthContext.Provider value={{
            user,
            isLoading,
            showLoginModal,
            logout,
            handleLoginSuccess,
            checkAuth,
            forceUpdate
        }}>
            {children}
            <LoginModal
                isOpen={showLogin}
                onCloseAction={() => {
                    setShowLogin(false);
                    checkAuth();
                }}
                onSuccessAction={handleLoginSuccess}
            />
        </AuthContext.Provider>
    );
} 