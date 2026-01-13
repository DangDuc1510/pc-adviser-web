"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Form, Input, Button, message, Result, Card, Typography } from "antd";
import {
  LockOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { AuthApi } from "@/apis/auth";

const { Title, Text } = Typography;

export default function ResetPasswordPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [resetSuccess, setResetSuccess] = useState(false);
  const [token, setToken] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (!tokenParam) {
      messageApi.error("Token không hợp lệ hoặc đã hết hạn!");
      setTimeout(() => {
        router.push("/quen-mat-khau");
      }, 2000);
    } else {
      setToken(tokenParam);
    }
  }, [searchParams, router, messageApi]);

  const handleResetPassword = async () => {
    try {
      await form.validateFields();
      setLoading(true);
      const values = form.getFieldsValue();

      if (values.password !== values.confirmPassword) {
        messageApi.error("Mật khẩu xác nhận không khớp!");
        return;
      }

      await AuthApi.resetPassword({
        resetToken: token,
        newPassword: values.password,
      });

      setResetSuccess(true);
      messageApi.success("Đặt lại mật khẩu thành công!");
    } catch (error) {
      if (error.response?.data?.message) {
        messageApi.error(error.response.data.message);
      } else if (error.errorFields) {
        messageApi.error("Vui lòng kiểm tra lại thông tin!");
      } else {
        messageApi.error("Đặt lại mật khẩu thất bại. Vui lòng thử lại!");
      }
    } finally {
      setLoading(false);
    }
  };

  if (resetSuccess) {
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
              icon={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
              title="Đặt lại mật khẩu thành công!"
              subTitle={
                <div style={{ color: "#666" }}>
                  <p>Mật khẩu của bạn đã được đặt lại thành công.</p>
                  <p style={{ marginTop: 8 }}>
                    Bạn có thể đăng nhập bằng mật khẩu mới ngay bây giờ.
                  </p>
                </div>
              }
              extra={[
                <Button
                  key="login"
                  type="primary"
                  onClick={() => router.push("/dang-nhap")}
                  style={{ borderRadius: 6 }}
                >
                  Đăng nhập ngay
                </Button>,
              ]}
            />
          </Card>
        </div>
      </>
    );
  }

  if (!token) {
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
              status="error"
              title="Token không hợp lệ"
              subTitle="Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu lại."
              extra={[
                <Button
                  key="forgot"
                  type="primary"
                  onClick={() => router.push("/quen-mat-khau")}
                  style={{ borderRadius: 6 }}
                >
                  Yêu cầu lại
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
            <Text type="secondary">Đặt lại mật khẩu</Text>
          </div>

          <Text
            type="secondary"
            style={{
              display: "block",
              textAlign: "center",
              marginBottom: 24,
            }}
          >
            Vui lòng nhập mật khẩu mới của bạn
          </Text>

          <Form
            form={form}
            name="resetPassword"
            layout="vertical"
            size="large"
            className="!space-y-4 !mt-4 w-full"
          >
            <Form.Item
              name="password"
              label="Mật khẩu mới"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập mật khẩu mới!",
                },
                {
                  min: 6,
                  message: "Mật khẩu phải có ít nhất 6 ký tự!",
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Nhập mật khẩu mới"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Xác nhận mật khẩu"
              dependencies={["password"]}
              rules={[
                {
                  required: true,
                  message: "Vui lòng xác nhận mật khẩu!",
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Mật khẩu xác nhận không khớp!")
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Nhập lại mật khẩu mới"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
              <Button
                type="primary"
                onClick={handleResetPassword}
                loading={loading}
                block
                className="btn-elegant"
                style={{ height: 48, fontSize: 16, fontWeight: 500 }}
              >
                {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
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
        </Card>
      </div>
    </>
  );
}
