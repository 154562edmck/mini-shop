"use client";

import { useEffect, useState } from "react";
import { Button, Card, CardBody, Spinner, Image, Checkbox } from "@nextui-org/react";
import apiClient from "@/utils/axiosUtils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { FaTrashAlt, FaShoppingCart } from "react-icons/fa";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { basePath } from "@/config/config";

export default function Cart() {
    const router = useRouter();
    const [cartItems, setCartItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const { user, showLoginModal } = useAuth();

    // 检查是否全选
    const isAllSelected = cartItems.length > 0 && selectedItems.size === cartItems.length;

    // 检查用户是否登录并获取购物车数据
    useEffect(() => {
        if (!user) {
            setLoading(false); // 未登录时不显示加载状态
            showLoginModal();
            return;
        }

        fetchCart();
    }, [user]);

    const fetchCart = async () => {
        try {
            const response = await apiClient.get("/shop/cart");
            setCartItems(response.data.data || []);
            // 清除已删除商品的选中状态
            setSelectedItems(prev => {
                const newSelected = new Set(prev);
                for (const id of newSelected) {
                    if (!response.data.data.find(item => item.id === id)) {
                        newSelected.delete(id);
                    }
                }
                return newSelected;
            });
        } catch (error) {
            console.error(error);
            // 只有在用户已登录时才显示错误提示
            if (user) {
                toast.error("获取购物车失败");
            }
        } finally {
            setLoading(false);
        }
    };

    // 处理全选/取消全选
    const handleSelectAll = (isSelected: boolean) => {
        if (isSelected) {
            setSelectedItems(new Set(cartItems.map(item => item.id)));
        } else {
            setSelectedItems(new Set());
        }
    };

    const handleDelete = async (id) => {
        try {
            await apiClient.delete(`/shop/cart/${id}`);
            fetchCart();
            toast.success("商品已删除");
        } catch (error) {
            console.error(error);
            toast.error("删除商品失败");
        }
    };

    const handleClearCart = async () => {
        try {
            await apiClient.delete("/shop/cart");
            fetchCart();
            toast.success("购物车已清空");
        } catch (error) {
            console.error(error);
            toast.error("清空购物车失败");
        }
    };

    const handleCheckout = async () => {
        if (selectedItems.size === 0) {
            toast.error("请至少选择一个商品");
            return;
        }

        const itemsToCheckout = cartItems.filter(item => selectedItems.has(item.id));

        try {
            // 检查是否有默认地址
            const addressResponse = await apiClient.get("/shop/addresses");
            const addresses = addressResponse.data.data;
            const defaultAddress = addresses.find(addr => addr.is_default);

            if (!defaultAddress) {
                toast.error("请先添加收货地址");
                router.push('/address');
                return;
            }

            const response = await apiClient.post("/shop/orders", {
                items: itemsToCheckout.map(item => ({
                    product_id: item.product_id,
                    spec_id: item.spec_id,
                    quantity: item.quantity
                })),
                address_id: defaultAddress.id
            });

            toast.success("订单创建成功");
            await handleClearCart();
            window.location.href = `${basePath}/order/confirm?orderNo=${response.data.data.order_no}`;
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "创建订单失败");
        }
    };

    const toggleSelectItem = (id) => {
        const newSelectedItems = new Set(selectedItems);
        if (newSelectedItems.has(id)) {
            newSelectedItems.delete(id);
        } else {
            newSelectedItems.add(id);
        }
        setSelectedItems(newSelectedItems);
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    // 未登录时显示空购物车状态
    if (!user) {
        return (
            <div className="container mx-auto max-w-2xl p-4 pb-[80px]">
                <h1 className="text-2xl font-bold mb-4">购物车</h1>
                <Card className="p-6 shadow-sm">
                    <div className="flex flex-col items-center justify-center min-h-[60vh]">
                        <div className="flex items-center justify-center w-16 h-16 bg-primary-50 rounded-full mb-6">
                            <FaShoppingCart size={24} className="text-primary" />
                        </div>
                        <h2 className="text-xl font-medium mb-6 text-gray-800">请先登录</h2>
                        <Button
                            color="primary"
                            variant="flat"
                            size="lg"
                            className="w-full max-w-[200px]"
                            onPress={showLoginModal}
                        >
                            去登录
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-2xl p-4 pb-[80px]">
            <h1 className="text-2xl font-bold mb-4">购物车</h1>
            {cartItems.length === 0 ? (
                <Card className="p-6 shadow-sm">
                    <div className="flex flex-col items-center justify-center min-h-[60vh]">
                        <div className="flex items-center justify-center w-16 h-16 bg-primary-50 rounded-full mb-6">
                            <FaShoppingCart size={24} className="text-primary" />
                        </div>
                        <h2 className="text-xl font-medium mb-6 text-gray-800">购物车还是空的</h2>
                        <Button
                            as={Link}
                            href="/"
                            color="primary"
                            variant="flat"
                            size="lg"
                            className="w-full max-w-[200px]"
                            startContent={<FaShoppingCart size={16} />}
                        >
                            去逛逛
                        </Button>
                    </div>
                </Card>
            ) : (
                <>
                    <div className="mb-4 px-4">
                        <Checkbox
                            isSelected={isAllSelected}
                            onValueChange={handleSelectAll}
                            size="sm"
                        >
                            全选
                        </Checkbox>
                    </div>

                    <div className="space-y-4 mb-[120px]">
                        {cartItems.map((item) => (
                            <Card key={item.id} className="w-full">
                                <CardBody className="p-4">
                                    <div className="flex items-center gap-4">
                                        <Checkbox
                                            isSelected={selectedItems.has(item.id)}
                                            onValueChange={(checked) => toggleSelectItem(item.id)}
                                            size="sm"
                                        />
                                        <Image
                                            src={item.product_image}
                                            alt={item.product_name}
                                            className="w-20 h-20 object-cover rounded-lg"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-sm truncate">
                                                {item.product_name}
                                            </h3>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {item.spec_name}
                                            </p>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-primary font-bold">
                                                    ¥{item.price}
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    x{item.quantity}
                                                </span>
                                            </div>
                                        </div>
                                        <Button
                                            isIconOnly
                                            color="danger"
                                            variant="light"
                                            onPress={() => handleDelete(item.id)}
                                            size="sm"
                                            className="min-w-unit-8 w-unit-8 h-unit-8"
                                        >
                                            <FaTrashAlt className="text-sm" />
                                        </Button>
                                    </div>
                                </CardBody>
                            </Card>
                        ))}
                    </div>

                    <div className="fixed bottom-[72px] left-0 right-0 bg-background/80 backdrop-blur-md p-4 border-t z-10">
                        <div className="flex items-center justify-between max-w-2xl mx-auto">
                            <Button
                                color="danger"
                                variant="light"
                                onPress={handleClearCart}
                                isDisabled={cartItems.length === 0}
                                size="sm"
                                startContent={<FaTrashAlt className="text-sm" />}
                            >
                                清空购物车
                            </Button>
                            <div className="flex items-center gap-4">
                                <span className="text-sm">
                                    已选择 {selectedItems.size} 件商品
                                </span>
                                <Button
                                    color="primary"
                                    onPress={handleCheckout}
                                    isDisabled={selectedItems.size === 0}
                                    size="sm"
                                >
                                    下单
                                </Button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
} 