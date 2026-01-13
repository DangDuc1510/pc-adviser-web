import ProductDetailPage from "@/features/products/ProductDetailPage";

export const metadata = {
  title: "Chi tiết sản phẩm - PC Adviser",
  description: "Chi tiết sản phẩm linh kiện PC",
};

export default function ProductDetailPageWrapper({ params }) {
  return <ProductDetailPage slug={params.slug} />;
}

