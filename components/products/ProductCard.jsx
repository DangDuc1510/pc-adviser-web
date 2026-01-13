"use client";

import { Card, Button, Tag, Rate, Typography, Space, Tooltip } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { formatPrice, calculateDiscount } from "@/utils/format";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { trackClick, trackAddToCart } from "@/services/behaviorTracking";

const { Text, Title } = Typography;

const ProductCard = ({ product, disableNavigation = false, onCardClick }) => {
  const router = useRouter();
  const { addItem } = useCart();

  // Calculate derived values
  const finalPrice =
    product.pricing?.isOnSale && product.pricing?.salePrice
      ? product.pricing.salePrice
      : product.pricing?.originalPrice || 0;

  const discount = calculateDiscount(
    product.pricing?.originalPrice,
    product.pricing?.salePrice
  );

  const isOutOfStock =
    !product.inventory?.isInStock ||
    product.inventory?.stock - (product.inventory?.reservedStock || 0) <= 0;

  const availableStock =
    (product.inventory?.stock || 0) - (product.inventory?.reservedStock || 0);

  const handleAddToCart = async (e) => {
    e.stopPropagation();

    trackAddToCart(product._id, 1, {
      productName: product.name,
      price: finalPrice,
      category: product.categoryId?.name,
    });

    try {
      await addItem({ productId: product._id, quantity: 1 });
    } catch (error) {
      console.error("Failed to add item to cart:", error);
    }
  };

  const handleCardClick = () => {
    if (disableNavigation) {
      if (onCardClick) {
        onCardClick();
      }
      return;
    }
    trackClick("product", product._id, {
      productName: product.name,
      category: product.categoryId?.name,
    });
    router.push(`/san-pham/${product.seo?.slug || product._id}`);
  };

  const primaryImage =
    product.images?.find((img) => img.isPrimary)?.url ||
    product.images?.[0]?.url ||
    null;

  // Get key specifications based on category
  const getKeySpecs = () => {
    const specs = product.specifications || {};
    const categoryType = product.categoryId?.componentType || "";

    const keySpecs = [];

    // Common specs
    if (specs.model) keySpecs.push({ label: "Model", value: specs.model });
    if (specs.warranty)
      keySpecs.push({ label: "Bảo hành", value: specs.warranty });

    // CPU specific
    if (categoryType === "CPU") {
      if (specs.series) keySpecs.push({ label: "Series", value: specs.series });
      if (specs.cores)
        keySpecs.push({ label: "Cores", value: `${specs.cores} cores` });
      if (specs.threads)
        keySpecs.push({ label: "Threads", value: `${specs.threads} threads` });
      if (specs.baseClock)
        keySpecs.push({ label: "Base Clock", value: specs.baseClock });
      if (specs.socket) keySpecs.push({ label: "Socket", value: specs.socket });
    }

    // VGA specific
    if (categoryType === "VGA") {
      if (specs.chipset)
        keySpecs.push({ label: "Chipset", value: specs.chipset });
      if (specs.memory) keySpecs.push({ label: "VRAM", value: specs.memory });
      if (specs.coreClock)
        keySpecs.push({ label: "Core Clock", value: specs.coreClock });
    }

    // RAM specific
    if (categoryType === "RAM") {
      if (specs.capacityTotal)
        keySpecs.push({ label: "Dung lượng", value: specs.capacityTotal });
      if (specs.generation)
        keySpecs.push({ label: "Loại", value: specs.generation });
      if (specs.busSpeed)
        keySpecs.push({ label: "Tốc độ", value: specs.busSpeed });
      if (specs.timing) keySpecs.push({ label: "Timing", value: specs.timing });
    }

    // Mainboard specific
    if (categoryType === "Mainboard") {
      if (specs.chipsetMB)
        keySpecs.push({ label: "Chipset", value: specs.chipsetMB });
      if (specs.socketMB)
        keySpecs.push({ label: "Socket", value: specs.socketMB });
      if (specs.formFactorMB)
        keySpecs.push({ label: "Form Factor", value: specs.formFactorMB });
      if (specs.ramType) keySpecs.push({ label: "RAM", value: specs.ramType });
    }

    // Storage specific
    if (categoryType === "Storage") {
      if (specs.capacity)
        keySpecs.push({ label: "Dung lượng", value: specs.capacity });
      if (specs.storageType)
        keySpecs.push({ label: "Loại", value: specs.storageType });
      if (specs.interface)
        keySpecs.push({ label: "Giao tiếp", value: specs.interface });
      if (specs.readSpeed)
        keySpecs.push({ label: "Đọc", value: specs.readSpeed });
    }

    // PSU specific
    if (categoryType === "PSU") {
      if (specs.wattage)
        keySpecs.push({ label: "Công suất", value: specs.wattage });
      if (specs.efficiency)
        keySpecs.push({ label: "Hiệu suất", value: specs.efficiency });
      if (specs.modular)
        keySpecs.push({ label: "Modular", value: specs.modular });
    }

    // Case specific
    if (categoryType === "Case") {
      if (specs.caseType)
        keySpecs.push({ label: "Loại", value: specs.caseType });
      if (specs.formFactorMB)
        keySpecs.push({ label: "Form Factor", value: specs.formFactorMB });
    }

    // Monitor specific
    if (categoryType === "Monitor") {
      if (specs.screenSize)
        keySpecs.push({ label: "Kích thước", value: specs.screenSize });
      if (specs.resolution)
        keySpecs.push({ label: "Độ phân giải", value: specs.resolution });
      if (specs.panelType)
        keySpecs.push({ label: "Panel", value: specs.panelType });
      if (specs.refreshRate)
        keySpecs.push({ label: "Tần số", value: specs.refreshRate });
    }

    return keySpecs.slice(0, 3); // Show max 3 key specs
  };

  const keySpecs = getKeySpecs();

  return (
    <Card
      hoverable
      className="product-card"
      style={{
        height: "100%",
        borderRadius: 8,
        overflow: "hidden",
        border: "1px solid #E0E0E0",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.3s",
      }}
      onClick={handleCardClick}
      cover={
        <div
          style={{
            position: "relative",
            paddingTop: "100%",
            overflow: "hidden",
            background: "#FAFAFA",
            cursor: "pointer",
          }}
        >
          {primaryImage && (
            <img
              alt={product.name}
              src={primaryImage}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          )}

          {/* Discount badge */}
          {discount > 0 && (
            <Tag
              color="error"
              style={{
                position: "absolute",
                top: 12,
                left: 12,
                margin: 0,
                fontWeight: 600,
                fontSize: 14,
                padding: "4px 8px",
              }}
            >
              -{discount}%
            </Tag>
          )}

          {/* Out of stock overlay */}
          {isOutOfStock && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0, 0, 0, 0.6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Tag
                color="default"
                style={{ fontSize: 16, padding: "8px 16px" }}
              >
                Hết hàng
              </Tag>
            </div>
          )}
        </div>
      }
      styles={{
        body: {
          padding: 16,
          flex: 1,
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* Brand and Category */}
      <div style={{ marginBottom: 8 }}>
        {product.brandId && (
          <Tag color="blue" style={{ marginBottom: 4 }}>
            {product.brandId.name}
          </Tag>
        )}
        {product.categoryId && (
          <Tag color="default">{product.categoryId.name}</Tag>
        )}
      </div>

      {/* Product name */}
      <Title
        level={5}
        style={{
          margin: "0 0 8px 0",
          fontSize: 16,
          fontWeight: 600,
          minHeight: 48,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          textOverflow: "ellipsis",
          cursor: "pointer",
        }}
        onClick={handleCardClick}
      >
        {product.name}
      </Title>

      {/* Key Specifications */}
      {keySpecs.length > 0 && (
        <div style={{ marginBottom: 12, minHeight: 60 }}>
          {keySpecs.map((spec, index) => (
            <div key={index} style={{ marginBottom: 4 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                <strong>{spec.label}:</strong> {spec.value}
              </Text>
            </div>
          ))}
        </div>
      )}

      {/* Rating */}
      {product.rating?.count > 0 && (
        <div style={{ marginBottom: 12 }}>
          <Rate
            disabled
            value={product.rating.average}
            style={{ fontSize: 12 }}
          />
          <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
            ({product.rating.count})
          </Text>
        </div>
      )}

      {/* Stock info */}
      {!isOutOfStock && availableStock > 0 && (
        <Text type="secondary" style={{ fontSize: 12, marginBottom: 8 }}>
          Còn {availableStock} sản phẩm
        </Text>
      )}

      {/* Price */}
      <div style={{ marginTop: "auto", marginBottom: 12 }}>
        <div>
          <Text
            strong
            style={{
              fontSize: 20,
              color: "#ff4d4f",
              fontWeight: 600,
            }}
          >
            {formatPrice(finalPrice)}
          </Text>
        </div>
        {product.pricing?.isOnSale && product.pricing?.salePrice && (
          <div>
            <Text delete type="secondary" style={{ fontSize: 14 }}>
              {formatPrice(product.pricing.originalPrice)}
            </Text>
          </div>
        )}
      </div>

      {/* Add to cart button */}
      <Button
        type="primary"
        icon={<ShoppingCartOutlined />}
        block
        disabled={isOutOfStock}
        onClick={handleAddToCart}
        style={{
          height: 40,
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        {isOutOfStock ? "Hết hàng" : "Thêm vào giỏ"}
      </Button>

      <style jsx global>{`
        .product-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transform: translateY(-2px);
        }
      `}</style>
    </Card>
  );
};

export default ProductCard;
