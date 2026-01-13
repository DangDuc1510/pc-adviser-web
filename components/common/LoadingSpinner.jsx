'use client';

import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';

const LoadingSpinner = ({ size = 'default', tip, fullScreen = false }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const antIcon = <LoadingOutlined style={{ fontSize: size === 'large' ? 48 : size === 'small' ? 16 : 24 }} spin />;

  if (fullScreen) {
    // For fullscreen, use nest pattern to support tip
    // Prevent hydration mismatch by only rendering on client
    if (!mounted) {
      return null;
    }

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255, 255, 255, 0.9)',
        zIndex: 9999,
        minWidth: '500px',
      }}>
        {tip ? (
          <Spin indicator={antIcon} size={size} tip={tip}>
            <div style={{ minHeight: '200px', width: '100%', minWidth: '300px' }} />
          </Spin>
        ) : (
          <Spin indicator={antIcon} size={size} />
        )}
      </div>
    );
  }

  // For non-fullscreen, wrap Spin in a container to support tip (nest pattern)
  if (tip) {
    return (
      <div style={{
        padding: '48px 0',
        width: '100%',
      }}>
        <Spin indicator={antIcon} size={size} tip={tip}>
          <div style={{ minHeight: '100px' }} />
        </Spin>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 0',
      width: '100%',
    }}>
      <Spin indicator={antIcon} size={size} />
    </div>
  );
};

export default LoadingSpinner;

