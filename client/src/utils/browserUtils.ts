export const isWeixinBrowser = (): boolean => {
    if (typeof window === 'undefined') return false; // 服务端渲染时返回 false
    
    const ua = window.navigator.userAgent.toLowerCase();
    return ua.indexOf('micromessenger') !== -1;
}; 