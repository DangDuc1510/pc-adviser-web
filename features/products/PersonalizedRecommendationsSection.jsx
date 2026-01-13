"use client";

import { usePersonalizedRecommendations } from "@/hooks/useRecommendations";
import RecommendationSection from "@/components/recommendations/RecommendationSection";
import { useMemo } from "react";

export default function PersonalizedRecommendationsSection({
  productId,
  categoryId,
  limit = 8,
}) {
  // Determine component type from category if possible
  // This is a simplified mapping - can be enhanced later
  const componentType = useMemo(() => {
    // You can add category-to-component-type mapping here
    // For now, we'll use categoryId as componentType filter
    return null; // Let backend determine from category
  }, [categoryId]);

  const {
    data: personalizedData,
    isLoading,
    isError,
    error,
  } = usePersonalizedRecommendations({
    componentType: categoryId, // Use categoryId as filter
    limit,
    strategy: "hybrid",
  });

  const recommendations = personalizedData?.recommendations || [];
  const products = recommendations
    .map((rec) => rec.product || rec)
    .filter((p) => p._id !== productId); // Exclude current product

  if (!productId) {
    return null;
  }

  // Don't show if no recommendations or error
  if (isError || (!isLoading && products.length === 0)) {
    return null;
  }

  return (
    <RecommendationSection
      title="Sản phẩm bạn có thể quan tâm"
      description="Dựa trên sở thích và hành vi mua sắm của bạn"
      recommendations={products}
      loading={isLoading}
      error={isError ? error : null}
      limit={limit}
    />
  );
}

