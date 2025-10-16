interface WeixinJSBridge {
  invoke: (method: string, params: any, callback: (res: any) => void) => void;
}

interface WxConfig {
  debug: boolean;
  appId: string;
  timestamp: string | number;
  nonceStr: string;
  signature: string;
  jsApiList: string[];
}

interface Wx {
  config: (config: WxConfig) => void;
  ready: (callback: () => void) => void;
  error: (callback: (res: any) => void) => void;
  updateAppMessageShareData: (config: any) => void;
  updateTimelineShareData: (config: any) => void;
}

declare global {
  interface Window {
    WeixinJSBridge: WeixinJSBridge;
    wx: Wx;
    APP_CONFIG: {
      API_URL: string;
      ASSET_PREFIX: string;
      APP_ENV: string;
      WECHAT_APP_ID: string;
      TITLE: string;
      DESCRIPTION: string;
    }
  }
}

export { }; 