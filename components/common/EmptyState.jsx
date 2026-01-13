'use client';

import { Empty, Button } from 'antd';
import { InboxOutlined } from '@ant-design/icons';

const EmptyState = ({ 
  title = 'Không có dữ liệu',
  description,
  icon,
  action,
  actionText,
  onAction,
  style = {},
}) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '64px 24px',
      ...style,
    }}>
      <Empty
        image={icon || <InboxOutlined style={{ fontSize: 64, color: '#999' }} />}
        styles={{
          image: {
            height: 80,
          },
        }}
        description={
          <div>
            <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8, color: '#000' }}>
              {title}
            </div>
            {description && (
              <div style={{ fontSize: 14, color: '#666' }}>
                {description}
              </div>
            )}
          </div>
        }
      >
        {action || (actionText && onAction) ? (
          action || (
            <Button type="primary" onClick={onAction}>
              {actionText}
            </Button>
          )
        ) : null}
      </Empty>
    </div>
  );
};

export default EmptyState;

