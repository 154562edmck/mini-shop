import { basePath } from '@/config/config';
import { getOrderStatusDisplay } from '@/utils/orderStatus';
import React, { useState, useEffect } from 'react';

interface Props {
    orderDetail: any; // 订单详情
    onPay: () => void; // 支付按钮点击事件
    payMethod: string; // 支付方式
}

const MYPayment = ({ orderDetail, onPay, payMethod }: Props) => {
    // 计算倒计时
    const [countdown, setCountdown] = useState(0);
    const item = orderDetail.items?.[0] || {};
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

    // 格式化时间
    const formatTimeBlock = (value: number) => {
        return value.toString().padStart(2, '0');
    };

    // 处理按钮点击
    const handleButtonClick = () => {
        if (isActive) {
            onPay();
        } else {
            // 非活动状态跳转到猫眼网站
            window.location.href = 'https://www.maoyan.com';
        }
    };

    return (
        <div
            style={{
                width: "100vw",
                height: "100vh",
                background:
                    "linear-gradient(to bottom,rgba(255, 107, 129, 0.35), #f5f5f5, #f5f5f5 60%)",
                display: "flex",
                flexDirection: "column",
            }}
        >
            {/* header */}
            <div
                style={{
                    width: "100%",
                    flexDirection: "row",
                    padding: "16px",
                    // display: "flex",
                    display: "none",
                }}
            >
                <img
                    src={`${basePath}/icons/back.svg`}
                    style={{ width: "20px", height: "20px" }}
                    alt="返回"
                />
                <p
                    style={{
                        fontSize: "14px",
                        flex: 1,
                        display: "flex",
                        justifyContent: "center",
                        marginRight: "20px",
                    }}
                >
                    确认订单
                </p>
            </div>
            {/* body */}
            <div
                style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    overflowY: "scroll",
                    paddingTop: "6px",
                    paddingBottom: "6px",
                    paddingLeft: "12px",
                    paddingRight: "12px",
                }}
            >
                {isActive && <div
                    style={{
                        width: "100%",
                        height: "auto",
                        padding: "10px 0px",
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        marginTop: "4px",
                        background: "#ffffff",
                        borderRadius: "12px",
                    }}
                >
                    <img className={''}
                        style={{
                            width: "16px",
                            height: "16px",
                            opacity: 0.7,
                        }}
                        src={`${basePath}/icons/time.svg`}
                        alt="付款剩余时间"
                    />
                    <p style={{
                        fontSize: "14px", marginLeft: "6px",
                        opacity: 0.8,
                    }}>
                        等待您的付款 {formatTimeBlock(Math.floor(countdown / 3600))}:
                        {formatTimeBlock(Math.floor((countdown % 3600) / 60))}:
                        {formatTimeBlock(countdown % 60)} 后订单自动关闭
                    </p>
                </div>
                }
                <div
                    style={{
                        width: "100%",
                        height: "auto",
                        background: "#ffffff",
                        marginTop: "10px",
                        marginBottom: "10px",
                        borderRadius: "12px",
                        display: "flex",
                        padding: "10px 12px",
                        flexDirection: "column",
                    }}
                >
                    {/* 订单信息(电影) */}
                    <div
                        style={{
                            width: "100%",
                            height: "auto",
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        {/* 商品图片 */}
                        <div
                            style={{
                                width: "90px",
                                height: "110px",
                                display: "flex",
                                borderRadius: "5px",
                                overflow: "hidden",
                            }}
                        >
                            <img className={'rounded-xl border border-gray-200'}
                                src={item.product_image}
                                style={{
                                    flex: 1,
                                    objectFit: "cover",
                                }}
                                alt="商品图片"
                            />
                        </div>
                        {/* 商品信息 */}
                        <div className={'flex flex-col justify-between py-1'}
                            style={{
                                flex: 1,
                                marginLeft: "8px",
                            }}
                        >
                            <div>
                                <p className={'line-clamp-1'}
                                    style={{
                                        fontSize: "16px",
                                        fontWeight: "550",
                                    }}
                                >
                                    {item.product_name}
                                </p>
                                <p
                                    style={{
                                        fontSize: "12px",
                                        color: "#383737",
                                        fontWeight: "400",
                                        marginTop: "2px",
                                    }}
                                >
                                    {item.merchant_name}
                                </p>
                            </div>
                            <div className={'flex flex-col mt-3'}>
                                <p
                                    style={{
                                        fontSize: "12px",
                                        color: "#8a8886",
                                        fontWeight: "400",
                                    }}
                                >
                                    {item.spec_name}
                                </p>
                                <p
                                    style={{
                                        fontSize: "12px",
                                        color: "#8a8886",
                                        fontWeight: "400",
                                        marginTop: "2px",
                                    }}
                                >
                                    {item.quantity}张
                                </p>
                            </div>
                        </div>
                    </div>
                    {/* 分割线 */}
                    <div
                        style={{
                            width: "100%",
                            height: "1px",
                            background: "#f5f5f5",
                            marginTop: "8px",
                            marginBottom: "8px",
                        }}
                    ></div>
                    {/* 退票/改签 */}
                    <div
                        style={{
                            width: "100%",
                            height: "autp",
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "6px 2px",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                fontSize: "12px",
                            }}
                        >
                            <img
                                style={{
                                    width: "18px",
                                    height: "18px",
                                }}
                                src={`${basePath}/icons/error.svg`}
                                alt="不支持退票"
                            />
                            <p
                                style={{
                                    marginLeft: "2px",
                                }}
                            >
                                不支持退票
                            </p>
                            <img
                                style={{
                                    width: "18px",
                                    height: "18px",
                                    marginLeft: "16px",
                                }}
                                src={`${basePath}/icons/success.svg`}
                                alt="不支持退票"
                            />
                            <p
                                style={{
                                    marginLeft: "2px",
                                }}
                            >
                                限时改签
                            </p>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                            }}
                        >
                            <p
                                style={{
                                    fontSize: "12px",
                                    color: "#8a8886",
                                }}
                            >
                                查看详情
                            </p>
                            <img
                                style={{
                                    width: "18px",
                                    height: "18px",
                                    marginLeft: "1px",
                                }}
                                src={`${basePath}/icons/forward.svg`}
                                alt="查看详情"
                            />
                        </div>
                    </div>
                </div>
                <div
                    style={{
                        width: "100%",
                        height: "auto",
                        background: "#ffffff",
                        marginTop: "6px",
                        borderRadius: "12px",
                        display: "flex",
                        marginBottom: "10px",
                        flexDirection: "column",
                        padding: "10px 12px",
                    }}
                >
                    <p
                        style={{
                            fontSize: "16px",
                            fontWeight: "550",
                            marginBottom: "6px",
                        }}
                    >
                        订单优惠
                    </p>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginTop: "6px",
                            marginBottom: "6px",
                        }}
                    >
                        <p
                            style={{
                                fontSize: "12px",
                            }}
                        >
                            影票活动与优惠卷
                        </p>
                        <p
                            style={{
                                fontSize: "12px",
                                color: "#8a8886",
                            }}
                        >
                            无可用
                        </p>
                    </div>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginTop: "6px",
                            marginBottom: "6px",
                        }}
                    >
                        <p
                            style={{
                                fontSize: "12px",
                            }}
                        >
                            猫享卡
                        </p>
                        <p
                            style={{
                                fontSize: "12px",
                                color: "#8a8886",
                            }}
                        >
                            无可用
                        </p>
                    </div>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginTop: "6px",
                            marginBottom: "6px",
                        }}
                    >
                        <p
                            style={{
                                fontSize: "12px",
                            }}
                        >
                            观影卡
                        </p>
                        <p
                            style={{
                                fontSize: "12px",
                                color: "#8a8886",
                            }}
                        >
                            无可用
                        </p>
                    </div>
                </div>
                <div
                    style={{
                        width: "100%",
                        height: "auto",
                        background: "#ffffff",
                        marginTop: "6px",
                        borderRadius: "12px",
                        display: "flex",
                        marginBottom: "10px",
                        flexDirection: "column",
                        padding: "10px 12px",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                        }}
                    >
                        <p
                            style={{
                                fontSize: "16px",
                                fontWeight: "550",
                            }}
                        >
                            手机号
                        </p>
                        <p
                            style={{
                                fontSize: "16px",
                                fontWeight: "550",
                            }}
                        >
                            {orderDetail.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}
                        </p>
                    </div>
                    <p
                        style={{
                            fontSize: "12px",
                            color: "#8a8886",
                            marginTop: "6px",
                        }}
                    >
                        手机号仅用于生成订单,取票码不再以短信发送
                    </p>
                </div>
                <div
                    style={{
                        width: "100%",
                        height: "auto",
                        background: "#ffffff",
                        marginTop: "6px",
                        borderRadius: "12px",
                        marginBottom: "10px",
                        display: "flex",
                        flexDirection: "column",
                        padding: "10px 12px",
                    }}
                >
                    <p
                        style={{
                            fontSize: "16px",
                            fontWeight: "550",
                        }}
                    >
                        购票须知
                    </p>
                    <p
                        style={{
                            fontSize: "12px",
                            marginTop: "6px",
                            color: "#000000bc",
                        }}
                    >
                        1.请提前30分钟左右到达影院现场，通过影院自助取票机完成取
                        票。
                    </p>
                    <p
                        style={{
                            fontSize: "12px",
                            marginTop: "6px",
                            color: "#000000bc",
                        }}
                    >
                        2.若取票过程中遇到无法取票等其它问题，请联系影院工作人员进行处理。
                    </p>
                    <p
                        style={{
                            fontSize: "12px",
                            marginTop: "6px",
                            color: "#000000bc",
                        }}
                    >
                        3.请及时关注电影开场时间，凭票有序检票入场。
                    </p>
                    <p
                        style={{
                            fontSize: "12px",
                            marginTop: "6px",
                            color: "#000000bc",
                        }}
                    >
                        4.如需开具电影票发票，可联系影院工作人员凭当日票根进行开具，若遇到特殊情况请及时联系猫眼客服人员。
                    </p>
                    <p
                        style={{
                            fontSize: "12px",
                            marginTop: "6px",
                            color: "#000000bc",
                        }}
                    >
                        5.退票、改签服务请参考影院具体政策要求，特殊场次及部分使用卡、券场次订单可能不支持此服务。
                    </p>
                </div>
            </div>
            {/* fotter */}
            <div
                style={{
                    width: "100%",
                    height: "auto",
                    background: "#ffffff",
                    padding: "12px 28px",
                    boxShadow: "0px -1px 2px rgba(0, 0, 0, 0.01)",
                    display: "flex",
                    flexDirection: "row",
                }}
            >
                <div className={'flex'}
                    style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "start",
                        color: "#e74c3c",
                        fontWeight: "bold",
                    }}
                >
                    <div className={'flex items-baseline'}>
                        <p
                            style={{
                                fontSize: "12px",
                            }}
                        >
                            ￥
                        </p>
                        <p
                            style={{
                                fontSize: "20px",
                            }}
                        >
                            {Number(orderDetail.total_amount).toFixed(2)}
                        </p>
                    </div>
                    <div className={'text-black/80 text-xs mt-1 font-extralight'}>
                        {getOrderStatusDisplay(orderDetail.status, 'my').text}
                    </div>
                </div>
                <button className={'font-bold'}
                    style={{
                        width: "auto",
                        height: "44px",
                        background: isActive ? "#e8311c" : "#999999",
                        border: "none",
                        padding: "0px 40px",
                        fontSize: "14px",
                        color: "#ffffff",
                        borderRadius: "35px",
                        cursor: isActive ? "pointer" : "default",
                    }}
                    onClick={handleButtonClick}
                >
                    {isActive ? "确认支付" : "查看详情"}
                </button>
            </div>
        </div >
    );
};

export default MYPayment;