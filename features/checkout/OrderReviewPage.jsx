"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Typography,
  App,
  Space,
  Divider,
  Spin,
  Alert,
  Image,
} from "antd";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { OrdersApi } from "@/apis/orders";
import { trackPurchase } from "@/services/behaviorTracking";
import {
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
} from "@/config/orderConstants";
import { formatPrice } from "@/utils/format";

const { Title, Text } = Typography;

function OrderReviewPageContent() {
  const { message: messageApi } = App.useApp();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [checkoutFormData, setCheckoutFormData] = useState(null);

  // Load checkout form data from sessionStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    const dataStr = sessionStorage.getItem("checkoutFormData");
    if (!dataStr) {
      messageApi.warning("Không tìm thấy thông tin đơn hàng");
      router.push("/thanh-toan");
      return;
    }

    try {
      const data = JSON.parse(dataStr);
      setCheckoutFormData(data);
    } catch (error) {
      console.error("Parse checkout form data failed:", error);
      messageApi.error("Dữ liệu đơn hàng không hợp lệ");
      router.push("/thanh-toan");
    } finally {
      setLoading(false);
    }
  }, [router, messageApi]);

  const handleEdit = () => {
    router.push("/thanh-toan");
  };

  const handleConfirmOrder = async () => {
    if (!checkoutFormData) return;

    try {
      setSubmitting(true);

      const { checkoutData, formData } = checkoutFormData;

      // Prepare order data
      const orderData = {
        products: checkoutData.products.map((p) => ({
          productId: p.productId,
          quantity: p.quantity,
        })),
        couponCode: checkoutData.coupon || null,
        shippingInfo: formData.shippingInfo,
        paymentMethod: formData.paymentMethod,
        customerNote: formData.customerNote || "",
      };

      // Create order
      const response = await OrdersApi.create(orderData);
      if (response.status !== "success" || !response.data) {
        throw new Error(response.message || "Tạo đơn hàng thất bại");
      }

      const order = response.data;

      // Clear sessionStorage
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("checkoutPayload");
        sessionStorage.removeItem("checkoutFormData");
      }

      // Track purchase
      trackPurchase(
        order.orderNumber || order._id,
        checkoutData.finalTotal || 0,
        checkoutData.products || [],
        {
          paymentMethod: formData.paymentMethod,
        }
      );

      // Handle payment based on method
      if (formData.paymentMethod === PAYMENT_METHODS.COD) {
        // COD - redirect to result page
        messageApi.success("Đặt hàng thành công!");
        router.push(
          `/thanh-toan/ket-qua?status=success&orderId=${order._id}&orderNumber=${order.orderNumber}`
        );
      } else if (formData.paymentMethod === PAYMENT_METHODS.VNPAY) {
        // VNPAY - create payment URL and redirect
        messageApi.loading({
          content: "Đang chuyển hướng đến cổng thanh toán VNPay...",
          key: "payment-session",
        });

        try {
          const paymentResponse = await OrdersApi.createVnpayPaymentUrl(
            order._id,
            {
              locale: "vn",
            }
          );

          if (
            paymentResponse.status === "success" &&
            paymentResponse.data?.paymentUrl
          ) {
            messageApi.destroy("payment-session");
            if (typeof window !== "undefined") {
              window.location.href = paymentResponse.data.paymentUrl;
            }
          } else {
            throw new Error(
              paymentResponse.message || "Không thể tạo URL thanh toán VNPay"
            );
          }
        } catch (paymentError) {
          console.error("Create VNPay payment URL failed:", paymentError);
          messageApi.destroy("payment-session");
          messageApi.error(
            paymentError.response?.data?.message ||
              paymentError.message ||
              "Không thể tạo URL thanh toán VNPay"
          );
        }
      }
    } catch (error) {
      console.error("Create order failed:", error);
      messageApi.error(
        error?.response?.data?.message ||
          error?.message ||
          "Không thể tạo đơn hàng, vui lòng thử lại"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!checkoutFormData) {
    return null;
  }

  const { checkoutData, formData } = checkoutFormData;

  return (
    <div
      style={{
        background: "#F5F5F5",
        minHeight: "calc(100vh - 64px)",
        padding: "32px 24px",
      }}
    >
      <div className="container" style={{ maxWidth: 800 }}>
        <Title level={2} style={{ marginBottom: 32 }}>
          Xác nhận đơn hàng
        </Title>

        <Card style={{ marginBottom: 24 }}>
          {/* Customer Info */}
          <div style={{ marginBottom: 24 }}>
            <Title level={4}>Thông tin người nhận</Title>
            <Space direction="vertical" style={{ width: "100%" }} size={8}>
              <div>
                <Text type="secondary">Họ tên: </Text>
                <Text strong>{formData.shippingInfo.name}</Text>
              </div>
              <div>
                <Text type="secondary">Số điện thoại: </Text>
                <Text strong>{formData.shippingInfo.phone}</Text>
              </div>
              <div>
                <Text type="secondary">Địa chỉ: </Text>
                <Text strong>{formData.shippingInfo.address}</Text>
              </div>
              {formData.customerNote && (
                <div>
                  <Text type="secondary">Ghi chú: </Text>
                  <Text>{formData.customerNote}</Text>
                </div>
              )}
            </Space>
          </div>

          <Divider />

          {/* Payment Method */}
          <div style={{ marginBottom: 24 }}>
            <Title level={4}>Phương thức thanh toán</Title>
            <Text strong>{PAYMENT_METHOD_LABELS[formData.paymentMethod]}</Text>
          </div>

          <Divider />

          {/* Products */}
          <div style={{ marginBottom: 24 }}>
            <Title level={4}>Sản phẩm</Title>
            <Space direction="vertical" style={{ width: "100%" }} size={12}>
              {checkoutData.products.map((product, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    gap: 16,
                    padding: "12px 0",
                  }}
                >
                  {/* Product Image */}
                  <div style={{ flexShrink: 0 }}>
                    <Image
                      src={
                        product.image ||
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect width='80' height='80' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-size='12'%3ENo Image%3C/text%3E%3C/svg%3E"
                      }
                      alt={product.name}
                      width={80}
                      height={80}
                      style={{
                        objectFit: "cover",
                        borderRadius: 8,
                        border: "1px solid #E0E0E0",
                      }}
                      fallback="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect width='80' height='80' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-size='12'%3ENo Image%3C/text%3E%3C/svg%3E"
                      preview={false}
                    />
                  </div>
                  {/* Product Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text strong style={{ display: "block", marginBottom: 4 }}>
                      {product.name}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 14 }}>
                      {formatPrice(product.price)} x {product.quantity}
                    </Text>
                  </div>
                  {/* Product Price */}
                  <div style={{ flexShrink: 0, textAlign: "right" }}>
                    <Text strong>{formatPrice(product.subtotal)}</Text>
                  </div>
                </div>
              ))}
            </Space>
          </div>

          <Divider />

          {/* Pricing Summary */}
          <div>
            <Title level={4}>Tổng thanh toán</Title>
            <Space direction="vertical" style={{ width: "100%" }} size={8}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Text>Tạm tính:</Text>
                <Text>{formatPrice(checkoutData.subtotal)}</Text>
              </div>
              {checkoutData.discount > 0 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Text>Giảm giá:</Text>
                  <Text type="success">
                    -{formatPrice(checkoutData.discount)}
                  </Text>
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Text>Phí vận chuyển:</Text>
                <Text>{formatPrice(checkoutData.shippingCost || 0)}</Text>
              </div>
              <Divider style={{ margin: "12px 0" }} />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Text strong style={{ fontSize: 18 }}>
                  Tổng cộng:
                </Text>
                <Text strong style={{ fontSize: 18, color: "#1890ff" }}>
                  {formatPrice(checkoutData.finalTotal)}
                </Text>
              </div>
            </Space>
          </div>
        </Card>

        {/* Action Buttons */}
        <Space size={16} style={{ width: "100%", justifyContent: "flex-end" }}>
          <Button size="large" onClick={handleEdit} disabled={submitting}>
            Sửa thông tin
          </Button>
          <Button
            type="primary"
            size="large"
            onClick={handleConfirmOrder}
            loading={submitting}
            style={{ minWidth: 200 }}
          >
            Xác nhận đặt hàng
          </Button>
        </Space>

        {formData.paymentMethod === PAYMENT_METHODS.VNPAY && (
          <Alert
            type="info"
            showIcon
            style={{ marginTop: 24, backgroundColor: "#F5F5F5" }}
            message="Sau khi xác nhận, bạn sẽ được chuyển hướng đến cổng thanh toán VNPay."
          />
        )}
      </div>
    </div>
  );
}

export default function OrderReviewPage() {
  return (
    <ProtectedRoute>
      <OrderReviewPageContent />
    </ProtectedRoute>
  );
}
