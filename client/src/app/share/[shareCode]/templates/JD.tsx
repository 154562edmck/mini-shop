import React, { useState, useEffect } from 'react';
import { FaWeixin, FaDog } from 'react-icons/fa';
import { BsCheck } from 'react-icons/bs';
import { getOrderStatusIcon } from '@/utils/orderStatus';
import { basePath } from '@/config/config';
interface Props {
  orderDetail: any;
  onPay: () => void;
  payMethod: string;
}
const JDPayment = ({ orderDetail, onPay, payMethod }: Props) => {
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

  const formatTimeBlock = (value) => {
    return value.toString().padStart(2, '0');
  };

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  return (
    <div className="max-w-md mx-auto bg-gray-100 min-h-screen px-0 py-0">
      {/* 聊天区域 */}
      <div style={{ height: '33.86667vw', backgroundImage: `url(${basePath}/images/jdBack.png)`, backgroundSize: '100vw 33.86667vw' }} className="relative">
        <div className="relative z-10 h-full flex items-center px-5 pb-3">
          <img
            src={orderDetail.creator_avatar}

            alt="avatar"
            style={{
              border: '1px solid #fff',
              borderRadius: '50%',
              height: '16.13333vw',
              left: '4.53333vw',
              position: 'absolute',
              top: '7.2vw',
              width: '16.13333vw',
            }}
          />

          <span style={{
            color: '#1a1a1a',
            fontFamily: 'PingFangSC-Regular',
            fontSize: '3.73333vw',
            left: '28vw',
            lineHeight: '4.66667vw',
            position: 'absolute',
            top: '11.33333vw',
            width: '60vw', // 添加宽度限制
            whiteSpace: 'pre-line' // 允许换行
          }}>
            我在京东上挑好了商品，是时候该你<br></br>仗义疏财啦，快帮我付个款吧～
          </span>
        </div>
      </div>

      {/* 支付金额区域 */}
      <div className="bg-white rounded-2xl p-4 mb-4 -mt-4 relative z-99">
        <div className="mb-4 flex justify-between items-center">
          <div className="text-gray-600">
            代付金额
          </div>
          <div className='flex justify-center items-center'>
            {orderDetail.status !== 0 && <div className='mr-2 -mt-4'>{getOrderStatusIcon(orderDetail.status)}</div>}
            <div className="text-gray-600 text-sm">
              收货人：{'*'.repeat(orderDetail.receiver.length - 1) + orderDetail.receiver.slice(-1)}
            </div>
          </div>
        </div>
        <div className="text-sm text-gray-500 flex justify-between items-center">
          <>
            <div className={`${orderDetail.status === 0 ? "text-[#FF4D4F]" : "text-gray-500"} text-2xl font-semibold`}>¥{orderDetail.total_amount}</div>
            <div className='flex justify-center items-end'>
              <span>剩余支付时间</span>
              <div className="flex items-center ml-2">

                <span className="inline-block min-w-[20px] text-xs text-center bg-white text-gray-900 px-0.5 py-0 rounded border border-gray-400">
                  {formatTimeBlock(Math.floor(countdown / 3600))}
                </span>
                <span className="mx-1">:</span>
                <span className="inline-block min-w-[20px] text-xs text-center bg-white text-gray-900 px-0.5 py-0 rounded border border-gray-400">
                  {formatTimeBlock(Math.floor((countdown % 3600) / 60))}
                </span>
                <span className="mx-1">:</span>
                <span className="inline-block min-w-[20px] text-xs text-center bg-white text-gray-900 px-0.5 py-0 rounded border border-gray-400">
                  {formatTimeBlock(countdown % 60)}
                </span>
              </div>
            </div>
          </>
        </div>
      </div>

      {/* 支付方式 - 仅在待支付状态显示 */}
      {orderDetail.status === 0 && (
        <div className="bg-white py-4 rounded-2xl">
          <div className="px-4 text-[15px] text-gray-900 mb-4">支付方式</div>
          <div className="flex items-center justify-between px-4 mb-4">
            <div className="flex items-center gap-3">
              <img
                src={payMethod === "wechat" || payMethod === "easypay-wxpay" ? `${basePath}/images/wechat-pay.png` : `${basePath}/images/alipay-pay.png`}
                alt={payMethod === "wechat" || payMethod === "easypay-wxpay" ? "WeChat Pay" : "Alipay Pay"}
                className="w-[28px] h-[28px]"
              />
              <span className="text-[15px] text-gray-900">
                {payMethod === "wechat" || payMethod === "easypay-wxpay" ? "微信支付" : "支付宝支付"}
              </span>
            </div>
            <img
              src={`${basePath}/images/check-circle.png`}
              alt="selected"
              className="w-[20px] h-[20px]"
            />
          </div>
          <div className="px-4">
            <button
              onClick={orderDetail.status === 0 ? onPay : () => window.location.href = "https://m.jd.com"}
              className={`w-full h-[40px] text-[15px] flex items-center justify-center rounded-[22px] ${orderDetail.status === 0
                ? "bg-gradient-to-r from-[#ff0000] to-[#ff4949] text-white"
                : "bg-gray-200 text-gray-600"
                }`}
            >
              {orderDetail.status === 0 ? "立即支付" : "去京东逛逛"}
            </button>
          </div>
        </div>
      )}

      {/* 代付订单信息 */}
      <div className="bg-white py-4 rounded-2xl mt-4">
        <div className="px-4 text-[15px] text-gray-900 mb-3">代付订单信息</div>
        {orderDetail.items.map((item, index) => (
          <div key={index} className="px-5 flex gap-4 mb-5 last:mb-0">
            <img
              src={item.product_image}
              alt={item.product_name}
              className="w-[78px] h-[78px] object-cover rounded"
            />
            <div className="min-w-0 flex flex-col justify-between py-1">
              <div className="text-sm leading-[1.4] text-black line-clamp-2">
                {item.product_name}
                {item.spec_name && (
                  <span className="text-black"> {item.spec_name}</span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-gray-900 font-medium text-lg">
                  <span className='text-xs'>¥</span>{item.price}
                </span>
                <span className="text-xs text-gray-500">数量：{item.quantity}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JDPayment;