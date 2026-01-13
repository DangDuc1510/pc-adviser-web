"use client";

import { useSimilarProducts } from "@/hooks/useRecommendations";
import RecommendationSection from "@/components/recommendations/RecommendationSection";

export default function SimilarProductsSection({
  productId,
  limit = 8,
  showReasons = false,
}) {
  const {
    data: similarData,
    isLoading,
    isError,
    error,
  } = useSimilarProducts(productId, {
    limit,
  });

  const similarProducts = similarData?.similarProducts || [];
  const referenceProduct = similarData?.referenceProduct;

  if (!productId) {
    return null;
  }

  if (isError || (!isLoading && similarProducts.length === 0)) {
    return null; // Don't show error, just hide section
  }

  return (
    <RecommendationSection
      title="Sản phẩm tương tự"
      description={
        referenceProduct
          ? `Các sản phẩm tương tự với ${referenceProduct.name}`
          : "Các sản phẩm bạn có thể quan tâm"
      }
      recommendations={similarProducts.map((item) => ({
        ...item.product,
        similarityScore: item.similarityScore,
        matchedFeatures: item.matchedFeatures,
      }))}
      loading={isLoading}
      error={isError ? error : null}
      limit={limit}
    />
  );
}

