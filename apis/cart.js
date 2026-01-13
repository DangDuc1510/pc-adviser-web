import { api } from "./axios";
import APIConfig from "./config";

export const CartApi = {
  /**
   * Get current cart
   * @returns {Promise}
   */
  getCart() {
    return api.get(APIConfig.cart);
  },

  /**
   * Get cart summary
   * @returns {Promise}
   */
  getSummary() {
    return api.get(`${APIConfig.cart}/summary`);
  },

  /**
   * Add item to cart
   * @param {Object} data - Item data
   * @param {string} data.productId - Product ID
   * @param {number} data.quantity - Quantity
   * @returns {Promise}
   */
  addItem(data) {
    return api.post(`${APIConfig.cart}/items`, data);
  },

  /**
   * Update cart item quantity
   * @param {string} productId - Product ID
   * @param {Object} data - Update data
   * @param {number} data.quantity - New quantity
   * @returns {Promise}
   */
  updateItem(productId, data) {
    return api.patch(`${APIConfig.cart}/items/${productId}`, data);
  },

  /**
   * Remove item from cart
   * @param {string} productId - Product ID
   * @returns {Promise}
   */
  removeItem(productId) {
    return api.delete(`${APIConfig.cart}/items/${productId}`);
  },

  /**
   * Clear cart
   * @returns {Promise}
   */
  clearCart() {
    return api.delete(`${APIConfig.cart}/clear`);
  },

  /**
   * Apply coupon to cart
   * @param {Object} data - Coupon data
   * @param {string} data.code - Coupon code
   * @returns {Promise}
   */
  applyCoupon(data) {
    return api.post(`${APIConfig.cart}/coupon`, data);
  },

  /**
   * Remove coupon from cart
   * @returns {Promise}
   */
  removeCoupon() {
    return api.delete(`${APIConfig.cart}/coupon`);
  },
};

