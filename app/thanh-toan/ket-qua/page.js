import { Suspense } from "react";
import CheckoutResultPage from "@/features/checkout/CheckoutResultPage";
import LoadingFallback from "@/components/common/LoadingFallback";

export const metadata = {
  title: "Kết quả thanh toán - PC Adviser",
  description: "Xem kết quả thanh toán đơn hàng của bạn",
};

export default function CheckoutResultPageWrapper() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CheckoutResultPage />
    </Suspense>
  );
}




