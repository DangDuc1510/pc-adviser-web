"use client";

import { Button, Typography, Space, Divider, Checkbox, App } from "antd";
import { ShoppingOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useMemo } from "react";
import CartItem from "@/components/cart/CartItem";
import CartSummary from "@/components/cart/CartSummary";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { OrdersApi } from "@/apis/orders";

const { Title, Text } = Typography;

export default function CartPage() {
  const { message: messageApi } = App.useApp();
  const router = useRouter();
  const {
    cart,
    loading,
    applyCoupon,
    removeCoupon,
    getAppliedCoupon,
    clearAppliedCoupon,
    refreshCart,
  } = useCart();
  const [selectedItems, setSelectedItems] = useState(new Set());
  const previousItemIdsRef = React.useRef("");
  const { user } = useAuth();

  const [creatingOrder, setCreatingOrder] = useState(false);

  // Auto-select all items only when items actually change (added/removed), not when cart object updates
  useEffect(() => {
    if (!cart?.items || cart.items.length === 0) {
      setSelectedItems(new Set());
      previousItemIdsRef.current = "";
      return;
    }

    // Create a stable string representation of product IDs
    const currentItemIds = cart.items
      .map((item) => item.productId?.toString())
      .filter(Boolean)
      .sort()
      .join(",");

    // Only update selection if product IDs actually changed (items added/removed)
    if (currentItemIds !== previousItemIdsRef.current) {
      // If this is first load or items were added/removed, auto-select all
      if (
        !previousItemIdsRef.current ||
        currentItemIds.split(",").length !==
          previousItemIdsRef.current.split(",").length
      ) {
        const allProductIds = new Set(cart.items.map((item) => item.productId));
        setSelectedItems(allProductIds);
      } else {
        // Items were replaced, keep only selected items that still exist
        setSelectedItems((prev) => {
          const currentProductIds = new Set(
            cart.items.map((item) => item.productId)
          );
          return new Set([...prev].filter((id) => currentProductIds.has(id)));
        });
      }
      previousItemIdsRef.current = currentItemIds;
    }
  }, [cart?.items]);

  const handleItemChecked = (productId, checked) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(productId);
      } else {
        newSet.delete(productId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (checked) => {
    if (checked && cart?.items) {
      // Only select items that are in stock
      const availableProductIds = new Set(
        cart.items
          .filter((item) => {
            const product = item.product;
            const stock = product?.inventory?.stock || 0;
            const reservedStock = product?.inventory?.reservedStock || 0;
            const availableStock = stock - reservedStock;
            return availableStock > 0;
          })
          .map((item) => item.productId)
      );
      setSelectedItems(availableProductIds);
    } else {
      setSelectedItems(new Set());
    }
  };

  const selectedCartItems = useMemo(() => {
    if (!cart?.items) return [];
    return cart.items.filter((item) => selectedItems.has(item.productId));
  }, [cart?.items, selectedItems]);

  // Count available items (in stock)
  const availableItems = useMemo(() => {
    if (!cart?.items) return [];
    return cart.items.filter((item) => {
      const product = item.product;
      const stock = product?.inventory?.stock || 0;
      const reservedStock = product?.inventory?.reservedStock || 0;
      const availableStock = stock - reservedStock;
      return availableStock > 0;
    });
  }, [cart?.items]);

  const isAllSelected =
    availableItems.length > 0 && selectedItems.size === availableItems.length;
  const isIndeterminate =
    selectedItems.size > 0 && selectedItems.size < availableItems.length;

  const handleCheckout = async () => {
    if (!selectedCartItems.length) {
      messageApi.warning("Vui lòng chọn ít nhất một sản phẩm để thanh toán");
      return;
    }

    if (!user) {
      messageApi.warning("Vui lòng đăng nhập để tiếp tục");
      router.push("/dang-nhap");
      return;
    }
    setCreatingOrder(true);
    try {
      const payload = {
        productIds: selectedCartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity || 1,
        })),
        couponCode: getAppliedCoupon()?.code,
      };

      // Save checkout data to sessionStorage for CheckoutPage
      if (typeof window !== "undefined") {
        sessionStorage.setItem("checkoutPayload", JSON.stringify(payload));
      }

      clearAppliedCoupon();
      messageApi.success("Chuyển đến trang thanh toán");
      router.push("/thanh-toan");
    } catch (error) {
      console.error("Checkout failed:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Không thể chuyển đến trang thanh toán, vui lòng thử lại";
      messageApi.error(errorMessage);
    } finally {
      setCreatingOrder(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  const hasItems = cart?.items && cart.items.length > 0;

  return (
    <div style={{ background: "#F5F5F5", minHeight: "calc(100vh - 64px)" }}>
      <div className="container" style={{ padding: "32px 24px" }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => router.back()}
            style={{ marginBottom: 16 }}
          >
            Tiếp tục mua sắm
          </Button>
          <Title level={2} style={{ margin: 0 }}>
            Giỏ hàng của bạn
            {hasItems && (
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 400,
                  color: "#666",
                  marginLeft: 8,
                }}
              >
                ({cart.items.length} sản phẩm)
              </span>
            )}
          </Title>
        </div>

        {!hasItems ? (
          <EmptyState
            icon={<ShoppingOutlined style={{ fontSize: 64, color: "#999" }} />}
            title="Giỏ hàng trống"
            description="Bạn chưa có sản phẩm nào trong giỏ hàng"
            actionText="Tiếp tục mua sắm"
            onAction={() => router.push("/san-pham")}
          />
        ) : (
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {/* Cart Items */}
            <div style={{ flex: "1 1 600px", minWidth: 0 }}>
              {/* Select All */}
              <div
                style={{
                  marginBottom: 16,
                  padding: "12px 16px",
                  background: "#fff",
                  borderRadius: 8,
                  border: "1px solid #E0E0E0",
                }}
              >
                <Checkbox
                  checked={isAllSelected}
                  indeterminate={isIndeterminate}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                >
                  <Text strong>
                    Chọn tất cả ({selectedItems.size}/{availableItems.length}{" "}
                    sản phẩm có sẵn)
                  </Text>
                </Checkbox>
                {cart.items.length > availableItems.length && (
                  <Text
                    type="secondary"
                    style={{
                      fontSize: 12,
                      marginLeft: 24,
                      display: "block",
                      marginTop: 4,
                    }}
                  >
                    {cart.items.length - availableItems.length} sản phẩm hết
                    hàng đã được bỏ qua
                  </Text>
                )}
              </div>

              {cart.items.map((item) => (
                <CartItem
                  key={item.productId}
                  item={item}
                  checked={selectedItems.has(item.productId)}
                  onCheckedChange={handleItemChecked}
                />
              ))}
            </div>

            {/* Cart Summary */}
            <div style={{ flex: "0 0 380px", minWidth: 300 }}>
              <div style={{ position: "sticky", top: 80 }}>
                <CartSummary
                  cart={cart}
                  selectedItems={selectedCartItems}
                  onApplyCoupon={applyCoupon}
                  onRemoveCoupon={removeCoupon}
                />

                <Divider style={{ margin: "16px 0" }} />

                <Space direction="vertical" style={{ width: "100%" }} size={12}>
                  <Button
                    type="primary"
                    size="large"
                    block
                    onClick={handleCheckout}
                    style={{ height: 56, fontSize: 16, fontWeight: 600 }}
                    className="btn-elegant"
                    loading={creatingOrder}
                  >
                    Tiến hành thanh toán
                  </Button>
                  <Button
                    size="large"
                    block
                    onClick={() => router.push("/san-pham")}
                    style={{ height: 48 }}
                  >
                    Tiếp tục mua sắm
                  </Button>
                </Space>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
