"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  InputNumber,
  Radio,
  Button,
  Typography,
  App,
  Space,
  Alert,
  Spin,
  Image,
} from "antd";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import CartSummary from "@/components/cart/CartSummary";
import AddressInput from "@/components/common/AddressInput";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useAuth } from "@/hooks/useAuth";
import { OrdersApi, PromoCodeApi } from "@/apis/orders";
import { trackCheckoutStart } from "@/services/behaviorTracking";
import {
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHOD_DESCRIPTIONS,
} from "@/config/orderConstants";
import { formatPrice } from "@/utils/format";

const { Title, Text } = Typography;

function CheckoutPageContent() {
  const { message: messageApi } = App.useApp();
  const router = useRouter();
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [checkoutData, setCheckoutData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS.VNPAY);
  const availablePaymentMethods = [PAYMENT_METHODS.VNPAY, PAYMENT_METHODS.COD];
  const [couponCode, setCouponCode] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [updatingQuantity, setUpdatingQuantity] = useState(false);

  // Load checkout payload from sessionStorage
  useEffect(() => {
    const loadCheckoutData = async () => {
      try {
        if (typeof window === "undefined") return;

        const payloadStr = sessionStorage.getItem("checkoutPayload");
        if (!payloadStr) {
          messageApi.warning("Không tìm thấy thông tin đơn hàng");
          router.push("/gio-hang");
          return;
        }

        const payload = JSON.parse(payloadStr);
        setLoading(true);

        // Call POST /orders/checkout
        const response = await OrdersApi.checkout(payload);
        if (response.status !== "success" || !response.data) {
          throw new Error(response.message || "Không thể tính toán đơn hàng");
        }

        const data = response.data;
        setCheckoutData(data);

        // Auto-fill form with user info
        form.setFieldsValue({
          name:
            data.shippingInfo?.name ||
            data.userInfo?.name ||
            user?.userName ||
            "",
          phone:
            data.shippingInfo?.phone ||
            data.userInfo?.phone ||
            user?.phone ||
            "",
          address:
            data.shippingInfo?.address ||
            data.userInfo?.address ||
            user?.address ||
            "",
        });

        // Track checkout start
        if (data.products && data.products.length > 0) {
          trackCheckoutStart({
            itemsCount: data.products.length,
            total: data.finalTotal || 0,
          });
        }
      } catch (error) {
        console.error("Load checkout data failed:", error);
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Không thể tải thông tin đơn hàng";

        // Show specific error message for stock issues
        if (
          errorMessage.toLowerCase().includes("hết hàng") ||
          errorMessage.toLowerCase().includes("không đủ hàng") ||
          errorMessage.toLowerCase().includes("stock")
        ) {
          messageApi.error({
            content: errorMessage,
            duration: 5,
          });
        } else {
          messageApi.error(errorMessage);
        }

        router.push("/gio-hang");
      } finally {
        setLoading(false);
      }
    };

    loadCheckoutData();
  }, [router, form, user, messageApi]);

  // Handle apply coupon
  const handleApplyCoupon = async (promoCode) => {
    if (!checkoutData || !promoCode) return;

    try {
      setApplyingCoupon(true);

      // Get current payload from sessionStorage
      const payloadStr = sessionStorage.getItem("checkoutPayload");
      if (!payloadStr) {
        messageApi.error("Không tìm thấy thông tin đơn hàng");
        return;
      }

      const payload = JSON.parse(payloadStr);

      // Update payload with coupon code
      const updatedPayload = {
        ...payload,
        couponCode: promoCode.code,
      };

      // Save updated payload
      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          "checkoutPayload",
          JSON.stringify(updatedPayload)
        );
      }

      // Recalculate checkout with coupon
      const response = await OrdersApi.checkout(updatedPayload);
      if (response.status !== "success" || !response.data) {
        throw new Error(response.message || "Không thể áp dụng mã giảm giá");
      }

      // Update checkout data
      setCheckoutData(response.data);
      messageApi.success(`Đã áp dụng mã giảm giá: ${promoCode.code}`);
    } catch (error) {
      console.error("Apply coupon failed:", error);
      messageApi.error(
        error?.response?.data?.message ||
          error?.message ||
          "Không thể áp dụng mã giảm giá"
      );
    } finally {
      setApplyingCoupon(false);
    }
  };

  // Handle remove coupon
  const handleRemoveCoupon = async () => {
    if (!checkoutData) return;

    try {
      setApplyingCoupon(true);

      // Get current payload from sessionStorage
      const payloadStr = sessionStorage.getItem("checkoutPayload");
      if (!payloadStr) {
        messageApi.error("Không tìm thấy thông tin đơn hàng");
        return;
      }

      const payload = JSON.parse(payloadStr);

      // Remove coupon code
      const updatedPayload = {
        ...payload,
        couponCode: null,
      };

      // Save updated payload
      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          "checkoutPayload",
          JSON.stringify(updatedPayload)
        );
      }

      // Recalculate checkout without coupon
      const response = await OrdersApi.checkout(updatedPayload);
      if (response.status !== "success" || !response.data) {
        throw new Error(response.message || "Không thể xóa mã giảm giá");
      }

      // Update checkout data
      setCheckoutData(response.data);
      messageApi.success("Đã xóa mã giảm giá");
    } catch (error) {
      console.error("Remove coupon failed:", error);
      messageApi.error(
        error?.response?.data?.message ||
          error?.message ||
          "Không thể xóa mã giảm giá"
      );
    } finally {
      setApplyingCoupon(false);
    }
  };

  // Handle quantity change
  const handleQuantityChange = async (productIndex, newQuantity) => {
    if (!checkoutData || newQuantity < 1) return;

    try {
      setUpdatingQuantity(true);

      // Get current payload from sessionStorage
      const payloadStr = sessionStorage.getItem("checkoutPayload");
      if (!payloadStr) {
        messageApi.error("Không tìm thấy thông tin đơn hàng");
        return;
      }

      const payload = JSON.parse(payloadStr);

      // Update quantity for the specific product
      const updatedProductIds = payload.productIds.map((item, index) => {
        if (index === productIndex) {
          return {
            ...item,
            quantity: newQuantity,
          };
        }
        return item;
      });

      // Update payload
      const updatedPayload = {
        ...payload,
        productIds: updatedProductIds,
      };

      // Save updated payload
      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          "checkoutPayload",
          JSON.stringify(updatedPayload)
        );
      }

      // Recalculate checkout
      const response = await OrdersApi.checkout(updatedPayload);
      if (response.status !== "success" || !response.data) {
        throw new Error(response.message || "Không thể cập nhật số lượng");
      }

      // Update checkout data
      setCheckoutData(response.data);
      messageApi.success("Đã cập nhật số lượng");
    } catch (error) {
      console.error("Update quantity failed:", error);
      messageApi.error(
        error?.response?.data?.message ||
          error?.message ||
          "Không thể cập nhật số lượng"
      );
    } finally {
      setUpdatingQuantity(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const values = await form.validateFields();

      // Prepare checkout data for OrderReviewPage
      const checkoutFormData = {
        checkoutData,
        formData: {
          shippingInfo: {
            name: values.name,
            phone: values.phone,
            address: values.address,
          },
          paymentMethod: paymentMethod,
          customerNote: values.note || "",
        },
      };

      // Save to sessionStorage
      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          "checkoutFormData",
          JSON.stringify(checkoutFormData)
        );
      }

      // Redirect to review page
      router.push("/thanh-toan/xac-nhan");
    } catch (error) {
      console.error("Form validation failed:", error);
      if (error.errorFields) {
        messageApi.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!checkoutData) {
    return null;
  }

  // Prepare summary data for CartSummary
  const summaryData = {
    items: checkoutData.products.map((product) => ({
      ...product,
      subtotal: product.subtotal,
    })),
    couponCode: checkoutData.coupon || null,
    couponDiscount: checkoutData.discount || 0,
    totals: {
      subtotal: checkoutData.subtotal || 0,
      discount: checkoutData.discount || 0,
      shipping: checkoutData.shippingCost || 0,
      tax: 0,
      total: checkoutData.finalTotal || 0,
    },
  };

  return (
    <div
      style={{
        background: "#F5F5F5",
        minHeight: "calc(100vh - 64px)",
        padding: "32px 24px",
      }}
    >
      <div className="container">
        <Title level={2} style={{ marginBottom: 32 }}>
          Thanh toán
        </Title>

        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          {/* Form */}
          <div style={{ flex: "1 1 600px", minWidth: 0 }}>
            <Card>
              <Form form={form} layout="vertical" onFinish={handleSubmit}>
                {/* Section A: Customer Info */}
                <div style={{ marginBottom: 32 }}>
                  <Title level={4}>Thông tin khách hàng</Title>
                  <Form.Item
                    name="name"
                    label="Họ và tên"
                    rules={[
                      { required: true, message: "Vui lòng nhập họ tên!" },
                    ]}
                  >
                    <Input size="large" placeholder="Nhập họ và tên" />
                  </Form.Item>

                  <Form.Item
                    name="phone"
                    label="Số điện thoại"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập số điện thoại!",
                      },
                      {
                        pattern: /^[0-9]{10}$/,
                        message: "Số điện thoại không hợp lệ!",
                      },
                    ]}
                  >
                    <Input size="large" placeholder="Nhập số điện thoại" />
                  </Form.Item>
                </div>

                {/* Section B: Shipping Address */}
                <div style={{ marginBottom: 32 }}>
                  <Title level={4}>Địa chỉ giao hàng</Title>
                  <Form.Item
                    name="address"
                    label="Địa chỉ"
                    rules={[
                      { required: true, message: "Vui lòng nhập địa chỉ!" },
                    ]}
                  >
                    <AddressInput placeholder="Nhập địa chỉ giao hàng" />
                  </Form.Item>
                  {/* Shipping Cost Info */}
                  <Alert
                    message="Phí vận chuyển: Miễn phí"
                    type="success"
                    showIcon
                    style={{ marginTop: 12 }}
                  />
                </div>

                {/* Section C: Products (read-only) */}
                <div style={{ marginBottom: 32 }}>
                  <Title level={4}>Sản phẩm trong đơn</Title>
                  <div
                    style={{
                      background: "#FAFAFA",
                      padding: 16,
                      borderRadius: 8,
                    }}
                  >
                    {checkoutData.products.map((product, index) => (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          gap: 16,
                          padding: "12px 0",
                          borderBottom:
                            index < checkoutData.products.length - 1
                              ? "1px solid #E0E0E0"
                              : "none",
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
                          <Text
                            strong
                            style={{ display: "block", marginBottom: 4 }}
                          >
                            {product.name}
                          </Text>
                          <Space size={12} style={{ marginTop: 8 }}>
                            <Text type="secondary" style={{ fontSize: 14 }}>
                              {formatPrice(product.price)}
                            </Text>
                            <Text type="secondary">x</Text>
                            <InputNumber
                              min={1}
                              max={999}
                              value={product.quantity}
                              onChange={(value) =>
                                handleQuantityChange(index, value)
                              }
                              disabled={updatingQuantity}
                              size="small"
                              style={{ width: 80 }}
                            />
                          </Space>
                        </div>
                        {/* Product Price */}
                        <div style={{ flexShrink: 0, textAlign: "right" }}>
                          <Text strong>{formatPrice(product.subtotal)}</Text>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section D: Payment Method */}
                <div style={{ marginBottom: 32 }}>
                  <Title level={4}>Phương thức thanh toán</Title>
                  <Radio.Group
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    style={{ width: "100%" }}
                  >
                    <Space
                      direction="vertical"
                      style={{ width: "100%" }}
                      size={16}
                    >
                      {availablePaymentMethods.map((method) => (
                        <Card
                          key={method}
                          hoverable
                          style={{
                            border:
                              paymentMethod === method
                                ? "2px solid #000"
                                : "1px solid #E0E0E0",
                          }}
                          onClick={() => setPaymentMethod(method)}
                        >
                          <Radio value={method}>
                            <div>
                              <Text strong>
                                {PAYMENT_METHOD_LABELS[method]}
                              </Text>
                              <br />
                              <Text type="secondary">
                                {PAYMENT_METHOD_DESCRIPTIONS[method]}
                              </Text>
                            </div>
                          </Radio>
                        </Card>
                      ))}
                    </Space>
                  </Radio.Group>

                  {paymentMethod === PAYMENT_METHODS.VNPAY && (
                    <Alert
                      type="info"
                      showIcon
                      style={{ marginTop: 16, backgroundColor: "#F5F5F5" }}
                      message="Bạn sẽ được chuyển hướng đến cổng VNPay để hoàn tất thanh toán."
                    />
                  )}
                </div>

                {/* Customer Note */}
                <div style={{ marginBottom: 32 }}>
                  <Form.Item name="note" label="Ghi chú (tùy chọn)">
                    <Input.TextArea
                      rows={3}
                      placeholder="Ghi chú cho đơn hàng"
                    />
                  </Form.Item>
                </div>

                {/* Submit Button */}
                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  loading={submitting}
                  block
                  style={{ height: 48, fontSize: 16, fontWeight: 600 }}
                >
                  Tiếp tục → Xác nhận đơn
                </Button>
              </Form>
            </Card>
          </div>

          {/* Order Summary */}
          <div style={{ flex: "0 0 380px", minWidth: 300 }}>
            <div style={{ position: "sticky", top: 80 }}>
              <CartSummary
                cart={summaryData}
                selectedItems={summaryData.items}
                showCoupon={true}
                onApplyCoupon={handleApplyCoupon}
                onRemoveCoupon={handleRemoveCoupon}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <ProtectedRoute>
      <CheckoutPageContent />
    </ProtectedRoute>
  );
}
