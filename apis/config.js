// Use API Gateway as the main endpoint
const apiGateway =
  process.env.NEXT_PUBLIC_API_GATEWAY_URL || "http://localhost:3000";

const APIConfig = {
  base: apiGateway,
  auth: `${apiGateway}/auth`,
  user: `${apiGateway}/user`,
  products: `${apiGateway}/products`,
  categories: `${apiGateway}/categories`,
  brands: `${apiGateway}/brands`,
  cart: `${apiGateway}/cart`,
  orders: `${apiGateway}/orders`,
  payment: `${apiGateway}/payment`,
  shipping: `${apiGateway}/shipping`,
  customers: `${apiGateway}/customers`,
  behavior: `${apiGateway}/behavior`,
  promoCodes: `${apiGateway}/promo-codes`,
  search: `${apiGateway}/search`,
  recommendations: `${apiGateway}/recommendations`,
};

export default APIConfig;
