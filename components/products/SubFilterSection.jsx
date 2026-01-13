"use client";

import { useMemo } from "react";
import { Row, Col, Select, Slider, Typography, Form } from "antd";
import { formatPrice } from "@/utils/format";

const { Text } = Typography;

export default function SubFilterSection({
  form,
  filters = [],
  loading = false,
}) {
  if (!filters || filters.length === 0) {
    return null;
  }

  // Render filter input based on type
  const renderFilterInput = (filter) => {
    const { key, label, type, options, min, max, step } = filter;

    switch (type) {
      case "multi-select":
        return (
          <Form.Item name={key} noStyle>
            <Select
              mode="multiple"
              placeholder={label}
              style={{ width: "100%" }}
              loading={loading}
              maxTagCount="responsive"
              allowClear
              showSearch
              filterOption={(input, option) => {
                const text = option?.children || option?.label || "";
                return String(text).toLowerCase().includes(input.toLowerCase());
              }}
            >
              {options?.map((opt) => (
                <Select.Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        );

      case "range":
        const currentValue = Form.useWatch(key, form) || [min, max];
        return (
          <div style={{ padding: "0 8px" }}>
            <Text strong style={{ display: "block", marginBottom: 8 }}>
              {label}: {currentValue[0]} - {currentValue[1]}
            </Text>
            <Form.Item name={key} noStyle>
              <Slider
                range
                min={min}
                max={max}
                step={step || 1}
                value={currentValue}
              />
            </Form.Item>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ marginTop: 16 }}>
      <Text strong style={{ display: "block", marginBottom: 12 }}>
        Lọc theo thông số kỹ thuật:
      </Text>
      <Row gutter={[16, 16]}>
        {filters.map((filter) => (
          <Col
            xs={24}
            sm={12}
            md={filter.type === "range" ? 24 : 8}
            key={filter.key}
          >
            {renderFilterInput(filter)}
          </Col>
        ))}
      </Row>
    </div>
  );
}
