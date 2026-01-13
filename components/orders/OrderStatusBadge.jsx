'use client';

import { Tag } from 'antd';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/config/orderConstants';

const OrderStatusBadge = ({ status, style = {} }) => {
  const label = ORDER_STATUS_LABELS[status] || status;
  const color = ORDER_STATUS_COLORS[status] || 'default';

  return (
    <Tag color={color} style={{ ...style }}>
      {label}
    </Tag>
  );
};

export default OrderStatusBadge;

