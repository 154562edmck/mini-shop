// 声明全局变量和 window 扩展
declare const WeixinJSBridge: {
    invoke(
        api: string,
        params: any,
        callback: (res: { err_msg: string }) => void
    ): void;
} | undefined;

declare const window: Window & {
    WeixinJSBridge?: typeof WeixinJSBridge;
};

class WechatPay {
    private static instance: WechatPay;

    private constructor() { }

    public static getInstance(): WechatPay {
        if (!WechatPay.instance) {
            WechatPay.instance = new WechatPay();
        }
        return WechatPay.instance;
    }

    // 加载微信 JS-SDK
    public async loadWechatScript(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (typeof WeixinJSBridge !== 'undefined') {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://res.wx.qq.com/open/js/jweixin-1.6.0.js';
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load WeChat JS-SDK'));
            document.head.appendChild(script);
        });
    }

    // 发起支付
    public async pay(params: {
        appId: string;
        timeStamp: string;
        nonceStr: string;
        package: string;
        signType: 'RSA';
        paySign: string;
    }): Promise<boolean> {
        return new Promise((resolve) => {
            const onBridgeReady = () => {
                WeixinJSBridge.invoke(
                    'getBrandWCPayRequest',
                    {
                        ...params,
                    },
                    (res: any) => {
                        if (res.err_msg === "get_brand_wcpay_request:ok") {
                            resolve(true);
                        } else {
                            resolve(false);
                        }
                    }
                );
            };

            if (typeof WeixinJSBridge === "undefined") {
                document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
            } else {
                onBridgeReady();
            }
        });
    }
}

export default WechatPay; 