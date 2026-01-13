"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CartApi } from "@/apis/cart";
import { ProductsApi } from "@/apis/products";
import { App } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { ACCESS_TOKEN } from "@/config/constants";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  trackAddToCart,
  trackRemoveFromCart,
} from "@/services/behaviorTracking";

// Helper function to extract error message and check for auth errors
const getErrorMessage = (error) => {
  // Check if error is from axios response
  const errorMessage =
    error?.response?.data?.message || error?.message || "Đã xảy ra lỗi";

  // Check if it's an authentication error (missing userId or sessionId)
  const authErrorPatterns = [
    "Either userId or sessionId must be provided",
    "userId or sessionId must be provided",
    "userId and sessionId",
    "Token không được cung cấp",
  ];

  const isAuthError = authErrorPatterns.some((pattern) =>
    errorMessage.toLowerCase().includes(pattern.toLowerCase())
  );

  if (isAuthError) {
    return {
      message: "Vui lòng đăng nhập để thực hiện thao tác này",
      isAuthError: true,
    };
  }

  return {
    message: errorMessage,
    isAuthError: false,
  };
};

export const useCart = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { modal, message } = App.useApp();
  const hasAccessToken =
    typeof window !== "undefined" && localStorage.getItem(ACCESS_TOKEN);

  // Load applied coupon from localStorage on mount
  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("appliedCoupon");
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });

  // Save applied coupon to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (appliedCoupon) {
        localStorage.setItem("appliedCoupon", JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem("appliedCoupon");
      }
    }
  }, [appliedCoupon]);
  const {
    data: cartData,
    isLoading: cartLoading,
    refetch: refreshCart,
  } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      if (!hasAccessToken) {
        return null;
      }
      const response = await CartApi.getCart();
      return response.status === "success" && response.data
        ? response.data
        : null;
    },
    enabled: !!hasAccessToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (keep in cache longer)
  });

  // Extract product IDs from cart items
  const productIds = useMemo(() => {
    if (!cartData?.items || cartData.items.length === 0) return [];
    return cartData.items.map((item) => item.productId);
  }, [cartData?.items]);

  // Get products from cache first, then fetch missing ones
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["cart-products", productIds],
    queryFn: async () => {
      if (!productIds || productIds.length === 0) return [];

      // Get all cached products from React Query cache
      const allQueries = queryClient.getQueriesData({ queryKey: ["products"] });
      const productQueries = queryClient.getQueriesData({
        queryKey: ["product"],
      });
      const productBySlugQueries = queryClient.getQueriesData({
        queryKey: ["productBySlug"],
      });

      // Collect all products from cache
      const cachedProducts = new Map();

      // From products list queries
      allQueries.forEach(([, data]) => {
        if (data?.products && Array.isArray(data.products)) {
          data.products.forEach((product) => {
            if (product?._id) {
              cachedProducts.set(product._id.toString(), product);
            }
          });
        } else if (Array.isArray(data)) {
          data.forEach((product) => {
            if (product?._id) {
              cachedProducts.set(product._id.toString(), product);
            }
          });
        }
      });

      // From single product queries
      productQueries.forEach(([, product]) => {
        if (product?._id) {
          cachedProducts.set(product._id.toString(), product);
        }
      });

      // From product by slug queries
      productBySlugQueries.forEach(([, product]) => {
        if (product?._id) {
          cachedProducts.set(product._id.toString(), product);
        }
      });

      // Find which products are missing from cache
      const missingIds = productIds.filter(
        (id) => !cachedProducts.has(id.toString())
      );

      // If all products are in cache, return them immediately
      if (missingIds.length === 0) {
        return productIds
          .map((id) => cachedProducts.get(id.toString()))
          .filter(Boolean);
      }

      // Fetch missing products from API immediately
      const response = await ProductsApi.getByIds(missingIds);
      let fetchedProducts = [];

      // Handle different response formats
      if (response.success && response.data) {
        fetchedProducts = Array.isArray(response.data) ? response.data : [];
      } else if (response.products) {
        fetchedProducts = Array.isArray(response.products)
          ? response.products
          : [];
      } else if (Array.isArray(response)) {
        fetchedProducts = response;
      }

      // Combine cached and fetched products
      const allProducts = productIds
        .map((id) => {
          const idStr = id.toString();
          return (
            cachedProducts.get(idStr) ||
            fetchedProducts.find((p) => p._id?.toString() === idStr)
          );
        })
        .filter(Boolean);

      return allProducts;
    },
    enabled: productIds.length > 0 && !!hasAccessToken,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000, // 10 minutes (keep in cache longer)
  });

  // Map products to cart items and calculate totals
  const cart = useMemo(() => {
    if (!cartData) return null;
    if (!cartData.items || cartData.items.length === 0) {
      return {
        ...cartData,
        items: [],
        totals: {
          subtotal: 0,
          discount: 0,
          tax: 0,
          shipping: 0,
          total: 0,
        },
      };
    }

    if (!productsData || productsData.length === 0) {
      // Return cart with items but no product data yet
      return {
        ...cartData,
        items: cartData.items.map((item) => ({
          ...item,
          product: null,
        })),
        totals: {
          subtotal: 0,
          discount: 0,
          tax: 0,
          shipping: 0,
          total: 0,
        },
      };
    }

    // Create product map
    const productMap = new Map(productsData.map((p) => [p._id.toString(), p]));

    // Map products to items and calculate prices using pricing.finalPrice
    let subtotal = 0;

    const mappedItems = cartData.items.map((item) => {
      const product = productMap.get(item.productId.toString());
      if (!product) {
        return {
          ...item,
          product: null,
        };
      }

      // Use pricing.finalPrice from product (already includes discount)
      const finalPrice = product.pricing?.finalPrice || 0;
      const originalPrice = product.pricing?.originalPrice || finalPrice;
      const itemSubtotal = finalPrice * item.quantity;
      const itemOriginalSubtotal = originalPrice * item.quantity;
      const itemDiscount = itemOriginalSubtotal - itemSubtotal;

      subtotal += itemSubtotal;

      return {
        ...item,
        name: product.name, // Keep full product data
        sku: product.sku,
        productImage: product.images?.[0]?.url || "",
        price: finalPrice,
        originalPrice: originalPrice,
        discount: itemDiscount,
        subtotal: itemSubtotal,
        product: product, // Keep full product object for stock checking
      };
    });

    // Calculate coupon discount if applied
    let couponDiscount = 0;
    if (appliedCoupon && subtotal > 0) {
      if (appliedCoupon.discountType === "percentage") {
        couponDiscount = (subtotal * appliedCoupon.discountValue) / 100;
        // Apply max discount if exists
        if (
          appliedCoupon.maxDiscountAmount &&
          couponDiscount > appliedCoupon.maxDiscountAmount
        ) {
          couponDiscount = appliedCoupon.maxDiscountAmount;
        }
      } else {
        // Fixed amount
        couponDiscount = appliedCoupon.discountValue;
      }
    }

    return {
      ...cartData,
      items: mappedItems,
      couponCode: appliedCoupon?.code || null,
      couponDiscount,
      totals: {
        subtotal,
        discount: 0, // Discount already included in finalPrice
        tax: 0,
        shipping: 0,
        total: subtotal - couponDiscount,
      },
    };
  }, [cartData, productsData, appliedCoupon]);

  const loading = cartLoading || productsLoading;
  const itemCount = cart?.items?.length || 0;
  const total = cart?.totals?.total || 0;

  const addItemMutation = useMutation({
    mutationFn: async ({ productId, quantity = 1 }) => {
      try {
        const response = await CartApi.addItem({ productId, quantity });
        if (response.status !== "success") {
          throw new Error(response.message || "Thêm vào giỏ hàng thất bại");
        }
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      message.success("Đã thêm vào giỏ hàng");
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["cart-products"] });
    },
    onError: (error) => {
      const { message: errorMessage, isAuthError } = getErrorMessage(error);

      if (isAuthError) {
        // Use modal from App.useApp() to ensure user sees the message before redirect
        modal.warning({
          title: "Yêu cầu đăng nhập",
          icon: <ExclamationCircleOutlined />,
          content: errorMessage,
          okText: "Đăng nhập",
          cancelText: "Hủy",
          onOk: () => {
            router.push("/dang-nhap");
          },
          onCancel: () => {
            // User can stay on current page
          },
        });
      } else {
        message.error(errorMessage);
      }
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ productId, quantity }) => {
      const response = await CartApi.updateItem(productId, { quantity });
      if (response.status !== "success") {
        throw new Error(response.message || "Cập nhật giỏ hàng thất bại");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["cart-products"] });
    },
    onError: (error) => {
      const { message: errorMessage, isAuthError } = getErrorMessage(error);

      if (isAuthError) {
        modal.warning({
          title: "Yêu cầu đăng nhập",
          icon: <ExclamationCircleOutlined />,
          content: errorMessage,
          okText: "Đăng nhập",
          cancelText: "Hủy",
          onOk: () => {
            router.push("/dang-nhap");
          },
        });
      } else {
        message.error(errorMessage);
      }
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (productId) => {
      // Get item quantity before removing for tracking
      const cartItem = cartData?.items?.find(item => item.productId === productId);
      const quantity = cartItem?.quantity || 1;
      
      const response = await CartApi.removeItem(productId);
      if (response.status !== "success") {
        throw new Error(response.message || "Xóa khỏi giỏ hàng thất bại");
      }
      
      // Track removal with quantity and reason
      trackRemoveFromCart(productId, quantity, 'user_action', {
        previousQuantity: quantity,
        removedAt: new Date().toISOString()
      });
      
      return response.data;
    },
    onSuccess: () => {
      message.success("Đã xóa khỏi giỏ hàng");
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["cart-products"] });
    },
    onError: (error) => {
      const { message: errorMessage, isAuthError } = getErrorMessage(error);

      if (isAuthError) {
        modal.warning({
          title: "Yêu cầu đăng nhập",
          icon: <ExclamationCircleOutlined />,
          content: errorMessage,
          okText: "Đăng nhập",
          cancelText: "Hủy",
          onOk: () => {
            router.push("/dang-nhap");
          },
        });
      } else {
        message.error(errorMessage);
      }
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      const response = await CartApi.clearCart();
      if (response.status !== "success") {
        throw new Error(response.message || "Xóa giỏ hàng thất bại");
      }
      return response.data;
    },
    onSuccess: () => {
      message.success("Đã xóa giỏ hàng");
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["cart-products"] });
    },
    onError: (error) => {
      const { message: errorMessage, isAuthError } = getErrorMessage(error);

      if (isAuthError) {
        modal.warning({
          title: "Yêu cầu đăng nhập",
          icon: <ExclamationCircleOutlined />,
          content: errorMessage,
          okText: "Đăng nhập",
          cancelText: "Hủy",
          onOk: () => {
            router.push("/dang-nhap");
          },
        });
      } else {
        message.error(errorMessage);
      }
    },
  });

  // Apply coupon locally without API call
  const applyCoupon = useCallback(
    (promoCode) => {
      if (!promoCode) {
        message.error("Mã giảm giá không hợp lệ");
        return;
      }

      // Validate minimum purchase amount
      const currentSubtotal = cart?.totals?.subtotal || 0;
      if (
        promoCode.minPurchaseAmount &&
        currentSubtotal < promoCode.minPurchaseAmount
      ) {
        message.error(
          `Đơn hàng tối thiểu ${promoCode.minPurchaseAmount.toLocaleString(
            "vi-VN"
          )}đ để áp dụng mã này`
        );
        return;
      }

      setAppliedCoupon(promoCode);
      message.success("Đã áp dụng mã giảm giá");
    },
    [cart, message]
  );

  // Remove coupon locally
  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    message.success("Đã xóa mã giảm giá");
  }, [message]);

  // Wrapper functions to match the expected API
  const updateItem = useCallback(
    async (productId, quantity) => {
      return await updateItemMutation.mutateAsync({ productId, quantity });
    },
    [updateItemMutation]
  );

  // Function to get applied coupon (for checkout page)
  const getAppliedCoupon = useCallback(() => {
    return appliedCoupon;
  }, [appliedCoupon]);

  // Function to clear applied coupon (after order created)
  const clearAppliedCoupon = useCallback(() => {
    setAppliedCoupon(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("appliedCoupon");
    }
  }, []);

  return {
    cart,
    loading,
    itemCount,
    total,
    addItem: addItemMutation.mutateAsync,
    updateItem,
    removeItem: removeItemMutation.mutateAsync,
    clearCart: clearCartMutation.mutateAsync,
    applyCoupon,
    removeCoupon,
    getAppliedCoupon,
    clearAppliedCoupon,
    refreshCart,
  };
};
