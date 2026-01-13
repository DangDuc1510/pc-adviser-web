import { api } from "./axios";
import APIConfig from "./config";

export const UserApi = {
  /**
   * Get user profile
   * @returns {Promise}
   */
  getProfile() {
    return api.get(`${APIConfig.user}/profile`);
  },

  /**
   * Update user profile
   * @param {Object} data - Profile data
   * @returns {Promise}
   */
  updateProfile(data) {
    return api.put(`${APIConfig.user}/profile`, data);
  },

  /**
   * Change password
   * @param {Object} data - Password data
   * @param {string} data.currentPassword - Current password
   * @param {string} data.newPassword - New password
   * @returns {Promise}
   */
  changePassword(data) {
    return api.put(`${APIConfig.user}/change-password`, data);
  },

  /**
   * Upload avatar
   * @param {FormData} formData - Form data with avatar file
   * @returns {Promise}
   */
  uploadAvatar(formData) {
    return api.post(`${APIConfig.user}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Get user addresses
   * @returns {Promise}
   */
  getAddresses() {
    return api.get(`${APIConfig.user}/addresses`);
  },

  /**
   * Add new address
   * @param {Object} data - Address data
   * @returns {Promise}
   */
  addAddress(data) {
    return api.post(`${APIConfig.user}/addresses`, data);
  },

  /**
   * Update address
   * @param {string} id - Address ID
   * @param {Object} data - Address data
   * @returns {Promise}
   */
  updateAddress(id, data) {
    return api.put(`${APIConfig.user}/addresses/${id}`, data);
  },

  /**
   * Delete address
   * @param {string} id - Address ID
   * @returns {Promise}
   */
  deleteAddress(id) {
    return api.delete(`${APIConfig.user}/addresses/${id}`);
  },

  /**
   * Set default address
   * @param {string} id - Address ID
   * @returns {Promise}
   */
  setDefaultAddress(id) {
    return api.patch(`${APIConfig.user}/addresses/${id}/default`);
  },

  /**
   * Get user permissions
   * @returns {Promise}
   */
  getPermissions() {
    return api.get(`${APIConfig.user}/permissions`);
  },
};

