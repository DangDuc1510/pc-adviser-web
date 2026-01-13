"use client";

import HeroSection from "./HeroSection";
import CategoriesSection from "./CategoriesSection";
import FeaturedProductsSection from "./FeaturedProductsSection";
import PersonalizedProductsSection from "./PersonalizedProductsSection";
import WhyChooseUsSection from "./WhyChooseUsSection";
import CallToActionSection from "./CallToActionSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoriesSection />
      <FeaturedProductsSection />
      <PersonalizedProductsSection />
      <WhyChooseUsSection />
      <CallToActionSection />
    </>
  );
}
