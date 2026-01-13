import axios from "axios";
import APIConfig from "@/apis/config";
import { ACCESS_TOKEN, REFRESH_TOKEN, USER_INFO } from "@/config/constants";
import config from "@/config";
import { AuthApi } from "./auth";

const getToken = () => {
  return typeof window !== "undefined"
    ? window.localStorage.getItem(ACCESS_TOKEN)
    : "ssr";
};

const getRefreshToken = () => {
  return typeof window !== "undefined"
    ? window.localStorage.getItem(REFRESH_TOKEN)
    : null;
};

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const api = axios.create({
  baseURL: APIConfig.base,
  timeout: 30000,
  withCredentials: true,
  headers: {
    "x-access-token": getToken() || "ssr",
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    config.headers["x-access-token"] = getToken();
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  function (response) {
    return response.data;
  },
  async function (error) {
    const originalRequest = error.config;
    const status = error?.response?.status;

    if (status === config.httpCode.TOKEN_EXPIRED && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["x-access-token"] = token;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshTokenValue = getRefreshToken();
      if (!refreshTokenValue) {
        processQueue(error, null);
        isRefreshing = false;
        logout();
        return Promise.reject(error);
      }

      try {
        const response = await AuthApi.refreshToken({
          token: refreshTokenValue,
        });
        const newToken = response?.accessToken || response?.token;

        if (newToken && typeof window !== "undefined") {
          localStorage.setItem(ACCESS_TOKEN, newToken);
          if (response?.refreshToken) {
            localStorage.setItem(REFRESH_TOKEN, response.refreshToken);
          } else {
            localStorage.setItem(REFRESH_TOKEN, newToken);
          }
        }

        processQueue(null, newToken);
        originalRequest.headers["x-access-token"] = newToken;
        isRefreshing = false;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        logout();
        return Promise.reject(refreshError);
      }
    }

    switch (status) {
      case config.httpCode.CONFLICT:
        // Don't logout for stock-related errors (hết hàng)
        const errorMessage =
          error?.response?.data?.message || error?.message || "";
        const isStockError =
          errorMessage.toLowerCase().includes("hết hàng") ||
          errorMessage.toLowerCase().includes("không đủ hàng") ||
          errorMessage.toLowerCase().includes("stock") ||
          errorMessage.toLowerCase().includes("insufficient");

        // Only logout for authentication conflicts, not stock errors
        if (!isStockError) {
          logout();
        }
        break;
      default:
        break;
    }
    return Promise.reject(error);
  }
);

const logout = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN);
    localStorage.removeItem(USER_INFO);
    window.location.href = "/dang-nhap";
  }
};
