"use client";

import { usePersonalizedRecommendations } from "@/hooks/useRecommendations";
import RecommendationSection from "@/components/recommendations/RecommendationSection";

export default function PersonalizedProductsSection() {
  // Get personalized recommendations for logged-in users
  const { data: personalizedData, isLoading: isLoadingPersonalized } =
    usePersonalizedRecommendations({
      limit: 8,
      strategy: "hybrid",
    });

  const recommendations = personalizedData?.recommendations || [];
  const products = recommendations
    .map((rec) => rec.product || rec)
    .filter(Boolean);

  // Only show "Dành cho bạn" section if there are personalized products
  // Don't show section if no personalized products (whether loading or not)
  if (products.length === 0) {
    return null;
  }

  return (
    <RecommendationSection
      title="Dành cho bạn"
      description="Các sản phẩm được đề xuất dựa trên sở thích của bạn"
      recommendations={products}
      loading={isLoadingPersonalized}
      limit={8}
    />
  );
}
