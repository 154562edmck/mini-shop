import { config } from '../config/config.js';
import { createResponse } from '../common/response.js';
import db from '../config/db.js';
import crypto from 'crypto';
import { TEMPLATE_OFFICIAL_URLS, TEMPLATE_TITLES } from './alipayController.js';
import Easypay from 'easypay-node-sdk';
import { easyPaySdk } from '../config/config.js';


// 获取默认值
const DEFAULT_QUIT_URL = TEMPLATE_OFFICIAL_URLS[1];
const DEFAULT_SUBJECT_PREFIX = TEMPLATE_TITLES[1];

// 获取支付参数 --- MD5
export const getPayParamsMD5 = async (req, res) => {
    const { order_no, pay_type = 'wxpay', method = 'submit' } = req.body; // 添加 method 参数，默认值为 'submit'

    try {
        // 1. 查询订单信息
        const [orders] = await db.query(
            "SELECT * FROM `order` WHERE order_no = ? AND status = 0",
            [order_no]
        );

        let payType;
        switch (pay_type) {
            case 'wxpay':
                payType = 'easypay-wxpay';
                break;
            case 'alipay':
                payType = 'easypay-alipay';
                break;
            case 'qqpay':
                payType = 'easypay-qqpay';
                break;
            default:
                payType = 'easypay-wxpay';
        }

        await db.query(
            "UPDATE `order` SET pay_method = ? WHERE order_no = ?",
            [payType, order_no]
        );

        if (orders.length === 0) {
            return res.status(404).json(
                createResponse(404, "error", null, "订单不存在或已支付")
            );
        }

        const order = orders[0];

        // 获取模板ID和对应的跳转URL
        let returnUrl = DEFAULT_QUIT_URL;
        let subjectPrefix = DEFAULT_SUBJECT_PREFIX;

        if (order.share_code) {
            const templateId = parseInt(order.share_code.split('_')[0]);
            if (TEMPLATE_OFFICIAL_URLS[templateId]) {
                returnUrl = TEMPLATE_OFFICIAL_URLS[templateId];
            }
            if (TEMPLATE_TITLES[templateId]) {
                subjectPrefix = TEMPLATE_TITLES[templateId];
            }
        }

        // 2. 构建请求参数
        const params = {
            pid: config.easypay.pid, // 商户ID
            type: pay_type,
            out_trade_no: order.order_no,
            notify_url: `${config.baseUrl}/v1/easypay/callback`,
            return_url: returnUrl,
            name: `${subjectPrefix}-${order.order_no}`,
            money: parseFloat(order.total_amount).toFixed(2), // 确保金额格式正确
            param: '',
            timestamp: Math.floor(Date.now() / 1000), // 当前时间戳
            sitename: subjectPrefix
        };

        console.log("------params------");
        console.log(params);
        console.log("------params------");

        // 3. 生成待签名字符串
        const signString = getSignContent(params);

        // 4. 使用商户私钥生成RSA签名
        const sign = generateMD5Sign(signString, config.easypay.key);

        // 5. 根据 method 参数决定使用 submit 还是 create
        let payUrl;
        if (method === 'create') {
            // 创建订单请求
            const createParams = {
                ...params,
                method: 'web', // 接口类型
                clientip: req.ip || '127.0.0.1', // 用户IP地址
            };

            // 发送 POST 请求到创建订单接口
            const response = await fetch(`${config.easypay.domain}/create.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    ...createParams,
                    sign,
                    sign_type: 'MD5',
                }).toString(),
            });

            const responseData = await response.json();

            if (response.ok && responseData.code === 0) {
                // 返回创建后的支付信息
                return res.json(createResponse(200, "success", responseData));
            } else {
                return res.status(response.status).json(createResponse(response.status, "error", null, responseData.msg));
            }
        } else {
            // 构建支付链接
            payUrl = `${config.easypay.domain}/submit.php?${new URLSearchParams({
                ...params,
                sign,
                sign_type: 'MD5',
            }).toString()}`;

            // 返回支付链接
            return res.json(createResponse(200, "success", { payUrl }));
        }
    } catch (error) {
        console.error("获取支付参数失败:", error);
        return res.status(500).json(
            createResponse(500, "error", null, "获取支付参数失败")
        );
    }
}


// 获取支付参数 --- RSA
export const getPayParams = async (req, res) => {
    // 如果易支付未初始化，返回错误
    if (!easyPaySdk) {
        return res.status(500).json(
            createResponse(500, "error", null, "支付功能未初始化")
        );
    }
    const { order_no, pay_type = 'wxpay', method = 'submit' } = req.body; // 添加 method 参数，默认值为 'submit'

    try {
        // 1. 查询订单信息
        const [orders] = await db.query(
            "SELECT * FROM `order` WHERE order_no = ? AND status = 0",
            [order_no]
        );

        if (orders.length === 0) {
            return res.status(404).json(
                createResponse(404, "error", null, "订单不存在或已支付")
            );
        }

        const order = orders[0];

        // 获取模板ID和对应的跳转URL
        let returnUrl = DEFAULT_QUIT_URL;
        let subjectPrefix = DEFAULT_SUBJECT_PREFIX;

        if (order.share_code) {
            const templateId = parseInt(order.share_code.split('_')[0]);
            if (TEMPLATE_OFFICIAL_URLS[templateId]) {
                returnUrl = TEMPLATE_OFFICIAL_URLS[templateId];
            }
            if (TEMPLATE_TITLES[templateId]) {
                subjectPrefix = TEMPLATE_TITLES[templateId];
            }
        }

        // 2. 构建请求参数
        const params = {
            pid: config.easypay.pid, // 商户ID
            type: pay_type,
            out_trade_no: order.order_no,
            notify_url: `${config.baseUrl}/v1/easypay/callback`,
            return_url: returnUrl,
            name: `${subjectPrefix}-${order.order_no}`,
            money: parseFloat(order.total_amount).toFixed(2), // 确保金额格式正确
            param: '',
            timestamp: Math.floor(Date.now() / 1000), // 当前时间戳
        };

        // 3. 生成待签名字符串
        const signString = getSignContent(params);

        // 4. 使用商户私钥生成RSA签名
        const sign = generateRSASign(signString, config.easypay.privateKey);

        // 5. 根据 method 参数决定使用 submit 还是 create
        let payUrl;
        if (method === 'create') {
            // 创建订单请求
            const createParams = {
                ...params,
                method: 'web', // 接口类型
                clientip: req.ip, // 用户IP地址
            };

            // 发送 POST 请求到创建订单接口
            const response = await fetch(`${config.easypay.domain}/create.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    ...createParams,
                    sign,
                    sign_type: 'RSA',
                }).toString(),
            });

            const responseData = await response.json();

            if (response.ok && responseData.code === 0) {
                // 返回创建后的支付信息
                return res.json(createResponse(200, "success", responseData));
            } else {
                return res.status(response.status).json(createResponse(response.status, "error", null, responseData.msg));
            }
        } else {
            // 构建支付链接
            payUrl = `${config.easypay.domain}/submit.php?${new URLSearchParams({
                ...params,
                sign,
                sign_type: 'RSA',
            }).toString()}`;

            // 返回支付链接
            return res.json(createResponse(200, "success", { payUrl }));
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
    console.log("------callback------");
    console.log(req.query);
    console.log("------callback------");
    try {
        const {
            pid,            // 商户ID
            trade_no,      // 易支付订单号
            out_trade_no,  // 商户订单号
            type,          // 支付方式
            name,          // 商品名称
            money,         // 支付金额
            trade_status,  // 交易状态
            sign,          // 签名
            sign_type     // 签名类型
        } = req.query;

        // 1. 验证签名（需要按照易支付的签名规则实现）
        /*
        const signString = getSignContent(req.query);
        const verifySign = generateMD5Sign(signString, config.easypay.key);
        console.log("------verifySign------");
        console.log(verifySign);
        console.log("------verifySign------");
        if (sign !== verifySign) {
            console.log("error");
            return res.status(200).json({ code: "FAIL", message: "签名验证失败" });
        }
        console.log("------signString------");
        console.log(signString);
        console.log("------signString------");
        */

        // 2. 验证支付状态
        if (trade_status === 'TRADE_SUCCESS') {
            // 3. 更新订单状态
            await db.query(
                "UPDATE `order` SET status = 1, pay_time = NOW() WHERE order_no = ? AND status = 0",
                [out_trade_no]
            );

            return res.status(200).json({ code: "SUCCESS", message: "支付成功" });
        }

        return res.status(200).json({ code: "FAIL", message: "支付未成功" });
    } catch (error) {
        console.error("处理支付回调失败:", error);
        return res.status(200).json({ code: "FAIL", message: "处理支付回调失败" });
    }
};



// 获取待签名字符串
const getSignContent = (params) => {
    // 使用 ksort 函数对参数排序（与SDK保持一致）
    const sortedParams = ksort(params);
    let signString = '';

    // 拼接签名字符串
    for (const key in sortedParams) {
        signString += sortedParams[key] === '' ? '' : key + "=" + sortedParams[key] + "&";
    }

    // 去掉最后一个 '&'
    return signString.slice(0, -1);
};

// RSA签名生成工具函数
const generateRSASign = (data, privateKey) => {
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(data);

    // 确保私钥是正确的格式
    const formattedPrivateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey.match(/.{1,64}/g).join('\n')}\n-----END PRIVATE KEY-----`;

    const privateKeyObject = crypto.createPrivateKey({
        key: formattedPrivateKey,
        format: 'pem',
        type: 'pkcs1' // 或者 'spki'，根据您的私钥类型选择
    });

    return sign.sign(privateKeyObject, 'base64');
};

// MD5签名生成工具函数
const generateMD5Sign = (data, key) => {
    // 直接追加密钥并计算MD5
    return crypto.createHash('md5').update(data + key).digest('hex');
}

// ksort函数实现（从SDK复制）
const ksort = function (inputArr, sort_flags) {
    var tmp_arr = {},
        keys = [],
        sorter, i, k,
        strictForIn = false,
        populateArr = {};

    // 默认排序器
    sorter = function (a, b) {
        var aFloat = parseFloat(a),
            bFloat = parseFloat(b),
            aNumeric = aFloat + '' === a,
            bNumeric = bFloat + '' === b;
        if (aNumeric && bNumeric) {
            return aFloat > bFloat ? 1 : aFloat < bFloat ? -1 : 0;
        } else if (aNumeric && !bNumeric) {
            return 1;
        } else if (!aNumeric && bNumeric) {
            return -1;
        }
        return a > b ? 1 : a < b ? -1 : 0;
    };

    // 提取键名并排序
    for (k in inputArr) {
        if (inputArr.hasOwnProperty(k)) {
            keys.push(k);
        }
    }
    keys.sort(sorter);

    // 重建排序后的对象
    for (i = 0; i < keys.length; i++) {
        k = keys[i];
        tmp_arr[k] = inputArr[k];
    }

    return tmp_arr;
};