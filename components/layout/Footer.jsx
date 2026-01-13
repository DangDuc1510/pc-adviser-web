'use client';

import { Layout, Row, Col, Typography, Space } from 'antd';
import {
  FacebookOutlined,
  TwitterOutlined,
  InstagramOutlined,
  YoutubeOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import Link from 'next/link';

const { Footer: AntFooter } = Layout;
const { Title, Text, Paragraph } = Typography;

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <AntFooter
      style={{
        background: '#000000',
        color: '#FFFFFF',
        padding: '48px 24px 24px',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Row gutter={[32, 32]}>
          {/* About */}
          <Col xs={24} sm={12} md={6}>
            <Title level={4} style={{ color: '#FFFFFF', marginBottom: 16 }}>
              PC Adviser
            </Title>
            <Paragraph style={{ color: '#CCCCCC', marginBottom: 16 }}>
              Nền tảng tư vấn và mua sắm linh kiện PC chuyên nghiệp, giúp bạn xây dựng cấu hình PC tối ưu.
            </Paragraph>
            <Space size="large">
              <a href="#" style={{ color: '#FFFFFF', fontSize: 20 }}>
                <FacebookOutlined />
              </a>
              <a href="#" style={{ color: '#FFFFFF', fontSize: 20 }}>
                <TwitterOutlined />
              </a>
              <a href="#" style={{ color: '#FFFFFF', fontSize: 20 }}>
                <InstagramOutlined />
              </a>
              <a href="#" style={{ color: '#FFFFFF', fontSize: 20 }}>
                <YoutubeOutlined />
              </a>
            </Space>
          </Col>

          {/* Quick Links */}
          <Col xs={24} sm={12} md={6}>
            <Title level={5} style={{ color: '#FFFFFF', marginBottom: 16 }}>
              Liên kết nhanh
            </Title>
            <Space direction="vertical" size="small">
              <Link href="/san-pham" style={{ color: '#CCCCCC' }}>
                Sản phẩm
              </Link>
              <Link href="/danh-muc/cpu" style={{ color: '#CCCCCC' }}>
                Danh mục
              </Link>
              <Link href="/don-hang" style={{ color: '#CCCCCC' }}>
                Đơn hàng
              </Link>
              <Link href="/ca-nhan" style={{ color: '#CCCCCC' }}>
                Tài khoản
              </Link>
            </Space>
          </Col>

          {/* Customer Service */}
          <Col xs={24} sm={12} md={6}>
            <Title level={5} style={{ color: '#FFFFFF', marginBottom: 16 }}>
              Hỗ trợ khách hàng
            </Title>
            <Space direction="vertical" size="small">
              <a href="#" style={{ color: '#CCCCCC' }}>
                Chính sách bảo hành
              </a>
              <a href="#" style={{ color: '#CCCCCC' }}>
                Chính sách đổi trả
              </a>
              <a href="#" style={{ color: '#CCCCCC' }}>
                Hướng dẫn mua hàng
              </a>
              <a href="#" style={{ color: '#CCCCCC' }}>
                Câu hỏi thường gặp
              </a>
            </Space>
          </Col>

          {/* Contact */}
          <Col xs={24} sm={12} md={6}>
            <Title level={5} style={{ color: '#FFFFFF', marginBottom: 16 }}>
              Liên hệ
            </Title>
            <Space direction="vertical" size="small" style={{ color: '#CCCCCC' }}>
              <Space>
                <EnvironmentOutlined />
                <Text style={{ color: '#CCCCCC' }}>
                  Hà Nội, Việt Nam
                </Text>
              </Space>
              <Space>
                <PhoneOutlined />
                <Text style={{ color: '#CCCCCC' }}>
                  (84) 123-456-789
                </Text>
              </Space>
              <Space>
                <MailOutlined />
                <Text style={{ color: '#CCCCCC' }}>
                  support@pcadviser.com
                </Text>
              </Space>
            </Space>
          </Col>
        </Row>

        {/* Copyright */}
        <div
          style={{
            borderTop: '1px solid #333333',
            marginTop: 32,
            paddingTop: 24,
            textAlign: 'center',
          }}
        >
          <Text style={{ color: '#999999' }}>
            © {currentYear} PC Adviser. All rights reserved.
          </Text>
        </div>
      </div>
    </AntFooter>
  );
};

export default Footer;

