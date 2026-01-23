import React, { useState, useMemo } from 'react';
import { Tag } from 'antd';
import { CloudOutlined, LaptopOutlined, CodeOutlined, SettingOutlined } from '@ant-design/icons';
import { useRuntimeConfig } from '../../hooks/useRuntimeConfig';
import { DevModeConfigSwitcher } from './DevModeConfigSwitcher';

interface DeploymentModeBadgeProps {
  compact?: boolean;
}

/**
 * Deployment Mode Badge Component
 * Displays current deployment mode: Edge (本地模式) / Cloud (云端模式) / Development (开发模式)
 */
export const DeploymentModeBadge: React.FC<DeploymentModeBadgeProps> = React.memo(({ compact = false }) => {
  const { deploymentMode, isLoading } = useRuntimeConfig();
  const [showConfigModal, setShowConfigModal] = useState(false);

  // useMemo 必须在所有条件语句之前调用
  const getModeConfig = useMemo(() => {
    switch (deploymentMode) {
      case 'edge':
        return {
          icon: <LaptopOutlined />,
          text: '本地',
          fullText: '本地模式',
          color: '#52c41a', // Green
          bgColor: 'rgba(82, 196, 26, 0.1)',
          borderColor: 'rgba(82, 196, 26, 0.3)',
        };
      case 'cloud':
        return {
          icon: <CloudOutlined />,
          text: '云端',
          fullText: '云端模式',
          color: '#1890ff', // Blue
          bgColor: 'rgba(24, 144, 255, 0.1)',
          borderColor: 'rgba(24, 144, 255, 0.3)',
        };
      case 'hybrid':
      case 'development':
      default:
        return {
          icon: <CodeOutlined />,
          text: '开发',
          fullText: '开发模式',
          color: '#faad14', // Orange
          bgColor: 'rgba(250, 173, 20, 0.1)',
          borderColor: 'rgba(250, 173, 20, 0.3)',
        };
    }
  }, [deploymentMode]);

  const config = getModeConfig;
  
  // 在开发环境下，所有模式都允许配置切换
  // 在生产环境下，只有 hybrid/development 模式允许切换
  const isDevelopment = import.meta.env.DEV || 
                        deploymentMode === 'development' || 
                        deploymentMode === 'hybrid' ||
                        localStorage.getItem('dev_config_mode') !== null; // 如果设置了开发配置，说明在开发模式

  // 在加载完成之前不渲染
  if (isLoading) {
    return null;
  }

  return (
    <>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: compact ? 4 : 6,
          padding: compact ? '2px 8px' : '4px 12px',
          background: config.bgColor,
          border: `1px solid ${config.borderColor}`,
          borderRadius: compact ? 4 : 6,
          fontSize: compact ? 11 : 13,
          fontWeight: 500,
          color: config.color,
          transition: 'all 0.3s ease',
          cursor: isDevelopment ? 'pointer' : 'default',
          userSelect: 'none',
          flexShrink: 0,
        }}
        title={isDevelopment ? `当前运行在${config.fullText}，点击切换配置` : `当前运行在${config.fullText}`}
        onClick={isDevelopment ? () => setShowConfigModal(true) : undefined}
      >
        <span style={{ fontSize: compact ? 11 : 14, display: 'flex', alignItems: 'center' }}>
          {config.icon}
        </span>
        <span>{config.text}</span>
        {isDevelopment && (
          <SettingOutlined 
            style={{ 
              fontSize: compact ? 10 : 12, 
              marginLeft: 2,
              opacity: 0.7,
            }} 
          />
        )}
      </div>

      {isDevelopment && (
        <DevModeConfigSwitcher
          visible={showConfigModal}
          onClose={() => setShowConfigModal(false)}
        />
      )}
    </>
  );
});

DeploymentModeBadge.displayName = 'DeploymentModeBadge';

export default DeploymentModeBadge;
