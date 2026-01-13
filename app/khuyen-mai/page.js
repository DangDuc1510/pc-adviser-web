'use client';

import MyVouchersPage from "@/features/vouchers/MyVouchersPage";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function MyVouchersPageWrapper() {
  return (
    <ProtectedRoute>
      <MyVouchersPage />
    </ProtectedRoute>
  );
}

