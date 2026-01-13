"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Form,
  Input,
  Button,
  message,
  Result,
  Card,
  Typography,
} from "antd";
import { MailOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import Link from "next/link";
import { AuthApi } from "@/apis/auth";

const { Title, Text } = Typography;

export default function ForgotPasswordPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [emailSent, setEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const router = useRouter();

  const handleForgotPassword = async () => {
    try {
      await form.validateFields();
      setLoading(true);
      const values = form.getFieldsValue();

      const response = await AuthApi.forgotPassword(values);
      setSentEmail(values.email);
      setEmailSent(true);
      messageApi.success("Email khôi phục mật khẩu đã được gửi!");
    } catch (error) {
      if (error.response?.data?.message) {
        messageApi.error(error.response.data.message);
      } else if (error.errorFields) {
        messageApi.error("Vui lòng kiểm tra lại thông tin!");
      } else {
        messageApi.error("Gửi email thất bại. Vui lòng thử lại!");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setLoading(true);
    try {
      const response = await AuthApi.forgotPassword({ email: sentEmail });
      messageApi.success("Email khôi phục mật khẩu đã được gửi lại!");
    } catch (error) {
      messageApi.error("Gửi lại email thất bại. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <>
        {contextHolder}
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#F5F5F5",
            padding: "24px",
          }}
        >
          <Card
            style={{
              width: "100%",
              maxWidth: 500,
              borderRadius: 8,
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.12)",
            }}
            styles={{ body: { padding: 40 } }}
          >
            <Result
              status="success"
              title="Email đã được gửi!"
              subTitle={
                <div style={{ color: "#666" }}>
                  <p>Chúng tôi đã gửi hướng dẫn khôi phục mật khẩu đến:</p>
                  <p style={{ fontWeight: 600, marginTop: 8, color: "#1890ff" }}>
                    {sentEmail}
                  </p>
                  <p style={{ marginTop: 8 }}>
                    Vui lòng kiểm tra hộp thư của bạn và làm theo hướng dẫn.
                  </p>
                </div>
              }
              extra={[
                <Button
                  key="resend"
                  onClick={handleResendEmail}
                  loading={loading}
                  style={{ borderRadius: 6 }}
                >
                  {loading ? "Đang gửi lại..." : "Gửi lại email"}
                </Button>,
                <Button
                  key="back"
                  type="primary"
                  onClick={() => router.push("/dang-nhap")}
                  style={{ borderRadius: 6 }}
                >
                  Về trang đăng nhập
                </Button>,
              ]}
            />
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      {contextHolder}
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F5F5F5",
          padding: "24px",
        }}
      >
        <Card
          style={{
            width: "100%",
            maxWidth: 450,
            borderRadius: 8,
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.12)",
          }}
          styles={{ body: { padding: 40 } }}
        >
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <Link href="/">
              <Title level={2} style={{ margin: "0 0 8px 0", fontWeight: 700 }}>
                PC Adviser
              </Title>
            </Link>
            <Text type="secondary">Quên mật khẩu</Text>
          </div>

          <Text
            type="secondary"
            style={{
              display: "block",
              textAlign: "center",
            
            }}
          >
            Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn khôi phục mật khẩu
          </Text>

          <Form
            form={form}
            name="forgotPassword"
            layout="vertical"
            size="large"
            className="!space-y-4 !mt-4 w-full"
          >
            <Form.Item
              name="email"
              label="Email"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập email!",
                },
                {
                  type: "email",
                  message: "Email không hợp lệ!",
                },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Nhập địa chỉ email của bạn"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
              <Button
                type="primary"
                onClick={handleForgotPassword}
                loading={loading}
                block
                className="btn-elegant"
                style={{ height: 48, fontSize: 16, fontWeight: 500 }}
              >
                {loading ? "Đang gửi..." : "Gửi email khôi phục"}
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: "center", marginTop: 24 }}>
            <Link
              href="/dang-nhap"
              style={{
                display: "inline-flex",
                alignItems: "center",
                color: "#000000",
              }}
            >
              <ArrowLeftOutlined style={{ marginRight: 8 }} />
              <Text strong>Quay lại đăng nhập</Text>
            </Link>
          </div>

          <div style={{ textAlign: "center", marginTop: 16 }}>
            <Text type="secondary">
              Chưa có tài khoản?{" "}
              <Link href="/dang-ky">
                <Text strong>Đăng ký ngay</Text>
              </Link>
            </Text>
          </div>
        </Card>
      </div>
    </>
  );
}

