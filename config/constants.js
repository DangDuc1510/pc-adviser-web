export const ACCESS_TOKEN = "access_token";
export const REFRESH_TOKEN = "refresh_token";
export const USER_INFO = "user_info";
export const CART_ID = "cart_id";
export const CART_SESSION_ID = "cart_session_id";
export const SESSION_ID = "session_id";

// User roles
export const USER_ROLES = {
  CUSTOMER: "customer",
  ADMIN: "admin",
  EMPLOYEE: "employee",
};

// Image placeholders
export const PLACEHOLDER_IMAGE = "/images/placeholder.png";
export const PLACEHOLDER_AVATAR = "/images/avatar-placeholder.png";

// API endpoints base
export const API_ENDPOINTS = {
  AUTH: "/user",
  PRODUCTS: "/products",
  CART: "/cart",
  ORDERS: "/orders",
  PAYMENT: "/payment",
};

// Friendly labels for product specifications keys
export const SPEC_LABELS = {
  // Common
  model: "Model",
  partNumber: "Mã sản phẩm",
  warranty: "Bảo hành",
  productType: "Loại sản phẩm",
  weight: "Trọng lượng",
  dimensions: "Kích thước",
  useCases: "Mục đích sử dụng",

  // CPU
  socket: "Socket",
  cores: "Số nhân",
  threads: "Số luồng",
  baseClock: "Xung cơ bản",
  boostClock: "Xung tối đa",
  cache: "Bộ nhớ đệm",
  tdp: "TDP",
  cpuBrand: "Hãng CPU",
  series: "Dòng",
  generation: "Thế hệ",
  processingSpeed: "Tốc độ xử lý",
  maxTemperature: "Nhiệt độ tối đa",
  ramSupport: "Hỗ trợ RAM",
  integratedGraphics: "GPU tích hợp",
  pciePorts: "Số lane PCIe",
  pcieVersion: "Chuẩn PCIe",

  // VGA
  chipset: "Chipset",
  chipsetManufacturer: "Hãng GPU",
  graphicsChipSeries: "Dòng GPU",
  gpuSeries: "Series",
  memory: "Bộ nhớ",
  memoryInterface: "Bus bộ nhớ",
  coreClock: "Core Clock",
  memoryClock: "Memory Clock",
  gpuClock: "GPU Clock",
  cudaCores: "Nhân xử lý",
  maxResolution: "Độ phân giải tối đa",
  outputs: "Cổng xuất hình",
  cooling: "Tản nhiệt",
  powerConnectors: "Nguồn cấp",
  recommendedPSU: "PSU khuyến nghị",

  // RAM
  ramSticks: "Số thanh RAM",
  capacity: "Dung lượng mỗi thanh",
  capacityTotal: "Tổng dung lượng",
  generation: "Thế hệ RAM",
  busSpeed: "Bus RAM",
  timing: "Timing",
  voltage: "Điện áp",
  formFactor: "Chuẩn RAM",

  // Storage
  storageType: "Loại lưu trữ",
  interface: "Giao tiếp",
  formFactorStorage: "Chuẩn kích thước",
  nandType: "Loại NAND",
  readSpeed: "Tốc độ đọc",
  writeSpeed: "Tốc độ ghi",

  // PSU
  psuSeries: "Series PSU",
  wattage: "Công suất",
  efficiency: "Chứng nhận hiệu suất",
  modular: "Kiểu dây nguồn",
  cables: "Dây nguồn đi kèm",
  coolingFan: "Quạt làm mát",
  inputVoltage: "Điện áp vào",

  // Mainboard
  mbSeries: "Series main",
  chipsetMB: "Chipset",
  socketMB: "Socket",
  formFactorMB: "Form factor",
  supportedCPU: "CPU hỗ trợ",
  memorySlots: "Số khe RAM",
  ramType: "Loại RAM",
  maxMemory: "RAM tối đa",
  ramBusSupport: "Bus RAM hỗ trợ",
  storageConnectors: "Cổng lưu trữ",
  m2Type: "Loại M.2",
  expansionSlots: "Khe mở rộng",
  videoOutputs: "Cổng xuất hình",
  usbPorts: "Cổng USB",
  lan: "LAN",
  wireless: "Kết nối không dây",
  audio: "Âm thanh",

  // Case
  caseName: "Tên case",
  caseType: "Loại case",
  material: "Chất liệu",
  sidePanelMaterial: "Mặt hông",
  supportedMainboard: "Mainboard hỗ trợ",
  maxGPULength: "Chiều dài GPU tối đa",
  maxCPUCoolerHeight: "Chiều cao tản CPU tối đa",
  maxRadiatorSize: "Radiator tối đa",
  driveBays: "Khay ổ cứng",
  frontPorts: "Cổng phía trước",
  topFanSupport: "Hỗ trợ quạt phía trên",
  rearFanSupport: "Hỗ trợ quạt phía sau",
  bottomFanSupport: "Hỗ trợ quạt phía dưới",
  pciSlots: "Số khe PCIe",

  // Cooling
  coolingType: "Loại tản nhiệt",
  socketCompatibility: "Socket hỗ trợ",
  fanSize: "Kích thước/quạt",
  coolingMaterial: "Chất liệu tản",
  radiatorSize: "Kích thước radiator",
  height: "Chiều cao",
  pumpRPM: "Tốc độ bơm",
  fanRPM: "Tốc độ quạt",
  airflowCFM: "Lưu lượng gió",
  noiseLevel: "Độ ồn",
  hasLED: "Đèn LED",
  ledType: "Loại LED",

  // Monitor
  screenSize: "Kích thước màn hình",
  resolution: "Độ phân giải",
  panelType: "Loại tấm nền",
  refreshRate: "Tần số quét",
  responseTime: "Thời gian phản hồi",
  brightness: "Độ sáng",
  contrast: "Độ tương phản",
  colorGamut: "Dải màu",
  features: "Tính năng",
};
