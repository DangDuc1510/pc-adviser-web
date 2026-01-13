"use client";

import {
  Card,
  Typography,
  Divider,
  Space,
  Button,
  Modal,
  List,
  Tag,
  Empty,
  message,
} from "antd";
import {
  TagOutlined,
  GiftOutlined,
  ShoppingOutlined,
  BarcodeOutlined,
} from "@ant-design/icons";
import { formatPrice } from "@/utils/format";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { PromoCodeApi } from "@/apis/orders";

const { Text, Title } = Typography;

const CartSummary = ({
  cart,
  selectedItems = [],
  onApplyCoupon,
  onRemoveCoupon,
  showCoupon = true,
}) => {
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  // Calculate totals based on selected items
  const calculateTotals = () => {
    if (!selectedItems || selectedItems.length === 0) {
      return {
        subtotal: 0,
        productDiscount: 0,
        couponDiscount: 0,
        shipping: 0,
        tax: 0,
        total: 0,
      };
    }

    // Subtotal uses finalPrice (already includes product discount)
    const subtotal = selectedItems.reduce(
      (sum, item) => sum + (item.subtotal || 0),
      0
    );
    // Total discount from products (originalPrice - finalPrice)
    const productDiscount = selectedItems.reduce(
      (sum, item) => sum + (item.discount || 0),
      0
    );
    // Coupon discount from voucher
    const couponDiscount = cart?.couponDiscount || 0;

    const shipping = cart?.totals?.shipping || 0;
    const tax = cart?.totals?.tax || 0;
    // Total is subtotal (already discounted by products) - couponDiscount + shipping + tax
    const total = subtotal - couponDiscount + shipping + tax;

    return {
      subtotal,
      productDiscount,
      couponDiscount,
      shipping,
      tax,
      total: Math.max(0, total),
    };
  };

  const totals = calculateTotals();
  const hasCoupon = cart?.couponCode;

  // Fetch valid promo codes
  const { data: promoCodesData, isLoading: loadingPromoCodes } = useQuery({
    queryKey: ["promoCodes", "valid", totals.subtotal],
    queryFn: async () => {
      const response = await PromoCodeApi.getValid({
        minAmount: totals.subtotal,
      });
      return response.status === "success" ? response.data : [];
    },
    enabled: couponModalOpen && totals.subtotal > 0,
  });

  // Filter promo codes based on cart items applicability
  const promoCodes = useMemo(() => {
    if (!promoCodesData || !Array.isArray(promoCodesData)) return [];
    if (!selectedItems || selectedItems.length === 0) return promoCodesData;

    return promoCodesData.filter((promoCode) => {
      // If applicableTo is "all", it applies to all items
      if (promoCode.applicableTo === "all") {
        return true;
      }

      // Extract IDs from selected items
      const cartProductIds = selectedItems
        .map((item) => {
          const productId = item.productId || item.product?._id;
          return productId?.toString();
        })
        .filter(Boolean);

      const cartCategoryIds = selectedItems
        .map((item) => {
          const categoryId =
            item.product?.categoryId?._id || item.product?.categoryId;
          return categoryId?.toString();
        })
        .filter(Boolean);

      const cartBrandIds = selectedItems
        .map((item) => {
          const brandId = item.product?.brandId?._id || item.product?.brandId;
          return brandId?.toString();
        })
        .filter(Boolean);

      // Check if promo code applies to any item in cart
      if (promoCode.applicableTo === "categories") {
        if (cartCategoryIds.length === 0) return false;
        const promoCategoryIds = (promoCode.categoryIds || []).map(
          (catId) =>
            catId?._id?.toString() || catId?.toString() || String(catId)
        );
        return promoCategoryIds.some((catId) =>
          cartCategoryIds.includes(catId)
        );
      } else if (promoCode.applicableTo === "products") {
        if (cartProductIds.length === 0) return false;
        const promoProductIds = (promoCode.productIds || []).map(
          (prodId) =>
            prodId?._id?.toString() || prodId?.toString() || String(prodId)
        );
        return promoProductIds.some((prodId) =>
          cartProductIds.includes(prodId)
        );
      } else if (promoCode.applicableTo === "brands") {
        if (cartBrandIds.length === 0) return false;
        const promoBrandIds = (promoCode.brandIds || []).map(
          (brandId) =>
            brandId?._id?.toString() || brandId?.toString() || String(brandId)
        );
        return promoBrandIds.some((brandId) => cartBrandIds.includes(brandId));
      }

      return false;
    });
  }, [promoCodesData, selectedItems]);

  const handleApplyCoupon = (promoCode) => {
    if (!promoCode) return;

    setApplyingCoupon(true);
    try {
      // Apply coupon directly with promoCode object (no API call)
      onApplyCoupon?.(promoCode);
      setCouponModalOpen(false);
    } catch (error) {
      message.error("Áp dụng mã giảm giá thất bại");
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    onRemoveCoupon?.();
  };

  const formatDiscountValue = (promoCode) => {
    if (promoCode.discountType === "percentage") {
      return `${promoCode.discountValue}%`;
    }
    return formatPrice(promoCode.discountValue);
  };

  return (
    <>
      <Card
        style={{
          borderRadius: 8,
          border: "1px solid #E0E0E0",
          padding: 16,
        }}
      >
        <Title level={4} style={{ margin: "0 0 16px 0" }}>
          Tóm tắt đơn hàng
        </Title>

        {/* Coupon section */}
        {showCoupon && (
          <>
            {hasCoupon ? (
              <div
                style={{
                  marginBottom: 16,
                  padding: 12,
                  background: "#F5F5F5",
                  borderRadius: 4,
                }}
              >
                <Space
                  style={{ width: "100%", justifyContent: "space-between" }}
                >
                  <Space>
                    <TagOutlined />
                    <Text strong>{cart.couponCode}</Text>
                    {cart.couponDiscount && (
                      <Tag color="green">
                        -{formatPrice(cart.couponDiscount)}
                      </Tag>
                    )}
                  </Space>
                  <Button type="link" size="small" onClick={handleRemoveCoupon}>
                    Xóa
                  </Button>
                </Space>
              </div>
            ) : (
              <div style={{ marginBottom: 16 }}>
                <Button
                  type="dashed"
                  block
                  icon={<GiftOutlined />}
                  onClick={() => setCouponModalOpen(true)}
                  style={{ height: 40 }}
                >
                  Chọn mã giảm giá
                </Button>
              </div>
            )}
            <Divider style={{ margin: "16px 0" }} />
          </>
        )}

        {/* Price breakdown */}
        <Space direction="vertical" style={{ width: "100%" }} size={12}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Text>Tạm tính:</Text>
            <Text>{formatPrice(totals.subtotal)}</Text>
          </div>

          {/* Product Discount */}
          {totals.productDiscount > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Space size={6}>
                <ShoppingOutlined style={{ color: "#52c41a", fontSize: 14 }} />
                <Text type="secondary" style={{ fontSize: 14 }}>
                  Giảm giá sản phẩm:
                </Text>
              </Space>
              <Text type="success" strong style={{ fontSize: 14 }}>
                -{formatPrice(totals.productDiscount)}
              </Text>
            </div>
          )}

          {/* Coupon/Voucher Discount */}
          {totals.couponDiscount > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Space size={6}>
                <BarcodeOutlined style={{ color: "#1890ff", fontSize: 14 }} />
                <Text type="secondary" style={{ fontSize: 14 }}>
                  Giảm giá voucher:
                </Text>
              </Space>
              <Text type="primary" strong style={{ fontSize: 14 }}>
                -{formatPrice(totals.couponDiscount)}
              </Text>
            </div>
          )}

          {totals.shipping > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Text>Phí vận chuyển:</Text>
              <Text>{formatPrice(totals.shipping)}</Text>
            </div>
          )}

          {totals.tax > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Text>Thuế:</Text>
              <Text>{formatPrice(totals.tax)}</Text>
            </div>
          )}
        </Space>

        <Divider style={{ margin: "16px 0" }} />

        {/* Total */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Title level={5} style={{ margin: 0 }}>
            Tổng cộng:
          </Title>
          <Title level={4} style={{ margin: 0, color: "#000" }}>
            {formatPrice(totals.total)}
          </Title>
        </div>
      </Card>

      {/* Coupon Selection Modal */}
      <Modal
        title="Chọn mã giảm giá"
        open={couponModalOpen}
        onCancel={() => setCouponModalOpen(false)}
        footer={null}
        width={600}
      >
        {loadingPromoCodes ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Text type="secondary">Đang tải...</Text>
          </div>
        ) : promoCodes.length === 0 ? (
          <Empty
            description="Không có mã giảm giá khả dụng"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <List
            dataSource={promoCodes}
            renderItem={(promoCode) => (
              <List.Item
                style={{
                  padding: "16px",
                  border: "1px solid #E0E0E0",
                  borderRadius: 8,
                  marginBottom: 12,
                  cursor: "pointer",
                }}
                actions={[
                  <Button
                    key="apply"
                    type="primary"
                    onClick={() => handleApplyCoupon(promoCode)}
                    loading={applyingCoupon}
                  >
                    Áp dụng
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <Text strong style={{ fontSize: 16 }}>
                        {promoCode.code}
                      </Text>
                      <Tag color="green">{formatDiscountValue(promoCode)}</Tag>
                    </Space>
                  }
                  description={
                    <div>
                      {promoCode.name && (
                        <div style={{ marginBottom: 4 }}>
                          <Text>{promoCode.name}</Text>
                        </div>
                      )}
                      {promoCode.description && (
                        <div style={{ marginBottom: 4 }}>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {promoCode.description}
                          </Text>
                        </div>
                      )}
                      {promoCode.minPurchaseAmount > 0 && (
                        <div>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            Áp dụng cho đơn hàng từ{" "}
                            {formatPrice(promoCode.minPurchaseAmount)}
                          </Text>
                        </div>
                      )}
                      {promoCode.maxDiscountAmount && (
                        <div>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            Giảm tối đa{" "}
                            {formatPrice(promoCode.maxDiscountAmount)}
                          </Text>
                        </div>
                      )}
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Modal>
    </>
  );
};

export default CartSummary;
