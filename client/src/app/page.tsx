"use client"

import { useEffect, useState } from "react";
import { Button, Card, Image, Spinner, Input } from "@nextui-org/react";
// import { toast } from "react-toastify";
import { toast } from "sonner";
import apiClient from "@/utils/axiosUtils";
import { motion } from "framer-motion";
import { ProductModal } from "@/components/ProductModal";
import { FaShoppingCart, FaSearch } from "react-icons/fa";
import { useAuth } from "@/contexts/AuthContext";
import AgreementModal from "@/components/AgreementModal";
import { basePath } from "@/config/config";

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  original_price: number;
  image: string;
  stock: number;
  sales_count: number;
  is_promotion: boolean;
  merchant_name: string;
}

interface ProductSpec {
  id: number;
  name: string;
  price: number;
  stock: number;
}

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<number>(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [productSpecs, setProductSpecs] = useState<ProductSpec[]>([]);
  const [selectedSpec, setSelectedSpec] = useState<ProductSpec | null>(null);
  const { user, showLoginModal } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAgreement, setShowAgreement] = useState(false);

  const fetchProducts = async (categoryId: number) => {
    try {
      setIsLoading(true);
      const response = await apiClient.get("/shop/products", {
        params: { category_id: categoryId }
      });
      setProducts(response.data.data);
    } catch (error) {
      console.error(error);
      toast.error("获取商品失败");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const [categoriesRes, productsRes] = await Promise.all([
        apiClient.get("/shop/categories"),
        apiClient.get("/shop/products")
      ]);

      const categories = categoriesRes.data.data;
      setCategories(categories);
      if (categories.length > 0) {
        setSelectedCategory(categories[0].id);
        await fetchProducts(categories[0].id);
      }
    } catch (error) {
      console.error(error);
      toast.error("加载数据失败");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProductSpecs = async (productId: number) => {
    try {
      const response = await apiClient.get(`/shop/products/${productId}/specs`);
      const specs = response.data.data;
      setProductSpecs(specs);
      if (specs.length > 0) {
        setSelectedSpec(specs[0]);
      } else {
        setSelectedSpec(null);
      }
    } catch (error) {
      toast.error("获取商品规格失败");
    }
  };

  const handleProductClick = async (product: Product) => {
    setSelectedProduct(product);
    setQuantity(1);
    await fetchProductSpecs(product.id);
    setIsDialogOpen(true);
  };

  const handleAddToCart = async () => {
    if (!selectedProduct || !selectedSpec) {
      toast.error("请选择商品规格");
      return;
    }

    if (!user) {
      showLoginModal();
      return;
    }

    try {
      await apiClient.post("/shop/cart", {
        product_id: selectedProduct.id,
        spec_id: selectedSpec.id,
        quantity
      });
      toast.success("已加入购物车");
      setIsDialogOpen(false);
    } catch (error) {
      toast.error("加入购物车失败");
    }
  };

  useEffect(() => {
    if (selectedCategory) {
      fetchProducts(selectedCategory);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    // 检查是否已同意协议
    const hasAgreed = localStorage.getItem('userAgreement');
    if (!hasAgreed) {
      setShowAgreement(true);
    }
  }, []);

  const handleAcceptAgreement = () => {
    localStorage.setItem('userAgreement', 'true');
    setShowAgreement(false);
  };

  const handleRejectAgreement = () => {
    // 可以根据需要跳转到其他页面或显示提示
    window.location.href = 'about:blank';
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 格式化商品名称，超过长度显示省略号
  const formatProductName = (name: string, maxLength: number = 20) => {
    return name.length > maxLength ? `${name.substring(0, maxLength)}...` : name;
  };

  // 格式化商家名称
  const formatMerchantName = (name: string, maxLength: number = 8) => {
    return name.length > maxLength ? `${name.substring(0, maxLength)}...` : name;
  };

  // 添加图片预处理函数
  const getImageUrl = (url: string) => {
    if (!url) return `${basePath}/images/placeholder.png`;
    // 确保URL是HTTPS
    // if (url.startsWith('http:')) {
    //   url = url.replace('http:', 'https:');
    // }
    return url;
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <div className="flex h-[calc(100vh-4rem)] bg-background">
        <div className="w-20 min-w-[80px] flex-shrink-0 bg-background/60 backdrop-blur-md border-r">
          {categories.map((category) => (
            <motion.button
              key={category.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(category.id)}
              className={`w-full py-3 px-2 text-xs transition-colors whitespace-nowrap ${selectedCategory === category.id
                ? "bg-primary/10 text-primary border-r-2 border-primary"
                : "hover:bg-gray-100"
                }`}
            >
              {category.name}
            </motion.button>
          ))}
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <div className="p-3 bg-background/60 backdrop-blur-md border-b">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索商品..."
              size="sm"
              startContent={<FaSearch className="text-gray-400" size={14} />}
              classNames={{
                input: "text-sm",
                inputWrapper: "h-10"
              }}
            />
          </div>

          <div className="flex-1 p-3 overflow-auto">
            {isLoading ? (
              <div className="flex h-full items-center justify-center">
                <Spinner size="lg" />
              </div>
            ) : (
              <div className="space-y-3">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="w-full" shadow="sm">
                    <div className="flex items-center p-3">
                      <Image
                        src={getImageUrl(product.image)}
                        alt={product.name}
                        width={80}
                        height={80}
                        onClick={() => {
                          handleProductClick(product);
                        }}
                        classNames={{
                          wrapper: "min-w-[80px] min-h-[80px] w-20 h-20 rounded-lg overflow-hidden shrink-0 shadow-none",
                          img: "w-full h-full object-cover"
                        }}
                        loading="lazy"
                        fallbackSrc={`${basePath}/images/placeholder.png`}
                        style={{
                          WebkitBackfaceVisibility: 'hidden', // iOS Safari 优化
                          backfaceVisibility: 'hidden'
                        }}
                      />
                      <div className="flex-1 ml-3 min-w-0">
                        <h3 className="text-sm font-semibold truncate">
                          {formatProductName(product.name)}
                        </h3>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-red-500 text-base font-bold">
                            ¥{product.price}
                          </span>
                          <span className="text-gray-400 line-through text-xs">
                            ¥{product.original_price}
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-500 mt-1">
                          月售{product.sales_count} | 库存{product.stock}
                        </div>
                        {/* 商家标签 */}
                        <div className="flex mt-1 overflow-hidden">
                          <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] truncate max-w-[120px]">
                            {formatMerchantName(product.merchant_name)}
                          </span>
                        </div>
                      </div>
                      <Button
                        isIconOnly
                        color="primary"
                        className="w-8 h-8 min-w-8 rounded-full bg-primary/10 hover:bg-primary/20 shrink-0"
                        onPress={() => handleProductClick(product)}>
                        <FaShoppingCart className="text-primary text-sm" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <ProductModal
          isOpen={isDialogOpen}
          onCloseAction={() => {
            setIsDialogOpen(false);
            setSelectedSpec(null);
          }}
          product={selectedProduct}
          quantity={quantity}
          setQuantityAction={setQuantity}
          onAddToCartAction={handleAddToCart}
          specs={productSpecs}
          selectedSpec={selectedSpec}
          setSelectedSpecAction={setSelectedSpec}
        />
      </div>

      <AgreementModal
        isOpen={showAgreement}
        onAccept={handleAcceptAgreement}
        onReject={handleRejectAgreement}
      />
    </>
  );
}