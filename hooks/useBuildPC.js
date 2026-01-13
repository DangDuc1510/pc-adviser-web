import { useState, useCallback, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CategoriesApi } from "@/apis/products";
import { PCConfigsApi } from "@/apis/pc-configs";
import { useAuth } from "./useAuth";

export const useBuildPC = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch root categories (level 0) with images
  const { data: rootCategories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ["rootCategories", "buildPC"],
    queryFn: async () => {
      const response = await CategoriesApi.getRoot();
      return response || [];
    },
  });

  // Map categories to component types format
  const COMPONENT_TYPES = useMemo(() => {
    const componentMap = {};
    rootCategories.forEach((category) => {
      if (category.componentType) {
        componentMap[category.componentType] = {
          key: category.componentType,
          label: category.name,
          icon: category.imageUrl || "📦",
          imageUrl: category.imageUrl,
          categoryId: category._id,
          category: category,
        };
      }
    });
    return componentMap;
  }, [rootCategories]);

  // Initialize currentConfig based on available component types
  const [currentConfig, setCurrentConfig] = useState({});

  // Initialize config when categories are loaded
  useEffect(() => {
    if (rootCategories.length > 0 && Object.keys(currentConfig).length === 0) {
      const initialConfig = {};
      rootCategories.forEach((category) => {
        if (category.componentType) {
          initialConfig[category.componentType] = null;
        }
      });
      setCurrentConfig(initialConfig);
    }
  }, [rootCategories]);

  // Transform currentConfig (frontend format) to products array (backend format)
  const transformConfigToProducts = useCallback((config, rootCategories) => {
    const products = [];
    const componentTypeMap = {};
    rootCategories.forEach((category) => {
      if (category.componentType) {
        componentTypeMap[category.componentType] = category._id;
      }
    });

    Object.entries(config).forEach(([componentType, product]) => {
      if (product && product._id) {
        products.push({
          productId: product._id,
          categoryLevel0Id: componentTypeMap[componentType],
          quantity: product.quantity || 1,
        });
      }
    });

    return products;
  }, []);

  // Transform products array (backend format) to currentConfig (frontend format)
  const transformProductsToConfig = useCallback((products, rootCategories) => {
    const config = {};
    const componentTypeMap = {};
    rootCategories.forEach((category) => {
      if (category.componentType) {
        // Map both _id (string) and category object to componentType
        if (category._id) {
          componentTypeMap[category._id.toString()] = category.componentType;
        }
        config[category.componentType] = null;
      }
    });

    products.forEach((item) => {
      if (item.productId && item.categoryLevel0Id) {
        // Handle both populated product object and categoryLevel0Id object/string
        const categoryId = item.categoryLevel0Id?._id
          ? item.categoryLevel0Id._id.toString()
          : item.categoryLevel0Id?.toString() || item.categoryLevel0Id;

        const componentType = componentTypeMap[categoryId];
        if (componentType && item.productId) {
          // productId is populated as product object from API
          const product =
            typeof item.productId === "object"
              ? item.productId
              : { _id: item.productId };

          config[componentType] = {
            ...product,
            quantity: item.quantity || 1,
          };
        }
      }
    });

    return config;
  }, []);

  // Fetch saved configs from API
  const {
    data: savedConfigsData,
    isLoading: loadingConfigs,
    refetch: refetchConfigs,
  } = useQuery({
    queryKey: ["pc-configs", user?._id || user?.id],
    queryFn: async () => {
      if (!user?._id && !user?.id) {
        return { groups: [], pagination: { total: 0 } };
      }
      const userId = user._id || user.id;
      const response = await PCConfigsApi.getAll(userId);
      return response || { groups: [], pagination: { total: 0 } };
    },
    enabled: !!user,
    staleTime: 30000,
  });

  // Transform backend format to frontend format
  const savedConfigs = useMemo(() => {
    const groups = savedConfigsData?.groups || savedConfigsData?.data || [];
    return groups.map((group) => {
      // Transform products array to components object
      const components = transformProductsToConfig(
        group.products || [],
        rootCategories
      );

      return {
        id: group._id || group.id,
        _id: group._id || group.id,
        name: group.name,
        components,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
        type: group.type,
        isActive: group.isActive,
        // Keep original data for reference
        originalData: group,
      };
    });
  }, [savedConfigsData, rootCategories, transformProductsToConfig]);

  // Calculate total price
  const totalPrice = useMemo(() => {
    return Object.values(currentConfig).reduce((total, component) => {
      if (!component) return total;
      const quantity = component.quantity || 1;
      const price =
        component.pricing?.isOnSale && component.pricing?.salePrice
          ? component.pricing.salePrice
          : component.pricing?.originalPrice || 0;
      return total + price * quantity;
    }, 0);
  }, [currentConfig]);

  // Add or update component
  const addComponent = useCallback((componentType, product, quantity = 1) => {
    setCurrentConfig((prev) => ({
      ...prev,
      [componentType]: {
        ...product,
        quantity,
      },
    }));
  }, []);

  // Remove component
  const removeComponent = useCallback((componentType) => {
    setCurrentConfig((prev) => ({
      ...prev,
      [componentType]: null,
    }));
  }, []);

  // Update component quantity
  const updateQuantity = useCallback(
    (componentType, quantity) => {
      if (quantity <= 0) {
        removeComponent(componentType);
        return;
      }
      setCurrentConfig((prev) => ({
        ...prev,
        [componentType]: prev[componentType]
          ? {
              ...prev[componentType],
              quantity,
            }
          : null,
      }));
    },
    [removeComponent]
  );

  // Save current config (deprecated - not used anymore)
  const saveConfig = useCallback(() => {
    // No-op: This function is kept for backward compatibility but does nothing
  }, []);

  // Reset current config
  const resetConfig = useCallback(() => {
    const emptyConfig = {};
    rootCategories.forEach((category) => {
      if (category.componentType) {
        emptyConfig[category.componentType] = null;
      }
    });
    setCurrentConfig(emptyConfig);
  }, [rootCategories]);

  // Save current config with a name (API call)
  const saveConfigWithName = useCallback(
    async (name) => {
      try {
        if (!user?._id && !user?.id) {
          throw new Error("User must be logged in to save config");
        }
        const userId = user._id || user.id;
        const userRole = user.role || "customer"; // Default to customer if role not available
        const products = transformConfigToProducts(
          currentConfig,
          rootCategories
        );
        const result = await PCConfigsApi.create({
          name: name || `Cấu hình ${Date.now()}`,
          products,
          userId,
          role: userRole, // Send role to backend
        });
        queryClient.invalidateQueries({
          queryKey: ["pc-configs", userId],
        });
        return result;
      } catch (error) {
        console.error("Error saving config:", error);
        throw error;
      }
    },
    [
      currentConfig,
      rootCategories,
      user,
      transformConfigToProducts,
      queryClient,
    ]
  );

  // Delete saved config (API call)
  const deleteSavedConfig = useCallback(
    async (configId) => {
      try {
        await PCConfigsApi.delete(configId);
        const userId = user?._id || user?.id;
        queryClient.invalidateQueries({
          queryKey: ["pc-configs", userId],
        });
      } catch (error) {
        console.error("Error deleting config:", error);
        throw error;
      }
    },
    [user, queryClient]
  );

  // Load saved config (API call)
  const loadSavedConfig = useCallback(
    async (configId) => {
      try {
        const config = await PCConfigsApi.getById(configId);
        if (config && config.products && rootCategories.length > 0) {
          const transformedConfig = transformProductsToConfig(
            config.products,
            rootCategories
          );
          setCurrentConfig(transformedConfig);
          return config;
        }
        return null;
      } catch (error) {
        console.error("Error loading config:", error);
        throw error;
      }
    },
    [rootCategories, transformProductsToConfig]
  );

  // Update saved config (API call)
  const updateSavedConfig = useCallback(
    async (configId, updates) => {
      try {
        await PCConfigsApi.update(configId, updates);
        const userId = user?._id || user?.id;
        queryClient.invalidateQueries({
          queryKey: ["pc-configs", userId],
        });
      } catch (error) {
        console.error("Error updating config:", error);
        throw error;
      }
    },
    [user, queryClient]
  );

  return {
    COMPONENT_TYPES,
    loadingCategories,
    loadingConfigs,
    currentConfig,
    totalPrice,
    savedConfigs,
    rootCategories,
    addComponent,
    removeComponent,
    updateQuantity,
    saveConfig,
    resetConfig,
    saveConfigWithName,
    deleteSavedConfig,
    loadSavedConfig,
    updateSavedConfig,
    refetchConfigs,
    transformConfigToProducts,
  };
};
