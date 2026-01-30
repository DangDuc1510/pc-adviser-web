import { api } from "./axios";
import APIConfig from "./config";
import { USER_INFO } from "@/config/constants";

// Get user ID from localStorage
const getUserId = () => {
  if (typeof window === "undefined") return null;
  
  try {
    const userInfo = localStorage.getItem(USER_INFO);
    if (userInfo) {
      const user = JSON.parse(userInfo);
      return user._id || user.id || null;
    }
  } catch (error) {
    console.error("Error parsing user info:", error);
  }
  
  return null;
};

// Get customer ID from localStorage (if available)
const getCustomerId = () => {
  if (typeof window === "undefined") return null;
  
  try {
    const userInfo = localStorage.getItem(USER_INFO);
    if (userInfo) {
      const user = JSON.parse(userInfo);
      return user.customerId || null;
    }
  } catch (error) {
    console.error("Error parsing user info:", error);
  }
  
  return null;
};

export const RecommendationsApi = {
  /**
   * Get personalized recommendations
   * @param {Object} params - Query parameters
   * @returns {Promise}
   */
  getPersonalized(params = {}) {
    const userId = getUserId();
    const customerId = getCustomerId();
    
    const queryParams = {
      ...params,
    };
    
    if (customerId) {
      queryParams.customerId = customerId;
    } else if (userId) {
      queryParams.userId = userId;
    }
    
    return api.get(`${APIConfig.recommendations}/personalized`, { params: queryParams });
  },

  /**
   * Get similar products
   * @param {string} productId - Product ID
   * @param {Object} params - Additional query parameters
   * @returns {Promise}
   */
  getSimilar(productId, params = {}) {
    if (!productId) {
      return Promise.reject(new Error("productId is required"));
    }
    
    return api.get(`${APIConfig.recommendations}/similar`, {
      params: {
        productId,
        ...params,
      },
    });
  },

  /**
   * Get favorite products
   * @param {Object} params - Query parameters
   * @returns {Promise}
   */
  getFavorites(params = {}) {
    const userId = getUserId();
    const customerId = getCustomerId();
    
    const queryParams = {
      ...params,
    };
    
    if (customerId) {
      queryParams.customerId = customerId;
    } else if (userId) {
      queryParams.userId = userId;
    }
    
    return api.get(`${APIConfig.recommendations}/favorites`, { params: queryParams });
  },

  /**
   * Get compatible component recommendations
   * @param {string} componentType - Component type (e.g., "motherboard", "psu")
   * @param {Array} currentComponents - Current build components
   * @param {Object} params - Additional query parameters
   * @returns {Promise}
   */
  getCompatible(componentType, currentComponents = [], params = {}) {
    if (!componentType) {
      return Promise.reject(new Error("componentType is required"));
    }
    
    return api.get(`${APIConfig.recommendations}/compatible`, {
      params: {
        componentType,
        currentComponents: JSON.stringify(currentComponents),
        ...params,
      },
    });
  },

  /**
   * Get build suggestions for a single missing component type
   * @param {Object} currentConfig - Current build configuration { componentType: product }
   * @param {String} categoryId - Category ID to suggest products for
   * @param {Number} limitPerComponent - Limit of suggestions (max 6)
   * @returns {Promise}
   */
  getBuildSuggestions(currentConfig = {}, categoryId, limitPerComponent = 6) {
    if (!categoryId || typeof categoryId !== 'string') {
      return Promise.reject(new Error("categoryId is required and must be a string"));
    }
    
    return api.post(`${APIConfig.recommendations}/build-suggestions`, {
      currentConfig,
      categoryId,
      limitPerComponent: Math.min(6, limitPerComponent),
    });
  },
};

