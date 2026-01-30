"use client";

import { useMemo } from "react";
import { Card, Typography, Button, Spin, Empty, Image, Tag, Space } from "antd";
import { ThunderboltOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { RecommendationsApi } from "@/apis/recommendations";
import { formatPrice } from "@/utils/format";

const { Title, Text } = Typography;

const BuildSuggestions = ({
  currentConfig,
  availableComponentTypes,
  onSelectProduct,
  limitPerComponent = 5,
}) => {

  // Convert currentConfig to lightweight format (only IDs and specs needed for compatibility)
  // Backend needs: productId and specifications (socket, type, formFactor, powerConsumption/tdp)
  const apiConfig = useMemo(() => {
    const config = {};
    Object.entries(currentConfig || {}).forEach(([key, product]) => {
      if (product && product._id) {
        // Only send essential data: ID and specifications for compatibility check
        // Backend will extract requirements from specifications:
        // - socket (from CPU) -> for motherboard compatibility
        // - type (from RAM) -> for motherboard compatibility  
        // - formFactor (from motherboard) -> for case compatibility
        // - powerConsumption/tdp (from all components) -> for PSU compatibility
        config[key] = {
          productId: product._id,
          specifications: product.specifications || {},
        };
      }
    });
    return config;
  }, [currentConfig]);

  // Convert availableComponentTypes to array of keys in order
  const componentTypeKeys = useMemo(() => {
    return availableComponentTypes.map((type) =>
      typeof type === "string" ? type : type.key
    );
  }, [availableComponentTypes]);

  // Find first missing component type in order and get its categoryId
  const firstMissingComponent = useMemo(() => {
    for (const componentTypeKey of componentTypeKeys) {
      const component = currentConfig[componentTypeKey];
      if (!component || !component._id) {
        // Find the component type object to get categoryId
        const componentTypeObj = availableComponentTypes.find(
          (type) => (typeof type === "string" ? type : type.key) === componentTypeKey
        );
        return {
          componentType: componentTypeKey,
          categoryId: typeof componentTypeObj === "object" ? componentTypeObj.categoryId : null,
        };
      }
    }
    return null;
  }, [componentTypeKeys, currentConfig, availableComponentTypes]);

  // Fetch build suggestions - only for first missing component type
  const {
    data: suggestionsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["buildSuggestions", apiConfig, firstMissingComponent?.categoryId],
    queryFn: async () => {
      if (!firstMissingComponent || !firstMissingComponent.categoryId) {
        return { recommendations: [] };
      }
      const response = await RecommendationsApi.getBuildSuggestions(
        apiConfig,
        firstMissingComponent.categoryId, // Send categoryId instead of componentType
        limitPerComponent
      );
      return response.data;
    },
    enabled: componentTypeKeys.length > 0 && !!firstMissingComponent?.categoryId,
    staleTime: 30000, // Cache for 30 seconds
  });

  // Extract recommendations from response (new format: recommendations directly in response)
  const firstMissingSuggestions = suggestionsData?.recommendations || [];

  // Get component type label
  const getComponentTypeLabel = (componentTypeKey) => {
    const componentType = availableComponentTypes.find(
      (type) => (typeof type === "string" ? type : type.key) === componentTypeKey
    );
    return typeof componentType === "string"
      ? componentType
      : componentType?.label || componentTypeKey;
  };

  // Show loading skeleton if:
  // 1. No availableComponentTypes yet (initial load)
  // 2. Currently loading data
  if (!availableComponentTypes || availableComponentTypes.length === 0 || isLoading) {
    return (
      <Card
        style={{
          borderRadius: 12,
          marginTop: 0,
        }}
      >
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">Đang tải gợi ý...</Text>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card
        style={{
          borderRadius: 12,
          marginTop: 0,
          height: "fit-content",
        }}
      >
        <Empty
          description={
            <Text type="secondary">
              Không thể tải gợi ý. Vui lòng thử lại sau.
            </Text>
          }
        />
      </Card>
    );
  }

  // Only show "Đã chọn đủ linh kiện" if we have component types but no missing ones
  if (componentTypeKeys.length > 0 && !firstMissingComponent) {
    return (
      <Card
        style={{
          borderRadius: 12,
          marginTop: 0,
          height: "fit-content",
        }}
      >
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <CheckCircleOutlined
            style={{ fontSize: 48, color: "#52c41a", marginBottom: 16 }}
          />
          <Title level={4} style={{ marginBottom: 8 }}>
            Đã chọn đủ linh kiện!
          </Title>
          <Text type="secondary">
            Bạn đã chọn đầy đủ các linh kiện cho cấu hình PC của mình.
          </Text>
        </div>
      </Card>
    );
  }

  if (firstMissingSuggestions.length === 0 && !isLoading) {
    return (
      <Card
        style={{
          borderRadius: 12,
          marginTop: 0,
          height: "fit-content",
        }}
      >
        <Empty
          description={
            <div style={{ textAlign: "center" }}>
              <Text type="secondary" style={{ fontSize: 14, display: "block", marginBottom: 8 }}>
                Hệ thống chưa tìm được sản phẩm phù hợp với cấu hình hiện tại của bạn.
              </Text>
              <Text type="secondary" style={{ fontSize: 13 }}>
                Bạn hãy tự chọn linh kiện từ danh sách sản phẩm để tiếp tục.
              </Text>
            </div>
          }
        />
      </Card>
    );
  }

  return (
    <Card
      style={{
        borderRadius: 12,
        marginTop: 0,
        height: "fit-content",
      }}
      bodyStyle={{
        padding: 16,
        maxHeight: "calc(100vh - 200px)",
        overflowY: "auto",
      }}
      title={
        <Space>
          <ThunderboltOutlined style={{ color: "#1890ff" }} />
          <Title level={4} style={{ margin: 0 }}>
            Gợi ý: {getComponentTypeLabel(firstMissingComponent?.componentType)}
          </Title>
        </Space>
      }
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 12,
        }}
      >
        {firstMissingSuggestions.map((rec) => {
          const product = rec.product || rec;
          const primaryImage =
            product.images?.find((img) => img.isPrimary)?.url ||
            product.images?.[0]?.url ||
            null;

          return (
            <Card
              key={product._id}
              hoverable
              style={{
                borderRadius: 8,
                cursor: "pointer",
              }}
              bodyStyle={{ padding: 12 }}
              onClick={() => {
                if (onSelectProduct && firstMissingComponent) {
                  onSelectProduct(firstMissingComponent.componentType, product);
                }
              }}
            >
              {primaryImage && (
                <div
                  style={{
                    width: "100%",
                    height: 120,
                    borderRadius: 8,
                    overflow: "hidden",
                    background: "#FAFAFA",
                    marginBottom: 8,
                  }}
                >
                  <Image
                    src={primaryImage}
                    alt={product.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                    preview={false}
                  />
                </div>
              )}
              <Text
                strong
                ellipsis
                style={{
                  display: "block",
                  marginBottom: 4,
                  fontSize: 12,
                }}
              >
                {product.name}
              </Text>
              <div style={{ marginBottom: 8 }}>
                <Text strong style={{ fontSize: 14, color: "#ff4d4f" }}>
                  {formatPrice(
                    product.pricing?.isOnSale && product.pricing?.salePrice
                      ? product.pricing.salePrice
                      : product.pricing?.originalPrice || 0
                  )}
                </Text>
              </div>
              {rec.reasons && rec.reasons.length > 0 && (
                <div>
                  {rec.reasons.slice(0, 1).map((reason, idx) => (
                    <Tag
                      key={idx}
                      color="blue"
                      style={{ fontSize: 10, marginBottom: 4 }}
                    >
                      {reason}
                    </Tag>
                  ))}
                </div>
              )}
              <Button
                type="primary"
                size="small"
                block
                style={{ marginTop: 8 }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onSelectProduct && firstMissingComponent) {
                    onSelectProduct(firstMissingComponent.componentType, product);
                  }
                }}
              >
                Chọn
              </Button>
            </Card>
          );
        })}
      </div>
    </Card>
  );
};

export default BuildSuggestions;
