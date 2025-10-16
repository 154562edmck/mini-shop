"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Button,
  Card,
  CardBody,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  useDisclosure,
  Chip,
  Divider
} from "@nextui-org/react";
import { FaPlus, FaCheck } from "react-icons/fa6";
import { toast } from "sonner";
import apiClient from "@/utils/axiosUtils";
import { PageHeader } from "@/components/PageHeader";


interface Address {
  id: number;
  receiver: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  is_default: number;
}

export default function AddressManage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderNo = searchParams.get('orderNo');
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isNewAddress, setIsNewAddress] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await apiClient.get("/shop/addresses");
      setAddresses(response.data.data);
    } catch (error) {
      toast.error("获取地址失败");
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewAddress = () => {
    setIsNewAddress(true);
    setEditingAddress({
      id: 0,
      receiver: '',
      phone: '',
      province: '',
      city: '',
      district: '',
      detail: '',
      is_default: 0
    });
    onOpen();
  };

  const handleEditAddress = (address: Address) => {
    setIsNewAddress(false);
    setEditingAddress({ ...address });
    onOpen();
  };

  const handleSaveAddress = async () => {
    if (!editingAddress) return;

    try {
      if (isNewAddress) {
        // 新增地址
        await apiClient.post("/shop/addresses", {
          receiver: editingAddress.receiver,
          phone: editingAddress.phone,
          province: editingAddress.province,
          city: editingAddress.city,
          district: editingAddress.district,
          detail: editingAddress.detail,
          is_default: editingAddress.is_default
        });
      } else {
        // 更新地址
        await apiClient.put(`/shop/addresses/${editingAddress.id}`, {
          receiver: editingAddress.receiver,
          phone: editingAddress.phone,
          province: editingAddress.province,
          city: editingAddress.city,
          district: editingAddress.district,
          detail: editingAddress.detail,
          is_default: editingAddress.is_default
        });
      }
      await fetchAddresses(); // 重新获取地址列表
      toast.success(isNewAddress ? "添加成功" : "保存成功");
      onClose();
    } catch (error) {
      toast.error(isNewAddress ? "添加失败" : "保存失败");
    }
  };

  const handleUseAddress = async (addressId: number) => {
    try {
      if (orderNo) {
        await apiClient.put(`/shop/orders/${orderNo}/address`, {
          addressId: addressId
        });
        toast.success("更新地址成功");
        router.push(`/order/confirm?orderNo=${orderNo}`);
      }
    } catch (error) {
      toast.error("更新地址失败");
    }
  };

  const handleSetDefault = async (addressId: number) => {
    try {
      await apiClient.put(`/shop/addresses/${addressId}/default`);
      await fetchAddresses();
      toast.success("设置默认地址成功");
    } catch (error) {
      toast.error("设置默认地址失败");
    }
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
      <PageHeader
        title="收货地址"
        right={
          <Button
            isIconOnly
            variant="light"
            onClick={handleAddNewAddress}
          >
            <FaPlus />
          </Button>
        }
      />

      <div className="flex-1 p-4 pb-[80px]">
        <div className="space-y-3">
          {addresses.map((address) => (
            <Card
              key={address.id}
              className={`w-full ${address.is_default ? 'border-primary' : ''}`}
            >
              <CardBody className="p-4">
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-lg">{address.receiver}</span>
                      <span className="text-gray-600">{address.phone}</span>
                    </div>
                    {address.is_default ? (
                      <Button
                        color="success"
                        variant="flat"
                        size="sm"
                        className="text-xs rounded-full"
                        startContent={<FaCheck className="text-xs" />}
                      >
                        默认地址
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="flat"
                        className="text-xs rounded-full"
                        onPress={() => handleSetDefault(address.id)}
                      >
                        此设为默认
                      </Button>
                    )}
                  </div>
                  <p className="text-gray-600 mb-4">
                    {address.province} {address.city} {address.district} {address.detail}
                  </p>
                  <Divider className="my-2" />
                  <div className="flex justify-end gap-3">
                    <Button
                      variant="light"
                      onPress={() => handleEditAddress(address)}
                    >
                      编辑
                    </Button>
                    {orderNo && (
                      <Button
                        color="primary"
                        onPress={() => handleUseAddress(address.id)}
                      >
                        使用
                      </Button>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}

          {addresses.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              暂无收货地址
            </div>
          )}
        </div>
      </div>

      {/* 编辑/新增地址弹窗 */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="lg"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>{isNewAddress ? '新增地址' : '编辑地址'}</ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  {/* 收货人和手机号水平排列 */}
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="收货人"
                      value={editingAddress?.receiver}
                      onChange={(e) => setEditingAddress(prev =>
                        prev ? { ...prev, receiver: e.target.value } : null
                      )}
                    />
                    <Input
                      label="手机号码"
                      value={editingAddress?.phone}
                      onChange={(e) => setEditingAddress(prev =>
                        prev ? { ...prev, phone: e.target.value } : null
                      )}
                    />
                  </div>

                  {/* 省份、城市、区县水平排列 */}
                  <div className="grid grid-cols-3 gap-4">
                    <Input
                      label="省份"
                      value={editingAddress?.province}
                      onChange={(e) => setEditingAddress(prev =>
                        prev ? { ...prev, province: e.target.value } : null
                      )}
                    />
                    <Input
                      label="城市"
                      value={editingAddress?.city}
                      onChange={(e) => setEditingAddress(prev =>
                        prev ? { ...prev, city: e.target.value } : null
                      )}
                    />
                    <Input
                      label="区县"
                      value={editingAddress?.district}
                      onChange={(e) => setEditingAddress(prev =>
                        prev ? { ...prev, district: e.target.value } : null
                      )}
                    />
                  </div>

                  <Input
                    label="详细地址"
                    value={editingAddress?.detail}
                    onChange={(e) => setEditingAddress(prev =>
                      prev ? { ...prev, detail: e.target.value } : null
                    )}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  取消
                </Button>
                <Button color="primary" onPress={handleSaveAddress}>
                  {isNewAddress ? '添加' : '保存'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* 底部添加按钮 */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md p-4">
        <Button
          color="primary"
          size="lg"
          className="w-full"
          startContent={<FaPlus />}
          onPress={handleAddNewAddress}
        >
          新增收货地址
        </Button>
      </div>
    </div>
  );
} 