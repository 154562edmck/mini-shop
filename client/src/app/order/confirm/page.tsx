"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Button,
  Card,
  CardBody,
  Image,
  Spinner,
  Divider,
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  RadioGroup,
  Radio
} from "@nextui-org/react";
import { toast } from "sonner";
import { FaChevronRight, FaShoppingCart, FaGift, FaShoppingBag, FaHandshake, FaWeixin, FaUsers, FaPlane, FaUtensils, FaCar, FaAlipay, FaPaypal, FaQq, FaWallet, FaPlay, FaAmazonPay, FaApplePay, FaMobile, FaShoppingBasket, FaFilm, FaTiktok } from "react-icons/fa";
import apiClient from "@/utils/axiosUtils";
import WechatPay from "@/utils/wechatPay";
import { IoClose } from "react-icons/io5";
import { QRCodeDisplay } from "@/components/QRCodeDisplay";
import { isWeixinBrowser } from "@/utils/browserUtils";
import { basePath, isTestApp } from "@/config/config";

type PaymentMethod = 'wechat' | 'alipay' | 'easypay' | 'friend';

interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  product_image: string;
  price: string;
  quantity: number;
  create_time: string;
  spec_id: number;
  spec_name: string;
  product_original_price: string;
  is_promotion: number;
}

interface OrderDetail {
  id: number;
  order_no: string;
  user_id: number;
  user_name: string;
  user_avatar: string;
  total_amount: string;
  address_id: number;
  status: number;
  pay_time: string | null;
  share_code: string;
  create_time: string;
  update_time: string;
  merchant_name: string;
  creator_nickname: string;
  creator_avatar: string;
  receiver: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  items: OrderItem[];
  templateId: number;
}


interface ShareTemplate {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface ShareConfig {
  [key: number]: {
    title: string;
    desc: string;
    imgUrl: string;
  }
}

type SharePayMethod = 'wechat' | 'alipay' | 'easypay';
type EasyPayType = 'wxpay' | 'alipay' | 'qqpay';

export default function OrderConfirm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderNo = searchParams.get('orderNo');

  const [loading, setLoading] = useState(true);
  const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('wechat');
  const [showAllItems, setShowAllItems] = useState(false);
  const [showShareTemplates, setShowShareTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [showShareUrlModal, setShowShareUrlModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [sharePayMethod, setSharePayMethod] = useState<SharePayMethod>('wechat');
  const [shareEasyPayType, setShareEasyPayType] = useState<EasyPayType>('wxpay');
  const shareUrlInputRef = useRef(null);


  //登录判断
  const { user, logout, showLoginModal, checkAuth } = useAuth();
  useEffect(() => {
    const init = async () => {
      if (!user) {
        showLoginModal();
        return;
      }
    };

    init(); // 直接执行初始化
  }, [user]); // 只依赖 user 变化

  // 默认分享配置
  const DEFAULT_SHARE_CONFIGS: ShareConfig = {
    1: {
      title: "携程特惠机票等你来",
      desc: "亲爱的朋友，帮我完成这趟旅程吧~",
      imgUrl: "https://evan-1304983303.cos.ap-nanjing.myqcloud.com/global/mini-shop/xc.png"
    },
    2: {
      title: "美团美食优惠券",
      desc: "一起来享受美食的快乐，帮我付一下餐费呗~",
      imgUrl: "https://evan-1304983303.cos.ap-nanjing.myqcloud.com/global/mini-shop/mt.png"
    },
    3: {
      title: "我在京东挑了样好东西，请你帮我付款吧",
      desc: `[共${orderDetail?.items.length}件] ${orderDetail?.items.map(item =>
        `${item.product_name}${item.spec_name ? ` ${item.spec_name}` : ''} x${item.quantity}`
      ).join(' ')}`,
      imgUrl: orderDetail?.items[0]?.product_image || "https://evan-1304983303.cos.ap-nanjing.myqcloud.com/global/mini-shop/jd.png"
    },
    4: {
      title: `${orderDetail?.receiver}希望你帮他付${orderDetail?.total_amount}元`,
      desc: "我在拼多多上买到了很赞的东西，希望你帮我付款哦~",
      imgUrl: orderDetail?.items[0]?.product_image || "https://evan-1304983303.cos.ap-nanjing.myqcloud.com/global/mini-shop/pdd.png"
    },
    5: {
      title: "滴滴快车优惠券",
      desc: "亲爱的，帮我付个车费，让我平安到达目的地~",
      imgUrl: "https://evan-1304983303.cos.ap-nanjing.myqcloud.com/global/mini-shop/dd.png"
    },
    6: {
      title: "得物限量版球鞋等你来",
      desc: "帮我付一下，这双鞋子太酷了，我等不及想要拥有它！",
      imgUrl: orderDetail?.items[0]?.product_image || "https://evan-1304983303.cos.ap-nanjing.myqcloud.com/global/mini-shop/dw.png"
    },
    7: {
      title: "饿了么外卖红包",
      desc: "肚子好饿，帮我付一下外卖费用吧，我请你下次！",
      imgUrl: orderDetail?.items[0]?.product_image || "https://evan-1304983303.cos.ap-nanjing.myqcloud.com/global/mini-shop/elm.png"
    },
    8: {
      title: "猫眼电影优惠券",
      desc: "精品电影，帮我付一下，我请你下次！",
      imgUrl: "https://evan-1304983303.cos.ap-nanjing.myqcloud.com/global/mini-shop/my.png"
    },
    9: {
      title: "飞猪旅行特惠",
      desc: "发现了一个超棒的旅行套餐，帮我付一下，一起去玩吧！",
      imgUrl: "https://evan-1304983303.cos.ap-nanjing.myqcloud.com/global/mini-shop/fz.png"
    },
    10: {
      title: "淘宝好物分享",
      desc: `我在淘宝看中了这${orderDetail?.items.length}件宝贝，帮我付一下呗，下次请你吃饭！`,
      imgUrl: orderDetail?.items[0]?.product_image || "https://evan-1304983303.cos.ap-nanjing.myqcloud.com/global/mini-shop/tb.png"
    },
    11: {
      title: "抖音好物分享",
      desc: `我在抖音看中了这${orderDetail?.items.length}件宝贝，帮我付一下呗，下次请你吃饭！`,
      imgUrl: orderDetail?.items[0]?.product_image || "https://evan-1304983303.cos.ap-nanjing.myqcloud.com/global/mini-shop/dy.png"
    }
  };

  const [shareConfigs, setShareConfigs] = useState<ShareConfig>(DEFAULT_SHARE_CONFIGS);

  // 获取分享配置
  useEffect(() => {
    const fetchShareConfigs = async () => {
      try {
        const response = await apiClient.get('/share/configs');
        const configs = response.data.data;
        if (configs) {
          setShareConfigs(configs);
        }
      } catch (error) {
        console.error('获取分享配置失败，使用默认配置:', error);
        // 出错时保持使用默认配置
        setShareConfigs(DEFAULT_SHARE_CONFIGS);
      }
    };

    fetchShareConfigs();
  }, [orderDetail]); // 添加 orderDetail 作为依赖，因为默认配置中使用了它

  // 处理分享配置
  const processShareConfig = useCallback((templateId: number, orderDetail: OrderDetail) => {
    const config = shareConfigs[templateId];
    if (!config) return null;

    try {
      // 处理标题
      let title = config.title;
      if (title.includes('${')) {
        title = new Function('orderDetail', `return \`${title}\``)(orderDetail);
      }

      // 处理描述
      let desc = config.desc;
      if (desc.includes('${')) {
        desc = new Function('orderDetail', `return \`${desc}\``)(orderDetail);
      }

      // 处理图片URL
      let imgUrl = config.imgUrl;
      if (imgUrl.includes('||')) {
        // 如果包含条件运算符，使用Function构造器
        imgUrl = new Function('orderDetail', `return ${imgUrl}`)(orderDetail);
      }

      return {
        title,
        desc,
        imgUrl
      };
    } catch (error) {
      console.error('处理分享配置失败:', error);
      // 返回原始配置
      return {
        title: config.title,
        desc: config.desc,
        imgUrl: config.imgUrl
      };
    }
  }, [shareConfigs]);

  const initWxShare = async (shareUrl: string, templateId: number, orderDetail: OrderDetail) => {
    try {
      const url = window.location.href.split('#')[0];
      console.log('当前页面URL:', url);

      console.log('请求微信配置参数...');
      const response = await apiClient.get(`/wx/jsconfig?url=${encodeURIComponent(url)}`);
      const config = response.data.data;
      console.log('获取到微信配置:', config);

      const shareConfig = processShareConfig(templateId, orderDetail);
      if (!shareConfig) {
        console.error('未找到对应的分享配置');
        return;
      }

      // 获取运行时配置的 appId
      const appId = typeof window !== 'undefined' && window.APP_CONFIG
        ? window.APP_CONFIG.WECHAT_APP_ID
        : process.env.NEXT_PUBLIC_WECHAT_APP_ID;
      console.log('appId', appId);

      console.log('配置微信JS-SDK...');
      window.wx.config({
        debug: false,
        appId: appId, // 使用运行时配置
        timestamp: config.timestamp,
        nonceStr: config.nonceStr,
        signature: config.signature,
        jsApiList: [
          'updateAppMessageShareData',
          'updateTimelineShareData',
          'onMenuShareTimeline',
          'onMenuShareAppMessage'
        ]
      });

      // 获取分享配置（本地获取）
      /*
      const shareConfigs: ShareConfig = {
        1: {
          title: "携程特惠机票等你来",
          desc: "亲爱的朋友，帮我完成这趟旅程吧~",
          imgUrl: "https://evan-1304983303.cos.ap-nanjing.myqcloud.com/global/mini-shop/xc.jpg"
        },
        2: {
          title: "美团美食优惠券",
          desc: "一起来享受美食的快乐，帮我付一下餐费呗~",
          imgUrl: "https://evan-1304983303.cos.ap-nanjing.myqcloud.com/global/mini-shop/mt.jpg"
        },
        3: {
          title: "我在京东挑了样好东西，请你帮我付款吧",
          desc: `[共${orderDetail.items.length}件] ${orderDetail.items.map(item =>
            `${item.product_name}${item.spec_name ? ` ${item.spec_name}` : ''} x${item.quantity}`
          ).join(' ')}`,
          imgUrl: orderDetail.items[0]?.product_image || "https://evan-1304983303.cos.ap-nanjing.myqcloud.com/global/mini-shop/jd.png"
        },
        4: {
          title: `${orderDetail.receiver}希望你帮他付${orderDetail.total_amount}元`,
          desc: "我在拼多多上买到了很赞的东西，希望你帮我付款哦~",
          imgUrl: orderDetail.items[0]?.product_image || "https://evan-1304983303.cos.ap-nanjing.myqcloud.com/global/mini-shop/pdd.png"
        },
        5: {
          title: "滴滴快车优惠券",
          desc: "亲爱的，帮我付个车费，让我平安到达目的地~",
          imgUrl: "https://evan-1304983303.cos.ap-nanjing.myqcloud.com/global/mini-shop/dd.jpg"
        }
      };
  
      
      const shareConfig = shareConfigs[templateId];
      console.log('使用的分享配置:', shareConfig);
      console.log('实际分享URL:', shareUrl);
      */

      window.wx.ready(() => {
        console.log('微信JS-SDK准备就绪，开始配置分享...');

        // 配置分享到朋友
        window.wx.updateAppMessageShareData({
          title: shareConfig.title,
          desc: shareConfig.desc,
          link: shareUrl, // 使用后端返回的分享URL
          imgUrl: shareConfig.imgUrl,
          success: () => console.log('配置分享朋友成功'),
          fail: (res: any) => console.error('配置分享朋友失败', res)
        });

        // 配置分享到朋友圈
        window.wx.updateTimelineShareData({
          title: shareConfig.title,
          link: shareUrl, // 使用后端返回的分享URL
          imgUrl: shareConfig.imgUrl,
          success: () => console.log('配置分享朋友圈成功'),
          fail: (res: any) => console.error('配置分享朋友圈失败', res)
        });

        console.log('分享配置完成');
      });

      window.wx.error((res: any) => {
        console.error('微信JS-SDK配置失败:', res);
      });
    } catch (error) {
      console.error('初始化分享失败:', error);
    }
  };

  const shareTemplates: ShareTemplate[] = [
    {
      id: 1,
      title: "携程风格",
      description: "简约蓝色风格，突出商品价值",
      icon: <div className="p-3 rounded-lg bg-blue-100">
        <FaPlane className="text-2xl text-blue-600" />
      </div>
    },
    {
      id: 2,
      title: "美团风格",
      description: "活力绿色主题，突出性价比",
      icon: <div className="p-3 rounded-lg bg-green-100">
        <FaUtensils className="text-2xl text-green-600" />
      </div>
    },
    {
      id: 3,
      title: "京东风格",
      description: "经典橙色设计，突出商品细节",
      icon: <div className="p-3 rounded-lg bg-orange-100">
        <FaShoppingBag className="text-2xl text-red-600" />
      </div>
    },
    {
      id: 4,
      title: "拼多多风格",
      description: "红色主题，突出优惠力度",
      icon: <div className="p-3 rounded-lg bg-red-100">
        <FaUsers className="text-2xl text-red-600" />
      </div>
    },
    {
      id: 5,
      title: "滴滴风格",
      description: "橙色主题，突出行程信息",
      icon: <div className="p-3 rounded-lg bg-amber-100">
        <FaCar className="text-2xl text-amber-600" />
      </div>
    },
    {
      id: 6,
      title: "得物风格",
      description: "潮流黑色主题，突出商品稀缺性",
      icon: <div className="p-3 rounded-lg bg-gray-100">
        <FaShoppingBag className="text-2xl text-gray-800" />
      </div>
    },
    {
      id: 7,
      title: "饿了么风格",
      description: "清新蓝色主题，突出配送速度",
      icon: <div className="p-3 rounded-lg bg-blue-100">
        <FaUtensils className="text-2xl text-blue-500" />
      </div>
    },
    {
      id: 8,
      title: "猫眼电影优惠券",
      description: "红色主题，突出优惠力度",
      icon: <div className="p-3 rounded-lg bg-red-100">
        <FaFilm className="text-2xl text-red-700" />
      </div>
    },
    {
      id: 9,
      title: "飞猪风格",
      description: "粉色主题，突出旅行体验",
      icon: <div className="p-3 rounded-lg bg-pink-100">
        <FaPlane className="text-2xl text-pink-500" />
      </div>
    },
    {
      id: 10,
      title: "淘宝风格",
      description: "橙色主题，突出商品多样性",
      icon: <div className="p-3 rounded-lg bg-orange-100">
        <FaShoppingCart className="text-2xl text-orange-500" />
      </div>
    },
    {
      id: 11,
      title: "抖音风格",
      description: "红色主题，突出优惠力度",
      icon: <div className="p-3 rounded-lg bg-red-100">
        <FaTiktok className="text-2xl text-red-700" />
      </div>
    }
  ];

  useEffect(() => {
    if (!orderNo) {
      router.push(`${basePath}/`);
      return;
    }
    fetchOrderDetail();
  }, [orderNo]);

  useEffect(() => {
    const loadWechatScript = () => {
      return new Promise((resolve, reject) => {
        if (window.wx) {
          resolve(window.wx);
        } else {
          const script = document.createElement("script");
          script.src = "https://res.wx.qq.com/open/js/jweixin-1.6.0.js"; // 确保使用正确的微信 JS-SDK URL
          script.onload = () => resolve(window.wx);
          script.onerror = () => reject(new Error("Failed to load WeChat JS SDK"));
          document.body.appendChild(script);
        }
      });
    };

    loadWechatScript()
      .then(() => {
        console.log("微信 JS-SDK 加载成功");
      })
      .catch((error) => {
        console.error("微信 JS-SDK 加载失败:", error);
      });
  }, []);

  useEffect(() => {
    console.log('showShareTemplates:', showShareTemplates);
    console.log('selectedTemplate:', selectedTemplate);
  }, [showShareTemplates, selectedTemplate]);

  useEffect(() => {
    if (shareUrl && selectedTemplate) {
      console.log('shareUrl或selectedTemplate更新，重新初始化分享配置');
    }
  }, [shareUrl, selectedTemplate]);

  const fetchOrderDetail = async () => {
    try {
      const response = await apiClient.get(`/shop/orders/${orderNo}`);
      setOrderDetail(response.data.data);
    } catch (error) {
      toast.error("获取订单信息失败");
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center">
      <Spinner size="lg" />
    </div>;
  }

  const displayItems = showAllItems
    ? orderDetail?.items
    : orderDetail?.items.slice(0, 2);

  const handlePayment = async () => {
    if (!orderDetail) return;

    if (isTestApp && paymentMethod !== 'friend') {
      toast(
        <div className="flex flex-col items-start justify-center">
          测试模式，支付成功！
          <span className="text-primary">
            开发者已开发并测试完成正式支付模式，无异常。
          </span>
        </div>
      )
      return
    }

    if (paymentMethod === 'wechat') {
      try {
        const response = await apiClient.post('/pay/params', {
          order_no: orderDetail.order_no
        });
        console.log('response', response);
        const success = await WechatPay.getInstance().pay(response.data.data);

        if (success) {
          toast.success('支付成功');
          router.push('/orders');
        } else {
          toast.error('支付失败，请重试');
        }
      } catch (error) {
        console.error('Payment failed:', error);
        toast.error('支付失败，请重试');
      }
    } else if (paymentMethod === 'alipay') {
      try {
        const response = await apiClient.post('/alipay/params', {
          order_no: orderDetail.order_no
        });

        // 不直接提交表单，而是跳转到中间页
        const payUrl = response.data.data.payUrl;

        // 判断是否在微信浏览器中
        if (isWeixinBrowser()) {
          // 在微信浏览器中，使用中间页
          router.push(`/payment/alipay?payUrl=${encodeURIComponent(payUrl)}`);
        } else {
          // 非微信浏览器，直接跳转
          window.location.href = payUrl;
        }
      } catch (error) {
        console.error('Alipay payment failed:', error);
        toast.error('支付宝支付失败，请重试');
      }
    } else if (paymentMethod === 'easypay') {
      try {
        const response = await apiClient.post('/easypay/params', {
          order_no: orderDetail.order_no,
          pay_type: shareEasyPayType  // 添加支付方式参数
        });
        console.log(response.data);
        if (response.data.data.payUrl) {
          const payUrl = response.data.data.payUrl;
          window.location.href = payUrl;
        } else {
          toast.error('支付失败，请重试');
        }
      } catch (error) {
        console.error('Easypay payment failed:', error);
        toast.error('支付失败，请重试');
      }
    } else if (paymentMethod === 'friend') {
      try {
        console.log('开始创建分享链接...');
        const payMethod = sharePayMethod === 'easypay'
          ? `easypay-${shareEasyPayType}`
          : sharePayMethod;

        const response = await apiClient.post(`/shop/orders/${orderDetail.order_no}/share`, {
          templateId: selectedTemplate,
          payMethod: payMethod
        });

        if (response.data.data.shareUrl) {
          const newShareUrl = response.data.data.shareUrl;
          console.log('获取到分享URL:', newShareUrl);

          setShareUrl(newShareUrl);

          // 确保微信 JS-SDK 已加载
          if (window.wx) {
            console.log('开始初始化微信分享配置...');
            await initWxShare(newShareUrl, selectedTemplate!, orderDetail);
            setShowShareUrlModal(true);
          } else {
            console.error('微信 JS-SDK 尚未加载，无法初始化分享配置');
          }
        } else {
          toast.error('创建分享失败，请重试');
        }
      } catch (error) {
        console.error('分享创建失败:', error);
        toast.error('创建分享失败，请重试');
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* 主体内容 */}
      <div className="flex-1 pb-[calc(120px+env(safe-area-inset-bottom))]">
        {/* 收货地址 */}
        <div className="bg-white mb-2 shadow-sm w-full">
          <div
            className="p-4 cursor-pointer"
            onClick={() => router.push(`/address?orderNo=${orderNo}`)}
          >
            {orderDetail?.receiver ? (
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-lg">{orderDetail.receiver}</span>
                    <span className="text-gray-600">{orderDetail.phone}</span>
                  </div>
                  <p className="text-gray-600">
                    {orderDetail.province} {orderDetail.city} {orderDetail.district} {orderDetail.detail}
                  </p>
                </div>
                <FaChevronRight className="text-gray-400 ml-4" />
              </div>
            ) : (
              <div className="flex items-center justify-between text-gray-500">
                <span>请选择收货地址</span>
                <FaChevronRight />
              </div>
            )}
          </div>
        </div>

        {/* 商品列表 */}
        <div className="bg-white mb-2 shadow-sm w-full">
          <div className="p-4">
            {displayItems?.map((item, index) => (
              <div key={index} className="flex gap-4 mb-4">
                <Image
                  src={item.product_image}
                  alt={item.product_name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold line-clamp-2">{item.product_name}</h3>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-primary">¥{item.price}</span>
                    <span className="text-gray-500">x{item.quantity}</span>
                  </div>
                </div>
              </div>
            ))}

            {orderDetail?.items.length > 2 && (
              <Button
                variant="light"
                onPress={() => setShowAllItems(!showAllItems)}
                className="w-full"
              >
                {showAllItems ? "收起" : `查看全部 ${orderDetail.items.length} 件商品`}
              </Button>
            )}

            <Divider className="my-4" />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>商品总额</span>
                <span>¥{orderDetail?.total_amount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>运费</span>
                <span>¥0.00</span>
              </div>
            </div>
          </div>
        </div>

        {/* 支付方式 */}
        <div className="bg-white w-full">
          <div className="p-4">
            <h3 className="font-semibold mb-4">支付方式</h3>
            <div className="space-y-3">
              <div
                className={`p-4 rounded-lg border ${paymentMethod === "wechat" ? "border-primary" : "border-gray-200"} cursor-pointer`}
                onClick={() => setPaymentMethod("wechat")}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-[#07C160] w-10 h-10 rounded-lg flex items-center justify-center">
                    <FaWeixin className="text-white text-xl" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">微信支付</p>
                    <p className="text-sm text-gray-500">推荐使用微信支付</p>
                  </div>
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
                    {paymentMethod === "wechat" && (
                      <div className="w-3 h-3 rounded-full bg-primary" />
                    )}
                  </div>
                </div>
              </div>

              <div
                className={`p-4 rounded-lg border ${paymentMethod === "alipay" ? "border-primary" : "border-gray-200"} cursor-pointer`}
                onClick={() => setPaymentMethod("alipay")}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-[#1677FF] w-10 h-10 rounded-lg flex items-center justify-center">
                    <FaAlipay className="text-white text-xl" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">支付宝支付</p>
                    <p className="text-sm text-gray-500">支持支付宝付款</p>
                  </div>
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
                    {paymentMethod === "alipay" && (
                      <div className="w-3 h-3 rounded-full bg-primary" />
                    )}
                  </div>
                </div>
              </div>

              <div
                className={`p-4 rounded-lg border ${paymentMethod === "easypay" ? "border-primary" : "border-gray-200"} cursor-pointer`}
                onClick={() => setPaymentMethod("easypay")}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-[#ff0000] w-10 h-10 rounded-lg flex items-center justify-center">
                    {/* <FaPaypal className="text-white text-xl" /> */}
                    <Image src={`${basePath}/png/easypay.png`} alt="易支付" className="w-10 h-10" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">易支付</p>
                    <p className="text-sm text-gray-500">支持多种支付方式</p>
                  </div>
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
                    {paymentMethod === "easypay" && (
                      <div className="w-3 h-3 rounded-full bg-primary" />
                    )}
                  </div>
                </div>

                {/* 易支付方式选择 */}
                {paymentMethod === "easypay" && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <RadioGroup
                      orientation="horizontal"
                      value={shareEasyPayType}
                      onValueChange={(value) => setShareEasyPayType(value as EasyPayType)}
                      size="sm"
                    >
                      <Radio value="wxpay">
                        <div className="flex items-center gap-1">
                          <FaWeixin className="text-[#07C160]" />
                          <span>微信支付</span>
                        </div>
                      </Radio>
                      <Radio value="alipay">
                        <div className="flex items-center gap-1">
                          <FaAlipay className="text-[#1677FF]" />
                          <span>支付宝</span>
                        </div>
                      </Radio>
                      <Radio value="qqpay" className="hidden">
                        <div className="flex items-center gap-1">
                          <FaQq className="text-[#12B7F5]" />
                          <span>QQ钱包</span>
                        </div>
                      </Radio>
                    </RadioGroup>
                  </div>
                )}
              </div>

              <div
                className={`p-4 rounded-lg border ${paymentMethod === "friend" ? "border-primary" : "border-gray-200"} cursor-pointer`}
                onClick={() => setPaymentMethod("friend")}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 w-10 h-10 rounded-lg flex items-center justify-center">
                    <FaUsers className="text-gray-600 text-xl" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">好友代付</p>
                    <p className="text-sm text-gray-500">让好友帮你付款</p>
                  </div>
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
                    {paymentMethod === "friend" && (
                      <div className="w-3 h-3 rounded-full bg-primary" />
                    )}
                  </div>
                </div>

                {/* 添加支付方式选择 */}
                {paymentMethod === "friend" && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    {/* 提示卡片 */}
                    {/* <div className="mb-4 bg-blue-50 rounded-xl p-3 border border-blue-100">
                      <div className="flex items-start gap-3">
                        <div className="text-blue-500 mt-0.5">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-blue-800 text-sm">创建分享提示</p>
                          <p className="text-blue-600 text-xs mt-0.5">同一订单重复创建分享，旧的分享链接将失效</p>
                        </div>
                      </div>
                    </div> */}

                    <p className="text-sm text-gray-500 mb-1">好友支付方式💁‍♂️</p>
                    <RadioGroup
                      orientation="horizontal"
                      value={sharePayMethod}
                      onValueChange={(value) => setSharePayMethod(value as SharePayMethod)}
                      size="sm"
                    >
                      <Radio value="wechat">
                        <div className="flex items-center gap-1">
                          <FaWeixin className="text-[#07C160]" />
                          <span>微信支付</span>
                        </div>
                      </Radio>
                      <Radio value="alipay">
                        <div className="flex items-center gap-1">
                          <FaAlipay className="text-[#1677FF]" />
                          <span>支付宝</span>
                        </div>
                      </Radio>
                      <Radio value="easypay">
                        <div className="flex items-center gap-1">
                          {/* <FaPaypal className="text-black" /> */}
                          <Image src={`${basePath}/png/easypay.png`} width={16} height={16} alt="易支付" className="object-cover" />
                          <span>易支付</span>
                        </div>
                      </Radio>
                    </RadioGroup>

                    {/* 当选择易支付时显示支付类型选择 */}
                    {sharePayMethod === 'easypay' && (
                      <>
                        <Divider className="my-3 border-gray-200" />
                        <div className="">
                          {/* 提示标题 */}
                          <p className="text-sm text-gray-500 mb-1">易支付方式🫱</p>
                          <RadioGroup
                            orientation="horizontal"
                            value={shareEasyPayType}
                            onValueChange={(value) => setShareEasyPayType(value as EasyPayType)}
                            size="sm"
                          >
                            <Radio value="wxpay">
                              <div className="flex items-center gap-1">
                                <FaWeixin className="text-[#07C160]" />
                                <span>微信支付</span>
                              </div>
                            </Radio>
                            <Radio value="alipay">
                              <div className="flex items-center gap-1">
                                <FaAlipay className="text-[#1677FF]" />
                                <span>支付宝</span>
                              </div>
                            </Radio>
                            <Radio value="qqpay" className="hidden">
                              <div className="flex items-center gap-1">
                                <FaQq className="text-[#12B7F5]" />
                                <span>QQ钱包</span>
                              </div>
                            </Radio>
                          </RadioGroup>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Templates Modal */}
      <Modal
        isOpen={showShareTemplates}
        onClose={() => setShowShareTemplates(false)}
        placement="bottom"
        backdrop="blur"
        hideCloseButton
        size="full"
        scrollBehavior="inside"
        className="bg-background/80 backdrop-blur-sm"
      >
        <ModalContent onClick={(e) => e.stopPropagation()}>
          {(onClose) => (
            <>
              <ModalBody className="p-4 pb-20 overflow-y-auto">
                <div className="flex justify-between items-center mb-4 bg-white rounded-lg p-3">
                  <div className="flex flex-col items-start gap-2">
                    <h3 className="font-semibold">选择分享模板</h3>
                    <p className="text-sm text-gray-500 hidden">本项目仅供学习和测试使用、禁止用于任何非法用途，后果自己负责。</p>
                  </div>
                  <Button
                    isIconOnly
                    variant="light"
                    onPress={onClose}
                  >
                    <IoClose className="text-xl" />
                  </Button>
                </div>
                <div className="space-y-3">
                  {shareTemplates.map((template) => (
                    <div
                      key={template.id}
                      className={`p-4 rounded-lg border ${selectedTemplate === template.id ? "border-primary" : "border-gray-300"} cursor-pointer`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedTemplate(template.id);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        {template.icon}
                        <div className="flex-1">
                          <p className="font-medium">{template.title}</p>
                          <p className="text-sm text-gray-500">{template.description}</p>
                        </div>
                        {selectedTemplate === template.id && (
                          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <span className="text-white text-sm">✓</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ModalBody>

              <div className="absolute bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t border-gray-200">
                <Button
                  className="w-full bg-black text-white"
                  onPress={() => setShowShareTemplates(false)}
                >
                  确认选择
                </Button>
              </div>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* 底部支付栏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md p-4 z-50">
        <div className="flex items-center justify-between gap-3">
          <div className="text-lg whitespace-nowrap">
            合计: <span className="text-primary font-bold">¥{orderDetail?.total_amount}</span>
          </div>
          <div className="flex gap-2">
            {paymentMethod === 'friend' && (
              <Button
                color="secondary"
                size="lg"
                onClick={() => {
                  setShowShareTemplates(true);
                }}
              >
                {selectedTemplate ? '更换模板' : '选择模板'}
              </Button>
            )}
            <Button
              color="primary"
              size="lg"
              isDisabled={!orderDetail?.receiver || (paymentMethod === 'friend' && !selectedTemplate)}
              onPress={handlePayment}
            >
              {paymentMethod === 'wechat' || paymentMethod === 'alipay' ? '立即支付' : '分享支付'}
            </Button>
          </div>
        </div>
        <div className="h-safe-area" />
      </div>

      {/* 分享URL弹窗 */}
      <Modal
        isOpen={showShareUrlModal}
        onClose={() => setShowShareUrlModal(false)}
        size="lg"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                分享订单
              </ModalHeader>
              <ModalBody className="pb-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={shareUrl}
                      readOnly
                      className="flex-1 p-2 border rounded"
                      ref={shareUrlInputRef}
                    />
                    <Button
                      color="primary"
                      onPress={() => {
                        if (shareUrlInputRef.current) {
                          shareUrlInputRef.current.select();
                          shareUrlInputRef.current.setSelectionRange(0, 99999);

                          try {
                            if (navigator.clipboard && window.isSecureContext) {
                              navigator.clipboard.writeText(shareUrl)
                                .then(() => toast.success("链接已复制"))
                                .catch(() => {
                                  document.execCommand('copy');
                                  toast.success("链接已复制");
                                });
                            } else {
                              document.execCommand('copy');
                              toast.success("链接已复制");
                            }
                          } catch (err) {
                            console.error('复制失败:', err);
                            toast.error("复制失败，请手动复制");
                          }
                        } else {
                          toast.error("复制失败，请手动复制");
                        }
                      }}
                    >
                      复制
                    </Button>
                  </div>

                  <QRCodeDisplay url={shareUrl} />

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      color="success"
                      startContent={<FaWeixin />}
                      onPress={() => {
                        toast.success("请点击右上角「...」分享给好友");
                      }}
                    >
                      分享好友
                    </Button>
                    <Button
                      color="warning"
                      startContent={<FaUsers />}
                      onPress={() => {
                        toast.success("请点击右上角「...」分享到朋友圈");
                      }}
                    >
                      分享朋友圈
                    </Button>
                  </div>
                  <Button
                    color="secondary"
                    fullWidth
                    onPress={() => {
                      setShowShareUrlModal(false);
                      setShowShareTemplates(true);
                    }}
                  >
                    更换模板
                  </Button>
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}