"use client";

import React, { useState } from "react";
import {
  Card,
  Row,
  Col,
  Tag,
  Typography,
  Space,
  Button,
  Empty,
  Spin,
  message,
  Badge,
  Divider,
  Tooltip,
} from "antd";
import {
  GiftOutlined,
  CopyOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FireOutlined,
  StarOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { PromoCodeApi } from "@/apis/orders";
import { formatPrice } from "@/utils/format";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

const { Title, Text, Paragraph } = Typography;

const MyVouchersPage = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [copiedCode, setCopiedCode] = useState(null);

  // Fetch valid promo codes
  const {
    data: promoCodes,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["myPromoCodes"],
    queryFn: async () => {
      const response = await PromoCodeApi.getValid({});
      return response.status === "success" ? response.data : [];
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const vouchers = promoCodes || [];

  // Copy voucher code to clipboard
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    message.success("Đã sao chép mã voucher");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Check if voucher is expiring soon (within 7 days)
  const isExpiringSoon = (endDate) => {
    const daysUntilExpiry = Math.floor(
      (new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry > 0 && daysUntilExpiry <= 7;
  };

  // Check if voucher is valid
  const isValid = (voucher) => {
    const now = new Date();
    return (
      voucher.isActive &&
      new Date(voucher.startDate) <= now &&
      new Date(voucher.endDate) >= now &&
      (!voucher.usageLimit || voucher.usageCount < voucher.usageLimit)
    );
  };

  // Format discount value
  const formatDiscount = (voucher) => {
    if (voucher.discountType === "percentage") {
      return `${voucher.discountValue}%`;
    }
    return formatPrice(voucher.discountValue);
  };

  // Calculate discount amount for display
  const calculateDiscountAmount = (voucher, minAmount = 0) => {
    if (voucher.discountType === "percentage") {
      const discount = (minAmount * voucher.discountValue) / 100;
      if (voucher.maxDiscountAmount) {
        return Math.min(discount, voucher.maxDiscountAmount);
      }
      return discount;
    }
    return voucher.discountValue;
  };

  // Group vouchers by status
  const validVouchers = vouchers.filter(isValid);
  const expiringSoon = validVouchers.filter((v) => isExpiringSoon(v.endDate));
  const expiredVouchers = vouchers.filter((v) => !isValid(v));

  if (!isAuthenticated) {
    return (
      <div style={{ padding: "48px 24px", textAlign: "center" }}>
        <Empty
          description="Vui lòng đăng nhập để xem mã khuyến mãi của bạn"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={() => router.push("/dang-nhap")}>
            Đăng nhập
          </Button>
        </Empty>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: "24px", 
      maxWidth: 1200, 
      margin: "0 auto",
      minHeight: "calc(100vh - 200px)",
    }}>
      <div style={{ marginBottom: 32 }}>
        <Title level={2} style={{ margin: 0, display: "flex", alignItems: "center", gap: 12 }}>
          <GiftOutlined style={{ color: "black" }} /> Khuyến mãi của tôi
        </Title>
        <Paragraph style={{ marginTop: 8, color: "#666", fontSize: 15 }}>
          Danh sách mã khuyến mãi bạn có thể sử dụng
        </Paragraph>
      </div>

      {isLoading ? (
        <div style={{ textAlign: "center", padding: "48px" }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          {/* Expiring Soon Section */}
          {expiringSoon.length > 0 && (
            <div style={{ marginBottom: 40 }}>
              <Row gutter={[16, 16]}>
                {expiringSoon.map((voucher) => (
                  <Col xs={24} sm={12} lg={8} key={voucher._id}>
                    <VoucherCard
                      voucher={voucher}
                      onCopy={handleCopyCode}
                      copiedCode={copiedCode}
                      isExpiringSoon={true}
                    />
                  </Col>
                ))}
              </Row>
            </div>
          )}

          {/* Valid Vouchers Section */}
          {validVouchers.filter((v) => !isExpiringSoon(v.endDate)).length > 0 && (
            <div style={{ marginBottom: 40 }}>
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: 8, 
                marginBottom: 20,
                paddingBottom: 12,
                borderBottom: "2px solid #52c41a",
              }}>
                <CheckCircleOutlined style={{ color: "#52c41a", fontSize: 20 }} />
                <Title level={4} style={{ margin: 0, color: "#52c41a" }}>
                  Có thể sử dụng ({validVouchers.filter((v) => !isExpiringSoon(v.endDate)).length})
                </Title>
              </div>
              <Row gutter={[16, 16]}>
                {validVouchers
                  .filter((v) => !isExpiringSoon(v.endDate))
                  .map((voucher) => (
                    <Col xs={24} sm={12} lg={8} key={voucher._id}>
                      <VoucherCard
                        voucher={voucher}
                        onCopy={handleCopyCode}
                        copiedCode={copiedCode}
                      />
                    </Col>
                  ))}
              </Row>
            </div>
          )}

          {/* Expired Vouchers Section */}
          {expiredVouchers.length > 0 && (
            <div style={{ marginTop: 40 }}>
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: 8, 
                marginBottom: 20,
                paddingBottom: 12,
                borderBottom: "2px solid #d9d9d9",
              }}>
                <ClockCircleOutlined style={{ color: "#999", fontSize: 20 }} />
                <Title level={4} style={{ margin: 0, color: "#999" }}>
                  Đã hết hạn ({expiredVouchers.length})
                </Title>
              </div>
              <Row gutter={[16, 16]}>
                {expiredVouchers.map((voucher) => (
                  <Col xs={24} sm={12} lg={8} key={voucher._id}>
                    <VoucherCard
                      voucher={voucher}
                      onCopy={handleCopyCode}
                      copiedCode={copiedCode}
                      isExpired={true}
                    />
                  </Col>
                ))}
              </Row>
            </div>
          )}

          {vouchers.length === 0 && !isLoading && (
            <Empty
              description="Bạn chưa có mã khuyến mãi nào"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button type="primary" onClick={() => router.push("/san-pham")}>
                Mua sắm ngay
              </Button>
            </Empty>
          )}
        </>
      )}
    </div>
  );
};

// Voucher Card Component
const VoucherCard = ({
  voucher,
  onCopy,
  copiedCode,
  isExpiringSoon = false,
  isExpired = false,
}) => {
  const router = useRouter();

  const formatDiscount = (voucher) => {
    if (voucher.discountType === "percentage") {
      return `${voucher.discountValue}%`;
    }
    return formatPrice(voucher.discountValue);
  };

  const getDiscountColor = () => {
    if (isExpired) return "#999";
    if (isExpiringSoon) return "#ff4d4f";
    if (voucher.discountValue >= 20) return "#52c41a";
    if (voucher.discountValue >= 10) return "#1890ff";
    return "#faad14";
  };

  const getDaysUntilExpiry = () => {
    const days = Math.floor(
      (new Date(voucher.endDate) - new Date()) / (1000 * 60 * 60 * 24)
    );
    return days;
  };

  return (
    <Card
      hoverable={!isExpired}
      style={{
        height: "100%",
        border: isExpired
          ? "1px dashed #d9d9d9"
          : `2px solid ${getDiscountColor()}`,
        borderRadius: 8,
        opacity: isExpired ? 0.6 : 1,
        position: "relative",
        overflow: "visible",
      }}
      bodyStyle={{ padding: 20 }}
    >
      {isExpiringSoon && (
        <Badge.Ribbon 
          text="Sắp hết hạn" 
          color="red" 
          style={{ top: -1, right: -1 }}
        />
      )}

      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        {/* Header */}
        <div style={{ 
          marginBottom: 16,
          paddingTop: isExpiringSoon ? 8 : 0,
        }}>
          {/* Discount and Tags Row */}
          <div style={{ 
            display: "flex", 
            alignItems: "flex-start", 
            justifyContent: "space-between",
            marginBottom: 8,
            gap: 8,
            flexWrap: "wrap",
            position: "relative",
          }}>
            <Text strong style={{ fontSize: 18, color: getDiscountColor() }}>
              {formatDiscount(voucher)}
            </Text>
            {voucher.type === "user-specific" && (
              <Tag 
                color="purple" 
                icon={<StarOutlined />}
                style={{ 
                  margin: 0,
                  marginTop: isExpiringSoon ? 24 : 0,
                  zIndex: 1,
                }}
              >
                Dành riêng cho bạn
              </Tag>
            )}
          </div>
          
          {/* Title */}
          <Text
            strong
            style={{ fontSize: 16, display: "block", marginBottom: 4 }}
          >
            {voucher.name}
          </Text>
          
          {/* Description */}
          {voucher.description && (
            <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
              {voucher.description}
            </Text>
          )}
        </div>

        <Divider style={{ margin: "12px 0" }} />

        {/* Details */}
        <div style={{ flex: 1, marginBottom: 16 }}>
          <Space direction="vertical" size={8} style={{ width: "100%" }}>
            {voucher.minPurchaseAmount > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Text style={{ fontSize: 13, color: "#666" }}>
                  Đơn hàng tối thiểu:{" "}
                  <strong style={{ color: "#000" }}>{formatPrice(voucher.minPurchaseAmount)}</strong>
                </Text>
              </div>
            )}
            {voucher.maxDiscountAmount &&
              voucher.discountType === "percentage" && (
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Text style={{ fontSize: 13, color: "#666" }}>
                    Giảm tối đa:{" "}
                    <strong style={{ color: "#000" }}>{formatPrice(voucher.maxDiscountAmount)}</strong>
                  </Text>
                </div>
              )}
            {voucher.usageLimitPerUser && (
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Text style={{ fontSize: 13, color: "#666" }}>
                  Sử dụng tối đa: <strong style={{ color: "#000" }}>{voucher.usageLimitPerUser} lần</strong>
                </Text>
              </div>
            )}
            {voucher.usageLimit && (
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Text style={{ fontSize: 13, color: "#999" }}>
                  Đã dùng: {voucher.usageCount || 0}/{voucher.usageLimit}
                </Text>
              </div>
            )}
          </Space>
        </div>

        {/* Footer */}
        <div style={{ marginTop: "auto", paddingTop: 16 }}>
          <Space direction="vertical" size={8} style={{ width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                HSD: {new Date(voucher.endDate).toLocaleDateString("vi-VN")}
              </Text>
              {!isExpired && getDaysUntilExpiry() > 0 && (
                <Text 
                  type="secondary" 
                  style={{ 
                    fontSize: 12,
                    color: isExpiringSoon ? "#ff4d4f" : "#666",
                    fontWeight: isExpiringSoon ? 600 : 400,
                  }}
                >
                  Còn lại: {getDaysUntilExpiry()} ngày
                </Text>
              )}
            </div>

            {/* Code and Actions */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 14px",
                background: isExpired ? "#fafafa" : "#f0f7ff",
                borderRadius: 6,
                border: isExpired ? "1px solid #e8e8e8" : "1px solid #d4e8ff",
                marginTop: 4,
              }}
            >
              <Text 
                code 
                style={{ 
                  flex: 1, 
                  fontSize: 15, 
                  fontWeight: 700,
                  color: isExpired ? "#999" : "#1890ff",
                  background: "transparent",
                  border: "none",
                  padding: 0,
                }}
              >
                {voucher.code}
              </Text>
              <Tooltip title="Sao chép mã">
                <Button
                  type="text"
                  icon={<CopyOutlined />}
                  size="small"
                  onClick={() => onCopy(voucher.code)}
                  style={{
                    color: copiedCode === voucher.code ? "#52c41a" : (isExpired ? "#999" : "#1890ff"),
                    minWidth: 32,
                  }}
                />
              </Tooltip>
            </div>

            {!isExpired && (
              <Button
                type="primary"
                block
                onClick={() => router.push("/gio-hang")}
                style={{ 
                  marginTop: 8,
                  height: 40,
                  fontSize: 15,
                  fontWeight: 600,
                }}
              >
                Sử dụng ngay
              </Button>
            )}
          </Space>
        </div>
      </div>
    </Card>
  );
};

export default MyVouchersPage;
