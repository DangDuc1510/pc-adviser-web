import { api } from "./axios";
import APIConfig from "./config";

export const ProductsApi = {
  /**
   * Get all products with filters and pagination
   * @param {Object} params - Query parameters
   * @returns {Promise}
   */
  getAll(params = {}) {
    return api.get(APIConfig.products, { params });
  },

  /**
   * Get product by ID
   * @param {string} id - Product ID
   * @returns {Promise}
   */
  getById(id) {
    return api.get(`${APIConfig.products}/${id}`);
  },

  /**
   * Get product by slug
   * @param {string} slug - Product slug
   * @returns {Promise}
   */
  getBySlug(slug) {
    return api.get(`${APIConfig.products}/slug/${slug}`);
  },

  /**
   * Search products
   * @param {Object} params - Search parameters
   * @returns {Promise}
   */
  search(params = {}) {
    return api.get(`${APIConfig.products}/search`, { params });
  },

  /**
   * Get featured products
   * @param {Object} params - Query parameters
   * @returns {Promise}
   */
  getFeatured(params = {}) {
    return api.get(`${APIConfig.products}/featured`, { params });
  },

  /**
   * Get products on sale
   * @param {Object} params - Query parameters
   * @returns {Promise}
   */
  getOnSale(params = {}) {
    return api.get(`${APIConfig.products}/sale`, { params });
  },

  /**
   * Get related products
   * @param {string} id - Product ID
   * @param {Object} params - Query parameters
   * @returns {Promise}
   */
  getRelated(id, params = {}) {
    return api.get(`${APIConfig.products}/${id}/related`, { params });
  },

  /**
   * Get products by price range
   * @param {Object} params - Price range parameters
   * @returns {Promise}
   */
  getByPriceRange(params = {}) {
    return api.get(`${APIConfig.products}/price-range`, { params });
  },

  /**
   * Get price range (min/max) for filtering
   * @param {Object} params - Filter parameters
   * @returns {Promise}
   */
  getPriceRange(params = {}) {
    return api.get(`${APIConfig.products}/price-range/limits`, { params });
  },

  /**
   * Get multiple products by IDs
   * @param {string[]} ids - Array of product IDs
   * @returns {Promise}
   */
  getByIds(ids = []) {
    if (!ids || ids.length === 0) {
      return Promise.resolve({ success: true, data: [] });
    }
    return api.get(APIConfig.products, {
      params: { ids: ids.join(',') },
    });
  },

  /**
   * Get use cases options
   * @returns {Promise}
   */
  getUseCases() {
    return api.get(`${APIConfig.products}/options/use-cases`);
  },

  /**
   * Get colors options
   * @returns {Promise}
   */
  getColors() {
    return api.get(`${APIConfig.products}/options/colors`);
  },

  /**
   * Get status options
   * @returns {Promise}
   */
  getStatus() {
    return api.get(`${APIConfig.products}/options/status`);
  },

  /**
   * Get price ranges (segments) options
   * @returns {Promise}
   */
  getPriceRanges() {
    return api.get(`${APIConfig.products}/options/price-ranges`);
  },

  /**
   * Get category-specific filters (sub-filters)
   * @param {string} categoryId - Category ID
   * @returns {Promise}
   */
  getCategoryFilters(categoryId) {
    return api.get(`${APIConfig.products}/filters/${categoryId}`);
  },

  /**
   * Get all filter options in one API call
   * @param {string} categoryId - Optional category ID for sub-filters
   * @returns {Promise}
   */
  getAllFilterOptions(categoryId) {
    return api.get(`${APIConfig.products}/filter-options`, {
      params: categoryId ? { categoryId } : {},
    });
  },
};

export const CategoriesApi = {
  /**
   * Get all categories
   * @param {Object} params - Query parameters
   * @returns {Promise}
   */
  getAll(params = {}) {
    return api.get(APIConfig.categories, { params });
  },

  /**
   * Get category by ID
   * @param {string} id - Category ID
   * @returns {Promise}
   */
  getById(id) {
    return api.get(`${APIConfig.categories}/${id}`);
  },

  /**
   * Get category by slug
   * @param {string} slug - Category slug
   * @returns {Promise}
   */
  getBySlug(slug) {
    return api.get(`${APIConfig.categories}/slug/${slug}`);
  },

  /**
   * Get products by category
   * @param {string} id - Category ID
   * @param {Object} params - Query parameters
   * @returns {Promise}
   */
  getProducts(id, params = {}) {
    return api.get(`${APIConfig.categories}/${id}/products`, { params });
  },

  /**
   * Get root categories (level 0)
   * @returns {Promise}
   */
  getRoot() {
    return api.get(`${APIConfig.categories}/root`);
  },
};

export const BrandsApi = {
  /**
   * Get all brands
   * @param {Object} params - Query parameters
   * @returns {Promise}
   */
  getAll(params = {}) {
    return api.get(APIConfig.brands, { params });
  },

  /**
   * Get brand by ID
   * @param {string} id - Brand ID
   * @returns {Promise}
   */
  getById(id) {
    return api.get(`${APIConfig.brands}/${id}`);
  },

  /**
   * Get products by brand
   * @param {string} id - Brand ID
   * @param {Object} params - Query parameters
   * @returns {Promise}
   */
  getProducts(id, params = {}) {
    return api.get(`${APIConfig.brands}/${id}/products`, { params });
  },
};
