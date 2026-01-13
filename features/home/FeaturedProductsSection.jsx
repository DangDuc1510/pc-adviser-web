import { Typography, Row, Col, Button } from "antd";
import { ArrowRightOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import ProductCard from "@/components/products/ProductCard";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { ProductsApi } from "@/apis/products";

const { Title, Paragraph } = Typography;

export default function FeaturedProductsSection() {
  const router = useRouter();

  const { data: featuredProductsData, isLoading } = useQuery({
    queryKey: ["featured-products", { limit: 8 }],
    queryFn: async () => {
      const response = await ProductsApi.getFeatured({ limit: 8 });
      if (response) {
        return response.products || response || [];
      }
      return [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const products = featuredProductsData || [];

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
            <Title level={2} style={{ marginBottom: 8 }}>
              Sản phẩm nổi bật
            </Title>
            <Paragraph
              type="secondary"
              style={{ fontSize: 16, margin: 0 }}
            >
              Những sản phẩm được yêu thích nhất
            </Paragraph>
          </div>
          <Button
            type="link"
            onClick={() => router.push("/san-pham")}
            style={{ fontSize: 16 }}
          >
            Xem tất cả <ArrowRightOutlined />
          </Button>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <Row gutter={[24, 24]}>
            {products.slice(0, 8).map((product) => (
              <Col
                xs={24}
                sm={12}
                md={8}
                lg={6}
                key={product._id}
              >
                <ProductCard product={product} />
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
}


