import OrderDetailPage from "@/features/orders/OrderDetailPage";

export const metadata = {
  title: "Chi tiết đơn hàng - PC Adviser",
  description: "Xem chi tiết đơn hàng của bạn",
};

export default function OrderDetailPageWrapper({ params }) {
  return <OrderDetailPage orderId={params.id} />;
}
