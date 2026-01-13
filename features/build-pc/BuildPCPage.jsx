"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Card,
  Typography,
  Space,
  Button,
  Spin,
  Modal,
  Input,
  message,
} from "antd";
import { ShoppingCartOutlined, SaveOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useBuildPC } from "@/hooks/useBuildPC";
import ComponentSelector from "@/components/build-pc/ComponentSelector";
import ProductSelectModal from "@/components/build-pc/ProductSelectModal";
import { formatPrice } from "@/utils/format";
import { useCart } from "@/hooks/useCart";

const { Title, Text } = Typography;

const BuildPCPage = ({ configId }) => {
  const router = useRouter();
  const {
    COMPONENT_TYPES,
    loadingCategories,
    currentConfig,
    totalPrice,
    addComponent,
    removeComponent,
    updateQuantity,
    saveConfigWithName,
    loadSavedConfig,
    updateSavedConfig,
    rootCategories,
    transformConfigToProducts,
  } = useBuildPC();

  const { addItem } = useCart();
  const [messageApi, contextHolder] = message.useMessage();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedComponentType, setSelectedComponentType] = useState(null);
  const [editingComponentType, setEditingComponentType] = useState(null);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [configName, setConfigName] = useState("");
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [currentConfigId, setCurrentConfigId] = useState(configId);

  // Load config when configId is provided
  useEffect(() => {
    if (
      configId &&
      COMPONENT_TYPES &&
      Object.keys(COMPONENT_TYPES).length > 0
    ) {
      setLoadingConfig(true);
      loadSavedConfig(configId)
        .then((config) => {
          if (config) {
            setCurrentConfigId(config._id || config.id);
            setConfigName(config.name || "");
            messageApi.success("Đã tải cấu hình thành công!");
          } else {
            messageApi.error("Không tìm thấy cấu hình");
            router.push("/build-pc");
          }
        })
        .catch((error) => {
          console.error("Error loading config:", error);
          messageApi.error("Có lỗi xảy ra khi tải cấu hình");
          router.push("/build-pc");
        })
        .finally(() => {
          setLoadingConfig(false);
        });
    }
  }, [configId, COMPONENT_TYPES, loadSavedConfig, router, messageApi]);

  // Handle select component button click
  const handleSelectComponent = useCallback((componentType) => {
    setSelectedComponentType(componentType);
    setEditingComponentType(null);
    setModalOpen(true);
  }, []);

  // Handle edit component button click
  const handleEditComponent = useCallback((componentType) => {
    setSelectedComponentType(componentType);
    setEditingComponentType(componentType);
    setModalOpen(true);
  }, []);

  // Handle product selection from modal
  const handleProductSelect = useCallback(
    (product) => {
      if (selectedComponentType) {
        addComponent(selectedComponentType.key, product, 1);
      }
      setModalOpen(false);
      setSelectedComponentType(null);
      setEditingComponentType(null);
    },
    [selectedComponentType, addComponent]
  );

  // Handle remove component
  const handleRemoveComponent = useCallback(
    (componentType) => {
      removeComponent(componentType.key);
    },
    [removeComponent]
  );

  // Handle quantity change
  const handleQuantityChange = useCallback(
    (componentType, quantity) => {
      updateQuantity(componentType.key, quantity);
    },
    [updateQuantity]
  );

  // Handle add all to cart
  const handleAddAllToCart = useCallback(async () => {
    const components = Object.values(currentConfig).filter(Boolean);
    if (components.length === 0) {
      return;
    }

    try {
      for (const component of components) {
        await addItem({
          productId: component._id,
          quantity: component.quantity || 1,
        });
      }
    } catch (error) {
      console.error("Failed to add items to cart:", error);
    }
  }, [currentConfig, addItem]);

  // Handle save config
  const handleSaveConfig = useCallback(() => {
    const components = Object.values(currentConfig).filter(Boolean);
    if (components.length === 0) {
      messageApi.warning("Vui lòng chọn ít nhất một linh kiện để lưu cấu hình");
      return;
    }
    setSaveModalOpen(true);
  }, [currentConfig]);

  // Handle confirm save
  const handleConfirmSave = useCallback(async () => {
    if (!configName.trim()) {
      messageApi.warning("Vui lòng nhập tên cấu hình");
      return;
    }

    try {
      if (currentConfigId) {
        // Update existing config - update both name and products
        const products = transformConfigToProducts(
          currentConfig,
          rootCategories
        );
        await updateSavedConfig(currentConfigId, {
          name: configName.trim(),
          products,
        });
        messageApi.success("Cập nhật cấu hình thành công!");
      } else {
        // Create new config
        await saveConfigWithName(configName.trim());
        messageApi.success("Lưu cấu hình thành công!");
      }
      setSaveModalOpen(false);
    } catch (error) {
      console.error("Error saving config:", error);
      messageApi.error("Có lỗi xảy ra khi lưu cấu hình");
    }
  }, [
    configName,
    currentConfigId,
    currentConfig,
    rootCategories,
    transformConfigToProducts,
    saveConfigWithName,
    updateSavedConfig,
    messageApi,
  ]);

  // Get selected product ID for modal
  const selectedProductId = editingComponentType
    ? currentConfig[editingComponentType.key]?._id
    : null;

  return (
    <div
      className="container"
      style={{ padding: "32px 0", minHeight: "calc(100vh - 200px)" }}
    >
      {contextHolder}
      {/* Header */}
      <div
        style={{
          marginBottom: 32,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <Title level={2} style={{ marginBottom: 8 }}>
            {currentConfigId ? "Chỉnh sửa cấu hình" : "Build PC"}
          </Title>
          <Text type="secondary">
            {currentConfigId
              ? "Chỉnh sửa các linh kiện trong cấu hình của bạn"
              : "Chọn các linh kiện để tạo cấu hình máy tính của bạn"}
          </Text>
        </div>
        <Button
          type="link"
          onClick={() => router.push("/cau-hinh-cua-toi")}
          style={{ fontSize: 16 }}
        >
          Xem cấu hình của tôi
        </Button>
      </div>

      {/* Components List */}
      <div
      // className="grid grid-cols-1 md:grid-cols-2"
      >
        <Card
          style={{
            marginBottom: 24,
            borderRadius: 12,
          }}
        >
          {loadingCategories || loadingConfig ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <Spin size="large" />
              <div style={{ marginTop: 16 }}>
                <Text type="secondary">
                  {loadingConfig
                    ? "Đang tải cấu hình..."
                    : "Đang tải danh mục..."}
                </Text>
              </div>
            </div>
          ) : Object.keys(COMPONENT_TYPES).length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <Text type="secondary">Không có danh mục nào</Text>
            </div>
          ) : (
            Object.values(COMPONENT_TYPES).map((componentType) => (
              <ComponentSelector
                key={componentType.key}
                componentType={componentType}
                component={currentConfig[componentType.key]}
                onSelect={handleSelectComponent}
                onEdit={handleEditComponent}
                onRemove={handleRemoveComponent}
                onQuantityChange={handleQuantityChange}
              />
            ))
          )}
        </Card>
        {/* <div>
          //// chỗ này sẽ gọi api gợi ý để người dùng add nhanh các linh kiện
          phù hợp //// api gợi ý sẽ trả về các linh kiện phù hợp với cấu hình
          hiện tại //// cấu hình hiện tại là các linh kiện đã chọn
        </div> */}
      </div>

      {/* Summary Card */}
      <Card
        style={{
          borderRadius: 12,
          position: "sticky",
          bottom: 0,
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <Text type="secondary" style={{ fontSize: 14 }}>
              Tổng giá:
            </Text>
            <Title
              level={3}
              style={{
                margin: "8px 0 0 0",
                color: "#ff4d4f",
                fontWeight: 600,
              }}
            >
              {formatPrice(totalPrice)}
            </Title>
          </div>
          <Space>
            <Button
              size="large"
              icon={<SaveOutlined />}
              onClick={handleSaveConfig}
              style={{
                height: 48,
                fontSize: 16,
                fontWeight: 600,
                minWidth: 150,
              }}
            >
              {currentConfigId ? "Cập nhật cấu hình" : "Lưu cấu hình"}
            </Button>
            <Button
              type="primary"
              size="large"
              icon={<ShoppingCartOutlined />}
              onClick={handleAddAllToCart}
              disabled={totalPrice === 0}
              style={{
                height: 48,
                fontSize: 16,
                fontWeight: 600,
                minWidth: 200,
              }}
            >
              Thêm tất cả vào giỏ
            </Button>
          </Space>
        </div>
      </Card>

      {/* Save Config Modal */}
      <Modal
        open={saveModalOpen}
        onCancel={() => {
          setSaveModalOpen(false);
          if (!currentConfigId) {
            setConfigName("");
          }
        }}
        onOk={handleConfirmSave}
        title={currentConfigId ? "Cập nhật cấu hình" : "Lưu cấu hình"}
        okText={currentConfigId ? "Cập nhật" : "Lưu"}
        cancelText="Hủy"
      >
        <div style={{ marginBottom: 16 }}>
          <Text>Tên cấu hình:</Text>
          <Input
            placeholder="Nhập tên cấu hình (ví dụ: PC Gaming 2024)"
            value={configName}
            onChange={(e) => setConfigName(e.target.value)}
            onPressEnter={handleConfirmSave}
            style={{ marginTop: 8 }}
          />
        </div>
        <div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {currentConfigId
              ? "Cấu hình sẽ được cập nhật với tên mới"
              : 'Cấu hình sẽ được lưu và bạn có thể xem lại trong trang "Cấu hình của tôi"'}
          </Text>
        </div>
      </Modal>

      {/* Product Select Modal */}
      <ProductSelectModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedComponentType(null);
          setEditingComponentType(null);
        }}
        componentType={selectedComponentType}
        onSelect={handleProductSelect}
        selectedProductId={selectedProductId}
      />
    </div>
  );
};

export default BuildPCPage;
