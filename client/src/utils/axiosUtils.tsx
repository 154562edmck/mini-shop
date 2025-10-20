import { basePath } from '@/config/config';
import axios from 'axios';

// 获取运行时配置
const getBaseUrl = () => {
    if (typeof window !== 'undefined' && window.APP_CONFIG) {
        return window.APP_CONFIG.API_URL;
    }
    // 服务端渲染时使用环境变量，如果没有则使用相对路径
    return process.env.NEXT_PUBLIC_API_URL || '/v1';
};

console.log('getBaseUrl', getBaseUrl());

// 创建 Axios 实例
const createApiClient = () => {
    const instance = axios.create({
        baseURL: getBaseUrl(),
        timeout: 10000,
    });

    // 请求拦截器
    instance.interceptors.request.use(
        (config) => {
            // 每次请求都重新获取 baseURL
            config.baseURL = getBaseUrl();
            
            const accessToken = localStorage.getItem('accessToken');
            if (accessToken) {
                config.headers['Authorization'] = `Bearer ${accessToken}`;
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // 响应拦截器
    instance.interceptors.response.use(
        (response) => {
            // 成功返回数据
            return response;
        },
        (error) => {
            // 失败返回错误信息
            console.log('API错误:', error);
            if (error.response?.status === 401) {
                console.log('token过期或未授权');
                // 清除本地存储
                localStorage.removeItem('accessToken');
                localStorage.removeItem('userInfo');

                // 保存当前页面路径
                let currentPath = window.location.pathname;
                if (currentPath.startsWith(`${basePath}/`)) {
                    currentPath = currentPath.substring(basePath.length);
                }
                console.log('currentPath-axios', currentPath);

                localStorage.setItem('loginRedirect', currentPath);

                // 触发重新登录
                // 方案1: 使用自定义事件触发登录弹窗
                //const publicPaths = ["/", "/auth/callback", "/auth/share-callback", "/share"]; // 不需要登录的页面
                // window.dispatchEvent(new CustomEvent('auth:requireLogin'));

                // 方案2: 刷新页面（如果你想要完全重置状态）
                window.location.reload();
            }
            return Promise.reject(error.response?.data || { message: '请求失败' });
        }
    );

    return instance;
};

const apiClient = createApiClient();

export default apiClient;
