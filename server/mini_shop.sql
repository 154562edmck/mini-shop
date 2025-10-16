-- MySQL dump 10.13  Distrib 8.0.31, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: mini_shop
-- ------------------------------------------------------
-- Server version	8.0.31
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */
;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */
;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */
;
/*!50503 SET NAMES utf8mb4 */
;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */
;
/*!40103 SET TIME_ZONE='+00:00' */
;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */
;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */
;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */
;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */
;
--
-- Table structure for table `address`
--

DROP TABLE IF EXISTS `address`;
/*!40101 SET @saved_cs_client     = @@character_set_client */
;
/*!50503 SET character_set_client = utf8mb4 */
;
CREATE TABLE `address` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '地址ID',
  `user_id` bigint unsigned NOT NULL COMMENT '用户ID',
  `receiver` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '收货人',
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '手机号',
  `province` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '省份',
  `city` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '城市',
  `district` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '区县',
  `detail` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '详细地址',
  `is_default` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否默认 1-是 0-否',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '收货地址表';
/*!40101 SET character_set_client = @saved_cs_client */
;
--
-- Dumping data for table `address`
--

LOCK TABLES `address` WRITE;
UNLOCK TABLES;
--
-- Table structure for table `cart`
--

DROP TABLE IF EXISTS `cart`;
/*!40101 SET @saved_cs_client     = @@character_set_client */
;
/*!50503 SET character_set_client = utf8mb4 */
;
CREATE TABLE `cart` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '购物车ID',
  `user_id` bigint unsigned NOT NULL COMMENT '用户ID',
  `product_id` bigint unsigned NOT NULL COMMENT '商品ID',
  `spec_id` bigint unsigned NOT NULL COMMENT '规格ID',
  `quantity` int NOT NULL DEFAULT '1' COMMENT '数量',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_product_spec` (`user_id`, `product_id`, `spec_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '购物车表';
/*!40101 SET character_set_client = @saved_cs_client */
;
--
-- Dumping data for table `cart`
--

LOCK TABLES `cart` WRITE;
UNLOCK TABLES;
--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */
;
/*!50503 SET character_set_client = utf8mb4 */
;
CREATE TABLE `category` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '分类ID',
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '分类名称',
  `sort` int DEFAULT '0' COMMENT '排序',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '商品分类表';
/*!40101 SET character_set_client = @saved_cs_client */
;
--
-- Dumping data for table `category`
--

LOCK TABLES `category` WRITE;
UNLOCK TABLES;
--
-- Table structure for table `order`
--

DROP TABLE IF EXISTS `order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */
;
/*!50503 SET character_set_client = utf8mb4 */
;
CREATE TABLE `order` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '订单ID',
  `order_no` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '订单编号',
  `user_id` bigint unsigned NOT NULL COMMENT '用户ID',
  `total_amount` decimal(10, 2) NOT NULL COMMENT '订单总金额',
  `address_id` bigint unsigned NOT NULL COMMENT '收货地址ID',
  `status` tinyint NOT NULL DEFAULT '0' COMMENT '订单状态 0-待付款 1-待发货 2-已过期',
  `pay_time` datetime DEFAULT NULL COMMENT '支付时间',
  `expire_time` datetime DEFAULT NULL COMMENT '订单过期时间',
  `share_code` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '分享码',
  `pay_method` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT 'wechat' COMMENT '支付方式 wechat-微信支付 alipay-支付宝支付 easypay-易支付',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_no` (`order_no`),
  KEY `idx_user` (`user_id`),
  KEY `idx_share_code` (`share_code`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '订单表';
/*!40101 SET character_set_client = @saved_cs_client */
;
--
-- Dumping data for table `order`
--

LOCK TABLES `order` WRITE;
UNLOCK TABLES;
--
-- Table structure for table `order_item`
--

DROP TABLE IF EXISTS `order_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */
;
/*!50503 SET character_set_client = utf8mb4 */
;
CREATE TABLE `order_item` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '订单项ID',
  `order_id` bigint unsigned NOT NULL COMMENT '订单ID',
  `product_id` bigint unsigned NOT NULL COMMENT '商品ID',
  `product_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '商品名称',
  `product_image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '商品图片',
  `price` decimal(10, 2) NOT NULL COMMENT '购买价格',
  `quantity` int NOT NULL COMMENT '购买数量',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `spec_id` bigint unsigned DEFAULT NULL COMMENT '规格ID',
  `spec_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '规格名称',
  PRIMARY KEY (`id`),
  KEY `idx_order` (`order_id`),
  KEY `idx_spec` (`spec_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '订单明细表';
/*!40101 SET character_set_client = @saved_cs_client */
;
--
-- Dumping data for table `order_item`
--

LOCK TABLES `order_item` WRITE;
UNLOCK TABLES;
--
-- Table structure for table `product`
--

DROP TABLE IF EXISTS `product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */
;
/*!50503 SET character_set_client = utf8mb4 */
;
CREATE TABLE `product` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '商品ID',
  `category_id` bigint unsigned NOT NULL COMMENT '分类ID',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '商品名称',
  `merchant_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '商家名称',
  `image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '商品图片URL',
  `original_price` decimal(10, 2) NOT NULL COMMENT '原价',
  `price` decimal(10, 2) NOT NULL COMMENT '现价',
  `sales_count` int unsigned DEFAULT '0' COMMENT '销量',
  `stock` int unsigned NOT NULL DEFAULT '0' COMMENT '库存',
  `is_on_sale` tinyint(1) NOT NULL DEFAULT '1' COMMENT '是否在售 1-是 0-否',
  `is_promotion` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否促销 1-是 0-否',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '商品表';
/*!40101 SET character_set_client = @saved_cs_client */
;
--
-- Dumping data for table `product`
--

LOCK TABLES `product` WRITE;
UNLOCK TABLES;
--
-- Table structure for table `product_spec`
--

DROP TABLE IF EXISTS `product_spec`;
/*!40101 SET @saved_cs_client     = @@character_set_client */
;
/*!50503 SET character_set_client = utf8mb4 */
;
CREATE TABLE `product_spec` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '规格ID',
  `product_id` bigint unsigned NOT NULL COMMENT '商品ID',
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '规格名称',
  `price` decimal(10, 2) NOT NULL COMMENT '规格价格',
  `stock` int unsigned NOT NULL DEFAULT '0' COMMENT '规格库存',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_product` (`product_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '商品规格表';
/*!40101 SET character_set_client = @saved_cs_client */
;
--
-- Dumping data for table `product_spec`
--

LOCK TABLES `product_spec` WRITE;
UNLOCK TABLES;
--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */
;
/*!50503 SET character_set_client = utf8mb4 */
;
CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires` int unsigned NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`session_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */
;
--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
UNLOCK TABLES;
--
-- Table structure for table `system_config`
--

DROP TABLE IF EXISTS `system_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */
;
/*!50503 SET character_set_client = utf8mb4 */
;
CREATE TABLE `system_config` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '配置ID',
  `key` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '配置键',
  `value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci COMMENT '配置值',
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '配置描述',
  `type` enum('text', 'number', 'password', 'textarea') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'text' COMMENT '配置类型',
  `group_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '配置分组',
  `restart_required` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否需要重启 1-是 0-否',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_key` (`key`)
) ENGINE = InnoDB AUTO_INCREMENT = 41 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '系统配置表';
/*!40101 SET character_set_client = @saved_cs_client */
;
--
-- Dumping data for table `system_config`
--

LOCK TABLES `system_config` WRITE;
INSERT INTO `system_config`
VALUES (
    1,
    'PORT',
    '3000',
    '服务器运行端口',
    'number',
    '服务器配置',
    1,
    '2025-02-04 01:23:10',
    '2025-02-08 17:35:29'
  ),
(
    2,
    'NODE_ENV',
    'production',
    '运行环境',
    'text',
    '服务器配置',
    1,
    '2025-02-04 01:23:10',
    '2025-02-08 17:35:29'
  ),
(
    5,
    'WECHAT_APP_ID',
    'No',
    '公众号AppID',
    'text',
    '公众号配置',
    0,
    '2025-02-04 01:23:10',
    '2025-03-12 13:34:34'
  ),
(
    6,
    'WECHAT_APP_SECRET',
    'No',
    '公众号AppSecret',
    'password',
    '公众号配置',
    0,
    '2025-02-04 01:23:10',
    '2025-03-12 13:34:34'
  ),
(
    7,
    'MCH_ID',
    '0',
    '商户号',
    'text',
    '微信支付配置',
    0,
    '2025-02-04 01:23:10',
    '2025-03-12 13:34:34'
  ),
(
    8,
    'SERIAL_NO',
    'No',
    '商户证书序列号',
    'text',
    '微信支付配置',
    0,
    '2025-02-04 01:23:10',
    '2025-03-12 13:34:34'
  ),
(
    9,
    'API_V3_KEY',
    'No',
    'API v3密钥',
    'password',
    '微信支付配置',
    0,
    '2025-02-04 01:23:10',
    '2025-03-12 13:34:34'
  ),
(
    10,
    'CERT_CONTENT',
    'No',
    'API证书内容',
    'textarea',
    '微信支付配置',
    0,
    '2025-02-04 01:23:10',
    '2025-03-12 13:34:34'
  ),
(
    11,
    'PRIVATE_KEY_CONTENT',
    'No',
    'API私钥内容',
    'textarea',
    '微信支付配置',
    0,
    '2025-02-04 01:23:10',
    '2025-03-12 13:34:34'
  ),
(
    12,
    'BASE_URL',
    'http://localhost:3000',
    '后端服务基础URL',
    'text',
    'URL配置',
    0,
    '2025-02-04 01:23:10',
    '2025-03-12 13:34:34'
  ),
(
    13,
    'CLIENT_URL',
    'http://localhost:3001',
    '前端客户端URL',
    'text',
    'URL配置',
    0,
    '2025-02-04 01:23:10',
    '2025-03-12 13:34:34'
  ),
(
    19,
    'TEMPLATE_1_EXPIRE_TIME',
    '30',
    '携程订单模板过期时间（分钟）',
    'number',
    '模板过期配置',
    0,
    '2025-02-24 12:16:49',
    '2025-02-24 12:16:49'
  ),
(
    20,
    'TEMPLATE_2_EXPIRE_TIME',
    '15',
    '美团订单模板过期时间（分钟）',
    'number',
    '模板过期配置',
    0,
    '2025-02-24 12:16:49',
    '2025-02-24 12:16:49'
  ),
(
    21,
    'TEMPLATE_3_EXPIRE_TIME',
    '1440',
    '京东订单模板过期时间（分钟）',
    'number',
    '模板过期配置',
    0,
    '2025-02-24 12:16:49',
    '2025-02-24 12:16:49'
  ),
(
    22,
    'TEMPLATE_4_EXPIRE_TIME',
    '1440',
    '拼多多订单模板过期时间（分钟）',
    'number',
    '模板过期配置',
    0,
    '2025-02-24 12:16:49',
    '2025-02-24 12:16:49'
  ),
(
    23,
    'TEMPLATE_5_EXPIRE_TIME',
    '1440',
    '滴滴订单模板过期时间（分钟）',
    'number',
    '模板过期配置',
    0,
    '2025-02-24 12:16:49',
    '2025-02-24 12:16:49'
  ),
(
    24,
    'SHARE_TEMPLATE_CONFIGS',
    '{\n    \"1\": {\n        \"title\": \"携程特惠机票等你来\",\n        \"desc\": \"亲爱的朋友，帮我完成这趟旅程吧~\",\n        \"imgUrl\": \"https://evan-1304983303.cos.ap-nanjing.myqcloud.com/global/mini-shop/xc.jpg\"\n    },\n    \"2\": {\n        \"title\": \"美团美食优惠券\",\n        \"desc\": \"一起来享受美食的快乐，帮我付一下餐费呗~\",\n        \"imgUrl\": \"https://evan-1304983303.cos.ap-nanjing.myqcloud.com/global/mini-shop/mt.jpg\"\n    },\n    \"3\": {\n        \"title\": \"我在京东挑了样好东西，请你帮我付款吧\",\n        \"desc\": \"[共${orderDetail.items.length}件] ${orderDetail.items.map(item => `${item.product_name}${item.spec_name ? ` ${item.spec_name}` : \'\'} x${item.quantity}`).join(\' \')}\",\n        \"imgUrl\": \"orderDetail.items[0]?.product_image || \\\"https://evan-1304983303.cos.ap-nanjing.myqcloud.com/global/mini-shop/jd.png\\\"\"\n    },\n    \"4\": {\n        \"title\": \"${orderDetail.receiver}希望你帮他付${orderDetail.total_amount}元\",\n        \"desc\": \"我在拼多多上买到了很赞的东西，希望你帮我付款哦~\",\n        \"imgUrl\": \"orderDetail.items[0]?.product_image || \\\"https://evan-1304983303.cos.ap-nanjing.myqcloud.com/global/mini-shop/pdd.png\\\"\"\n    },\n    \"5\": {\n        \"title\": \"滴滴快车优惠券\",\n        \"desc\": \"亲爱的，帮我付个车费，让我平安到达目的地~\",\n        \"imgUrl\": \"https://evan-1304983303.cos.ap-nanjing.myqcloud.com/global/mini-shop/dd.jpg\"\n    },\n    \"6\": {\n        \"title\": \"得物限量版球鞋等你来\",\n        \"desc\": \"帮我付一下，这双鞋子太酷了，我等不及想要拥有它！\",\n        \"imgUrl\": \"orderDetail?.items[0]?.product_image || \\\"https://evan-1304983303.cos.ap-nanjing.myqcloud.com/global/mini-shop/dw.png\\\"\"\n    },\n    \"7\": {\n        \"title\": \"饿了么外卖红包\",\n        \"desc\": \"肚子好饿，帮我付一下外卖费用吧，我请你下次！\",\n        \"imgUrl\": \"orderDetail?.items[0]?.product_image || \\\"https://evan-1304983303.cos.ap-nanjing.myqcloud.com/global/mini-shop/elm.png\\\"\"\n    },\n    \"8\": {\n        \"title\": \"猫眼电影优惠券\",\n        \"desc\": \"精品电影，帮我付一下，我请你下次！\",\n        \"imgUrl\": \"https://evan-1304983303.cos.ap-nanjing.myqcloud.com/global/mini-shop/my.png\"\n    },\n    \"9\": {\n        \"title\": \"飞猪旅行特惠\",\n        \"desc\": \"发现了一个超棒的旅行套餐，帮我付一下，一起去玩吧！\",\n        \"imgUrl\": \"https://evan-1304983303.cos.ap-nanjing.myqcloud.com/global/mini-shop/fz.png\"\n    },\n    \"10\": {\n        \"title\": \"淘宝好物分享\",\n        \"desc\": \"我在淘宝看中了这${orderDetail?.items.length}件宝贝，帮我付一下呗，下次请你吃饭！\",\n        \"imgUrl\": \"orderDetail?.items[0]?.product_image || \\\"https://evan-1304983303.cos.ap-nanjing.myqcloud.com/global/mini-shop/tb.png\\\"\"\n    },\n    \"11\": {\n        \"title\": \"抖音好物分享\",\n        \"desc\": \"我在抖音看中了这${orderDetail?.items.length}件宝贝，帮我付一下呗，下次请你吃饭！\",\n        \"imgUrl\": \"orderDetail?.items[0]?.product_image || \\\"https://evan-1304983303.cos.ap-nanjing.myqcloud.com/global/mini-shop/dy.png\\\"\"\n    }\n}',
    '分享模板配置（包含动态代码，请谨慎修改）',
    'textarea',
    '模板分享配置',
    0,
    '2025-02-24 12:16:51',
    '2025-03-09 20:03:41'
  ),
(
    25,
    'ALIPAY_APP_ID',
    '0',
    '支付宝应用ID',
    'text',
    '支付宝支付配置',
    0,
    '2025-02-24 15:19:07',
    '2025-03-12 13:34:34'
  ),
(
    26,
    'ALIPAY_PRIVATE_KEY',
    'No',
    '支付宝应用私钥',
    'textarea',
    '支付宝支付配置',
    0,
    '2025-02-24 15:19:07',
    '2025-03-12 13:34:34'
  ),
(
    27,
    'ALIPAY_PUBLIC_KEY',
    'No',
    '支付宝公钥',
    'textarea',
    '支付宝支付配置',
    0,
    '2025-02-24 15:19:07',
    '2025-03-12 13:34:34'
  ),
(
    28,
    'EASYPAY_DOMAIN',
    'No',
    '易支付接口域名',
    'text',
    '易支付配置',
    0,
    '2025-02-25 12:12:50',
    '2025-03-12 13:34:34'
  ),
(
    29,
    'EASYPAY_PID',
    '0',
    '易支付商户ID',
    'text',
    '易支付配置',
    0,
    '2025-02-25 12:12:50',
    '2025-03-12 13:34:34'
  ),
(
    30,
    'EASYPAY_KEY',
    'No',
    '易支付商户密钥',
    'password',
    '易支付配置',
    0,
    '2025-02-25 12:12:50',
    '2025-03-12 13:34:34'
  ),
(
    31,
    'ORDER_SHARE_RESET_ENABLED',
    '1',
    '创建分享时是否重置分享码（1-是 0-否）',
    'number',
    '订单设置',
    0,
    '2025-02-26 01:52:29',
    '2025-02-26 01:56:18'
  ),
(
    32,
    'ORDER_SHARE_ALLOW_OLD_LINKS',
    '1',
    '是否允许访问旧的分享链接（1-是 0-否）',
    'number',
    '订单设置',
    0,
    '2025-02-26 01:52:29',
    '2025-02-26 01:56:47'
  ),
(
    33,
    'EASYPAY_PUBLIC_KEY',
    'No',
    '平台公钥',
    'textarea',
    '易支付配置',
    0,
    '2025-02-27 00:17:53',
    '2025-03-12 13:34:34'
  ),
(
    34,
    'EASYPAY_PRIVATE_KEY',
    'No',
    '商户私钥',
    'textarea',
    '易支付配置',
    0,
    '2025-02-27 00:17:53',
    '2025-03-12 13:34:34'
  ),
(
    35,
    'TEMPLATE_6_EXPIRE_TIME',
    '15',
    '得物订单模板过期时间（分钟）',
    'number',
    '模板过期配置',
    0,
    '2025-03-09 18:02:07',
    '2025-03-09 18:02:07'
  ),
(
    36,
    'TEMPLATE_7_EXPIRE_TIME',
    '15',
    '饿了么订单模板过期时间（分钟）',
    'number',
    '模板过期配置',
    0,
    '2025-03-09 18:02:07',
    '2025-03-09 18:02:07'
  ),
(
    37,
    'TEMPLATE_8_EXPIRE_TIME',
    '15',
    '猫眼订单模板过期时间（分钟）',
    'number',
    '模板过期配置',
    0,
    '2025-03-09 18:02:07',
    '2025-03-09 18:02:07'
  ),
(
    38,
    'TEMPLATE_9_EXPIRE_TIME',
    '15',
    '飞猪订单模板过期时间（分钟）',
    'number',
    '模板过期配置',
    0,
    '2025-03-09 18:02:07',
    '2025-03-09 18:02:07'
  ),
(
    39,
    'TEMPLATE_10_EXPIRE_TIME',
    '15',
    '淘宝订单模板过期时间（分钟）',
    'number',
    '模板过期配置',
    0,
    '2025-03-09 18:02:07',
    '2025-03-09 18:02:07'
  ),
(
    40,
    'TEMPLATE_11_EXPIRE_TIME',
    '15',
    '抖音订单模板过期时间（分钟）',
    'number',
    '模板过期配置',
    0,
    '2025-03-09 18:02:07',
    '2025-03-09 18:02:07'
  ),
  (
    41,
    'ALIPAY_TRADE_PRECREATE_ENABLED',
    '1',
    '是否启用当面付（1-是 0-否）',
    'number',
    '支付宝支付配置',
    0,
    '2025-03-12 13:34:34',
    '2025-03-12 13:34:34'
  );
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */
;
/*!50503 SET character_set_client = utf8mb4 */
;
CREATE TABLE `user` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `openid` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '微信openid',
  `nickname` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '微信昵称',
  `avatar` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '头像URL',
  `access_token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'JWT token',
  `token_expire_time` datetime DEFAULT NULL COMMENT 'token过期时间',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_openid` (`openid`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '用户表';
/*!40101 SET character_set_client = @saved_cs_client */
;
--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */
;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */
;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */
;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */
;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */
;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */
;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */
;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */
;
-- Dump completed on 2025-03-12 13:35:01