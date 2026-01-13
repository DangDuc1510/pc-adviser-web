"use client";

import { Button, Space, Dropdown } from "antd";
import { ReloadOutlined, DownloadOutlined } from "@ant-design/icons";

const ConfigManager = ({
  configs,
  activeConfigId,
  onConfigChange,
  onReset,
  onLoadConfig,
}) => {
  const handleConfigClick = (configId) => {
    if (onConfigChange) {
      onConfigChange(configId);
    }
  };

  const handleLoadConfig = (configId) => {
    if (onLoadConfig) {
      onLoadConfig(configId);
    }
  };

  const loadConfigMenuItems = configs.map((config) => ({
    key: config.id,
    label: config.name,
    onClick: () => handleLoadConfig(config.id),
  }));

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
        flexWrap: "wrap",
        gap: 16,
      }}
    >
      {/* Config Buttons */}
      <Space wrap>
        {configs.map((config) => (
          <Button
            key={config.id}
            type={activeConfigId === config.id ? "primary" : "default"}
            onClick={() => handleConfigClick(config.id)}
            style={{
              minWidth: 120,
              fontWeight: activeConfigId === config.id ? 600 : 400,
            }}
          >
            {config.name}
          </Button>
        ))}
      </Space>

      {/* Action Buttons */}
      <Space>
        <Button type="primary" icon={<ReloadOutlined />} onClick={onReset}>
          Tạo lại
        </Button>
        <Dropdown menu={{ items: loadConfigMenuItems }} placement="bottomRight">
          <Button
            icon={<DownloadOutlined />}
            style={{ background: "#FFFFFF", border: "1px solid #D9D9D9" }}
          >
            Tải cấu hình
          </Button>
        </Dropdown>
      </Space>
    </div>
  );
};

export default ConfigManager;
