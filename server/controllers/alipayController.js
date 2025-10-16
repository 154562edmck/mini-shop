import { AlipaySdk } from 'alipay-sdk';
import { config } from '../config/config.js';
import { createResponse } from '../common/response.js';
import db from '../config/db.js';
import { alipaySdk } from '../config/config.js';
import axios from 'axios';

// 定义模板对应的官方链接映射
export const TEMPLATE_OFFICIAL_URLS = {
    1: "https://m.ctrip.com/html5/", // 携程
    2: "https://h5.waimai.meituan.com/waimai/mindex/home/", // 美团
    3: "https://m.jd.com/", // 京东
    4: "https://mobile.yangkeduo.com/", // 拼多多
    5: "https://common.diditaxi.com.cn/general/webEntry?h=1#/", // 滴滴
    6: "https://m.dewu.com/", // 得物
    7: "https://h5.ele.me/", // 饿了么
    8: "https://wx.10086.cn/website/personalHome/index", // 中国移动
    9: "https://m.fliggy.com/", // 飞猪
    10: "https://m.taobao.com/", // 淘宝
    11: "https://www.douyin.com/" // 抖音
};

// 定义模板标题映射
export const TEMPLATE_TITLES = {
    1: "携程代付",
    2: "美团代付",
    3: "京东代付",
    4: "拼多多代付",
    5: "滴滴代付",
    6: "得物代付",
    7: "饿了么代付",
    8: "猫眼代付",
    9: "飞猪代付",
    10: "淘宝代付",
    11: "抖音代付"
};

// 获取默认值（使用第一个模板的值）
const DEFAULT_QUIT_URL = TEMPLATE_OFFICIAL_URLS[1];
const DEFAULT_SUBJECT_PREFIX = TEMPLATE_TITLES[1];

// 获取支付参数
export const getPayParams = async (req, res) => {
    // 如果支付宝支付未初始化，返回错误
    if (!alipaySdk) {
        return res.status(500).json(
            createResponse(500, "error", null, "支付功能未初始化")
        );
    }

    const { order_no } = req.body;

    try {
        // 1. 查询订单信息
        const [orders] = await db.query(
            "SELECT * FROM `order` WHERE order_no = ? AND status = 0",
            [order_no]
        );

        // 更新订单支付方式为支付宝
        await db.query(
            "UPDATE `order` SET pay_method = 'alipay' WHERE order_no = ?",
            [order_no]
        );

        if (orders.length === 0) {
            return res.status(404).json(
                createResponse(404, "error", null, "订单不存在或已支付")
            );
        }

        const order = orders[0];

        // 获取模板ID和对应的跳转URL，默认使用第一个模板的值
        let quitUrl = DEFAULT_QUIT_URL;
        let subjectPrefix = DEFAULT_SUBJECT_PREFIX;

        if (order.share_code) {
            const templateId = parseInt(order.share_code.split('_')[0]);
            if (TEMPLATE_OFFICIAL_URLS[templateId]) {
                quitUrl = TEMPLATE_OFFICIAL_URLS[templateId];
            }
            if (TEMPLATE_TITLES[templateId]) {
                subjectPrefix = TEMPLATE_TITLES[templateId];
            }
        }

        // 定义下单接口配置
        const methods = {
            "wapPay": {
                "method": "alipay.trade.wap.pay",
                "format": "JSON",
                "charset": "utf-8",
                "sign_type": "RSA2",
                "notify_url": `${config.baseUrl}/v1/alipay/callback`,
                "desc": "手机网站支付"
            },
            "tradePrecreate": {
                "method": "alipay.trade.precreate",
                "format": "JSON",
                "charset": "utf-8",
                "sign_type": "RSA2",
                "notify_url": `${config.baseUrl}/v1/alipay/callback`,
                "desc": "当面付-扫码支付"
            }
        }

        // 根据支付方式构建不同的bizContent
        const getBizContent = (order, payType, quitUrl = '') => {
            const base = {
                out_trade_no: order.order_no,
                total_amount: order.total_amount.toString(),
                subject: `${subjectPrefix}-${order.order_no}`,
            };

            if (payType === 'wapPay') {
                return {
                    ...base,
                    product_code: 'QUICK_WAP_WAY',
                    quit_url: quitUrl
                };
            } else if (payType === 'tradePrecreate') {
                return {
                    ...base,
                    product_code: 'FACE_TO_FACE_PAYMENT'
                };
            }
        };

        const payMethod = config.ALIPAY_TRADE_PRECREATE_ENABLED ? methods.tradePrecreate.method : methods.wapPay.method;

        // 2. 调用支付宝统一下单
        const result = await alipaySdk.pageExec(payMethod, "GET", {
            method: 'GET',
            format: 'JSON',
            charset: 'utf-8',
            sign_type: 'RSA2',
            timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
            version: '1.0',
            notify_url: `${config.baseUrl}/v1/alipay/callback`,
            bizContent: getBizContent(order, config.ALIPAY_TRADE_PRECREATE_ENABLED ? 'tradePrecreate' : 'wapPay', quitUrl),
        });

        // 3. 根据支付方式处理返回结果
        if (config.ALIPAY_TRADE_PRECREATE_ENABLED) {
            try {
                // 请求支付宝返回的URL获取二维码链接
                const response = await axios.get(result);
                const data = response.data;

                if (data.alipay_trade_precreate_response &&
                    data.alipay_trade_precreate_response.code === '10000') {
                    return res.json(
                        createResponse(200, "success", {
                            payUrl: data.alipay_trade_precreate_response.qr_code
                        })
                    );
                } else {
                    throw new Error(data.alipay_trade_precreate_response?.msg || '获取二维码失败');
                }
            } catch (error) {
                console.error("处理预创建订单响应失败:", error);
                return res.status(500).json(
                    createResponse(500, "error", null, "获取支付二维码失败")
                );
            }
        } else {
            // wapPay模式直接返回支付链接
            return res.json(
                createResponse(200, "success", { payUrl: result })
            );
        }
    } catch (error) {
        console.error("获取支付参数失败:", error);
        return res.status(500).json(
            createResponse(500, "error", null, "获取支付参数失败")
        );
    }
};

// 处理支付回调
export const handlePayCallback = async (req, res) => {
    // 如果支付宝支付未初始化，返回错误
    if (!alipaySdk) {
        return res.status(200).json({
            code: "FAIL",
            message: "支付功能未初始化"
        });
    }

    try {
        console.log("====================================");
        console.log("handlePayCallback", req.body);
        console.log("====================================");

        const data = req.body;

        // 1. 验证签名
        const signValid = alipaySdk.checkNotifySign(data);
        if (!signValid) {
            console.log("====================================");
            console.log("签名验证失败", data);
            console.log("====================================");
            return res.status(200).json({ code: "FAIL", message: "签名验证失败" });
        }

        // 2. 验证支付状态
        if (data.trade_status === 'TRADE_SUCCESS') {
            console.log("====================================");
            console.log("支付成功", data);
            console.log("====================================");

            const { out_trade_no, trade_no, gmt_payment } = data;

            // 3. 更新订单状态
            await db.query(
                "UPDATE `order` SET status = 1, pay_time = ?, pay_method = 'alipay' WHERE order_no = ? AND status = 0",
                [gmt_payment, out_trade_no]
            );

            return res.status(200).json({ code: "SUCCESS", message: "支付成功" });
        }

        console.log("====================================");
        console.log("支付未成功", data);
        console.log("====================================");

        return res.status(200).json({ code: "FAIL", message: "支付未成功" });
    } catch (error) {
        console.error("处理支付回调失败:", error);
        console.log("====================================");
        console.log("处理支付回调失败", error);
        console.log("====================================");
        return res.status(200).json({ code: "FAIL", message: "处理支付回调失败" });
    }
};