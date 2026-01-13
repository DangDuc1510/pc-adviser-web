import { Typography, Row, Col } from "antd";
import {
  RocketOutlined,
  SafetyOutlined,
  CustomerServiceOutlined,
} from "@ant-design/icons";

const { Title, Paragraph } = Typography;

export default function WhyChooseUsSection() {
  return (
    <div style={{ padding: "64px 24px", background: "#FFFFFF" }}>
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <Title level={2}>Tại sao chọn chúng tôi?</Title>
        </div>
        <Row gutter={[48, 48]}>
          <Col xs={24} md={8}>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "#F5F5F5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 24px",
                }}
              >
                <RocketOutlined style={{ fontSize: 40 }} />
              </div>
              <Title level={4}>Giao hàng nhanh chóng</Title>
              <Paragraph type="secondary">
                Giao hàng toàn quốc, nhanh chóng trong 1-3 ngày
              </Paragraph>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "#F5F5F5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 24px",
                }}
              >
                <SafetyOutlined style={{ fontSize: 40 }} />
              </div>
              <Title level={4}>Bảo hành chính hãng</Title>
              <Paragraph type="secondary">
                100% sản phẩm chính hãng với bảo hành đầy đủ
              </Paragraph>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "#F5F5F5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 24px",
                }}
              >
                <CustomerServiceOutlined style={{ fontSize: 40 }} />
              </div>
              <Title level={4}>Hỗ trợ 24/7</Title>
              <Paragraph type="secondary">
                Đội ngũ tư vấn chuyên nghiệp sẵn sàng hỗ trợ
              </Paragraph>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
}


