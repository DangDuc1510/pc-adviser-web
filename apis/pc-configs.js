import { api } from "./axios";
import APIConfig from "./config";

export const PCConfigsApi = {
  /**
   * Get all PC configs by userId
   * @param {string} userId - User ID
   * @param {Object} params - Query parameters (page, limit, etc.)
   * @returns {Promise}
   */
  getAll(userId, params = {}) {
    return api.get(`${APIConfig.products}/product-groups/user/${userId}`, {
      params,
    });
  },

  /**
   * Get PC config by ID
   * @param {string} id - Config ID
   * @returns {Promise}
   */
  getById(id) {
    return api.get(`${APIConfig.products}/product-groups/${id}`);
  },

  /**
   * Create new PC config
   * @param {Object} data - Config data (name, products, userId)
   * @returns {Promise}
   */
  create(data) {
    return api.post(`${APIConfig.products}/product-groups`, {
      ...data,
      type: "pc-config",
    });
  },

  /**
   * Update PC config
   * @param {string} id - Config ID
   * @param {Object} data - Update data
   * @returns {Promise}
   */
  update(id, data) {
    return api.put(`${APIConfig.products}/product-groups/${id}`, data);
  },

  /**
   * Delete PC config
   * @param {string} id - Config ID
   * @returns {Promise}
   */
  delete(id) {
    return api.delete(`${APIConfig.products}/product-groups/${id}`);
  },
};
