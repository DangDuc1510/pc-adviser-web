"use client";

import { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Button,
  Space,
  Tag,
  Empty,
  Tabs,
  Select,
} from "antd";
import {
  EyeOutlined,
  CloseCircleOutlined,
  CreditCardOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import OrderStatusBadge from "@/components/orders/OrderStatusBadge";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import { OrdersApi } from "@/apis/orders";
import { formatPrice, formatDate } from "@/utils/format";
import {
  ORDER_STATUS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS,
} from "@/config/orderConstants";

const { Title, Text } = Typography;

function OrdersPageContent() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = activeTab !== "all" ? { status: activeTab } : {};
      const response = await OrdersApi.getAll(params);

      if (response.status === "success" || response.success) {
        setOrders(response.data?.orders || response.data || []);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (orderId) => {
    router.push(`/don-hang/${orderId}`);
  };

  const handleCancelOrder = async (orderId) => {
    // TODO: Implement cancel order with confirmation modal
    console.log("Cancel order:", orderId);
  };

  const handlePayOrder = async (orderId) => {
    router.push(`/thanh-toan?orderId=${orderId}`);
  };

  const tabItems = [
    { key: "all", label: "Tất cả" },
    { key: ORDER_STATUS.PENDING_PAYMENT, label: "Chờ thanh toán" },
    { key: ORDER_STATUS.PENDING, label: "Chờ xác nhận" },
    { key: ORDER_STATUS.CONFIRMED, label: "Đã xác nhận" },
    { key: ORDER_STATUS.PROCESSING, label: "Đang xử lý" },
    { key: ORDER_STATUS.SHIPPED, label: "Đang giao" },
    { key: ORDER_STATUS.DELIVERED, label: "Đã giao" },
    { key: ORDER_STATUS.CANCELLED, label: "Đã hủy" },
  ];

  return (
    <div style={{ background: "#F5F5F5", minHeight: "calc(100vh - 64px)" }}>
      <div className="container" style={{ padding: "32px 24px" }}>
        <Title level={2} style={{ marginBottom: 32 }}>
          Đơn hàng của tôi
        </Title>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          style={{ marginBottom: 24 }}
        />

        {loading ? (
          <LoadingSpinner />
        ) : orders.length === 0 ? (
          <EmptyState
            title="Chưa có đơn hàng"
            description="Bạn chưa có đơn hàng nào"
            actionText="Mua sắm ngay"
            onAction={() => router.push("/san-pham")}
          />
        ) : (
          <Space direction="vertical" style={{ width: "100%" }} size={16}>
            {orders.map((order) => (
              <Card
                key={order._id}
                style={{
                  borderRadius: 8,
                  border: "1px solid #E0E0E0",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 16,
                  }}
                >
                  <div>
                    <Text strong style={{ fontSize: 16 }}>
                      Đơn hàng #{order.orderNumber}
                    </Text>
                    <br />
                    <Text type="secondary">
                      Đặt ngày {formatDate(order.createdAt, "datetime")}
                    </Text>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>

                {/* Order Items Preview */}
                {order.products && order.products.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    {order.products.slice(0, 2).map((item, index) => (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          gap: 12,
                          marginBottom: 8,
                        }}
                      >
                        <img
                          src={
                            item.image ||
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Crect width='60' height='60' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-size='12'%3ENo Image%3C/text%3E%3C/svg%3E"
                          }
                          alt={item.name}
                          style={{
                            width: 60,
                            height: 60,
                            objectFit: "cover",
                            borderRadius: 4,
                            background: "#FAFAFA",
                          }}
                          onError={(e) => {
                            if (!e.target.src.includes("data:image")) {
                              e.target.src =
                                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Crect width='60' height='60' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-size='12'%3ENo Image%3C/text%3E%3C/svg%3E";
                            }
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <Text>{item.name}</Text>
                          <br />
                          <Text type="secondary">x{item.quantity}</Text>
                        </div>
                      </div>
                    ))}
                    {order.products.length > 2 && (
                      <Text type="secondary">
                        và {order.products.length - 2} sản phẩm khác
                      </Text>
                    )}
                  </div>
                )}

                {/* Order Summary */}
                <div
                  style={{
                    padding: "12px 0",
                    borderTop: "1px solid #F0F0F0",
                    borderBottom: "1px solid #F0F0F0",
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <Text type="secondary">Phương thức thanh toán:</Text>
                    <Text>
                      {PAYMENT_METHOD_LABELS[order.payment?.method] ||
                        "Chưa chọn"}
                    </Text>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <Text type="secondary">Trạng thái thanh toán:</Text>
                    <Tag
                      color={
                        order.payment?.status === PAYMENT_STATUS.PAID
                          ? "green"
                          : order.payment?.status === PAYMENT_STATUS.FAILED
                          ? "red"
                          : order.payment?.status === PAYMENT_STATUS.PROCESSING
                          ? "blue"
                          : "orange"
                      }
                    >
                      {PAYMENT_STATUS_LABELS[order.payment?.status] ||
                        "Chưa thanh toán"}
                    </Tag>
                  </div>
                  {order.payment?.transactionId && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 8,
                      }}
                    >
                      <Text type="secondary">Mã giao dịch:</Text>
                      <Text code>{order.payment.transactionId}</Text>
                    </div>
                  )}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text strong>Tổng tiền:</Text>
                    <Text strong style={{ fontSize: 18, color: "#000" }}>
                      {formatPrice(order.pricing?.total || 0)}
                    </Text>
                  </div>
                </div>

                {/* Actions */}
                <Space>
                  <Button
                    type="primary"
                    icon={<EyeOutlined />}
                    onClick={() => handleViewOrder(order._id)}
                  >
                    Xem chi tiết
                  </Button>
                  {/* Show Pay button for unpaid orders */}
                  {[
                    ORDER_STATUS.PENDING_PAYMENT,
                    ORDER_STATUS.PAYMENT_FAILED,
                  ].includes(order.status) &&
                    order.payment?.status !== PAYMENT_STATUS.PAID && (
                      <Button
                        type="primary"
                        icon={<CreditCardOutlined />}
                        onClick={() => handlePayOrder(order._id)}
                        style={{
                          background: "#52c41a",
                          borderColor: "#52c41a",
                        }}
                      >
                        Thanh toán
                      </Button>
                    )}
                  {[ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED].includes(
                    order.status
                  ) && (
                    <Button
                      danger
                      icon={<CloseCircleOutlined />}
                      onClick={() => handleCancelOrder(order._id)}
                    >
                      Hủy đơn
                    </Button>
                  )}
                </Space>
              </Card>
            ))}
          </Space>
        )}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <ProtectedRoute>
      <OrdersPageContent />
    </ProtectedRoute>
  );
}
