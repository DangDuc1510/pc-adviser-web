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
};

