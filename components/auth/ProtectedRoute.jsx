'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const ProtectedRoute = ({ children, requireAuth = true }) => {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && requireAuth && !isAuthenticated) {
      // Save intended URL for redirect after login
      const currentPath = window.location.pathname + window.location.search;
      if (typeof window !== 'undefined') {
        localStorage.setItem('redirectAfterLogin', currentPath);
      }
      router.push('/dang-nhap');
    }
  }, [isAuthenticated, loading, requireAuth, router]);

  if (loading) {
    return <LoadingSpinner fullScreen tip="Đang kiểm tra xác thực..." />;
  }

  if (requireAuth && !isAuthenticated) {
    return <LoadingSpinner fullScreen tip="Đang chuyển hướng..." />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

