"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Card,
  Typography,
  Button,
  Space,
  Tag,
  Divider,
  Row,
  Col,
  Descriptions,
  Modal,
  App,
  Timeline,
} from "antd";
import {
  ArrowLeftOutlined,
  CreditCardOutlined,
  CloseCircleOutlined,
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
  PAYMENT_STATUS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  SHIPPING_METHOD_LABELS,
} from "@/config/orderConstants";

const { Title, Text } = Typography;

function OrderDetailPageContent({ orderId }) {
  const router = useRouter();
  const { message: messageApi } = App.useApp();

  const {
    data: order,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const response = await OrdersApi.getById(orderId);
      if (response.status === "success") {
        return response.data;
      }
      throw new Error(response.message || "Không thể tải đơn hàng");
    },
    enabled: !!orderId,
    retry: false,
  });

  const handlePayOrder = () => {
    router.push(`/thanh-toan?orderId=${orderId}`);
  };

  const handleCancelOrder = () => {
    Modal.confirm({
      title: "Hủy đơn hàng?",
      content: "Bạn có chắc chắn muốn hủy đơn hàng này không?",
      okText: "Hủy đơn",
      cancelText: "Quay lại",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          const response = await OrdersApi.cancel(orderId, {
            reason: "Người dùng hủy từ trang chi tiết đơn hàng",
          });
          if (response.status === "success") {
            messageApi.success("Đã hủy đơn hàng");
            refetch();
          } else {
            messageApi.error(response.message || "Hủy đơn hàng thất bại");
          }
        } catch (error) {
          messageApi.error(
            error.response?.data?.message ||
              error.message ||
              "Không thể hủy đơn hàng"
          );
        }
      },
    });
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (isError || !order) {
    return (
      <div style={{ padding: "48px", textAlign: "center" }}>
        <EmptyState
          title="Không tìm thấy đơn hàng"
          description="Đơn hàng không tồn tại hoặc bạn không có quyền xem"
          actionText="Quay lại danh sách"
          onAction={() => router.push("/don-hang")}
        />
      </div>
    );
  }

  const canPay =
    [ORDER_STATUS.PENDING_PAYMENT, ORDER_STATUS.PAYMENT_FAILED].includes(
      order.status
    ) && order.payment?.status !== PAYMENT_STATUS.PAID;

  const canCancel = [
    ORDER_STATUS.PENDING,
    ORDER_STATUS.CONFIRMED,
    ORDER_STATUS.PENDING_PAYMENT,
  ].includes(order.status);

  return (
    <div style={{ background: "#F5F5F5", minHeight: "calc(100vh - 64px)" }}>
      <div className="container" style={{ padding: "32px 24px" }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push("/don-hang")}
          style={{ marginBottom: 24 }}
        >
          Quay lại danh sách
        </Button>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 24,
          }}
        >
          <div>
            <Title level={2} style={{ margin: 0 }}>
              Đơn hàng #{order.orderNumber}
            </Title>
            <Text type="secondary">
              Đặt ngày {formatDate(order.createdAt, "datetime")}
            </Text>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        <Row gutter={[24, 24]}>
          {/* Order Items */}
          <Col xs={24} lg={16}>
            <Card title="Sản phẩm" style={{ marginBottom: 24 }}>
              <Space direction="vertical" style={{ width: "100%" }} size={16}>
                {order.products?.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      gap: 16,
                      padding: "16px 0",
                      borderBottom:
                        index < order.products.length - 1
                          ? "1px solid #F0F0F0"
                          : "none",
                    }}
                  >
                    <img
                      src={
                        item.image ||
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-size='14'%3ENo Image%3C/text%3E%3C/svg%3E"
                      }
                      alt={item.name}
                      onError={(e) => {
                        if (!e.target.src.includes("data:image")) {
                          e.target.src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-size='14'%3ENo Image%3C/text%3E%3C/svg%3E";
                        }
                      }}
                      style={{
                        width: 100,
                        height: 100,
                        objectFit: "cover",
                        borderRadius: 8,
                        background: "#FAFAFA",
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <Text strong style={{ fontSize: 16 }}>
                        {item.name}
                      </Text>
                      <div style={{ marginTop: 8 }}>
                        <Text>Số lượng: {item.quantity}</Text>
                        <br />
                        <Text>
                          Giá: {formatPrice(item.price)} x {item.quantity}
                        </Text>
                        <br />
                        <Text strong style={{ fontSize: 16, color: "#000" }}>
                          Thành tiền: {formatPrice(item.subtotal)}
                        </Text>
                      </div>
                    </div>
                  </div>
                ))}
              </Space>
            </Card>

            {/* Shipping Information */}
            <Card title="Thông tin giao hàng">
              <Descriptions column={1} bordered>
                <Descriptions.Item label="Người nhận">
                  {order.shippingInfo?.name || order.customer?.userName || "—"}
                </Descriptions.Item>
                <Descriptions.Item label="Số điện thoại">
                  {order.shippingInfo?.phone || order.customer?.phone || "—"}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {order.customer?.email || "—"}
                </Descriptions.Item>
                <Descriptions.Item label="Địa chỉ">
                  {order.shippingInfo?.address ||
                    order.customer?.address ||
                    order.shipping?.address ||
                    "—"}
                </Descriptions.Item>
                <Descriptions.Item label="Phương thức vận chuyển">
                  {SHIPPING_METHOD_LABELS[order.shipping?.method] ||
                    "Miễn phí" ||
                    "—"}
                </Descriptions.Item>
                {order.shipping?.trackingNumber && (
                  <Descriptions.Item label="Mã vận đơn">
                    {order.shipping.trackingNumber}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          </Col>

          {/* Order Summary & Payment */}
          <Col xs={24} lg={8}>
            <Card title="Thông tin thanh toán" style={{ marginBottom: 24 }}>
              <Space direction="vertical" style={{ width: "100%" }} size={16}>
                <div>
                  <Text type="secondary">Phương thức thanh toán:</Text>
                  <br />
                  <Text strong>
                    {PAYMENT_METHOD_LABELS[order.payment?.method] || "—"}
                  </Text>
                </div>

                <Divider style={{ margin: "12px 0" }} />

                <div>
                  <Text type="secondary">Trạng thái thanh toán:</Text>
                  <br />
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
                    style={{ marginTop: 8 }}
                  >
                    {PAYMENT_STATUS_LABELS[order.payment?.status] || "—"}
                  </Tag>
                </div>

                {order.payment?.transactionId && (
                  <>
                    <Divider style={{ margin: "12px 0" }} />
                    <div>
                      <Text type="secondary">Mã giao dịch:</Text>
                      <br />
                      <Text code style={{ fontSize: 14 }}>
                        {order.payment.transactionId}
                      </Text>
                    </div>
                  </>
                )}

                {order.payment?.paidAt && (
                  <>
                    <Divider style={{ margin: "12px 0" }} />
                    <div>
                      <Text type="secondary">Ngày thanh toán:</Text>
                      <br />
                      <Text>
                        {formatDate(order.payment.paidAt, "datetime")}
                      </Text>
                    </div>
                  </>
                )}

                {order.payment?.refundedAt && (
                  <>
                    <Divider style={{ margin: "12px 0" }} />
                    <div>
                      <Text type="secondary">Ngày hoàn tiền:</Text>
                      <br />
                      <Text>
                        {formatDate(order.payment.refundedAt, "datetime")}
                      </Text>
                      {order.payment?.refundAmount && (
                        <>
                          <br />
                          <Text type="secondary">Số tiền hoàn:</Text>
                          <br />
                          <Text strong>
                            {formatPrice(order.payment.refundAmount)}
                          </Text>
                        </>
                      )}
                    </div>
                  </>
                )}
              </Space>
            </Card>

            <Card title="Tổng kết đơn hàng">
              <Space direction="vertical" style={{ width: "100%" }} size={12}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Text>Tạm tính:</Text>
                  <Text>{formatPrice(order.pricing?.subtotal || 0)}</Text>
                </div>
                {order.pricing?.breakdown?.itemDiscount > 0 && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text>Giảm giá sản phẩm:</Text>
                    <Text type="success">
                      -{formatPrice(order.pricing.breakdown.itemDiscount)}
                    </Text>
                  </div>
                )}
                {order.coupon?.discount > 0 && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text>Mã giảm giá ({order.coupon.code}):</Text>
                    <Text type="success">
                      -{formatPrice(order.coupon.discount)}
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
                  <Text>{formatPrice(order.pricing?.shipping || 0)}</Text>
                </div>
                {order.pricing?.tax > 0 && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text>Thuế:</Text>
                    <Text>{formatPrice(order.pricing.tax)}</Text>
                  </div>
                )}
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
                  <Text strong style={{ fontSize: 18, color: "#000" }}>
                    {formatPrice(order.pricing?.total || 0)}
                  </Text>
                </div>
              </Space>
            </Card>

            {/* Actions */}
            <Card style={{ marginTop: 24 }}>
              <Space direction="vertical" style={{ width: "100%" }} size={12}>
                {canPay && (
                  <Button
                    type="primary"
                    icon={<CreditCardOutlined />}
                    onClick={handlePayOrder}
                    block
                    size="large"
                    style={{ background: "#52c41a", borderColor: "#52c41a" }}
                  >
                    Thanh toán ngay
                  </Button>
                )}
                {canCancel && (
                  <Button
                    danger
                    icon={<CloseCircleOutlined />}
                    onClick={handleCancelOrder}
                    block
                    size="large"
                  >
                    Hủy đơn hàng
                  </Button>
                )}
                <Button
                  onClick={() => router.push("/don-hang")}
                  block
                  size="large"
                >
                  Quay lại danh sách
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Status History */}
        {order.statusHistory && order.statusHistory.length > 0 && (
          <Card title="Lịch sử trạng thái" style={{ marginTop: 24 }}>
            <Timeline>
              {order.statusHistory.map((history, index) => (
                <Timeline.Item
                  key={index}
                  color={
                    index === order.statusHistory.length - 1 ? "green" : "blue"
                  }
                >
                  <Text strong>
                    {formatDate(history.updatedAt, "datetime")}
                  </Text>
                  <br />
                  <Text>{history.status}</Text>
                  {history.note && (
                    <>
                      <br />
                      <Text type="secondary">{history.note}</Text>
                    </>
                  )}
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function OrderDetailPage({ orderId }) {
  return (
    <ProtectedRoute>
      <OrderDetailPageContent orderId={orderId} />
    </ProtectedRoute>
  );
}
