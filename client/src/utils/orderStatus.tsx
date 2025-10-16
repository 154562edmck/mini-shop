import React from 'react';
import { FaCheckCircle, FaTimesCircle, FaTruck, FaClock } from 'react-icons/fa';
import Image from 'next/image';
import { basePath, showToastMessages } from '@/config/config';
interface StatusDisplay {
    text: string;
    icon?: React.ReactNode;
    color?: string;
}

export const SHOW_TOAST_MESSAGES = showToastMessages; // 控制是否显示提示信息

export const getOrderStatusDisplay = (status: number, template: 'meituan' | 'ctrip' | 'jd' | 'pdd' | 'didi' | 'fz' | 'dw' | 'elm' | 'my' | 'tb' | 'dy' = 'meituan'): StatusDisplay => {
    const statusMap = {
        meituan: {
            0: {
                text: "需付款"
            },
            1: {
                text: "来迟了，美团用户已付款",
                icon: <FaCheckCircle color="#FFC300" className="w-5 h-5" />,
                color: "text-gray-900"
            },
            2: {
                text: "订单已过期"
            }
        },
        ctrip: {
            0: {
                text: "需付款"
            },
            1: {
                text: "来迟了，代付已付款"
            },
            2: {
                text: "订单已过期"
            }
        },
        jd: {
            0: {
                text: "需付款"
            },
            1: {
                text: "来迟了，代付已付款"
            },
            2: {
                text: "订单已过期"
            }
        },
        pdd: {
            0: {
                text: "需付款"
            },
            1: {
                text: "查看订单列表",
            },
            2: {
                text: "订单已过期"
            }
        },
        didi: {
            0: {
                text: "需付款"
            },
            1: {
                text: "来迟了，代付已付款"
            },
            2: {
                text: "订单已过期"
            }
        },
        dw: {
            0: {
                text: "订单未支付"
            },
            1: {
                text: "订单已完成",
                color: "text-gray-500"
            },
            2: {
                text: "订单已过期",
                color: "text-gray-500"
            }
        },
        elm: {
            0: {
                text: "订单未支付"
            },
            1: {
                text: "订单已完成",
                color: "text-gray-500"
            },
            2: {
                text: "订单已过期",
                color: "text-gray-500"
            }
        },
        my: {
            0: {
                text: "订单未支付"
            },
            1: {
                text: "订单已完成",
                color: "text-gray-500"
            },
            2: {
                text: "订单已过期",
                color: "text-gray-500"
            }
        },
        fz: {
            0: {
                text: "订单未支付"
            },
            1: {
                text: "订单已完成",
                color: "text-gray-500"
            },
            2: {
                text: "订单已过期",
                color: "text-gray-500"
            }
        },
        tb: {
            0: {
                text: "订单未支付"
            },
            1: {
                text: "订单已完成",
                color: "text-gray-500"
            },
            2: {
                text: "订单已过期",
                color: "text-gray-500"
            }
        },
        dy: {
            0: {
                text: "订单未支付"
            },
            1: {
                text: "订单已完成",
                color: "text-gray-500"
            },
            2: {
                text: "订单已过期",
                color: "text-gray-500"
            }
        }
    };

    return statusMap[template]?.[status] || { text: "订单已过期" };
};

// 渲染状态的组件
export const OrderStatusDisplay = ({ status, template }: { status: number; template: 'meituan' | 'ctrip' | 'jd' | 'pdd' | 'didi' | 'fz' | 'dw' | 'elm' | 'my' | 'tb' | 'dy' }) => {
    const statusInfo = getOrderStatusDisplay(status, template);

    return (
        <div className="flex items-center justify-center gap-2">
            {statusInfo.icon}
            <span className={statusInfo.color || "text-gray-900"}>
                {statusInfo.text}
            </span>
        </div>
    );
};

// 获取订单状态的图标
export const getOrderStatusIcon = (status: number): React.ReactNode => {
    const statusMap = {
        0: <Image
            className='-mt-4'
            src={`${basePath}/png/pay_close.png`}
            alt="ctrip"
            width={60}
            height={60}
            style={{ filter: 'grayscale(80%) brightness(1.2) opacity(0.9)' }}
        />,
        1: <Image
            className='-mt-4'
            src={`${basePath}/png/pay_ed.png`}
            alt="ctrip"
            width={60}
            height={60}
            style={{ filter: 'grayscale(80%) brightness(1.2) opacity(0.9)' }}
        />,
        2: <Image
            className='-mt-4'
            src={`${basePath}/png/pay_ex.png`}
            alt="ctrip"
            width={60}
            height={60}
            style={{ filter: 'grayscale(80%) brightness(1.2) opacity(0.9)' }}
        />
    };
    return statusMap[status];
};
