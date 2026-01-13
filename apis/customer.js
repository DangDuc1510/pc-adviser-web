import { api } from './axios';
import APIConfig from './config';

export const CustomerApi = {
  // Create or update customer (public)
  createOrUpdate: (data) => {
    return api.post(`${APIConfig.customers}`, data);
  },

  // Get all customers (admin only)
  getAll: (params = {}) => {
    return api.get(`${APIConfig.customers}`, { params });
  },

  // Get customer by ID (admin only)
  getById: (id) => {
    return api.get(`${APIConfig.customers}/${id}`);
  },

  // Get customer stats (admin only)
  getStats: () => {
    return api.get(`${APIConfig.customers}/stats`);
  },

  // Get customer behavior (admin only)
  getBehavior: (id, params = {}) => {
    return api.get(`${APIConfig.customers}/${id}/behavior`, { params });
  },

  // Get customer orders (admin only)
  getOrders: (id) => {
    return api.get(`${APIConfig.customers}/${id}/orders`);
  }
};

