import { Suspense } from "react";
import ProductsPage from "@/features/products/ProductsPage";
import LoadingFallback from "@/components/common/LoadingFallback";

export const metadata = {
  title: "Sản phẩm - PC Adviser",
  description: "Khám phá hàng ngàn linh kiện PC chất lượng cao với giá tốt nhất",
};

export default function ProductsPageWrapper() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ProductsPage />
    </Suspense>
  );
}
