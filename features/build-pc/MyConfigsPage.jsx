"use client";

import { useState, useCallback } from "react";
import {
  Card,
  Typography,
  Space,
  Button,
  Row,
  Col,
  Empty,
  Popconfirm,
  Tag,
  Modal,
  Input,
  message,
  Image,
  Spin,
} from "antd";
import {
  DeleteOutlined,
  EyeOutlined,
  ShoppingCartOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useBuildPC } from "@/hooks/useBuildPC";
import { formatPrice } from "@/utils/format";
import { useCart } from "@/hooks/useCart";
import { useRouter } from "next/navigation";

const { Title, Text } = Typography;

const MyConfigsPage = () => {
  const router = useRouter();
  const {
    savedConfigs,
    deleteSavedConfig,
    updateSavedConfig,
    loadingConfigs,
    COMPONENT_TYPES,
  } = useBuildPC();
  const { addItem } = useCart();

  const [editingConfig, setEditingConfig] = useState(null);
  const [editName, setEditName] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Calculate total price for a config
  const calculateConfigPrice = useCallback((config) => {
    return Object.values(config.components || {}).reduce((total, component) => {
      if (!component) return total;
      const quantity = component.quantity || 1;
      const price =
        component.pricing?.isOnSale && component.pricing?.salePrice
          ? component.pricing.salePrice
          : component.pricing?.originalPrice || 0;
      return total + price * quantity;
    }, 0);
  }, []);
  // Handle confirm edit
  const handleConfirmEdit = useCallback(() => {
    if (!editName.trim()) {
      message.warning("Vui lòng nhập tên cấu hình");
      return;
    }
    if (editingConfig) {
      updateSavedConfig(editingConfig.id, { name: editName.trim() });
      message.success("Cập nhật tên cấu hình thành công!");
      setEditModalOpen(false);
      setEditingConfig(null);
      setEditName("");
    }
  }, [editName, editingConfig, updateSavedConfig]);

  // Handle delete config
  const handleDeleteConfig = useCallback(
    (configId) => {
      deleteSavedConfig(configId);
      message.success("Xóa cấu hình thành công!");
    },
    [deleteSavedConfig]
  );

  // Handle add all to cart
  const handleAddToCart = useCallback(
    async (config) => {
      const components = Object.values(config.components || {}).filter(Boolean);
      if (components.length === 0) {
        message.warning("Cấu hình này không có linh kiện nào");
        return;
      }

      try {
        for (const component of components) {
          await addItem({
            productId: component._id,
            quantity: component.quantity || 1,
          });
        }
        message.success("Đã thêm tất cả linh kiện vào giỏ hàng!");
      } catch (error) {
        console.error("Failed to add items to cart:", error);
        message.error("Có lỗi xảy ra khi thêm vào giỏ hàng");
      }
    },
    [addItem]
  );

  // Get component label
  const getComponentLabel = useCallback(
    (componentType) => {
      return COMPONENT_TYPES[componentType]?.label || componentType;
    },
    [COMPONENT_TYPES]
  );

  // Get component image
  const getComponentImage = useCallback((component) => {
    return (
      component?.images?.find((img) => img.isPrimary)?.url ||
      component?.images?.[0]?.url ||
      null
    );
  }, []);

  return (
    <div
      className="container"
      style={{ padding: "32px 0", minHeight: "calc(100vh - 200px)" }}
    >
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
            Cấu hình của tôi
          </Title>
          <Text type="secondary">Quản lý các cấu hình máy tính đã lưu</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => router.push("/build-pc")}
        >
          Tạo cấu hình mới
        </Button>
      </div>

      {/* Configs List */}
      {loadingConfigs ? (
        <Card>
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>
              <Text type="secondary">Đang tải danh sách cấu hình...</Text>
            </div>
          </div>
        </Card>
      ) : savedConfigs.length === 0 ? (
        <Card>
          <Empty
            description="Bạn chưa có cấu hình nào được lưu"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => router.push("/build-pc")}
            >
              Tạo cấu hình mới
            </Button>
          </Empty>
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {savedConfigs.map((config) => {
            const totalPrice = calculateConfigPrice(config);
            const components = Object.entries(config.components || {}).filter(
              ([_, component]) => component !== null
            );

            return (
              <Col xs={24} sm={12} lg={8} key={config.id}>
                <Card
                  hoverable
                  style={{
                    height: "100%",
                    borderRadius: 12,
                  }}
                  actions={[
                    <Button
                      type="text"
                      icon={<EyeOutlined />}
                      onClick={() => router.push(`/build-pc/${config.id}`)}
                    >
                      Xem/Chỉnh sửa
                    </Button>,
                    <Popconfirm
                      title="Xóa cấu hình"
                      description="Bạn có chắc chắn muốn xóa cấu hình này?"
                      onConfirm={() => handleDeleteConfig(config.id)}
                      okText="Xóa"
                      cancelText="Hủy"
                    >
                      <Button type="text" danger icon={<DeleteOutlined />}>
                        Xóa
                      </Button>
                    </Popconfirm>,
                  ]}
                >
                  <div style={{ marginBottom: 16 }}>
                    <Title level={4} style={{ marginBottom: 8 }}>
                      {config.name}
                    </Title>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {new Date(config.createdAt).toLocaleDateString("vi-VN")}
                    </Text>
                  </div>

                  {/* Components Preview */}
                  <div style={{ marginBottom: 16, minHeight: 200 }}>
                    {components.length === 0 ? (
                      <Text type="secondary">Chưa có linh kiện nào</Text>
                    ) : (
                      <Space
                        direction="vertical"
                        size="small"
                        style={{ width: "100%" }}
                      >
                        {components
                          .slice(0, 4)
                          .map(([componentType, component]) => (
                            <div
                              key={componentType}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                padding: 8,
                                background: "#FAFAFA",
                                borderRadius: 6,
                              }}
                            >
                              {getComponentImage(component) && (
                                <Image
                                  src={getComponentImage(component)}
                                  alt={component.name}
                                  width={40}
                                  height={40}
                                  style={{
                                    objectFit: "cover",
                                    borderRadius: 4,
                                  }}
                                  preview={false}
                                />
                              )}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <Text
                                  strong
                                  style={{
                                    fontSize: 12,
                                    display: "block",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {getComponentLabel(componentType)}
                                </Text>
                                <Text
                                  type="secondary"
                                  style={{
                                    fontSize: 11,
                                    display: "block",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {component.name}
                                </Text>
                              </div>
                              {component.quantity > 1 && (
                                <Tag>x{component.quantity}</Tag>
                              )}
                            </div>
                          ))}
                        {components.length > 4 && (
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            +{components.length - 4} linh kiện khác
                          </Text>
                        )}
                      </Space>
                    )}
                  </div>

                  {/* Total Price */}
                  <div
                    style={{
                      marginBottom: 16,
                      paddingTop: 16,
                      borderTop: "1px solid #F0F0F0",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Text strong>Tổng giá:</Text>
                      <Title
                        level={5}
                        style={{
                          margin: 0,
                          color: "#ff4d4f",
                          fontWeight: 600,
                        }}
                      >
                        {formatPrice(totalPrice)}
                      </Title>
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <Button
                    type="primary"
                    icon={<ShoppingCartOutlined />}
                    block
                    onClick={() => handleAddToCart(config)}
                    disabled={components.length === 0}
                  >
                    Thêm vào giỏ
                  </Button>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );
};

export default MyConfigsPage;
