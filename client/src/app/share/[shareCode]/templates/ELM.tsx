import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { getOrderStatusDisplay } from '@/utils/orderStatus';

interface Props {
    orderDetail: any;
    onPay: () => void;
    payMethod: string;
}

const ELMOrder = ({ orderDetail, onPay, payMethod }: Props) => {
    const [countdown, setCountdown] = useState(0);
    const isActive = orderDetail.status === 0;

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

    return (
        <div className="min-h-screen bg-[#f5f5f5] flex flex-col">
            {/* 头部用户信息 */}
            <div className="bg-[#00b7fd] pt-8 pb-20 rounded-none flex flex-col items-center">
                <div className="bg-[#e5e5e5] rounded-full flex items-center justify-center mb-2">
                    <Image
                        src={orderDetail.creator_avatar}
                        alt="avatar"
                        width={62}
                        height={62}
                        className="rounded-full"
                    />
                </div>
                <div className="text-sm text-white/80 text-center">
                    {`“万水千山总是情，帮我付款行不行”`}
                </div>
            </div>

            <div className={'bg-black/20 h-3 -mt-12 mx-2 rounded-full shadow-inner'}></div>

            {/* 订单金额区域 */}
            <div className="relative bg-white -mt-1.5 mx-4 px-4 py-8"
                style={{
                    background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.8) 0%, white 20%, white 100%)'
                }}
            >
                {/* 左边装饰 */}
                <div className="absolute left-2 top-0 bottom-0 flex items-center">
                    <div className="w-2 h-full flex flex-col justify-between py-2">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="w-2 h-2 rounded-full bg-[#f5f5f5]" />
                        ))}
                    </div>
                    <div className="h-full w-[1px] border-r border-dashed border-gray-200 ml-2" />
                </div>

                {/* 右边装饰 */}
                <div className="absolute right-2 top-0 bottom-0 flex items-center">
                    <div className="h-full w-[1px] border-l border-dashed border-gray-200 mr-2" />
                    <div className="w-2 h-full flex flex-col justify-between py-2">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="w-2 h-2 rounded-full bg-[#f5f5f5]" />
                        ))}
                    </div>
                </div>

                {/* 价格内容 */}
                <div className="text-center flex justify-center items-baseline">
                    <span className="text-[18px] font-normal">¥</span>
                    <span className="text-[32px] font-normal">{Number(orderDetail.total_amount).toFixed(2)}</span>
                </div>
                {isActive ? (
                    <div className="text-xs text-[#a0a0a0] text-center mt-2">
                        请你{" "}
                        <span className="bg-[#ff4e4e]/10 text-[#ff4e4e] px-0.5 rounded py-0.5">
                            {formatTimeBlock(Math.floor((countdown % 3600) / 60))}
                        </span>
                        <span className="text-[#ff4e4e] mx-1">:</span>
                        <span className="bg-[#ff4e4e]/10 text-[#ff4e4e] px-0.5 rounded py-0.5">
                            {formatTimeBlock(countdown % 60)}
                        </span>
                        {" "}内完成支付，超时将自动取消订单
                    </div>
                ) : (
                    <div className="text-xs text-[#a0a0a0] text-center mt-2">
                        {getOrderStatusDisplay(orderDetail.status, 'elm').text}
                    </div>
                )}
            </div>
            {/* 波浪形装饰 */}
            <div className={'h-3 mt-0 mx-4 rounded-none'}
                style={{
                    backgroundImage: 'radial-gradient(circle at 50% 100%, transparent 8px, white 8px)',
                    backgroundSize: '16px 16px'
                }}></div>

            {/* 订单商品列表 */}
            {isActive && <div className="bg-white mt-4 mx-4 p-4 rounded-lg">
                <div className="text-sm text-black/50 mb-2">{orderDetail.merchant_name}</div>
                {orderDetail.items?.map((item: any, index: number) => (
                    <div key={index} className="flex items-center py-2">
                        <Image
                            src={item.product_image || "/default-product.png"}
                            alt={item.product_name}
                            width={40}
                            height={40}
                            className="rounded h-10 w-10 object-cover"
                        />
                        <div className="ml-3">
                            <div className="text-sm line-clamp-1">{item.product_name}</div>
                            <div className="text-xs mt-1 text-[#a0a0a0]">x{item.quantity}</div>
                        </div>
                    </div>
                ))}
            </div>
            }

            {/* 帮付说明 */}
            <div className="flex-1 p-4">
                <div className="text-xs font-medium mb-4 text-[#a0a0a0]">帮付说明</div>
                <div className="text-xs text-[#a0a0a0] mb-3">
                    1.付款前请务必与好友核实订单信息，谨防诈骗
                </div>
                <div className="text-xs text-[#a0a0a0]">
                    2.当前付款申请将在倒计时结束后，支付金额将原路退回付款人
                </div>
            </div>

            {/* 底部按钮区域 */}
            <div className="bg-white mt-2 p-4 rounded-lg">
                <button
                    onClick={() => {
                        if (orderDetail.status === 0) {
                            onPay();
                        } else {
                            window.location.href = 'https://h5.ele.me';
                        }
                    }}
                    className={`w-full py-2.5 rounded-full text-base
                        ${isActive ? 'bg-[#00acf0] active:bg-[#00b7fd] text-white' : 'bg-white border border-[#00b7fd] text-[#00b7fd]'}`}
                >
                    {isActive ? '帮好友支付' : '返回首页'}
                </button>
            </div>
        </div>
    );
};

export default ELMOrder;