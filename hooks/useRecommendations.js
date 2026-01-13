"use client";

import { useQuery } from "@tanstack/react-query";
import { RecommendationsApi } from "@/apis/recommendations";
import { useAuth } from "./useAuth";

/**
 * Custom hook for personalized recommendations
 */
export function usePersonalizedRecommendations(options = {}) {
  const { isAuthenticated } = useAuth();
  const { componentType, limit = 20, strategy = "hybrid", enabled = true } = options;

  return useQuery({
    queryKey: ["personalized-recommendations", componentType, limit, strategy],
    queryFn: async () => {
      const response = await RecommendationsApi.getPersonalized({
        componentType,
        limit,
        strategy,
      });
      return response?.data || response;
    },
    enabled: enabled && isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

/**
 * Custom hook for favorite products
 */
export function useFavoriteProducts(options = {}) {
  const { isAuthenticated } = useAuth();
  const { timeWindow = 30, limit = 20, category, enabled = true } = options;

  return useQuery({
    queryKey: ["favorite-products", timeWindow, limit, category],
    queryFn: async () => {
      const response = await RecommendationsApi.getFavorites({
        timeWindow,
        limit,
        category,
      });
      return response?.data || response;
    },
    enabled: enabled && isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

/**
 * Custom hook for similar products
 */
export function useSimilarProducts(productId, options = {}) {
  const { limit = 10, category, enabled = true } = options;

  return useQuery({
    queryKey: ["similar-products", productId, limit, category],
    queryFn: async () => {
      if (!productId) return null;
      const response = await RecommendationsApi.getSimilar(productId, {
        limit,
        category,
      });
      return response?.data || response;
    },
    enabled: enabled && !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

/**
 * Custom hook for compatible components
 */
export function useCompatibleComponents(componentType, currentComponents = [], options = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: ["compatible-components", componentType, currentComponents],
    queryFn: async () => {
      if (!componentType) return null;
      const response = await RecommendationsApi.getCompatible(
        componentType,
        currentComponents
      );
      return response?.data || response;
    },
    enabled: enabled && !!componentType,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

