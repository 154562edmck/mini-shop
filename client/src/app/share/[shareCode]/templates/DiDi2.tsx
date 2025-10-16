import React from 'react';
import { useEffect, useState } from "react";
import Image from 'next/image';
import { getOrderStatusDisplay } from "@/utils/orderStatus";
import { FaChevronLeft, FaChevronDown, FaPhoneAlt, FaInfoCircle, FaShieldAlt } from 'react-icons/fa';
import { basePath } from '@/config/config';
import { toast } from 'sonner';

interface Props {
  orderDetail: any;
  onPay: () => void;
  payMethod: string;
  redirectUrl?: string;
}

export default function DiDi2({ orderDetail, onPay, payMethod, redirectUrl = "https://common.diditaxi.com.cn/general/webEntry?h=1#/" }: Props) {
  // 获取商品信息
  const firstItem = orderDetail.items?.[0] || {};

  // 是否可以支付
  const canPay = orderDetail.status === 0;

  return (
    <div className="max-w-md mx-auto bg-gray-100 min-h-screen flex flex-col">
      {/* 顶部导航 - 移除阴影，增加渐变透明效果 */}
      <div className="bg-white px-4 py-4 flex items-center">
        <div className="flex items-center">
          <FaChevronLeft onClick={() => window.location.href = redirectUrl} className="text-black text-lg mr-3" />
          <h1 className="text-lg font-bold">
            {orderDetail.status === 0 ? "待支付" :
              orderDetail.status === 1 ? "已支付" : "已过期"}
          </h1>
        </div>
      </div>

      {/* 主卡片 */}
      <div className="rounded-none m-3 overflow-hidden">

        {/* 订单信息 */}
        <div className="bg-white rounded-xl shadow-sm px-3 border-gray-100 text-sm text-gray-500 object-fill"
          style={{
            backgroundImage: `url(${basePath}/images/didi/top_bg.png)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center right',
            backgroundRepeat: 'no-repeat',
            minHeight: '80px',  // 确保有足够高度显示背景
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
          <div className="flex items-center">
            <span className="inline-block w-2 h-2 rounded-full bg-gray-400 mr-2"></span>
            <span>{firstItem.spec_name || "商家"}</span>
          </div>

          <div className="flex items-center mt-2">
            <span className="inline-block w-2 h-2 rounded-full bg-gray-400 mr-2"></span>
            <span>前往 <span className="text-orange-500">{orderDetail.merchant_name}</span></span>
          </div>
        </div>

        {/* 司机卡片 */}
        <div className="bg-white rounded-xl shadow-sm mt-3 py-4 border-gray-100">
          {/* 顶部信息 - 保持水平flex布局 */}
          <div className="flex justify-between mb-4 mx-4 py-2">
            <div className="flex-1">
              <div className="flex items-center">
                {/* 截取前10个字符 */}
                <span className="font-bold line-clamp-1">{firstItem.product_name}</span>
              </div>

              <div className="flex items-center mt-1 text-sm">
                {/* {orderDetail.creator_nickname} */}
                <span className="text-gray-400">周师傅</span>
                <span className="text-yellow-500 ml-3">★</span>
                <span className="text-yellow-500">5.0</span>
                <span className="text-gray-400 ml-3">1w+</span>
                <span className="text-gray-400 ml-1">单</span>
              </div>
            </div>

            {/* 司机头像 */}
            <div className="ml-4 relative">
              {/* 汽车背景图 - 在头像左侧，z-index较低 */}
              <div className="absolute left-[-58px] top-[0px] z-0">
                <Image
                  src={`${basePath}/images/didi/top_car_bg.png`}
                  alt="汽车背景"
                  width={80}
                  height={80}
                  className="opacity-25" // 添加透明效果
                  style={{ filter: 'brightness(0.7)' }} // 添加黑色tint效果
                />
              </div>

              {/* 司机头像 */}
              <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden shadow-xl border-2 border-white relative z-10">
                <Image
                  // orderDetail.creator_avatar
                  src={`${basePath}/images/didi/head.png`}
                  alt="司机头像"
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* 分割线 */}
          <div className="h-[1px] bg-gray-100 my-2"></div>

          {/* 底部按钮 - 移到主布局外，占据整个卡片宽度 */}
          <div className="flex justify-between items-center mx-4">
            <div className="flex flex-col items-center flex-1">
              <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
                <span className="text-red-500 text-xs">110</span>
              </div>
              <span className="text-xs mt-1 text-gray-500">紧急</span>
            </div>

            <div className="flex flex-col items-center flex-1">
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                <FaPhoneAlt className="text-gray-500 text-xs" />
              </div>
              <span className="text-xs mt-1 text-gray-500">打电话</span>
            </div>

            <div className="flex flex-col items-center flex-1">
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                <FaInfoCircle className="text-gray-500 text-xs" />
              </div>
              <span className="text-xs mt-1 text-gray-500">商家帮助</span>
            </div>
          </div>
        </div>

        {/* 费用信息 */}
        <div className="bg-white rounded-xl shadow-sm mt-3 px-1 border-gray-100 mb-20">
          {/* 行程费用 */}
          <div className="p-4 flex justify-between items-center">
            <span className="text-black font-bold text-sm">行程费用</span>
            <div className="flex items-center">
              <span className="text-black font-semibold">{orderDetail.total_amount}元</span>
              <FaChevronDown className="ml-2 text-gray-400 text-xs" />
            </div>
          </div>

          {/* 分割线 */}
          <div className="h-[1px] bg-gray-100 mx-4"></div>

          {/* 优惠券 */}
          <div className="p-4 flex justify-between items-center">
            <span className="text-black font-bold text-sm">优惠券</span>
            <div className="flex items-center">
              <span className="text-gray-400 text-sm">无可用</span>
              <span className="ml-1 text-gray-400">›</span>
            </div>
          </div>

          {/* 分割线 */}
          <div className="h-[1px] bg-gray-100 mx-4"></div>
          {/* 折上折优惠 */}
          <div className="p-4 flex justify-between items-center">
            <span className="text-black font-bold text-sm">折上折优惠</span>
            <div className="flex items-center">
              <span className="text-white text-sm px-2 py-0.5 bg-orange-500 rounded-sm">暂无优惠</span>
              <span className="ml-1 text-gray-400">›</span>
            </div>
          </div>

          {/* 总金额 */}
          <div className="p-2 flex flex-col items-center">
            <div className="text-3xl font-bold mb-3 text-black">{orderDetail.total_amount} <span className="text-base">元</span></div>
            <p className="text-gray-500 text-sm text-center">
              您正在为好友代付车费,取消订单支付金额将原路退回。
            </p>
          </div>

          {/* 分割线 */}
          <div className="h-[1px] bg-gray-100 my-2"></div>

          {/* 支付方式 - 微信支付选项放在右侧，颜色改为橙色 */}
          <div className="p-4 mt-auto shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <img src={payMethod === "wechat" || payMethod === "easypay-wxpay" ? `${basePath}/images/wechat-pay.png` : `${basePath}/images/alipay-pay.png`} alt={payMethod === "wechat" || payMethod === "easypay-wxpay" ? "微信支付" : "支付宝支付"} className="w-5 h-5 mr-2" />
                <span>{payMethod === "wechat" || payMethod === "easypay-wxpay" ? "微信支付" : "支付宝支付"}</span>
              </div>
              <div className="w-5 h-5 rounded-full border border-[#ff6633] bg-[#ff6633] flex items-center justify-center opacity-50">
                <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 左下角安全卡片 */}
      <div className="fixed bottom-20 left-3 z-20 bg-blue-100 p-2 rounded-lg overflow-hidden">
        <Image
          src={`${basePath}/images/didi/safe.png`}
          alt="安全保障"
          onPause={() => {
            console.log("onPause");
            toast.info("安全保障");
          }}
          width={60}
          height={60}
          className="w-full h-full object-contain"
        />
      </div>

      {/* 底部支付按钮 - 改为圆角 */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-white shadow-[0_-2px_8px_rgba(0,0,0,0.05)]">
        <button
          onClick={canPay ? onPay : () => window.location.href = redirectUrl}
          className={`w-full h-[50px] text-white rounded-full text-[17px] font-normal ${canPay ? "bg-[#14346a]" : "bg-gray-300"
            }`}
        >
          {canPay
            ? `为好友支付${orderDetail.total_amount}元`
            : getOrderStatusDisplay(orderDetail.status, "didi").text}
        </button>
      </div>
    </div>
  );
}