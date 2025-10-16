import React, { useState, useEffect } from 'react';
import { getOrderStatusDisplay, OrderStatusDisplay } from "@/utils/orderStatus";

interface Props {
  orderDetail: any;
  onPay: () => void;
  payMethod: string;
}

export default function MeituanOrder({ orderDetail, onPay, payMethod }: Props) {
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
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return (
      <div className="flex items-center justify-center gap-1">
        <span className="bg-black text-white px-0.5 py-0.5 rounded text-xs">{hours.toString().padStart(2, '0')}</span>
        <span className="text-gray-900">:</span>
        <span className="bg-black text-white px-0.5 py-0.5 rounded text-xs">{minutes.toString().padStart(2, '0')}</span>
        <span className="text-gray-900">:</span>
        <span className="bg-black text-white px-0.5 py-0.5 rounded text-xs">{secs.toString().padStart(2, '0')}</span>
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto bg-gray-100 min-h-screen">
      <div className="text-black pt-4 px-6">
        <div className="flex items-center gap-3">
          <img
            src={orderDetail.creator_avatar}
            alt="avatar"
            className="w-10 h-10 rounded-xl object-cover"
          />
          <div className="flex-1">
            <div className="text-base mb-1">{orderDetail.creator_nickname}</div>
            <div className="text-sm text-gray-500">Hi～你和我的距离只差一顿外卖～</div>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="bg-white rounded-xl p-6 mb-4">
          <div className="text-center">
            <div className="text-gray-900 text-lg font-semibold mb-2">
              <OrderStatusDisplay status={orderDetail.status} template="meituan" />
            </div>
            <div className="text-[32px] font-semibold">¥{orderDetail.total_amount}</div>
            {orderDetail.status === 1 && <div className="text-sm font-light mb-4">{payMethod === "wechat" || payMethod === "easypay-wxpay" ? "微信支付" : "支付宝支付"}</div>}
            {orderDetail.status === 0 && (
              <div className="text-gray-500 text-sm flex items-center justify-center gap-2">
                支付剩余时间 {formatTime(countdown)}
              </div>
            )}
          </div>


          <div className="bg-yellow-50 p-4 rounded-xl mt-6 text-sm">
            <div className="text-yellow-900 font-medium mb-3">付款须知</div>
            <div className="text-yellow-900">
              <p>1.代付订单创建成功后15分钟内未付款，订单会自动取消，你可以重新下单。</p>
              <p className="mt-2">2.当代付订单退款成功后，实付金额将原路退还代付人。</p>
            </div>
          </div>


          <button
            onClick={orderDetail.status === 0 ? onPay : () => window.location.href = "https://h5.waimai.meituan.com/waimai/mindex/home"}
            className={`w-full text-center py-3 rounded-xl mt-6 text-base font-semibold bg-yellow-300 hover:bg-yellow-300"
              }`}
          >
            {orderDetail.status === 0 ? "为好友买单" : "知道了"}
          </button>
        </div>

        <div className="bg-white rounded-xl p-4">
          <div className="text-gray-900 font-medium mb-4">
            {orderDetail.merchant_name}
          </div>

          {orderDetail.items.map((item, index) => (
            <div key={index} className="flex gap-3 py-3">
              <img
                src={item.product_image}
                alt={item.product_name}
                className="w-[76px] h-[76px] rounded-lg object-cover"
              />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <span className="text-black text-sm line-clamp-2 mr-1">{item.product_name}</span>
                  {orderDetail.status === 0 && (
                    <span className="text-black">¥{item.price}</span>
                  )}
                </div>
                <div className="text-gray-500 text-sm mt-1">{item.spec_name}</div>
                <div className="text-gray-500 text-sm mt-1">x{item.quantity}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};