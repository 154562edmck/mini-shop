import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { basePath } from '@/config/config';

interface Props {
    orderDetail: any;
    onPay: () => void;
    payMethod: string;
}

const DWPayment = ({ orderDetail, onPay, payMethod }: Props) => {
    const [countdown, setCountdown] = useState(0);

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

    const formatTime = (seconds: number) => {
        return seconds.toString().padStart(2, '0');
    };

    return (
        <div className="max-w-md mx-auto bg-white min-h-screen" style={{
            margin: 0,
            padding: 0,
            'WebkitTapHighlightColor': 'transparent',
            'WebkitTextSizeAdjust': 'none',
            'WebkitFontSmoothing': 'antialiased',
            'WebkitBoxSizing': 'border-box',
            'boxSizing': 'border-box',
            'fontWeight': '400',
        }}>
            <div style={{
                'background': `url(${basePath}/images/dw/dw-bg.png) no-repeat`,
                'padding': '6.4vw 5.333vw',
                'position': 'relative',
                'height': '34.667vw',
                'WebkitBoxSizing': 'border-box',
                'boxSizing': 'border-box',
                'backgroundSize': 'contain'
            }}>
                <Image
                    src={`${basePath}/images/dw/dw-top.png`}
                    alt="Top Background"
                    width={720}
                    height={300}
                    style={{
                        width: '72vw',
                        height: 'auto',
                        content: "viewport-units-buggyfill; width: 72vw",
                    }}
                    className="text2"
                    quality={100}
                    priority
                />
                <Image
                    src={`${basePath}/images/dw/dw-top-2.png`}
                    alt="Bar"
                    width={946}
                    height={300}
                    style={{
                        width: '94.667vw',
                        position: 'absolute',
                        left: '2.667vw',
                        bottom: '5.333vw',
                        height: 'auto'
                    }}
                    className="bar"
                    quality={100}
                    priority
                />
            </div>
            <div className="box" style={{
                background: '#fff',
                'WebkitBoxShadow': '0 -.533vw 3.2vw 0 rgba(26, 26, 26, .05), 0 1.6vw 3.2vw 0 rgba(26, 26, 26, .05)',
                'boxShadow': '0 -.533vw 3.2vw 0 rgba(26, 26, 26, .05), 0 1.6vw 3.2vw 0 rgba(26, 26, 26, .05)',
                'borderRadius': '0',
                'marginLeft': '4.267vw',
                'marginRight': '4.267vw',
                'WebkitTransform': 'translateY(-8vw)',
                'transform': 'translateY(-8vw)',
            }}>
                <p style={{
                    height: '6.4vw',
                    'borderBottom': '1px dashed #eee',
                    'background': `url(${basePath}/images/dw/dw-top-3.png) no-repeat`,
                    'backgroundSize': 'contain'
                }}></p>
                <div style={{
                    'background': `url(${basePath}/images/dw/dw-buttom.png) no-repeat`,
                    'backgroundSize': '100% auto',
                    'backgroundPosition': `0 calc(100% + 4vw)`,
                    'imageRendering': '-webkit-optimize-contrast',
                    'WebkitBackfaceVisibility': 'hidden',
                    'backfaceVisibility': 'hidden',
                    'WebkitTransform': 'translateZ(0)',
                    'transform': 'translateZ(0)',
                }}>
                    <p style={{
                        color: '#000',
                        'fontSize': '4.267vw',
                        'fontFamily': 'PingFangSC-Regular',
                        'fontWeight': '400',
                        'textAlign': 'center',
                        'letterSpacing': '0',
                        'lineHeight': '5.333vw',
                        'marginTop': '5.333vw',
                    }}>付款金额</p>
                    <p style={{
                        color: 'rgba(0, 0, 0, .9)',
                        'fontSize': '11.733vw',
                        'lineHeight': '14.4vw',
                        'textAlign': 'center',
                        'marginBottom': '1.6vw',
                    }}>
                        <span style={{
                            'fontSize': '8.267vw',
                            'height': '10.4vw',
                            'lineHeight': '10.4vw',
                        }}>¥</span>
                        <span style={{
                            'fontFamily': 'PingFangSC-Bold',
                            'fontWeight': 'bold',
                        }}>{orderDetail.total_amount}</span>
                    </p>
                    <div className='flex justify-center items-end'>
                        <span className='text-[#7f7f8e] font-normal text-base'>剩余支付时间</span>
                        {orderDetail.status === 0 && (
                            <div className="flex items-center ml-2">
                                <span className="inline-block min-w-[20px] text-xs text-center font-bold bg-white text-black px-0.5 py-0 rounded-none border border-gray-400">
                                    {formatTime(Math.floor((countdown % 3600) / 60)).padStart(2, '0')}
                                </span>
                                <span className="mx-1">:</span>
                                <span className="inline-block min-w-[20px] text-xs text-center font-bold bg-white text-black px-0.5 py-0 rounded-none border border-gray-400">
                                    {formatTime(countdown % 60).padStart(2, '0')}
                                </span>
                            </div>
                        )}
                    </div>
                    <div style={{
                        'borderTop': '.5px solid #f1f1f5',
                        'marginTop': '5.333vw',
                        'padding': '5.067vw 4.267vw 4.267vw',
                    }}>
                        <div style={{
                            'lineHeight': '5.333vw',
                            'color': '#14151a',
                            'fontSize': '3.733vw',
                            'fontFamily': 'PingFangSC-Regular',
                            'fontWeight': '400',
                            'overflow': 'hidden',
                        }}>
                            <span style={{
                                'lineHeight': '5.333vw',
                                'color': '#14151a',
                                'fontSize': '3.733vw',
                                'fontFamily': 'PingFangSC-Regular',
                                'fontWeight': '400',
                            }}>付款商品</span>
                            <span style={{
                                'lineHeight': '5.333vw',
                                'color': '#14151a',
                                'fontSize': '3.733vw',
                                'fontFamily': 'PingFangSC-Regular',
                                'fontWeight': '400',
                                'float': 'right',
                            }}>收货人：**{orderDetail.receiver.slice(-1)}</span>
                        </div>
                        <div style={{
                            'display': 'flex',
                            'marginTop': '5.333vw',
                        }}>
                            <div style={{
                                'width': '21.333vw',
                                'height': '21.208vw',
                                'background': '#fff',
                                'border': '.5px solid rgba(0, 0, 0, .03)',
                                'borderRadius': '0',
                                'display': 'flex',
                                'justifyContent': 'center',
                                'alignItems': 'center',
                            }}>
                                <Image
                                    src={orderDetail.items[0].product_image}
                                    alt={orderDetail.items[0].product_name}
                                    style={{
                                        width: '97%',
                                        height: 'auto',
                                    }}
                                    width={100}
                                    height={100}
                                    className="img"
                                />
                            </div>
                            <div style={{
                                'paddingLeft': '3.733vw',
                                'WebkitBoxFlex': '1',
                                'WebkitFlex': '1',
                                'msFlex': '1',
                                'flex': '1'
                            }}>
                                <p style={{
                                    color: 'rgba(0, 0, 0, .9)',
                                    'fontSize': '3.733vw',
                                    'lineHeight': '4.8vw',
                                    'fontFamily': 'PingFangSC-Light',
                                    'fontWeight': '300',
                                    'marginTop': '.8vw',
                                    'height': '9.6vw',
                                    'display': '-webkit-box',
                                    'WebkitLineClamp': '2',
                                    'lineClamp': '2',
                                    'overflow': 'hidden',
                                }}>{orderDetail.items[0].product_name}</p>
                                <p style={{
                                    color: 'rgba(0, 0, 0, .9)',
                                    'fontSize': '3.733vw',
                                    'lineHeight': '4.8vw',
                                    'fontFamily': 'PingFangSC-Regular',
                                    'fontWeight': '400',
                                    'textTransform': 'uppercase',
                                    'marginTop': '4.533vw',
                                }}>{orderDetail.items[0].spec_name} 数量×{orderDetail.items[0].quantity}</p>
                            </div>
                        </div>
                    </div>
                    <div style={{
                        'padding': '0 4.267vw',
                    }}>
                        <button
                            onClick={orderDetail.status === 0 ? onPay : () => window.location.href = "https://h5.dewu.com"}
                            className={`w-full mt-4 py-2 rounded-md text-white ${orderDetail.status === 0 ? "bg-[#0ab7b8]" : "bg-gray-300"}`}
                            style={{
                                'height': '11.635vw',
                                'background': orderDetail.status === 0 ? '#01c2c3' : '#ccc',
                                'padding': '2.933vw',
                                'lineHeight': '5.867vw',
                                'color': '#fff',
                                'fontSize': '4.267vw',
                                'fontFamily': 'PingFangSC-Medium',
                                'fontWeight': '500',
                                'marginTop': '5.333vw',
                                'width': '100%',
                            }}
                        >
                            豪爽支付
                        </button>
                        <div style={{
                            'lineHeight': '4.496vw',
                            'color': '#7f7f8e',
                            'fontSize': '3.2vw',
                            'fontFamily': 'PingFangSC-Regular',
                            'fontWeight': '400',
                            'marginTop': '7.2vw',
                        }}>
                            <p style={{
                                'fontWeight': '800',
                                'marginBottom': '2.133vw',
                                'padding': '0 4.267vw',
                                'color': '#7f7f8e',
                            }}>付款说明：</p>
                            <div style={{
                                'padding': '0 4.267vw',
                            }}>
                                <p style={{
                                    'marginBottom': '2.133vw',
                                }}>1.付款前请务必和好友进行确认，避免给你造成资金损失。</p>
                                <p style={{
                                    'marginBottom': '2.133vw',
                                }}>2.如果订单发生退款，钱将退还到你的微信支付账户中。</p>
                            </div>
                        </div>
                    </div>
                    <div style={{
                        'height': '4vw',
                    }}></div>
                </div>
                {orderDetail.status !== 0 && (
                    <Image
                        src={`${orderDetail.status === 1 ? `${basePath}/images/dw/dewu_end.png` : `${basePath}/images/dw/dw-cancel.png`}`}
                        alt="Bottom Background"
                        width={26.667}
                        height={4}
                        className="text2"
                        style={{
                            position: 'absolute',
                            top: '.8vw',
                            right: 0,
                            width: '26.667vw',
                        }}
                    />
                )}
            </div>
        </div >
    );
};

export default DWPayment;