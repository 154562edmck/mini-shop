"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Button,
  Card,
  Avatar,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";
import { toast } from "sonner";
import apiClient from "@/utils/axiosUtils";
import {
  FaShoppingCart,
  FaTruck,
  FaCheckCircle,
  FaCreditCard,
  FaMapMarkerAlt,
  FaHeadset,
  FaCog,
  FaSignOutAlt,
  FaWeixin,
  FaChevronRight
} from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface OrderStats {
  pending_payment: number;
  paid: number;
  shipped: number;
  completed: number;
}

interface ProfileData {
  userInfo: {
    nickname: string;
    avatar: string;
  };
  orderStats: OrderStats;
  addressCount: number;
}

export default function Profile() {
  const { user, logout, showLoginModal, checkAuth } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      if (!user) {
        setIsLoading(false);
        showLoginModal();
        return;
      }
      await fetchProfile();
    };

    init(); // 直接执行初始化
  }, [user]); // 只依赖 user 变化

  const fetchProfile = async () => {
    try {
      const response = await apiClient.get("/user/profile");
      setProfileData(response.data.data);
    } catch (error: any) { // 明确指定 error 类型为 any，或者使用更具体的类型
      if (error.response?.status === 401) {
        // 如果是未授权错误，重新检查认证状态
        await checkAuth();
      } else {
        toast.error("获取个人信息失败");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // 未登录时显示登录提示页面
  if (!user) {
    return (
      <div className="container mx-auto max-w-2xl p-4 pb-[80px]">
        <h1 className="text-2xl font-bold mb-4">个人中心</h1>
        <Card className="p-6 shadow-sm">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="flex items-center justify-center w-16 h-16 bg-primary-50 rounded-full mb-6">
              <FaWeixin size={24} className="text-primary" />
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

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    toast.success("已退出登录");
    router.push('/');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/80">
      {/* 用户信息卡片 */}
      <Card className="mx-4 mt-4 shadow-sm">
        <div className="flex items-center p-4 space-x-4">
          <Avatar
            src={profileData?.userInfo.avatar}
            className="w-16 h-16"
            alt="用户头像"
          />
          <div className="flex-1">
            <h2 className="text-lg font-medium">{profileData?.userInfo.nickname}</h2>
            <div className="flex items-center mt-1 text-success-600">
              <FaWeixin className="w-3.5 h-3.5 mr-1" />
              <span className="text-sm">已绑定微信</span>
            </div>
          </div>
        </div>
      </Card>

      {/* 订单统计 */}
      <Card className="mx-4 mt-4 shadow-sm">
        <div className="grid grid-cols-4 py-4">
          <Link href="/orders" className="flex flex-col items-center">
            <div className="relative">
              <FaShoppingCart className="w-5 h-5 text-primary-500 mb-1" />
            </div>
            <span className="text-xs mt-1">全部</span>
          </Link>
          <Link href="/orders?status=0" className="flex flex-col items-center">
            <div className="relative">
              <FaCreditCard className="w-5 h-5 text-primary-500 mb-1" />
              {profileData?.orderStats.pending_payment > 0 && (
                <span className="absolute -top-1 -right-1 bg-danger-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {profileData.orderStats.pending_payment}
                </span>
              )}
            </div>
            <span className="text-xs mt-1">待支付</span>
          </Link>
          <Link href="/orders?status=1" className="flex flex-col items-center">
            <FaTruck className="w-5 h-5 text-primary-500 mb-1" />
            <span className="text-xs mt-1">待发货</span>
          </Link>
          <Link href="/orders?status=2" className="flex flex-col items-center">
            <FaCheckCircle className="w-5 h-5 text-primary-500 mb-1" />
            <span className="text-xs mt-1">已过期</span>
          </Link>
        </div>
      </Card>

      {/* 功能选项 */}
      <Card className="mx-4 mt-4 shadow-sm">
        <div className="divide-y divide-gray-100">
          <Link
            href="/address"
            className="flex items-center px-4 h-12 hover:bg-gray-50 active:bg-gray-100"
          >
            <FaMapMarkerAlt className="w-4 h-4 text-gray-400" />
            <span className="ml-3 flex-1">收货地址</span>
            <span className="text-gray-400 text-sm mr-2">{profileData?.addressCount}个地址</span>
            <FaChevronRight className="w-3 h-3 text-gray-300" />
          </Link>
          <div className="flex items-center px-4 h-12 hover:bg-gray-50 active:bg-gray-100 hidden">
            <FaHeadset className="w-4 h-4 text-gray-400" />
            <span className="ml-3 flex-1">联系客服</span>
            <FaChevronRight className="w-3 h-3 text-gray-300" />
          </div>
          <Link href="/settings" className="flex items-center px-4 h-12 hover:bg-gray-50 active:bg-gray-100">
            <FaCog className="w-4 h-4 text-gray-400" />
            <span className="ml-3 flex-1">设置</span>
            <FaChevronRight className="w-3 h-3 text-gray-300" />
          </Link>
          <Button
            className="w-full h-12 justify-start px-4"
            variant="light"
            onPress={handleLogout}
          >
            <FaSignOutAlt className="w-4 h-4 text-danger-500" />
            <span className="ml-3 text-danger-500">退出登录</span>
          </Button>
        </div>
      </Card>

      {/* 退出登录确认弹窗 */}
      <Modal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        size="xs"
        placement="auto"
        classNames={{
          base: "bg-background/80 backdrop-blur-md",
          wrapper: "max-w-[100%] md:max-w-md h-[100dvh] items-center",
          body: "py-6 px-4",
          closeButton: "hover:bg-white/5 active:bg-white/10",
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">确认退出</ModalHeader>
          <ModalBody>
            <p>确定要退出登录吗？</p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setShowLogoutConfirm(false)}>
              取消
            </Button>
            <Button color="danger" onPress={confirmLogout}>
              确认退出
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
} 