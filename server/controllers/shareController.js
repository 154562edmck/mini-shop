import { createResponse } from "../common/response.js";
import { config } from "../config/config.js";

// 默认的分享配置
const DEFAULT_SHARE_CONFIGS = {
    "1": {
        "title": "携程特惠机票等你来",
        "desc": "亲爱的朋友，帮我完成这趟旅程吧~",
        "imgUrl": "https://evan-1304983303.cos.ap-nanjing.myqcloud.com/global/mini-shop/xc.jpg"
    },
    "2": {
        "title": "美团美食优惠券",
        "desc": "一起来享受美食的快乐，帮我付一下餐费呗~",
        "imgUrl": "https://evan-1304983303.cos.ap-nanjing.myqcloud.com/global/mini-shop/mt.jpg"
    },
    "3": {
        "title": "我在京东挑了样好东西，请你帮我付款吧",
        "desc": "[共${orderDetail.items.length}件] ${orderDetail.items.map(item => `${item.product_name}${item.spec_name ? ` ${item.spec_name}` : ''} x${item.quantity}`).join(' ')}",
        "imgUrl": "orderDetail.items[0]?.product_image || \"https://evan-1304983303.cos.ap-nanjing.myqcloud.com/global/mini-shop/jd.png\""
    },
    "4": {
        "title": "${orderDetail.receiver}希望你帮他付${orderDetail.total_amount}元",
        "desc": "我在拼多多上买到了很赞的东西，希望你帮我付款哦~",
        "imgUrl": "orderDetail.items[0]?.product_image || \"https://evan-1304983303.cos.ap-nanjing.myqcloud.com/global/mini-shop/pdd.png\""
    },
    "5": {
        "title": "滴滴快车优惠券",
        "desc": "亲爱的，帮我付个车费，让我平安到达目的地~",
        "imgUrl": "https://evan-1304983303.cos.ap-nanjing.myqcloud.com/global/mini-shop/dd.jpg"
    },
    "6": {
        "title": "得物限量版球鞋等你来",
        "desc": "帮我付一下，这双鞋子太酷了，我等不及想要拥有它！",
        "imgUrl": "orderDetail?.items[0]?.product_image || \"https://evan-1304983303.cos.ap-nanjing.myqcloud.com/global/mini-shop/dw.png\""
    },
    "7": {
        "title": "饿了么外卖红包",
        "desc": "肚子好饿，帮我付一下外卖费用吧，我请你下次！",
        "imgUrl": "orderDetail?.items[0]?.product_image || \"https://evan-1304983303.cos.ap-nanjing.myqcloud.com/global/mini-shop/elm.png\""
    },
    "8": {
        "title": "猫眼电影优惠券",
        "desc": "精品电影，帮我付一下，我请你下次！",
        "imgUrl": "https://evan-1304983303.cos.ap-nanjing.myqcloud.com/global/mini-shop/my.png"
    },
    "9": {
        "title": "飞猪旅行特惠",
        "desc": "发现了一个超棒的旅行套餐，帮我付一下，一起去玩吧！",
        "imgUrl": "https://evan-1304983303.cos.ap-nanjing.myqcloud.com/global/mini-shop/fz.png"
    },
    "10": {
        "title": "淘宝好物分享",
        "desc": "我在淘宝看中了这${orderDetail?.items.length}件宝贝，帮我付一下呗，下次请你吃饭！",
        "imgUrl": "orderDetail?.items[0]?.product_image || \"https://evan-1304983303.cos.ap-nanjing.myqcloud.com/global/mini-shop/tb.png\""
    },
    "11": {
        "title": "抖音好物分享",
        "desc": "我在抖音看中了这${orderDetail?.items.length}件宝贝，帮我付一下呗，下次请你吃饭！",
        "imgUrl": "orderDetail?.items[0]?.product_image || \"https://evan-1304983303.cos.ap-nanjing.myqcloud.com/global/mini-shop/dy.png\""
    }
};

export const getShareConfigs = async (req, res) => {
    try {
        let shareConfigs;

        // 尝试从配置中获取
        if (config.SHARE_TEMPLATE_CONFIGS) {
            console.log("获取数据库配置")
            try {
                shareConfigs = JSON.parse(config.SHARE_TEMPLATE_CONFIGS);
            } catch (parseError) {
                console.warn("解析配置失败，使用默认配置:", parseError);
                shareConfigs = DEFAULT_SHARE_CONFIGS;
            }
        } else {
            console.log("获取默认配置")
            // 如果配置不存在，使用默认配置
            shareConfigs = DEFAULT_SHARE_CONFIGS;
        }

        return res.json(createResponse(200, "success", shareConfigs));
    } catch (error) {
        console.error("获取分享配置失败:", error);
        // 发生错误时也返回默认配置
        return res.json(createResponse(200, "success", DEFAULT_SHARE_CONFIGS));
    }
}; 