"use client";

import { useEffect, useState } from "react";
import {
  Card,
  Tabs,
  Form,
  Input,
  Button,
  Upload,
  Typography,
  Avatar,
  Divider,
  Select,
  Modal,
  App,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  CameraOutlined,
} from "@ant-design/icons";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { UserApi } from "@/apis/user";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import AddressInput from "@/components/common/AddressInput";
import { USER_INFO } from "@/config/constants";

const { Title, Text } = Typography;
const { Option } = Select;

function ProfilePageContent() {
  const { message: messageApi } = App.useApp();
  const { user, updateProfile, checkAuth } = useAuth();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        userName: user?.userName || "",
        email: user?.email || "",
        phone: user?.phone || "",
        gender: user?.gender || undefined,
        dateOfBirth: user?.dateOfBirth
          ? new Date(user.dateOfBirth).toISOString().split("T")[0]
          : undefined,
        address: user?.address || "",
      });
    }
  }, [user, form]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (values) => {
      const updateData = {
        userName: values.userName,
        phone: values.phone || undefined,
        gender: values.gender || undefined,
        dateOfBirth: values.dateOfBirth
          ? new Date(values.dateOfBirth)
          : undefined,
        address: values.address || undefined,
      };
      return await updateProfile(updateData);
    },
    onSuccess: (result) => {
      if (result) {
        messageApi.success("Cập nhật thông tin thành công!");
        queryClient.invalidateQueries({ queryKey: ["user"] });
      } else {
        messageApi.error(result?.message || "Cập nhật thất bại");
      }
    },
    onError: (error) => {
      console.error("Update profile error:", error);
      messageApi.error(
        error?.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại"
      );
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (values) => {
      return await UserApi.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
    },
    onSuccess: (response) => {
      if (response.success) {
        messageApi.success("Đổi mật khẩu thành công!");
        passwordForm.resetFields();
      } else {
        messageApi.error(response.message || "Đổi mật khẩu thất bại");
      }
    },
    onError: (error) => {
      messageApi.error(
        error?.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại"
      );
    },
  });

  // Upload avatar mutation
  const uploadAvatarMutation = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append("avatar", file);
      return await UserApi.uploadAvatar(formData);
    },
    onSuccess: async (response) => {
      // API returns { status: "success", data: { avatar, user } }
      if (response?.status === "success" || response?.success) {
        // Update localStorage with new user data if available
        if (response?.data?.user) {
          if (typeof window !== "undefined") {
            localStorage.setItem(USER_INFO, JSON.stringify(response.data.user));
          }
        }
        // Invalidate and refetch user data
        await queryClient.invalidateQueries({ queryKey: ["user"] });
        // Refetch user data to ensure UI is updated
        await checkAuth();
        messageApi.success("Cập nhật ảnh đại diện thành công!");
      } else {
        messageApi.error(response?.message || "Upload ảnh thất bại");
      }
    },
    onError: (error) => {
      messageApi.error(
        error?.response?.data?.message || "Upload ảnh thất bại"
      );
    },
  });

  const handleUpdateProfile = async (values) => {
    await updateProfileMutation.mutateAsync(values);
  };

  const handleChangePassword = async (values) => {
    await changePasswordMutation.mutateAsync(values);
  };

  const handleUploadAvatar = async (file) => {
    await uploadAvatarMutation.mutateAsync(file);
    return false; // Prevent default upload behavior
  };

  const handleUploadAvatarFromModal = async () => {
    if (!avatarFile) {
      messageApi.error("Vui lòng chọn ảnh avatar");
      return;
    }
    try {
      await uploadAvatarMutation.mutateAsync(avatarFile);
      // Only close modal after successful upload and data refresh
      setAvatarModalVisible(false);
      setAvatarFile(null);
    } catch (error) {
      // Error is already handled in onError callback
      console.error("Upload avatar error:", error);
    }
  };

  const tabItems = [
    {
      key: "profile",
      label: (
        <span>
          <UserOutlined /> Thông tin cá nhân
        </span>
      ),
      children: (
        <Card>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div
              style={{
                position: "relative",
                display: "inline-block",
                cursor: "pointer",
              }}
              onClick={() => setAvatarModalVisible(true)}
            >
              <Avatar
                size={120}
                src={user?.avatar}
                icon={<UserOutlined />}
                style={{ background: "#000" }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  background: "#000",
                  borderRadius: "50%",
                  width: 36,
                  height: 36,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFF",
                }}
              >
                <CameraOutlined />
              </div>
            </div>
            <Title level={4} style={{ marginTop: 16, marginBottom: 4 }}>
              {user?.userName || "Người dùng"}
            </Title>
            <Text type="secondary">{user?.email}</Text>
          </div>

          <Divider />

          <Form
            form={form}
            layout="vertical"
            className="!space-y-2 !mt-4 w-full"
            initialValues={{
              userName: user?.userName || "",
              email: user?.email || "",
              phone: user?.phone || "",
              address: user?.address || "",
            }}
            onFinish={handleUpdateProfile}
          >
            <Form.Item
              name="userName"
              label="Họ và tên"
              rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
            >
              <Input size="large" placeholder="Nhập họ và tên" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Vui lòng nhập email!" },
                { type: "email", message: "Email không hợp lệ!" },
              ]}
            >
              <Input size="large" placeholder="Nhập email" disabled />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Số điện thoại"
              rules={[
                {
                  pattern: /^[0-9]{10}$/,
                  message: "Số điện thoại không hợp lệ!",
                },
              ]}
            >
              <Input size="large" placeholder="Nhập số điện thoại" />
            </Form.Item>

            <Form.Item
              name="gender"
              label="Giới tính"
            >
              <Select size="large" placeholder="Chọn giới tính">
                <Option value="male">Nam</Option>
                <Option value="female">Nữ</Option>
                <Option value="other">Khác</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="dateOfBirth"
              label="Ngày sinh"
            >
              <Input
                type="date"
                size="large"
                placeholder="Chọn ngày sinh"
              />
            </Form.Item>

            <Form.Item name="address" label="Địa chỉ">
              <AddressInput
                placeholder="Nhập địa chỉ hoặc chọn từ bản đồ"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={updateProfileMutation.isPending}
                block
                className="!mt-4"
              >
                Cập nhật thông tin
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: "password",
      label: (
        <span>
          <LockOutlined /> Đổi mật khẩu
        </span>
      ),
      children: (
        <Card>
          <Title level={4}>Đổi mật khẩu</Title>
          <Text type="secondary" style={{ display: "block", marginBottom: 24 }}>
            Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác
          </Text>

          <Form
            form={passwordForm}
            layout="vertical"
            className="!space-y-2 !mt-4 w-full"
            onFinish={handleChangePassword}
          >
            <Form.Item
              name="currentPassword"
              label="Mật khẩu hiện tại"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập mật khẩu hiện tại!",
                },
              ]}
            >
              <Input.Password
                size="large"
                placeholder="Nhập mật khẩu hiện tại"
              />
            </Form.Item>

            <Form.Item
              name="newPassword"
              label="Mật khẩu mới"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu mới!" },
                { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
              ]}
            >
              <Input.Password size="large" placeholder="Nhập mật khẩu mới" />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Xác nhận mật khẩu mới"
              dependencies={["newPassword"]}
              rules={[
                { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value) {
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
                size="large"
                placeholder="Nhập lại mật khẩu mới"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={changePasswordMutation.isPending}
                block
                className="!mt-4"
              >
                Đổi mật khẩu
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
  ];

  return (
    <div style={{ background: "#F5F5F5", minHeight: "calc(100vh - 64px)" }}>
        <div className="container" style={{ padding: "32px 24px" }}>
          <Title level={2} style={{ marginBottom: 32 }}>
            Tài khoản của tôi
          </Title>

          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            tabPosition="left"
            style={{
              background: "#FFFFFF",
              borderRadius: 8,
              padding: 24,
            }}
          />

          {/* Avatar Upload Modal */}
          <Modal
            title="Đổi avatar"
            open={avatarModalVisible}
            onCancel={() => {
              setAvatarModalVisible(false);
              setAvatarFile(null);
            }}
            onOk={handleUploadAvatarFromModal}
            confirmLoading={uploadAvatarMutation.isPending}
            className=""
          >
            <div
              style={{
                width: "100%",
                
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Upload
                showUploadList={false}
                beforeUpload={(file) => {
                  setAvatarFile(file);
                  return false;
                }}
                accept="image/*"
              >
                <Button icon={<CameraOutlined />}>Chọn ảnh</Button>
              </Upload>
              {avatarFile && (
                <div style={{ marginTop: 16 }}>
                  <img
                    src={URL.createObjectURL(avatarFile)}
                    alt="Preview"
                    style={{
                      width: "100%",
                      maxHeight: 300,
                      objectFit: "contain",
                      borderRadius: 8,
                    }}
                  />
                </div>
              )}
            </div>
          </Modal>
        </div>
      </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfilePageContent />
    </ProtectedRoute>
  );
}

