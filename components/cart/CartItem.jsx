"use client";

import {
  Card,
  InputNumber,
  Button,
  Typography,
  Space,
  Checkbox,
  Tag,
  Alert,
} from "antd";
import { DeleteOutlined, WarningOutlined } from "@ant-design/icons";
import { formatPrice } from "@/utils/format";
import { PLACEHOLDER_IMAGE } from "@/config/constants";
import { useCart } from "@/hooks/useCart";
import Link from "next/link";

const { Text } = Typography;

const CartItem = ({
  item,
  showActions = true,
  checked = false,
  onCheckedChange,
}) => {
  const { updateItem, removeItem } = useCart();

  // Get stock information from product
  const product = item.product;
  const stock = product?.inventory?.stock || 0;
  const reservedStock = product?.inventory?.reservedStock || 0;
  const availableStock = stock - reservedStock;
  const isOutOfStock = availableStock <= 0;
  const isLowStock =
    availableStock > 0 && availableStock < (item.quantity || 1);
  const productSlug = product?.seo?.slug || item.seo?.slug;

  const handleQuantityChange = async (value) => {
    if (value && value > 0 && item.productId) {
      try {
        await updateItem(item.productId, value);
      } catch (error) {
        console.error("Error updating cart item:", error);
      }
    } else {
      console.warn(
        "Cannot update item: missing productId or invalid quantity",
        {
          productId: item.productId,
          quantity: value,
          item,
        }
      );
    }
  };

  const handleRemove = async () => {
    if (item.productId) {
      await removeItem(item.productId);
    }
  };

  // Get product info from product object or productSnapshot (backward compatibility)
  const productImage =
    product?.images?.find((img) => img.isPrimary)?.url ||
    product?.images?.[0]?.url ||
    item.productImage ||
    null;
  const productName = product?.name || item.name || "Sản phẩm";
  const productSku = product?.sku || item.sku;

  // Disable checkbox if out of stock
  const handleCheckboxChange = (e) => {
    if (isOutOfStock) {
      return; // Prevent checking out of stock items
    }
    onCheckedChange?.(item.productId, e.target.checked);
  };

  return (
    <Card
      style={{
        marginBottom: 16,
        borderRadius: 8,
        border: "1px solid #E0E0E0",
      }}
      styles={{ body: { padding: 16 } }}
    >
      <div style={{ display: "flex", gap: 16 }}>
        {/* Checkbox */}
        {onCheckedChange && (
          <div style={{ display: "flex", alignItems: "center", paddingTop: 8 }}>
            <Checkbox
              checked={checked && !isOutOfStock}
              disabled={isOutOfStock}
              onChange={handleCheckboxChange}
            />
          </div>
        )}

        {/* Product image */}
        <div
          style={{
            width: 100,
            height: 100,
            flexShrink: 0,
            borderRadius: 4,
            overflow: "hidden",
            background: "#FAFAFA",
          }}
        >
          {productImage && (
            <img
              src={productImage}
              alt={productName}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          )}
        </div>

        {/* Product info */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Link href={`/san-pham/${productSlug}`} >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 4,
              }}
            >
              <Text strong style={{ fontSize: 16 }}>
                {productName}
              </Text>
              {isOutOfStock && (
                <Tag color="error" icon={<WarningOutlined />}>
                  Hết hàng
                </Tag>
              )}
              {isLowStock && !isOutOfStock && (
                <Tag color="warning">Còn {availableStock} sản phẩm</Tag>
              )}
            </div>
            {productSku && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                SKU: {productSku}
              </Text>
            )}
            {/* Stock information */}
            {!isOutOfStock && (
              <Text
                type="secondary"
                style={{ fontSize: 12, display: "block", marginTop: 4 }}
              >
                Tồn kho: {availableStock} sản phẩm
              </Text>
            )}
          </Link>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 12,
            }}
          >
            {/* Quantity */}
            {showActions ? (
              <Space>
                <Text type="secondary">Số lượng:</Text>
                <InputNumber
                  min={1}
                  max={isOutOfStock ? 0 : Math.min(99, availableStock)}
                  value={item.quantity}
                  onChange={handleQuantityChange}
                  disabled={isOutOfStock}
                  style={{ width: 80 }}
                />
                {isOutOfStock && (
                  <Text type="danger" style={{ fontSize: 12 }}>
                    (Hết hàng)
                  </Text>
                )}
                {isLowStock &&
                  !isOutOfStock &&
                  item.quantity > availableStock && (
                    <Text type="warning" style={{ fontSize: 12 }}>
                      (Chỉ còn {availableStock})
                    </Text>
                  )}
              </Space>
            ) : (
              <Text type="secondary">
                Số lượng: <Text strong>{item.quantity}</Text>
              </Text>
            )}

            {/* Price */}
            <div style={{ textAlign: "right" }}>
              <Text strong style={{ fontSize: 18, color: "#000" }}>
                {formatPrice(item.price)}
              </Text>
              {item.discount > 0 && item.originalPrice && (
                <div>
                  <Text delete type="secondary" style={{ fontSize: 14 }}>
                    {formatPrice(item.originalPrice)}
                  </Text>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Remove button */}
        {showActions && (
          <div>
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={handleRemove}
              title="Xóa sản phẩm"
            />
          </div>
        )}
      </div>
    </Card>
  );
};

export default CartItem;
