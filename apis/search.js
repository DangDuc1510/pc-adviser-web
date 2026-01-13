import { api } from "./axios";
import APIConfig from "./config";

export const SearchApi = {
  /**
   * Search products with autocomplete suggestions
   * @param {string} keyword - Search keyword
   * @param {Object} params - Additional query parameters (limit, filters, etc.)
   * @returns {Promise}
   */
  searchProducts(keyword, params = {}) {
    const queryParams = {
      q: keyword,
      limit: params.limit || 10,
      ...params,
    };
    return api.get(`${APIConfig.search}/products`, { params: queryParams });
  },

  /**
   * Get autocomplete suggestions
   * @param {string} prefix - Search prefix
   * @returns {Promise}
   */
  autocomplete(prefix) {
    return api.get(`${APIConfig.search}/autocomplete`, {
      params: { prefix },
    });
  },
};
