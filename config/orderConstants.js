// Order Status
export const ORDER_STATUS = {
  PENDING_PAYMENT: "pending_payment",
  PAYMENT_FAILED: "payment_failed",
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PROCESSING: "processing",
  PREPARING: "preparing",
  READY_TO_SHIP: "ready_to_ship",
  SHIPPED: "shipped",
  IN_TRANSIT: "in_transit",
  DELIVERED: "delivered",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
};

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PENDING_PAYMENT]: "Chờ thanh toán",
  [ORDER_STATUS.PAYMENT_FAILED]: "Thanh toán thất bại",
  [ORDER_STATUS.PENDING]: "Chờ xác nhận",
  [ORDER_STATUS.CONFIRMED]: "Đã xác nhận",
  [ORDER_STATUS.PROCESSING]: "Đang xử lý",
  [ORDER_STATUS.PREPARING]: "Đang chuẩn bị hàng",
  [ORDER_STATUS.READY_TO_SHIP]: "Sẵn sàng giao hàng",
  [ORDER_STATUS.SHIPPED]: "Đã bàn giao vận chuyển",
  [ORDER_STATUS.IN_TRANSIT]: "Đang vận chuyển",
  [ORDER_STATUS.DELIVERED]: "Đã giao hàng",
  [ORDER_STATUS.COMPLETED]: "Hoàn thành",
  [ORDER_STATUS.CANCELLED]: "Đã hủy",
  [ORDER_STATUS.REFUNDED]: "Đã hoàn tiền",
};

export const ORDER_STATUS_COLORS = {
  [ORDER_STATUS.PENDING_PAYMENT]: "#faad14",
  [ORDER_STATUS.PAYMENT_FAILED]: "#ff4d4f",
  [ORDER_STATUS.PENDING]: "#faad14",
  [ORDER_STATUS.CONFIRMED]: "#1890ff",
  [ORDER_STATUS.PROCESSING]: "#1890ff",
  [ORDER_STATUS.PREPARING]: "#1890ff",
  [ORDER_STATUS.READY_TO_SHIP]: "#1890ff",
  [ORDER_STATUS.SHIPPED]: "#1890ff",
  [ORDER_STATUS.IN_TRANSIT]: "#1890ff",
  [ORDER_STATUS.DELIVERED]: "#52c41a",
  [ORDER_STATUS.COMPLETED]: "#52c41a",
  [ORDER_STATUS.CANCELLED]: "#ff4d4f",
  [ORDER_STATUS.REFUNDED]: "#8c8c8c",
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  PAID: "paid",
  FAILED: "failed",
  REFUNDED: "refunded",
  CANCELLED: "cancelled",
};

export const PAYMENT_STATUS_LABELS = {
  [PAYMENT_STATUS.PENDING]: "Chờ thanh toán",
  [PAYMENT_STATUS.PROCESSING]: "Đang xử lý",
  [PAYMENT_STATUS.PAID]: "Đã thanh toán",
  [PAYMENT_STATUS.FAILED]: "Thất bại",
  [PAYMENT_STATUS.REFUNDED]: "Đã hoàn tiền",
  [PAYMENT_STATUS.CANCELLED]: "Đã hủy",
};

export const PAYMENT_STATUS_COLORS = {
  [PAYMENT_STATUS.PENDING]: "warning",
  [PAYMENT_STATUS.PROCESSING]: "processing",
  [PAYMENT_STATUS.PAID]: "success",
  [PAYMENT_STATUS.FAILED]: "error",
  [PAYMENT_STATUS.REFUNDED]: "default",
  [PAYMENT_STATUS.CANCELLED]: "error",
};

// Payment Methods
export const PAYMENT_METHODS = {
  COD: "cod",
  VNPAY: "vnpay",
  BANK_TRANSFER: "bank_transfer",
};

export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHODS.COD]: "Thanh toán khi nhận hàng (COD)",
  [PAYMENT_METHODS.VNPAY]: "Thanh toán online qua VNPay",
  [PAYMENT_METHODS.BANK_TRANSFER]: "Chuyển khoản ngân hàng",
};

export const PAYMENT_METHOD_DESCRIPTIONS = {
  [PAYMENT_METHODS.COD]: "Thanh toán bằng tiền mặt khi nhận hàng",
  [PAYMENT_METHODS.VNPAY]: "Thanh toán trực tuyến qua VNPay với thẻ nội địa/QR",
  [PAYMENT_METHODS.BANK_TRANSFER]: "Chuyển khoản qua ngân hàng",
};

// Shipping Methods
export const SHIPPING_METHODS = {
  STANDARD: "standard",
  EXPRESS: "express",
  SAME_DAY: "same_day",
};

export const SHIPPING_METHOD_LABELS = {
  [SHIPPING_METHODS.STANDARD]: "Giao hàng tiêu chuẩn",
  [SHIPPING_METHODS.EXPRESS]: "Giao hàng nhanh",
  [SHIPPING_METHODS.SAME_DAY]: "Giao hàng trong ngày",
};

export const SHIPPING_METHOD_DESCRIPTIONS = {
  [SHIPPING_METHODS.STANDARD]: "3-5 ngày làm việc",
  [SHIPPING_METHODS.EXPRESS]: "1-2 ngày làm việc",
  [SHIPPING_METHODS.SAME_DAY]: "Trong ngày (nội thành)",
};

export const SHIPPING_METHOD_FEES = {
  [SHIPPING_METHODS.STANDARD]: 30000,
  [SHIPPING_METHODS.EXPRESS]: 50000,
  [SHIPPING_METHODS.SAME_DAY]: 80000,
};

// Order cancellation reasons
export const CANCELLATION_REASONS = [
  "Tôi muốn thay đổi địa chỉ giao hàng",
  "Tôi muốn thay đổi sản phẩm",
  "Tôi tìm được giá tốt hơn",
  "Tôi không còn nhu cầu",
  "Đặt nhầm sản phẩm",
  "Thời gian giao hàng quá lâu",
  "Lý do khác",
];

// Product sort options
export const PRODUCT_SORT_OPTIONS = [
  { value: "newest", label: "Mới nhất" },
  { value: "price_asc", label: "Giá thấp đến cao" },
  { value: "price_desc", label: "Giá cao đến thấp" },
  { value: "best_selling", label: "Bán chạy nhất" },
  { value: "rating", label: "Đánh giá cao nhất" },
];

// Price ranges for filters
export const PRICE_RANGES = [
  { value: "0-5000000", label: "Dưới 5 triệu" },
  { value: "5000000-10000000", label: "5 - 10 triệu" },
  { value: "10000000-20000000", label: "10 - 20 triệu" },
  { value: "20000000-30000000", label: "20 - 30 triệu" },
  { value: "30000000-50000000", label: "30 - 50 triệu" },
  { value: "50000000-999999999", label: "Trên 50 triệu" },
];

// Pagination
export const DEFAULT_PAGE_SIZE = 12;
export const PAGE_SIZE_OPTIONS = [12, 24, 36, 48];
