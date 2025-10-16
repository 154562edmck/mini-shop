import React from 'react';
import Image from 'next/image';
import { FaQuestion, FaQuestionCircle } from 'react-icons/fa';
import Link from 'next/link';

interface Props {
    orderDetail: any;
    onPay: () => void;
    payMethod: string;
}

const TBPayment = ({ orderDetail, onPay, payMethod }: Props) => {
    const isActive = orderDetail.status === 0;

    return (
        <div className="min-h-screen bg-[#F7F7F7] pt-4">
            {/* 金额展示 */}
            <div className="text-[40px] font-normal text-[#FF5500] flex items-baseline justify-center mb-4">
                <span className="text-[22px]">¥</span>
                {Number(orderDetail.total_amount).toFixed(2)}
            </div>

            {/* 商品卡片 */}
            <div className="mx-2 bg-white rounded-xl">
                {/* 卡片标题 */}
                <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-[14px] text-[#333333] font-medium">帮付订单信息</span>
                    <div className="flex items-center text-[#999999]">
                        <Link href="https://rule.taobao.com" className="text-[12px] mr-1">帮我付说明</Link>
                        <FaQuestion className="w-4 h-4 text-[#999999] border border-[#999999] rounded-full p-0.5" />
                    </div>
                </div>

                {/* 商品列表 */}
                <div className="px-4 py-3">
                    {orderDetail.items?.map((item: any, index: number) => (
                        <div key={index} className="flex items-start mb-4 last:mb-0">
                            <Image
                                src={item.product_image || '/placeholder.png'}
                                alt="product"
                                width={90}
                                height={90}
                                className="rounded-lg border border-[#F0F0F0] object-cover"
                            />
                            <div className="ml-3 flex-1">
                                <div className="text-[14px] text-[#333333] line-clamp-3">
                                    {item.product_name}
                                </div>
                                <div className="text-[12px] text-[#999999] mt-2">
                                    ×{item.quantity}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 底部按钮 */}
            <div className="fixed bottom-0 left-0 right-0 px-4 pb-8 pt-3 bg-white">
                {orderDetail.status === 0 ? (
                    <button
                        onClick={onPay}
                        className="w-full h-[48px] text-white text-[16px] rounded-full 
                                               font-medium transition-transform active:scale-95
                                               bg-gradient-to-r from-[#ff8901] to-[#fe4a00]
                                               active:from-[#ff7901] active:to-[#fe4400]"
                    >
                        慷慨付款
                    </button>
                ) : (
                    <button
                        onClick={() => window.location.href = "https://main.m.taobao.com"}
                        className="w-full h-[48px] bg-[#999999] text-white text-[16px] rounded-full 
                                 font-medium cursor-pointer"
                    >
                        {orderDetail.status === 1 ? '订单已完成' : '订单已过期'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default TBPayment;