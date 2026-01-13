import { api } from './axios';
import APIConfig from './config';

export const BehaviorApi = {
  // Track event (public)
  track: (eventData) => {
    return api.post(`${APIConfig.behavior}/track`, eventData);
  },

  // Track multiple events (batch)
  trackBatch: (events) => {
    return api.post(`${APIConfig.behavior}/track/batch`, { events });
  },

  // Get customer behavior (admin only)
  getCustomerBehavior: (customerId, params = {}) => {
    return api.get(`${APIConfig.behavior}/${customerId}`, { params });
  },

  // Get behavior summary (admin only)
  getSummary: (customerId) => {
    return api.get(`${APIConfig.behavior}/${customerId}/summary`);
  },

  // Get behavior timeline (admin only)
  getTimeline: (customerId, params = {}) => {
    return api.get(`${APIConfig.behavior}/${customerId}/timeline`, { params });
  },

  // Get product analytics (admin only)
  getProductAnalytics: (productId, params = {}) => {
    return api.get(`${APIConfig.behavior}/analytics/products/${productId}`, { params });
  },

  // Get overview analytics (admin only)
  getOverviewAnalytics: (params = {}) => {
    return api.get(`${APIConfig.behavior}/analytics/overview`, { params });
  }
};

