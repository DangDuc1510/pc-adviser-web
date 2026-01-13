import { api } from "./axios";
import APIConfig from "./config";

export const OrdersApi = {
  /**
   * Get all orders
   * @param {Object} params - Query parameters
   * @returns {Promise}
   */
  getAll(params = {}) {
    return api.get(APIConfig.orders, { params });
  },

  /**
   * Get order by ID
   * @param {string} id - Order ID
   * @returns {Promise}
   */
  getById(id) {
    return api.get(`${APIConfig.orders}/${id}`);
  },

  /**
   * Get order by order number
   * @param {string} orderNumber - Order number
   * @returns {Promise}
   */
  getByOrderNumber(orderNumber) {
    return api.get(`${APIConfig.orders}/number/${orderNumber}`);
  },

  /**
   * Create new order
   * @param {Object} data - Order data
   * @param {Array} data.products - Array of {productId, quantity}
   * @param {string} data.couponCode - Optional coupon code
   * @param {Object} data.shippingInfo - Shipping info {name, phone, address}
   * @param {string} data.paymentMethod - Payment method (COD | VNPAY)
   * @param {string} data.customerNote - Optional customer note
   * @returns {Promise}
   */
  create(data) {
    return api.post(APIConfig.orders, data);
  },

  /**
   * Calculate checkout information (does not create order)
   * @param {Object} data
   * @param {Array} data.productIds - Array of {productId, quantity}
   * @param {string} data.couponCode - Optional coupon code
   * @returns {Promise}
   */
  checkout(data) {
    return api.post(`${APIConfig.orders}/checkout`, data);
  },

  /**
   * Create payment session for order
   * @param {string} id
   * @param {Object} data
   * @returns {Promise}
   */
  createPaymentSession(id, data = {}) {
    return api.post(`${APIConfig.orders}/${id}/pay`, data);
  },

  /**
   * Create VNPay payment URL for order
   * @param {string} id - Order ID
   * @param {Object} data - Payment options
   * @param {string} data.bankCode - Optional bank code
   * @param {string} data.locale - Locale (vn/en)
   * @returns {Promise}
   */
  createVnpayPaymentUrl(id, data = {}) {
    return api.post(
      `${APIConfig.payment}/vnpay/orders/${id}/payment-url`,
      data
    );
  },

  /**
   * Update order status
   * @param {string} id - Order ID
   * @param {Object} data - Status data
   * @param {string} data.status - New status
   * @param {string} data.note - Status note
   * @returns {Promise}
   */
  updateStatus(id, data) {
    return api.patch(`${APIConfig.orders}/${id}/status`, data);
  },

  /**
   * Cancel order
   * @param {string} id - Order ID
   * @param {Object} data - Cancellation data
   * @param {string} data.reason - Cancellation reason
   * @returns {Promise}
   */
  cancel(id, data) {
    return api.delete(`${APIConfig.orders}/${id}`, { data });
  },

  /**
   * Get order statistics
   * @param {Object} params - Query parameters
   * @returns {Promise}
   */
  getStats(params = {}) {
    return api.get(`${APIConfig.orders}/stats`, { params });
  },
};

export const PaymentApi = {
  /**
   * Create payment intent
   * @param {Object} data - Payment data
   * @param {string} data.orderId - Order ID
   * @returns {Promise}
   */
  createIntent(data) {
    return api.post(`${APIConfig.payment}/create-intent`, data);
  },

  /**
   * Mock confirm payment (development only)
   * @param {string} orderId - Order ID
   * @returns {Promise}
   */
  mockConfirm(orderId) {
    return api.post(`${APIConfig.payment}/mock-confirm/${orderId}`);
  },

  /**
   * Get payment by order ID
   * @param {string} orderId - Order ID
   * @returns {Promise}
   */
  getByOrderId(orderId) {
    return api.get(`${APIConfig.payment}/order/${orderId}`);
  },

  /**
   * Request refund
   * @param {string} orderId - Order ID
   * @param {Object} data - Refund data
   * @param {number} data.amount - Refund amount
   * @param {string} data.reason - Refund reason
   * @returns {Promise}
   */
  refund(orderId, data) {
    return api.post(`${APIConfig.payment}/${orderId}/refund`, data);
  },
};

export const PromoCodeApi = {
  /**
   * Get valid promo codes for user
   * @param {Object} params - Query parameters
   * @param {number} params.minAmount - Minimum purchase amount
   * @returns {Promise}
   */
  getValid(params = {}) {
    return api.get(`${APIConfig.promoCodes}/valid`, { params });
  },

  /**
   * Validate promo code
   * @param {Object} data - Validation data
   * @param {string} data.code - Promo code
   * @returns {Promise}
   */
  validate(data) {
    return api.post(`${APIConfig.promoCodes}/validate`, data);
  },
};
