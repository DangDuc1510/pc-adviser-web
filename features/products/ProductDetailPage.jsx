"use client";
import React, { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  Button,
  Typography,
  Space,
  Tag,
  Rate,
  Divider,
  Row,
  Col,
  Image,
  message,
} from "antd";
import { ShoppingCartOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { ProductsApi } from "@/apis/products";
import { useCart } from "@/hooks/useCart";
import { formatPrice, calculateDiscount } from "@/utils/format";
import { trackProductView, trackAddToCart } from "@/services/behaviorTracking";
import { useRouter } from "next/navigation";
import { SPEC_LABELS } from "@/config/constants";
import SimilarProductsSection from "./SimilarProductsSection";
import PersonalizedRecommendationsSection from "./PersonalizedRecommendationsSection";

const { Title, Text, Paragraph } = Typography;

const formatSpecValue = (value) => {
  if (typeof value === "boolean") {
    return value ? "Có" : "Không";
  }
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  return String(value);
};

export default function ProductDetailPage({ slug }) {
  const router = useRouter();
  const { addItem } = useCart();

  // Fetch product using useQuery directly
  const {
    data: product,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["productBySlug", slug],
    queryFn: async () => {
      if (!slug) return null;
      const response = await ProductsApi.getBySlug(slug);
      return response;
    },
    enabled: !!slug,
  });

  const loading = isLoading;
  const errorMessage = isError
    ? error?.response?.data?.message ||
      error?.message ||
      "Không thể tải sản phẩm"
    : null;
  // Scroll to top when slug changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [slug]);

  // Track product view
  useEffect(() => {
    if (product?._id) {
      trackProductView(product._id, {
        productName: product.name,
        category: product.categoryId?.name,
        price: product.pricing?.salePrice || product.pricing?.originalPrice,
      });
    }
  }, [product?._id]);

  const handleAddToCart = async () => {
    if (!product?._id) return;

    trackAddToCart(product._id, 1, {
      productName: product.name,
      price: finalPrice,
      category: product.categoryId?.name,
    });

    try {
      await addItem({ productId: product._id, quantity: 1 });
    } catch (error) {
      message.error("Thêm vào giỏ hàng thất bại");
    }
  };

  const specEntries = useMemo(() => {
    const specs = product?.specifications;
    if (!specs) return [];

    return Object.entries(specs).filter(([key, value]) => {
      if (value === null || value === undefined || value === "") return false;

      // Bỏ qua các trường LED khi không có LED
      if (key === "hasLED" && value === false) return false;
      if (
        key === "ledType" &&
        (value === "none" || value === "None" || value === "NONE")
      ) {
        return false;
      }

      if (Array.isArray(value)) return value.length > 0;
      return true;
    });
  }, [product]);

  const hasSpecs = specEntries.length > 0;

  const descriptionContent =
    product?.fullDescription || product?.shortDescription || null;

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (errorMessage || (!loading && !product)) {
    return (
      <div style={{ padding: "48px", textAlign: "center" }}>
        <Text type="danger">{errorMessage || "Không tìm thấy sản phẩm"}</Text>
        <br />
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push("/san-pham")}
          style={{ marginTop: 16 }}
        >
          Quay lại danh sách
        </Button>
      </div>
    );
  }

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
    product.inventory?.stock - product.inventory?.reservedStock <= 0;

  const primaryImage =
    product.images?.find((img) => img.isPrimary)?.url ||
    product.images?.[0]?.url ||
    null;

  const availableStock =
    (product.inventory?.stock || 0) - (product.inventory?.reservedStock || 0);

  return (
    <div
      style={{
        padding: "24px",
        background: "#F5F5F5",
        minHeight: "calc(100vh - 64px)",
      }}
    >
      <div className="container" style={{ maxWidth: 1200, margin: "0 auto" }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push("/san-pham")}
          style={{ marginBottom: 24 }}
        >
          Quay lại
        </Button>

        <Card>
          <Row gutter={[32, 32]}>
            {/* Product Images */}
            <Col xs={24} md={12}>
              {primaryImage && (
                <Image
                  src={primaryImage}
                  alt={product.name}
                  style={{ width: "100%", borderRadius: 8 }}
                  preview={{
                    mask: "Xem ảnh",
                  }}
                />
              )}
            </Col>

            {/* Product Info */}
            <Col xs={24} md={12}>
              <Space
                direction="vertical"
                size="large"
                style={{ width: "100%" }}
              >
                <div>
                  <Title level={2} style={{ margin: 0 }}>
                    {product.name}
                  </Title>
                  {product.brandId && (
                    <Text type="secondary" style={{ fontSize: 16 }}>
                      {product.brandId.name}
                    </Text>
                  )}
                </div>

                {product.categoryId && (
                  <Text type="secondary">
                    Thuộc danh mục: {product.categoryId.name}
                  </Text>
                )}

                {product.rating && product.rating.count > 0 && (
                  <div>
                    <Rate disabled value={product.rating.average} />
                    <Text style={{ marginLeft: 8 }}>
                      ({product.rating.count} đánh giá)
                    </Text>
                  </div>
                )}

                <Divider />

                <div>
                  <Space size="large" align="baseline">
                    <Text strong style={{ fontSize: 32, color: "#000" }}>
                      {formatPrice(finalPrice)}
                    </Text>
                    {product.pricing?.isOnSale &&
                      product.pricing?.salePrice && (
                        <>
                          <Text
                            delete
                            type="secondary"
                            style={{ fontSize: 20 }}
                          >
                            {formatPrice(product.pricing.originalPrice)}
                          </Text>
                          <Tag
                            color="error"
                            style={{ fontSize: 16, padding: "4px 12px" }}
                          >
                            -{discount}%
                          </Tag>
                        </>
                      )}
                  </Space>
                </div>

                <div>
                  <Text strong>Tình trạng: </Text>
                  {isOutOfStock ? (
                    <Tag color="default">Hết hàng</Tag>
                  ) : (
                    <Tag color="success">Còn hàng</Tag>
                  )}
                  {!isOutOfStock && (
                    <Text type="secondary" style={{ marginLeft: 8 }}>
                      ({availableStock} sản phẩm trong kho)
                    </Text>
                  )}
                </div>

                {product.tags && product.tags.length > 0 && (
                  <div>
                    <Text strong>Tags: </Text>
                    <Space wrap>
                      {product.tags.map((tag) => (
                        <Tag key={tag.name} color={tag.color || "default"}>
                          {tag.name}
                        </Tag>
                      ))}
                    </Space>
                  </div>
                )}

                <Button
                  type="primary"
                  size="large"
                  icon={<ShoppingCartOutlined />}
                  block
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                  style={{ height: 48, fontSize: 16 }}
                >
                  {isOutOfStock ? "Hết hàng" : "Thêm vào giỏ hàng"}
                </Button>
              </Space>
            </Col>
          </Row>

          <Divider />

          {/* Product Description */}
          {descriptionContent && (
            <div>
              <Title level={4}>Mô tả sản phẩm</Title>
              <Paragraph>{descriptionContent}</Paragraph>
            </div>
          )}

          {/* Product Specifications */}
          {hasSpecs && (
            <div style={{ marginTop: 24 }}>
              <Title level={4}>Thông số kỹ thuật</Title>
              <Row gutter={[16, 16]}>
                {specEntries.map(([key, value]) => {
                  const label = SPEC_LABELS[key] || key;
                  return (
                    <Col xs={24} sm={12} key={key}>
                      <Text strong>{label}: </Text>
                      <Text>{formatSpecValue(value)}</Text>
                    </Col>
                  );
                })}
              </Row>
            </div>
          )}
        </Card>

        {/* Similar Products Section */}
        {product?._id && (
          <div style={{ marginTop: 32 }}>
            <SimilarProductsSection productId={product._id} limit={8} />
          </div>
        )}

        {/* Personalized Recommendations Section */}
        {product?._id && (
          <div style={{ marginTop: 32 }}>
            <PersonalizedRecommendationsSection
              productId={product._id}
              categoryId={product.categoryId?._id || product.categoryId}
              limit={8}
            />
          </div>
        )}
      </div>
    </div>
  );
}
