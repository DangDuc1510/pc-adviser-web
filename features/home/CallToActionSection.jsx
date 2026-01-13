import { Typography, Button } from "antd";
import { useRouter } from "next/navigation";

const { Title, Paragraph } = Typography;

export default function CallToActionSection() {
  const router = useRouter();

  return (
    <div
      style={{
        padding: "80px 24px",
        background: "#F5F5F5",
        color: "#000000",
        textAlign: "center",
      }}
    >
      <div className="container">
        <Title level={2} style={{ color: "#000000", marginBottom: 16 }}>
          Sẵn sàng xây dựng PC của bạn?
        </Title>
        <Paragraph
          style={{ fontSize: 18, color: "#000000", marginBottom: 32 }}
        >
          Bắt đầu mua sắm ngay hôm nay và nhận ưu đãi đặc biệt
        </Paragraph>
        <Button
          type="primary"
          size="large"
          onClick={() => router.push("/san-pham")}
          style={{
            height: 56,
            padding: "0 48px",
            fontSize: 18,
            fontWeight: 600,
            background: "#000000",
            color: "#FFFFFF",
            border: "none",
          }}
        >
          Mua sắm ngay
        </Button>
      </div>
    </div>
  );
}


