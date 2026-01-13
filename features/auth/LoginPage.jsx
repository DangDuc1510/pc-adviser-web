"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Form,
  Input,
  Button,
  Divider,
  message,
  Card,
  Typography,
  Checkbox,
} from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

const { Title, Text } = Typography;

export default function LoginPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const { login } = useAuth();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();
      const result = await login({
        emailOrUsername: values.emailOrUsername,
        password: values.password,
      });

      messageApi.success("Đăng nhập thành công!");

      // Check for redirect URL
      const redirectUrl =
        typeof window !== "undefined"
          ? localStorage.getItem("redirectAfterLogin")
          : null;

      if (redirectUrl) {
        localStorage.removeItem("redirectAfterLogin");
        router.push(redirectUrl);
      } else {
        router.push("/");
      }
    } catch (error) {
      if (error.errorFields) {
        // Validation error
        return;
      }
      messageApi.error(error?.response?.data?.message||"Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

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
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <Link href="/">
              <Title level={2} style={{ margin: "0 0 8px 0", fontWeight: 700 }}>
                PC Adviser
              </Title>
            </Link>
            <Text type="secondary">Đăng nhập để tiếp tục</Text>
          </div>
          <Form
            form={form}
            name="login"
            layout="vertical"
            size="large"
            onFinish={handleLogin}
            className="!space-y-4 !mt-6 w-full"
          >
            <Form.Item
              name="emailOrUsername"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập email hoặc tên đăng nhập!",
                },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Email hoặc tên đăng nhập"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập mật khẩu!",
                },
                {
                  min: 6,
                  message: "Mật khẩu phải có ít nhất 6 ký tự!",
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Mật khẩu"
              />
            </Form.Item>

            <Form.Item>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>Ghi nhớ đăng nhập</Checkbox>
                </Form.Item>
                <Link href="/quen-mat-khau">
                  <Text type="secondary">Quên mật khẩu?</Text>
                </Link>
              </div>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                className="btn-elegant"
                style={{ height: 48, fontSize: 16, fontWeight: 500 }}
              >
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: "center", marginTop: 24 }}>
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

