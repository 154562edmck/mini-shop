import React from 'react';
import Image from 'next/image';
import { getOrderStatusDisplay } from "@/utils/orderStatus";
import { FaHeart } from 'react-icons/fa';

interface Props {
    orderDetail: any;
    onPay: () => void;
    payMethod: string;
}

const FZPayment = ({ orderDetail, onPay, payMethod }: Props) => {
    // 处理用户名显示逻辑
    const formatName = (name: string) => {
        if (!name) return '';
        const firstName = name.charAt(0);
        const lastName = name.charAt(name.length - 1);
        return `${firstName}****${lastName}`;
    };

    // 处理手机号显示逻辑
    const formatPhone = (phone: string) => {
        if (!phone) return '';
        return `${phone.slice(0, 2)}*****${phone.slice(-3)}`;
    };

    // 获取订单状态显示文本
    const statusDisplay = getOrderStatusDisplay(orderDetail.status, "fz");
    const isActive = orderDetail.status === 0;

    return (
        <div className="min-h-screen bg-[#F7F7F7] pt-4">
            {/* 用户信息卡片 */}
            <div className="mx-4 bg-white rounded-lg p-4">
                {/* 用户信息行 */}
                <div className="flex items-start">
                    {/* 头像 */}
                    <Image
                        src={orderDetail.creator_avatar}
                        alt="avatar"
                        width={40}
                        height={40}
                        className="rounded-sm"
                    />
                    {/* 用户信息 */}
                    <div className="ml-2 flex-1">
                        <div className="flex flex-col">
                            <span className="text-[14px] text-[#333]">
                                {formatName(orderDetail.creator_nickname)} (**{orderDetail.merchant_name.slice(-1)})
                            </span>
                            <span className="text-[12px] text-[#999] mt-0.5">
                                {formatPhone(orderDetail.phone)}
                            </span>
                            {/* 请求文案区 */}
                            <div className="mt-2">
                                <div className="bg-[#fcf5ef] px-3 py-2 rounded text-[14px] text-[#363636] font-medium leading-relaxed">
                                    <p>我有一张订单需要支付，请帮我代付吧。</p>
                                    <p>非常感谢你~</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 订单金额卡片 */}
            <div className="mx-4 mt-3 rounded-lg overflow-hidden">
                {/* 橙色背景区域 */}
                <div className="bg-gradient-to-r from-[#fd743e] to-[#ffb681] px-4 py-2 relative overflow-hidden">
                    {/* 背景装饰爱心 */}
                    <div className="absolute -bottom-3 right-0 transform translate-x-2 translate-y-2 opacity-10">
                        <FaHeart className="text-white w-32 h-32" />
                    </div>

                    {/* 原有内容 */}
                    <div className="flex justify-between items-center">
                        <span className="text-white text-[15px]">帮我付订单信息</span>
                        <span className="text-white text-[15px]">
                            {isActive ? "订单未支付" : statusDisplay.text}
                        </span>
                    </div>

                    {/* 金额显示 */}
                    <div className="mt-1 text-white">
                        <span className="text-[24px]">¥</span>
                        <span className="text-[40px] font-normal">
                            {Number(orderDetail.total_amount).toFixed(2)}
                        </span>
                    </div>

                    {/* 分割线 */}
                    <div className="mt-1 h-[2px] bg-white/70 rounded-full" />

                    {/* 提示文本 */}
                    <div className="mt-3 mb-2 text-white/80 text-[11px]">
                        实际金额以付款人确认付款时为准
                    </div>
                </div>

                {/* 商品信息 */}
                <div className="bg-white p-4">
                    <div className="flex items-center bg-[#fcf5ef] rounded p-2 line-clamp-2 overflow-hidden">
                        <Image
                            src={orderDetail.items?.[0]?.product_image}
                            alt="fliggy"
                            className="rounded h-10 w-10 object-cover"
                            width={42}
                            height={42}
                        />
                        <div className="ml-3 flex-1">
                            <div className="text-[14px] text-[#333] line-clamp-2">
                                {orderDetail.items?.[0]?.product_name}
                            </div>
                        </div>
                    </div>

                    {/* 只在订单未支付状态显示按钮 */}
                    {isActive && (
                        <button
                            onClick={onPay}
                            className="w-full h-[48px] bg-[#1677ff] text-white text-[16px] rounded-full 
                                     font-medium mt-6"
                        >
                            帮他人付款
                        </button>
                    )}
                </div>
            </div>

            {/* 帮我付说明 */}
            <div className="mx-4 mt-4">
                <div className="text-[#666] text-[13px] leading-6">
                    帮我付说明：
                </div>
                <div className="text-[#999] text-[12px] leading-5">
                    1. 本产品正在为您提供帮亲友代付款的服务，您应在自愿法规政策允许的范围内使用本产品。
                </div>
                <div className="text-[#999] text-[12px] leading-5">
                    2. 付款前请务必确认认付方身份，以免造到诈骗行为。
                </div>
                <div className="text-[#999] text-[12px] leading-5">
                    3. 选择[长期用TA付款]将持续获选为对方开通亲情付，完成开通后，您仍需通过当下页面继续完成当前付款行为。
                </div>
                <div className="text-[#df7a42] text-[12px] leading-5">
                    4. 如果交易发生退款，已支付金额将原路退回付款人的付款账户。
                </div>
            </div>

            {/* 底部版权信息 */}
            <div className="fixed bottom-0 left-0 right-0 mb-8 text-center text-[#999] text-[11px]">
                本服务由支付宝（中国）网络科技有限公司提供
            </div>
        </div>
    );
};

export default FZPayment;