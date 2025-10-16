import React from 'react';
import Image from 'next/image';
import { useEffect, useState } from "react";
import { getOrderStatusIcon } from '@/utils/orderStatus';
import { basePath } from '@/config/config';
interface Props {
  orderDetail: any;
  onPay: () => void;
  payMethod: string;
}

const CTrip2 = ({ orderDetail, onPay, payMethod }: Props) => {
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (orderDetail.status === 0) {
      // 将 ISO 日期字符串转换为时间戳（秒）
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

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 处理用户昵称显示，只显示最后两个字符，前面用星号代替
  const formatNickname = (nickname: string) => {
    if (nickname.length <= 2) return nickname;
    return '*'.repeat(nickname.length - 2) + nickname.slice(-2);
  };

  const itemData = orderDetail.items && orderDetail.items.length > 0 ? orderDetail.items[0] : null;

  return (
    <div className="max-w-md mx-auto bg-gray-100 min-h-screen">
      {/* 顶部绿色背景 - 使用自定义颜色 */}
      <div className="text-white p-4 pt-6 pb-20 relative" style={{ backgroundColor: '#1ccd97' }}>
        <div className="flex items-center">
          <div className="text-white">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z"></path>
            </svg>
          </div>
          <div className="flex-1 text-center">
            <span className="text-lg font-medium">他人代付</span>
          </div>
        </div>
      </div>

      {/* 主卡片区域 - 与顶部背景融合 */}
      <div className="bg-white mx-4 rounded-lg shadow relative mt-[-30px]">
        {/* 用户头像 - 悬浮在卡片与背景交界处 */}
        <div className="absolute left-1/2 -top-10 z-[999] transform -translate-x-1/2">
          <div className="w-20 h-20 rounded-full bg-gray-200 border-4 border-white overflow-hidden">
            {orderDetail.creator_avatar ? (
              <Image
                src={orderDetail.creator_avatar}
                alt="用户头像"
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg viewBox="0 0 24 24" width="40" height="40" stroke="currentColor" strokeWidth="1" fill="none">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* 内容区域 - 因为有头像所以顶部要有padding */}
        <div className="pt-14 px-5">
          {/* 用户信息与邀请内容 */}
          <div className="text-center mb-0">
            <div className="text-base font-bold mb-1">{orderDetail.creator_nickname || "用户"} <span className="text-base font-medium ml-1">发起的代付邀请</span></div>
            <div className="text-[#4f4a20] text-xs">我选好了商品 你来买单吧~</div>
          </div>

          {/* 商品信息卡片 */}
          <div className="border-gray-100 py-2">
            {itemData && (
              <div className="flex gap-3">
                <div className="w-28 h-28 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 border-none border-gray-200">
                  <Image
                    src={itemData.product_image || `${basePath}/images/placeholder.jpg`}
                    alt="商品图片"
                    width={112}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col justify-center gap-2 py-1">
                  <div className="text-lg font-medium line-clamp-1">{itemData.product_name}</div>
                  <div className="text-sm text-gray-500">
                    {itemData.spec_name} x{itemData.quantity}
                  </div>
                  <div className="text-sm text-gray-500">
                    {orderDetail.merchant_name}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 特殊分割线 - 虚线加两端半圆 */}
          <div className="relative flex items-center my-4">
            {/* 左侧半圆 */}
            <div className="absolute -left-7 w-4 h-4 bg-[#f3f4f6] rounded-full"></div>

            {/* 中间虚线 */}
            <div className="flex-grow border-t border-dashed border-gray-300 mx-0"></div>

            {/* 右侧半圆 */}
            <div className="absolute -right-7 w-4 h-4 bg-[#f3f4f6] rounded-full"></div>
          </div>

          {/* 价格和付款区域 */}
          <div className="pb-6">
            <div className="flex items-baseline justify-center mb-3">
              <span className="text-black text-md mr-2">{orderDetail.status === 0 ? '待支付' : orderDetail.status === 1 ? '已支付' : '已过期'}</span>
              <span className="text-4xl font-bold" style={{ color: '#fd6947' }}><span className="text-2xl">¥</span> {orderDetail.total_amount}</span>
            </div>

            {/* 支付倒计时 - 使用自定义颜色 */}
            {orderDetail.status === 0 && (
              <div className="flex items-center justify-center text-gray-500 mb-8">
                <span className="text-gray-500 text-sm">支付倒计时</span>
                <span className="mx-2 px-2 py-0 text-sm rounded-none text-white" style={{ backgroundColor: '#fd6947' }}>
                  {Math.floor(countdown / 60)}
                </span>
                <span>:</span>
                <span className="mx-2 px-2 py-0 text-sm rounded-none text-white" style={{ backgroundColor: '#fd6947' }}>
                  {(countdown % 60).toString().padStart(2, '0')}
                </span>
              </div>
            )}

            {/* 付款按钮 - 使用自定义颜色 */}
            <button
              onClick={orderDetail.status === 0 ? onPay : () => window.location.href = "https://m.ctrip.com/html5/"}
              className="w-full py-2 rounded-full text-white font-medium text-base"
              style={{ backgroundColor: orderDetail.status === 0 ? '#1ccd97' : '#ccc' }}
            >
              帮ta付款
            </button>
          </div>
        </div>
      </div>

      {/* 代付说明 */}
      <div className="mx-4 mb-8 mt-4 px-4">
        <div className="text-gray-500 mb-2 text-xs font-semibold">代付说明</div>
        <div className="text-gray-500 text-xs leading-6">
          <p>1. 代付订单创建后30分钟内未付款，订单会自动取消，你可以重新下单。</p>
          <p>2. 当代付订单退款成功后，实付金额将原路退还代付人。</p>
        </div>
      </div>
    </div>
  );
};

export default CTrip2;