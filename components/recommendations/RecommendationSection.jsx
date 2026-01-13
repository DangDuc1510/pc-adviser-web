"use client";

import { Typography, Row, Col, Empty } from "antd";
import ProductCard from "@/components/products/ProductCard";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import RecommendationSkeleton from "./RecommendationSkeleton";
import RecommendationError from "./RecommendationError";

const { Title, Paragraph } = Typography;

export default function RecommendationSection({
  title = "Gợi ý cho bạn",
  description,
  recommendations = [],
  loading = false,
  error = null,
  limit = 8,
  showViewAll = false,
  onViewAll,
}) {
  if (loading) {
    return (
      <div style={{ padding: "64px 24px", background: "#F5F5F5" }}>
        <div className="container">
          <div style={{ marginBottom: 48 }}>
            {title && (
              <Title level={2} style={{ marginBottom: 8 }}>
                {title}
              </Title>
            )}
            {description && (
              <Paragraph type="secondary" style={{ fontSize: 16, margin: 0 }}>
                {description}
              </Paragraph>
            )}
          </div>
          <RecommendationSkeleton count={limit} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "64px 24px", background: "#F5F5F5" }}>
        <div className="container">
          <RecommendationError error={error} />
        </div>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  const products = recommendations
    .map((rec) => rec.product || rec)
    .filter(Boolean)
    .slice(0, limit);

  if (products.length === 0) {
    return null;
  }

  return (
    <div style={{ padding: "64px 24px", background: "#F5F5F5" }}>
      <div className="container">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 48,
          }}
        >
          <div>
            {title && (
              <Title level={2} style={{ marginBottom: 8 }}>
                {title}
              </Title>
            )}
            {description && (
              <Paragraph type="secondary" style={{ fontSize: 16, margin: 0 }}>
                {description}
              </Paragraph>
            )}
          </div>
        </div>

        <Row gutter={[24, 24]}>
          {products.map((product) => (
            <Col xs={24} sm={12} md={8} lg={6} key={product._id || product.id}>
              <ProductCard product={product} />
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
}

