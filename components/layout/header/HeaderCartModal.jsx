import { Modal, Button, Typography, Divider, Empty } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { formatPrice } from "@/utils/format";

const { Text, Title } = Typography;

export default function HeaderCartModal({
  open,
  onClose,
  onViewCart,
  cart,
  cartLoading,
}) {
  return (
    <Modal
      title="Sản phẩm đã thêm vào giỏ hàng"
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Tiếp tục mua sắm
        </Button>,
        <Button
          key="view"
          type="primary"
          onClick={onViewCart}
          disabled={!cart || !cart.items || cart.items.length === 0}
        >
          Xem giỏ hàng
        </Button>,
      ]}
      width={600}
      styles={{
        body: {
          maxHeight: "60vh",
          overflowY: "auto",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        },
      }}
      classNames={{
        body: "cart-modal-body",
      }}
    >
      <style jsx global>{`
        .cart-modal-body::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      {cartLoading ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Text type="secondary">Đang tải...</Text>
        </div>
      ) : !cart || !cart.items || cart.items.length === 0 ? (
        <Empty
          description="Giỏ hàng của bạn đang trống"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <div>
          <div style={{ marginBottom: 16 }}>
            {cart.items.map((item) => {
              const productImage = item.productImage || null;
              const productName = item.name || "Sản phẩm";
              const productSku = item.sku;

              return (
                <div
                  key={item._id || item.productId}
                  style={{
                    display: "flex",
                    gap: 12,
                    padding: "12px 0",
                    borderBottom: "1px solid #F0F0F0",
                  }}
                >
                  <div
                    style={{
                      width: 80,
                      height: 80,
                      flexShrink: 0,
                      borderRadius: 4,
                      overflow: "hidden",
                      background: "#FAFAFA",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {productImage ? (
                      <img
                        src={productImage}
                        alt={productName}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <ShoppingCartOutlined
                        style={{ fontSize: 24, color: "#D9D9D9" }}
                      />
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text
                      strong
                      style={{
                        fontSize: 14,
                        display: "block",
                        marginBottom: 4,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.name}
                    </Text>
                    {productSku && (
                      <Text
                        type="secondary"
                        style={{
                          fontSize: 12,
                          display: "block",
                          marginBottom: 4,
                        }}
                      >
                        SKU: {productSku}
                      </Text>
                    )}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginTop: 8,
                      }}
                    >
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Số lượng: <Text strong>{item.quantity}</Text>
                      </Text>
                      <div style={{ textAlign: "right" }}>
                        <Text
                          strong
                          style={{ fontSize: 16, color: "#000" }}
                        >
                          {formatPrice(item.price)}
                        </Text>
                        {item.discount > 0 && (
                          <div>
                            <Text
                              delete
                              type="secondary"
                              style={{ fontSize: 12 }}
                            >
                              {formatPrice(item.originalPrice)}
                            </Text>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Divider style={{ margin: "16px 0" }} />

          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <Text>Tạm tính:</Text>
              <Text>{formatPrice(cart.totals?.subtotal || 0)}</Text>
            </div>
            {cart.totals?.discount > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <Text>Giảm giá:</Text>
                <Text type="danger">
                  -{formatPrice(cart.totals.discount)}
                </Text>
              </div>
            )}
            {cart.totals?.shipping > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <Text>Phí vận chuyển:</Text>
                <Text>{formatPrice(cart.totals.shipping)}</Text>
              </div>
            )}
            {cart.totals?.tax > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <Text>Thuế:</Text>
                <Text>{formatPrice(cart.totals.tax)}</Text>
              </div>
            )}
            <Divider style={{ margin: "12px 0" }} />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text strong style={{ fontSize: 16 }}>
                Tổng cộng:
              </Text>
              <Title
                level={4}
                style={{
                  margin: 0,
                  color: "#FF4D4F",
                  fontSize: 20,
                  fontWeight: 700,
                }}
              >
                {formatPrice(cart.totals?.total || 0)}
              </Title>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}


