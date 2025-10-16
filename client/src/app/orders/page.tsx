"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
    Tabs,
    Tab,
    Card,
    Button,
    Image,
    Spinner,
    Divider,
} from "@nextui-org/react";
import { toast } from "sonner";
import apiClient from "@/utils/axiosUtils";
import { FaTrashAlt, FaBell, FaCheck, FaInbox } from "react-icons/fa";
import { basePath } from "@/config/config";

// 添加催发货记录的本地存储 key
const URGED_ORDERS_KEY = 'urged_orders';

interface OrderItem {
    id: number;
    order_id: number;
    product_id: number;
    product_name: string;
    product_image: string;
    price: string;
    quantity: number;
}

interface Order {
    id: number;
    order_no: string;
    user_id: number;
    address_id: number;
    receiver: string;
    phone: string;
    province: string;
    city: string;
    district: string;
    detail: string;
    total_amount: string;
    status: number;
    pay_method: string;
    pay_time: string | null;
    create_time: string;
    update_time: string;
    expire_time: string;
    share_code: string;
    items: OrderItem[];
}

// 更新状态映射
const statusMap = {
    0: "待支付",
    1: "已支付",
    2: "已过期"
};

export default function Orders() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState(
        searchParams.get("status") || "all"
    );
    const [urgedOrders, setUrgedOrders] = useState<string[]>([]);
    const tabsRef = useRef<HTMLDivElement>(null);

    // 从本地存储加载催发货记录
    useEffect(() => {
        const urged = localStorage.getItem(URGED_ORDERS_KEY);
        if (urged) {
            setUrgedOrders(JSON.parse(urged));
        }
    }, []);

    // 监听路由变化并滚动到选中的 tab
    useEffect(() => {
        const status = searchParams.get("status") || "all";
        setSelectedStatus(status);
        fetchOrders(status);

        // 滚动到选中的 tab
        if (tabsRef.current) {
            const selectedTab = tabsRef.current.querySelector('[data-selected="true"]');
            if (selectedTab) {
                selectedTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }
    }, [searchParams]);

    // 处理催发货
    const handleUrgeShipment = (orderNo: string) => {
        const newUrgedOrders = [...urgedOrders, orderNo];
        setUrgedOrders(newUrgedOrders);
        localStorage.setItem(URGED_ORDERS_KEY, JSON.stringify(newUrgedOrders));
        toast.success("已通知商家尽快发货");
    };

    // 处理确认收货
    const handleConfirmReceipt = async (orderNo: string) => {
        try {
            await apiClient.put(`/shop/orders/${orderNo}/status`, { status: 2 });
            toast.success("已确认收货");
            fetchOrders(selectedStatus);
        } catch (error) {
            toast.error("确认收货失败");
        }
    };

    const fetchOrders = async (status?: string) => {
        try {
            setLoading(true);
            const response = await apiClient.get("/shop/orders", {
                params: status !== "all" ? { status } : undefined,
            });
            setOrders(response.data.data);
        } catch (error) {
            toast.error("获取订单列表失败");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (status: string) => {
        setSelectedStatus(status);
        router.push(`/orders?status=${status}`);
    };

    const handleDeleteOrder = async (orderNo: string) => {
        try {
            await apiClient.delete(`/shop/orders/${orderNo}`);
            toast.success("订单已删除");
            fetchOrders(selectedStatus);
        } catch (error) {
            toast.error("删除订单失败");
        }
    };

    const handleClearOrders = async () => {
        try {
            await apiClient.delete("/shop/orders", {
                params: selectedStatus !== "all" ? { status: selectedStatus } : undefined,
            });
            toast.success("订单已清空");
            fetchOrders(selectedStatus);
        } catch (error) {
            toast.error("清空订单失败");
        }
    };

    const handlePayment = (orderNo: string) => {
        window.location.href = `${basePath}/order/confirm?orderNo=${orderNo}`;
    };

    // 空状态组件
    const EmptyState = () => (
        <div className="flex flex-col items-center justify-center py-12 px-4">
            <FaInbox className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg mb-2">暂无订单</p>
            <p className="text-gray-400 text-sm text-center">
                当前状态下没有任何订单记录
            </p>
        </div>
    );

    const formatDateTime = (dateStr: string) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <div className="sticky top-0 z-50 bg-background">
                <div ref={tabsRef}>
                    <Tabs
                        selectedKey={selectedStatus}
                        onSelectionChange={(key) => handleStatusChange(key as string)}
                        className="p-4 overflow-x-auto"
                        variant="underlined"
                        fullWidth
                        classNames={{
                            tabList: "gap-6 w-full relative rounded-none p-0 border-none border-divider",
                            cursor: "w-full bg-primary",
                            tab: "max-w-fit px-0 h-12",
                            tabContent: "group-data-[selected=true]:text-primary"
                        }}
                    >
                        <Tab key="all" title="全部" />
                        <Tab key="0" title="待支付" />
                        <Tab key="1" title="已支付" />
                        <Tab key="2" title="已过期" />
                    </Tabs>
                </div>
            </div>

            <div className={`flex-1 pb-4 ${selectedStatus === '0' || selectedStatus === '2' ? '' : 'pt-4'}`}>
                {orders.length > 0 ? (
                    <>
                        {(selectedStatus === '2') && (
                            <Card className="sticky top-[76px] z-40 mb-4 rounded-none shadow-sm border-b" shadow='none' radius='sm'>
                                <Button
                                    className="w-full rounded-none"
                                    color="danger"
                                    variant="light"
                                    onPress={handleClearOrders}
                                    size="sm"
                                    startContent={<FaTrashAlt />}
                                >
                                    清空{statusMap[parseInt(selectedStatus) as keyof typeof statusMap]}订单
                                </Button>
                            </Card>
                        )}

                        <div className="space-y-4 mx-4">
                            {orders.map((order) => (
                                <Card key={order.id} className="p-4">
                                    <div className="relative overflow-hidden">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-sm text-gray-500">
                                                订单号: {order.order_no}
                                            </span>
                                            <span className="text-primary">
                                                {statusMap[order.status as keyof typeof statusMap]}
                                            </span>
                                        </div>

                                        {order.items.map((item, index) => (
                                            <div key={index}>
                                                <div className="flex gap-4 mb-4">
                                                    <Image
                                                        src={item.product_image}
                                                        alt={item.product_name}
                                                        className="w-20 h-20 object-cover rounded-lg"
                                                    />
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold">{item.product_name}</h3>
                                                        <div className="flex justify-between items-center mt-2">
                                                            <span className="text-primary">¥{item.price}</span>
                                                            <span className="text-gray-500">x{item.quantity}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                {index < order.items.length - 1 && <Divider className="my-4" />}
                                            </div>
                                        ))}
                                    </div>

                                    {/* 订单底部 */}
                                    <Divider className="my-3" />

                                    <div className="flex justify-between items-center">
                                        <div className="text-sm">
                                            合计: <span className="text-primary font-bold">¥{order.total_amount}</span>
                                        </div>
                                        <div className="space-x-2">
                                            {order.status === 0 && (
                                                <>
                                                    <Button
                                                        color="danger"
                                                        variant="light"
                                                        size="sm"
                                                        onPress={() => handleDeleteOrder(order.order_no)}
                                                    >
                                                        删除订单
                                                    </Button>
                                                    <Button
                                                        color="primary"
                                                        size="sm"
                                                        onPress={() => handlePayment(order.order_no)}
                                                    >
                                                        立即付款
                                                    </Button>
                                                </>
                                            )}

                                            {order.status === 1 && (
                                                <Button
                                                    color="warning"
                                                    size="sm"
                                                    startContent={<FaBell />}
                                                    isDisabled={urgedOrders.includes(order.order_no)}
                                                    onPress={() => handleUrgeShipment(order.order_no)}
                                                >
                                                    {urgedOrders.includes(order.order_no) ? "已催发货" : "催发货"}
                                                </Button>
                                            )}

                                            {(order.status === 2) && (
                                                <Button
                                                    color="danger"
                                                    variant="light"
                                                    size="sm"
                                                    onPress={() => handleDeleteOrder(order.order_no)}
                                                >
                                                    删除订单
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </>
                ) : (
                    <EmptyState />
                )}
            </div>
        </div>
    );
} 