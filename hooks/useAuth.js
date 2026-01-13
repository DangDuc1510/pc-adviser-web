"use client";

import { useCallback } from "react";
import { ACCESS_TOKEN, REFRESH_TOKEN, USER_INFO } from "@/config/constants";
import { AuthApi } from "@/apis/auth";
import { UserApi } from "@/apis/user";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useAuth = () => {
  const queryClient = useQueryClient();

  const {
    data: user,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem(ACCESS_TOKEN)
          : null;
      if (!token) {
        return null;
      }
      // Always fetch from API to get latest data
      try {
        const response = await UserApi.getProfile();
        // Update localStorage with fresh data from API
        if (typeof window !== "undefined" && response) {
          localStorage.setItem(USER_INFO, JSON.stringify(response));
        }
        return response;
      } catch (error) {
        // If API fails, fallback to localStorage
        const storedUser =
          typeof window !== "undefined"
            ? localStorage.getItem(USER_INFO)
            : null;
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            return userData;
          } catch (e) {
            return null;
          }
        }
        return null;
      }
    },
    staleTime: 0, // Always refetch when invalidated
    refetchOnWindowFocus: false,
  });

  const isAuthenticated = !!user;
  const loading = isLoading;

  const loginMutation = useMutation({
    mutationFn: AuthApi.login,
    onSuccess: (response) => {
      const { token, accessToken, refreshToken, user: userData } = response;
      if (typeof window !== "undefined") {
        const accessTokenValue = accessToken || token;
        const refreshTokenValue = refreshToken || token || accessToken;
        localStorage.setItem(ACCESS_TOKEN, accessTokenValue);
        if (refreshTokenValue) {
          localStorage.setItem(REFRESH_TOKEN, refreshTokenValue);
        }
        localStorage.setItem(USER_INFO, JSON.stringify(userData));
      }
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: AuthApi.logout,
    onSuccess: () => {
      if (typeof window !== "undefined") {
        localStorage.removeItem(ACCESS_TOKEN);
        localStorage.removeItem(REFRESH_TOKEN);
        localStorage.removeItem(USER_INFO);
        localStorage.removeItem("appliedCoupon");
      }
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.removeQueries({ queryKey: ["cart"] });
      queryClient.removeQueries({ queryKey: ["cart-products"] });
    },
  });

  const registerMutation = useMutation({
    mutationFn: AuthApi.register,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: UserApi.updateProfile,
    onSuccess: (response) => {
      if (response.success && response.data) {
        if (typeof window !== "undefined") {
          localStorage.setItem(USER_INFO, JSON.stringify(response.data));
        }
      }
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  return {
    user,
    loading,
    isAuthenticated,
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    updateProfile: updateProfileMutation.mutateAsync,
    checkAuth: refetch,
  };
};
