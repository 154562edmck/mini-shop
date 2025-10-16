"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button, Card, Spinner } from "@nextui-org/react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import apiClient from "@/utils/axiosUtils";
import WechatPay from "@/utils/wechatPay";
import { useRouter } from "next/navigation";
import { directWechatLogin } from "@/components/LoginModal";
import Head from "next/head";
import { SHOW_TOAST_MESSAGES } from "@/utils/orderStatus"; // 导入提示控制开关
import { FaAlipay, FaWeixin } from "react-icons/fa";
import { isWeixinBrowser } from "@/utils/browserUtils"; // 需要创建这个工具函数

import CTrip from "./templates/CTrip2";
import DiDi from "./templates/DiDi2";

import Meituan from "./templates/Meituan";
import JD from "./templates/JD";
import PDD from "./templates/PDD";
import DWPayment from "./templates/DW";
import MYPayment from "./templates/MY";
import ELMOrder from "./templates/ELM";
import FZPayment from "./templates/FZ";
import TBPayment from "./templates/TB";
import DYPayment from "./templates/DY";
import { isTestApp } from "@/config/config";


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
    expire_time: number;  // 后端返回的过期时间戳（秒）
    payMethod: string;
}

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

// 定义模板标题映射
const TEMPLATE_TITLES = {
    1: "携程代付",
    2: "美团代付",
    3: "京东代付",
    4: "拼多多代付",
    5: "滴滴代付",
    6: "得物代付",
    7: "饿了么代付",
    8: "猫眼代付",
    9: "飞猪代付",
    10: "淘宝代付",
    11: "抖音代付"
};

export default function SharePage() {
    const { shareCode } = useParams();
    const { user, showLoginModal } = useAuth();
    const [loading, setLoading] = useState(true);
    const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null);
    const router = useRouter();
    const [pageTitle, setPageTitle] = useState("代付订单");
    const [requiresLogin, setRequiresLogin] = useState(true); // 添加一个变量控制是否需要登录

    useEffect(() => {
        const initPage = async () => {
            try {
                // 先获取订单信息
                const response = await apiClient.get(`/shop/share/${shareCode}`);
                const orderData = response.data.data;
                setOrderDetail(orderData);

                // 设置页面标题
                const title = TEMPLATE_TITLES[orderData.templateId] || "代付订单";
                console.log(title);
                setPageTitle(title);

                // 判断是否需要登录
                // 易支付或支付宝支付不需要登录
                const isEasyPayOrAlipay = orderData.payMethod?.startsWith('easypay-') || orderData.payMethod === 'alipay';
                setRequiresLogin(!isEasyPayOrAlipay);

                // 如果需要登录且未登录，直接跳转到微信登录
                if (!isEasyPayOrAlipay && !user) {
                    directWechatLogin(orderData?.templateId ?? 1);
                    return;
                }
            } catch (error) {
                if (SHOW_TOAST_MESSAGES) toast.error("获取订单信息失败");
            } finally {
                setLoading(false);
            }
        };

        initPage();
    }, [shareCode, user, requiresLogin]);

    const handlePay = async () => {
        if (!orderDetail?.order_no) {
            if (SHOW_TOAST_MESSAGES) toast.error("订单信息不完整");
            return;
        }

        if (isTestApp) {
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

        try {
            // 处理支付方式
            if (orderDetail.payMethod?.startsWith('easypay-')) {
                // 易支付处理
                const payType = orderDetail.payMethod.split('-')[1]; // 获取具体支付类型 (wxpay/alipay/qqpay)
                const response = await apiClient.post("/easypay/params", {
                    order_no: orderDetail.order_no,
                    pay_type: payType
                });
                console.log(response.data);
                const payUrl = response.data.data.payUrl;
                window.location.href = payUrl;
            } else if (orderDetail.payMethod === 'alipay') {
                // 根据订单的支付方式选择支付逻辑
                console.log("支付宝支付");
                // 支付宝支付逻辑
                const response = await apiClient.post("/alipay/params", {
                    order_no: orderDetail.order_no
                });

                // 判断是否在微信浏览器中
                if (isWeixinBrowser()) {
                    // 在微信浏览器中，使用中间页
                    router.push(`/payment/alipay?payUrl=${encodeURIComponent(response.data.data.payUrl)}`);
                } else {
                    // 非微信浏览器，直接跳转
                    window.location.href = response.data.data.payUrl;
                }
            } else {
                if (!user) {
                    directWechatLogin(orderDetail?.templateId ?? 1);
                    return;
                }
                console.log("微信支付");
                // 微信支付逻辑（保持不变）
                const response = await apiClient.post("/pay/params", {
                    order_no: orderDetail.order_no
                });

                const success = await WechatPay.getInstance().pay(response.data.data);

                if (success) {
                    if (SHOW_TOAST_MESSAGES) toast.success("支付成功");
                    // 根据模板ID跳转到对应的官方网站
                    const officialUrl = TEMPLATE_OFFICIAL_URLS[orderDetail.templateId];
                    if (officialUrl) {
                        window.location.href = officialUrl;
                    }
                } else {
                    if (SHOW_TOAST_MESSAGES) toast.error("支付失败，请重试");
                }
            }
        } catch (error) {
            console.error('Payment failed:', error);
            if (SHOW_TOAST_MESSAGES) toast.error("支付失败，请重试");
        }
    };

    useEffect(() => {
        if (pageTitle) document.title = pageTitle
    }, [pageTitle])

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    if (!orderDetail) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Card className="p-6">
                    <p className="text-center text-gray-500">订单不存在或已过期</p>
                </Card>
            </div>
        );
    }

    // 根据模板ID渲染不同的模板组
    const renderTemplate = () => {
        switch (orderDetail.templateId) {
            case 1:
                return <CTrip orderDetail={orderDetail} onPay={handlePay} payMethod={orderDetail.payMethod} />;
            case 2:
                return <Meituan orderDetail={orderDetail} onPay={handlePay} payMethod={orderDetail.payMethod} />;
            case 3:
                return <JD orderDetail={orderDetail} onPay={handlePay} payMethod={orderDetail.payMethod} />;
            case 4:
                return <PDD orderDetail={orderDetail} onPay={handlePay} payMethod={orderDetail.payMethod} />;
            case 5:
                return <DiDi orderDetail={orderDetail} onPay={handlePay} payMethod={orderDetail.payMethod} />;
            case 6:
                return <DWPayment orderDetail={orderDetail} onPay={handlePay} payMethod={orderDetail.payMethod} />;
            case 7:
                return <ELMOrder orderDetail={orderDetail} onPay={handlePay} payMethod={orderDetail.payMethod} />;
            case 8:
                return <MYPayment orderDetail={orderDetail} onPay={handlePay} payMethod={orderDetail.payMethod} />;
            case 9:
                return <FZPayment orderDetail={orderDetail} onPay={handlePay} payMethod={orderDetail.payMethod} />;
            case 10:
                return <TBPayment orderDetail={orderDetail} onPay={handlePay} payMethod={orderDetail.payMethod} />;
            case 11:
                return <DYPayment orderDetail={orderDetail} onPay={handlePay} payMethod={orderDetail.payMethod} />;
            default:
                return <CTrip orderDetail={orderDetail} onPay={handlePay} payMethod={orderDetail.payMethod} />;
        }
    };

    return (
        <>
            <title>{pageTitle}</title>
            <div className="min-h-screen bg-gray-50">{renderTemplate()}</div>
        </>
    );
} 