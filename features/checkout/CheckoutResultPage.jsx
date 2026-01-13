"use client";

import React from "react";
import { Result, Button, Typography, Card, Space, Divider } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { OrdersApi } from "@/apis/orders";
import { formatPrice } from "@/utils/format";
import { PAYMENT_STATUS_LABELS } from "@/config/orderConstants";

const { Text, Title } = Typography;

function CheckoutResultPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status");
  const orderIdParam = searchParams.get("orderId");
  const orderNumberParam = searchParams.get("orderNumber");
  const transactionNoParam = searchParams.get("transactionNo");

  const {
    data: order,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["checkout-result", orderIdParam],
    queryFn: async () => {
      if (!orderIdParam) {
        return null;
      }
      const response = await OrdersApi.getById(orderIdParam);
      if (response.status === "success") {
        return response.data;
      }
      throw new Error(response.message || "Không thể tải thông tin đơn hàng");
    },
    enabled: Boolean(orderIdParam),
    retry: false,
  });

  const derivedStatus = React.useMemo(() => {
    if (order?.payment?.status === "paid") {
      return "success";
    }
    if (order?.status === "payment_failed") {
      return "failed";
    }
    if (statusParam === "failed") {
      return "failed";
    }
    if (statusParam === "success") {
      return "success";
    }
    if (statusParam === "pending") {
      return "pending";
    }
    return "info";
  }, [order, statusParam]);

  const statusConfigs = {
    success: {
      resultStatus: "success",
      title: "Thanh toán thành công",
      description: "Đơn hàng của bạn đang được xử lý. Chúng tôi sẽ cập nhật sớm nhất.",
    },
    failed: {
      resultStatus: "error",
      title: "Thanh toán thất bại",
      description: "Rất tiếc, thanh toán chưa hoàn tất. Bạn có thể thử lại hoặc chọn phương thức khác.",
    },
    pending: {
      resultStatus: "info",
      title: "Thanh toán đang xử lý",
      description: "Chúng tôi đang nhận thông tin thanh toán từ cổng VNPay. Vui lòng chờ trong giây lát.",
    },
    info: {
      resultStatus: "info",
      title: "Trạng thái đơn hàng",
      description: "Kiểm tra thông tin chi tiết đơn hàng của bạn bên dưới.",
    },
  };

  const statusConfig = statusConfigs[derivedStatus] || statusConfigs.info;

  const orderNumber = order?.orderNumber || orderNumberParam || "—";
  const transactionNo = order?.payment?.transactionId || transactionNoParam || "—";
  const totalAmount = order?.pricing?.total;
  const paymentStatusLabel = order?.payment?.status
    ? PAYMENT_STATUS_LABELS[order.payment.status] || order.payment.status
    : "—";

  const actionButtons = (
    <Space wrap>
      {derivedStatus === "failed" && orderIdParam && (
        <Button
          type="primary"
          onClick={() => router.push(`/thanh-toan?orderId=${orderIdParam}`)}
        >
          Thử thanh toán lại
        </Button>
      )}
      <Button type="default" onClick={() => router.push("/don-hang")}>
        Xem đơn hàng
      </Button>
      <Button onClick={() => router.push("/san-pham")}>Tiếp tục mua sắm</Button>
    </Space>
  );

  return (
    <div
      style={{
        background: "#F5F5F5",
        minHeight: "calc(100vh - 64px)",
        padding: "32px 16px",
      }}
    >
        <div className="container" style={{ maxWidth: 720 }}>
          {isLoading ? (
            <LoadingSpinner fullScreen />
          ) : (
            <Card style={{ borderRadius: 12 }}>
              <Result
                status={statusConfig.resultStatus}
                title={statusConfig.title}
                subTitle={statusConfig.description}
                extra={actionButtons}
              />

              <Divider />

              <Space direction="vertical" style={{ width: "100%" }} size={12}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Text type="secondary">Mã đơn hàng</Text>
                  <Text strong>{orderNumber}</Text>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Text type="secondary">Trạng thái thanh toán</Text>
                  <Text strong>{paymentStatusLabel}</Text>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Text type="secondary">Mã giao dịch</Text>
                  <Text strong>{transactionNo}</Text>
                </div>
                {typeof totalAmount === "number" && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <Text type="secondary">Tổng thanh toán</Text>
                    <Text strong>{formatPrice(totalAmount)}</Text>
                  </div>
                )}
              </Space>
            </Card>
          )}

          {isError && (
            <Card style={{ marginTop: 16 }}>
              <Text type="danger">
                Không thể tải thông tin đơn hàng. Vui lòng kiểm tra lại hoặc liên hệ hỗ trợ.
              </Text>
            </Card>
          )}
        </div>
      </div>
  );
}

export default function CheckoutResultPage() {
  return (
    <ProtectedRoute>
      <CheckoutResultPageContent />
    </ProtectedRoute>
  );
}




