"use client";

import { Result, Button } from "antd";
import { ReloadOutlined } from "@ant-design/icons";

export default function RecommendationError({ error, onRetry }) {
  const errorMessage =
    error?.response?.data?.message ||
    error?.message ||
    "Không thể tải gợi ý sản phẩm";

  return (
    <Result
      status="warning"
      title="Không thể tải gợi ý"
      subTitle={errorMessage}
      extra={
        onRetry && (
          <Button type="primary" icon={<ReloadOutlined />} onClick={onRetry}>
            Thử lại
          </Button>
        )
      }
    />
  );
}

