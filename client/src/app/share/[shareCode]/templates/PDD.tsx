import React from 'react';
import { Image } from "@nextui-org/react";
import { getOrderStatusDisplay, OrderStatusDisplay } from "@/utils/orderStatus";

interface Props {
  orderDetail: any;
  onPay: () => void;
  payMethod: string;
}

export default function PDDPayment({ orderDetail, onPay, payMethod }: Props) {
  return (
    <div className="max-w-md mx-auto bg-[#F8F8F8]">
      {/* 主内容区 */}
      <div className="bg-[#FF6B6B] px-5 pt-6 pb-24">
        <div className="flex items-center gap-3">
          <img
            src={orderDetail.creator_avatar}
            alt="avatar"
            className="w-14 h-14 rounded-full"
          />
          <div className="flex flex-col justify-center gap-2">
            <div className="text-lg font-medium text-white">{orderDetail.creator_nickname}</div>
            <div className="bg-white/25 px-4 py-2 rounded-sm relative flex-1 text-white/95">
              <div className="absolute left-[-6px] top-3 w-0 h-0 border-t-[5px] border-t-transparent border-r-[6px] border-r-white/25 border-b-[5px] border-b-transparent"></div>
              {orderDetail.status === 0
                ? "帮我付一下这件商品吧，谢谢啦"
                : orderDetail.status === 1 ? "我已经为你代付成功啦 ~" : "先不用帮我代付了，谢谢啦 ~"}
            </div>
          </div>
        </div>
      </div>

      {/* 支付内容区 */}
      <div className="px-3 -mt-16">
        <div className="bg-white rounded-sm px-3 py-4 shadow-lg shadow-gray-100">
          {/* 金额区域 */}
          <div className="text-center">
            <>
              <div className="text-black mb-2">代付金额</div>
              <div className="text-[32px] leading-none font-bold mb-1">¥{orderDetail.total_amount}</div>
            </>
          </div>

          <button
            onClick={orderDetail.status === 0 ? onPay : () => window.location.href = "https://mobile.yangkeduo.com/"}
            className={`w-full py-2.5 rounded-sm mt-5 text-lg font-medium ${orderDetail.status === 0 || orderDetail.status === 1
              ? "bg-[#E02E24] text-white"
              : "bg-gray-200 text-gray-600"
              }`}
          >
            {orderDetail.status === 0 ? "立即支付" : getOrderStatusDisplay(orderDetail.status, "pdd").text}
          </button>

          {/* 支付提示 - 仅在待支付状态显示 */}
          {orderDetail.status === 0 && (
            <div className="text-gray-400 text-xs text-center mt-3 mb-6">
              如果订单申请退款，已支付金额将原路退还给您
            </div>
          )}

          {/* 分割线 */}
          <div className="border-t mx-1 mt-4"></div>

          {/* 商品信息 */}
          <div className=" border-gray-100 pt-4">
            {orderDetail.items.map((item: any, index: number) => (
              <div key={index} className="flex gap-3 mb-4 last:mb-0">
                <img
                  src={item.product_image}
                  alt={item.product_name}
                  className="w-[82px] h-[82px] object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-base font-medium leading-tight line-clamp-2 text-black">
                    {item.product_name}
                  </div>
                  <div className="text-sm text-gray-400 mt-4">
                    {item.spec_name}
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-baseline text-gray-400">
                      <span className="text-sm">¥</span>
                      <span className="text-sm font-medium">{item.price}</span>
                    </div>
                    <span className="text-gray-400 text-sm">×{item.quantity}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}