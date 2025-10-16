import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaTiktok } from 'react-icons/fa';
import { toast } from "sonner";

interface Props {
    orderDetail: any;
    onPay: () => void;
    payMethod: string;
}

const DYPayment = ({ orderDetail, onPay, payMethod }: Props) => {
    const [countdown, setCountdown] = useState(0);
    const firstItem = orderDetail.items?.[0];
    const isActive = orderDetail.status === 0; // 判断是否是正常状态

    // 倒计时逻辑
    useEffect(() => {
        if (orderDetail.status === 0) {
            const expireTimestamp = Math.floor(new Date(orderDetail.expire_time).getTime() / 1000);
            const now = Math.floor(Date.now() / 1000);
            const initialCountdown = Math.max(0, expireTimestamp - now);
            setCountdown(initialCountdown);

            const timer = setInterval(() => {
                setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [orderDetail.status, orderDetail.expire_time]);

    const formatTimeBlock = (value: number) => {
        return value.toString().padStart(2, '0');
    };

    const handleVerifyName = () => {
        toast.success('校验成功');
    };

    return (
        <div className="min-h-screen bg-[#f8f8f8] py-4">
            {/* 顶部导航 */}
            <div className="flex flex-col items-center pb-4">
                <span className="text-[17px] font-medium text-[hsl(0,0%,13%)]">亲友付</span>
                {isActive && (
                    <span className="text-[12px] text-[#999] mt-1">
                        剩 <span className="text-[#fe2c55]">{formatTimeBlock(Math.floor(countdown / 3600))}:</span>
                        <span className="text-[#fe2c55]">{formatTimeBlock(Math.floor((countdown % 3600) / 60))}:</span>
                        <span className="text-[#fe2c55]">{formatTimeBlock(countdown % 60)}</span> 订单关闭
                    </span>
                )}
            </div>

            {/* 主卡片 */}
            <div className="mx-4 bg-white rounded-lg overflow-hidden">
                {/* 用户信息 */}
                <div className="p-4 flex items-start">
                    <Image
                        src={orderDetail.creator_avatar}
                        alt="avatar"
                        width={40}
                        height={40}
                        className="rounded-full"
                    />
                    <div className="ml-3 flex-1">
                        <div className="text-[15px] text-black font-bold flex items-center">
                            <span className="font-bold">
                                {orderDetail.creator_nickname}
                                {isActive && ` (**${orderDetail.merchant_name.slice(-1)})`}
                            </span>
                            {isActive && (
                                <span
                                    className="text-[11px] text-[#2f547e] ml-2 cursor-pointer"
                                    onClick={handleVerifyName}
                                >
                                    校验姓名
                                </span>
                            )}
                        </div>
                        <div className="text-[13px] text-[#999] mt-1">
                            我拼了喜欢的宝贝，帮我付个款吧
                        </div>
                    </div>
                </div>

                {/* 价格信息 */}
                <div className={`mx-4 px-4 pt-0 pb-4 mb-4 rounded-lg ${orderDetail.status === 0 || orderDetail.status === 1 ? 'bg-[#f8f8f8] opacity-100' : 'bg-[#f5f5f5] opacity-50'}`}>
                    <div className="flex items-baseline justify-start">
                        <div className="flex items-baseline">
                            <span className="text-black text-[24px]">¥</span>
                            <span className="text-black text-[36px] font-medium ml-1">
                                {Number(orderDetail.total_amount).toFixed(2)}
                            </span>
                        </div>
                        <span className="text-[#fe2c55] text-[10px] border ml-2 border-[#fe2c55] px-1 py-[0.1px] rounded">
                            {orderDetail.status === 0 ? '待支付' : orderDetail.status === 1 ? '已支付' : '支付申请已失效'}
                        </span>
                    </div>
                    {/* 商品信息 */}
                    {firstItem && (
                        <div className="flex items-center mt-1">
                            <Image
                                src={firstItem.product_image}
                                alt="product"
                                width={24}
                                height={24}
                                className="rounded h-10 w-10 object-cover"
                            />
                            <span className="ml-2 text-[13px] text-[#666] flex-1 line-clamp-1">
                                {firstItem.product_name}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* 提示文本 - 只在正常状态显示 */}
            {isActive && (
                <div className="mt-4 mx-4 text-[12px] text-gray-600">
                    如果订单申请退款，已支付金额将原路退还给你。
                </div>
            )}

            {/* 底部支付按钮区域 */}
            <div className="fixed flex flex-col bottom-0 left-0 right-0 px-4 pb-8 pt-3">
                {orderDetail.status === 0 && (<button
                    onClick={onPay}
                    className="w-full h-12 bg-[#fe2c55] rounded-md text-white text-[17px] font-medium"
                >
                    确认付款
                </button>
                )}
                {orderDetail.status !== 0 && (<button
                    onClick={() => {
                        window.location.href = 'https://www.douyin.com';
                    }}
                    className="mx-auto w-[180px] h-12 bg-[#ededef] rounded-md text-black text-[17px] font-medium"
                >
                    发消息告诉Ta
                </button>
                )}
                <div className="flex items-center justify-center mt-6 text-[13px] text-gray-300">
                    <div className="w-4 h-4 flex items-center justify-center bg-gray-300 rounded-full mr-1">
                        <FaTiktok className="text-white text-xs" />
                    </div>
                    <span className="font-black">抖音支付</span>
                    <span className="mx-2">|</span>
                    <span>9亿人都在用</span>
                </div>
            </div>
        </div>
    );
};

export default DYPayment;