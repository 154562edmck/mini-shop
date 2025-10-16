"use client";

import { Modal, ModalContent, Button, Image, Divider } from "@nextui-org/react";
import { FaMinus, FaPlus, FaShoppingCart } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import apiClient from "@/utils/axiosUtils";
import { basePath } from "@/config/config";

interface ProductSpec {
  id: number;
  name: string;
  price: number;
  stock: number;
}

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  stock: number;
  sales_count: number;
  original_price: number;
  is_promotion: boolean;
}

export const ProductModal = ({
  isOpen,
  onCloseAction,
  product,
  quantity,
  setQuantityAction,
  onAddToCartAction,
  specs,
  selectedSpec,
  setSelectedSpecAction
}: {
  isOpen: boolean;
  onCloseAction: () => void;
  product: Product | null;
  quantity: number;
  setQuantityAction: (q: number) => void;
  onAddToCartAction: () => void;
  specs: ProductSpec[];
  selectedSpec: ProductSpec | null;
  setSelectedSpecAction: (spec: ProductSpec) => void;
}) => {
  const router = useRouter();
  const { user, showLoginModal } = useAuth();

  // 计算实际付款金额
  const actualPrice = selectedSpec
    ? selectedSpec.price * quantity
    : product?.price * quantity;

  const handleBuyNow = async () => {
    if (!user) {
      showLoginModal();
      return;
    }

    if (!selectedSpec) {
      toast.error("请选择商品规格");
      return;
    }

    try {
      // 1. 先检查是否有收货地址
      const addressResponse = await apiClient.get("/shop/addresses");
      const addresses = addressResponse.data.data;

      // 如果没有地址，显示提示并返回
      if (addresses.length === 0) {
        toast.error("请先添加收货地址");
        router.push('/address');
        return;
      }

      // 2. 有地址才创建订单
      const response = await apiClient.post("/shop/orders", {
        items: [{
          product_id: product.id,
          spec_id: selectedSpec.id,
          quantity: quantity
        }],
        address_id: addresses.find(addr => addr.is_default)?.id || addresses[0].id
      });

      const { order_no } = response.data.data;
      onCloseAction();
      //router.push(`/order/confirm?orderNo=${order_no}`);
      window.location.href = `${basePath}/order/confirm?orderNo=${order_no}`;
    } catch (error) {
      console.error(error);
      toast.error("创建订单失败");
    }
  };

  if (!product) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCloseAction}
      placement="bottom"
    >
      <ModalContent>
        <div className="p-4 space-y-4">
          <div className="flex gap-4 mb-4">
            <Image
              src={product.image}
              alt={product.name}
              classNames={{
                wrapper: "w-24 h-24 rounded-lg overflow-hidden",
                img: "w-full h-full object-cover"
              }}
            />
            <div className="flex-1">
              <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-red-500 text-xl font-bold">
                  ¥{selectedSpec ? selectedSpec.price : product.price}
                </span>
                {product.is_promotion && (
                  <span className="text-gray-400 line-through text-sm">
                    ¥{product.original_price}
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500">
                库存: {selectedSpec ? selectedSpec.stock : product.stock} |
                月售: {product.sales_count}
              </div>
            </div>
          </div>

          <Divider />

          <div className="py-4">
            <h4 className="text-sm mb-2">规格选择</h4>
            <div className="flex flex-wrap gap-2">
              {specs.map((spec) => (
                <Button
                  key={spec.id}
                  size="sm"
                  variant={selectedSpec?.id === spec.id ? "solid" : "bordered"}
                  color={selectedSpec?.id === spec.id ? "primary" : "default"}
                  onPress={() => setSelectedSpecAction(spec)}
                >
                  {spec.name}
                </Button>
              ))}
            </div>
          </div>

          <Divider />

          <div className="py-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">购买数量</span>
              <div className="flex items-center gap-3">
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  isDisabled={quantity <= 1}
                  onPress={() => setQuantityAction(quantity - 1)}
                >
                  <FaMinus className="text-xs" />
                </Button>
                <span className="w-8 text-center">{quantity}</span>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  isDisabled={selectedSpec && quantity >= selectedSpec.stock}
                  onPress={() => setQuantityAction(quantity + 1)}
                >
                  <FaPlus className="text-xs" />
                </Button>
              </div>
            </div>
          </div>

          <Divider />

          <div className="space-y-2">
            <div className="text-right text-sm text-gray-600">
              实际付款：<span className="text-primary font-semibold text-lg">¥{actualPrice?.toFixed(2) || '0.00'}</span>
            </div>

            <div className="flex gap-2">
              <Button
                className="flex-1"
                color="default"
                variant="flat"
                startContent={<FaShoppingCart />}
                onPress={onAddToCartAction}
                isDisabled={!selectedSpec}
              >
                加入购物车
              </Button>
              <Button
                className="flex-1"
                color="primary"
                onPress={handleBuyNow}
                isDisabled={!selectedSpec}
              >
                立即购买
              </Button>
            </div>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
};