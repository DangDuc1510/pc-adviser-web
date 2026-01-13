import { Typography, Row, Col } from "antd";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { CategoriesApi } from "@/apis/products";

const { Title, Paragraph, Text } = Typography;

export default function CategoriesSection() {
  const router = useRouter();

  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ["root-categories"],
    queryFn: async () => {
      const response = await CategoriesApi.getRoot();
      if (response) {
        return Array.isArray(response) ? response : response.categories || [];
      }
      return [];
    },
    staleTime: 10 * 60 * 1000,
  });

  const categories = categoriesData || [];

  if (isLoading || categories.length === 0) return null;

  return (
    <div style={{ padding: "64px 24px", background: "#FFFFFF" }}>
      <div className="container">
        <div style={{ textAlign: "start", marginBottom: 24}}>
          <Title level={2}>Danh mục sản phẩm</Title>
          <Paragraph type="secondary" style={{ fontSize: 16 }}>
            Tìm linh kiện phù hợp cho build PC của bạn
          </Paragraph>
        </div>
        <Row
          gutter={[24, 0]}
          wrap={false}
          className="overflow-x-auto no-scrollbar"
        >
          {categories.map((category) => (
            <Col xs={24} sm={12} md={8} lg={4} key={category._id}>
              <div
                onClick={() =>
                  router.push(
                    `/san-pham?categoryId=${category._id}`
                  )
                }
                className="card-hover cursor-pointer h-[180px] rounded-lg border border-[var(--color-border)] bg-white flex flex-col items-center justify-center text-center transition-all"
              >
                {category.imageUrl ? (
                  <div className="mb-4 flex items-center justify-center h-16">
                    <img
                      src={category.imageUrl}
                      alt={category.name}
                      className="w-16 h-16 object-contain rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="mb-4 min-h-16 flex items-center justify-center text-5xl">
                    💻
                  </div>
                )}
                <Text strong className="text-base">
                  {category.name}
                </Text>
              </div>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
}


