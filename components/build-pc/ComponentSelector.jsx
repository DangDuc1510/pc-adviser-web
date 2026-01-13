"use client";

import { Card, Button, Typography, Space, InputNumber, Image } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  MinusOutlined,
} from "@ant-design/icons";
import { formatPrice } from "@/utils/format";

const { Text, Title } = Typography;

const ComponentSelector = ({
  componentType,
  component,
  onSelect,
  onEdit,
  onRemove,
  onQuantityChange,
}) => {
  const isSelected = !!component;

  const handleQuantityChange = (value) => {
    if (onQuantityChange) {
      onQuantityChange(componentType, value);
    }
  };

  const primaryImage =
    component?.images?.find((img) => img.isPrimary)?.url ||
    component?.images?.[0]?.url ||
    null;

  return (
    <Card
      style={{
        marginBottom: 16,
        borderRadius: 12,
        border: "1px solid #E0E0E0",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {/* Left: Component Label */}
        <div style={{ minWidth: 40 }}>
          <Title level={5} style={{ margin: 0, fontWeight: 600 }}>
            {componentType.label}
          </Title>
        </div>

        {/* Middle: Component Info or Placeholder */}
        <div
          style={{ flex: 1, display: "flex", alignItems: "center", gap: 16 }}
        >
          {isSelected ? (
            <>
              {/* Product Image */}
              {primaryImage && (
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 8,
                    overflow: "hidden",
                    background: "#FAFAFA",
                    flexShrink: 0,
                  }}
                >
                  <Image
                    src={primaryImage}
                    alt={component.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    preview={false}
                  />
                </div>
              )}

              {/* Product Info */}
              <div style={{ flex: 1 }}>
                <Text strong style={{ display: "block", marginBottom: 4 }}>
                  {component.name}
                </Text>
                {component.sku && (
                  <Text
                    type="secondary"
                    style={{ fontSize: 12, display: "block" }}
                  >
                    SKU: {component.sku}
                  </Text>
                )}

                {/* Quantity Control */}
                <div
                  style={{
                    marginTop: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      border: "1px solid #D9D9D9",
                      borderRadius: 8,
                      padding: "4px 8px",
                      background: "#FFFFFF",
                    }}
                  >
                    <Button
                      type="text"
                      icon={<MinusOutlined />}
                      size="small"
                      onClick={() =>
                        handleQuantityChange((component.quantity || 1) - 1)
                      }
                      style={{ padding: 0, width: 24, height: 24 }}
                    />
                    <InputNumber
                      value={component.quantity || 1}
                      min={1}
                      max={99}
                      controls={false}
                      onChange={handleQuantityChange}
                      style={{
                        width: 50,
                        border: "none",
                        textAlign: "center",
                        padding: 0,
                      }}
                    />
                    <Button
                      type="text"
                      icon={<PlusOutlined />}
                      size="small"
                      onClick={() =>
                        handleQuantityChange((component.quantity || 1) + 1)
                      }
                      style={{ padding: 0, width: 24, height: 24 }}
                    />
                  </div>
                </div>

                {/* Price */}
                <div style={{ marginTop: 8 }}>
                  <Text strong style={{ fontSize: 18, color: "#ff4d4f" }}>
                    {formatPrice(
                      (component.pricing?.isOnSale &&
                      component.pricing?.salePrice
                        ? component.pricing.salePrice
                        : component.pricing?.originalPrice || 0) *
                        (component.quantity || 1)
                    )}
                  </Text>
                </div>
              </div>
            </>
          ) : (
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "40px 20px",
                border: "2px dashed #D9D9D9",
                borderRadius: 8,
                background: "#FAFAFA",
              }}
            >
              <div style={{ textAlign: "center" }}>
                {componentType.imageUrl ? (
                  <img
                    src={componentType.imageUrl}
                    alt={componentType.label}
                    style={{
                      width: 80,
                      height: 80,
                      objectFit: "contain",
                      marginBottom: 8,
                      opacity: 0.5,
                    }}
                  />
                ) : (
                  <div style={{ fontSize: 48, marginBottom: 8 }}>
                    {componentType.icon || "📦"}
                  </div>
                )}
                <Text type="secondary">Vui lòng chọn linh kiện</Text>
              </div>
            </div>
          )}
        </div>

        {/* Right: Action Buttons */}
        <div
          style={{
            minWidth: 100,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {isSelected ? (
            <>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => onEdit && onEdit(componentType)}
                block
              >
                Sửa
              </Button>
              <Button
                type="link"
                danger
                icon={<DeleteOutlined />}
                onClick={() => onRemove && onRemove(componentType)}
                block
              >
                Xóa
              </Button>
            </>
          ) : (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => onSelect && onSelect(componentType)}
              block
            >
              Chọn
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ComponentSelector;
