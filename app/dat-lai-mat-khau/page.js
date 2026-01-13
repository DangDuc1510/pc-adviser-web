import { Suspense } from "react";
import ResetPasswordPage from "@/features/auth/ResetPasswordPage";
import LoadingFallback from "@/components/common/LoadingFallback";

export const metadata = {
  title: "Đặt lại mật khẩu - PC Adviser",
  description: "Đặt lại mật khẩu tài khoản PC Adviser của bạn",
};

export default function ResetPasswordPageWrapper() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResetPasswordPage />
    </Suspense>
  );
}
