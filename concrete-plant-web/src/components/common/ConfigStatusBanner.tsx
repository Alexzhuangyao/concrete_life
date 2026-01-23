import React from 'react';
import { Alert, Space, Tag, Tooltip } from 'antd';
import {
  DatabaseOutlined,
  CloudOutlined,
  ApiOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { useRuntimeConfig } from '../../hooks/useRuntimeConfig';

/**
 * 配置状态横幅
 * 显示当前运行时配置的关键信息
 */
export const ConfigStatusBanner: React.FC = () => {
  const { config, deploymentMode, isLoading } = useRuntimeConfig();

  if (isLoading || !config) {
    return null;
  }

  // 只在开发模式下显示
  const isDevelopment = deploymentMode === 'hybrid' || deploymentMode === 'development';
  if (!isDevelopment) {
    return null;
  }

  const getModeInfo = () => {
    if (config.mode === 'cloud') {
      return {
        type: 'info' as const,
        icon: <CloudOutlined />,
        title: '当前配置：云端模式',
        description: '使用 PostgreSQL 数据库，启用多站点管理和高级分析功能',
      };
    } else if (config.mode === 'edge') {
      return {
        type: 'success' as const,
        icon: <ApiOutlined />,
        title: '当前配置：本地模式',
        description: '使用 SQLite 数据库，启用 PLC 通信和云端同步功能',
      };
    } else {
      return {
        type: 'warning' as const,
        icon: <InfoCircleOutlined />,
        title: '当前配置：混合模式',
        description: '使用默认配置，点击侧边栏徽章可切换配置',
      };
    }
  };

  const modeInfo = getModeInfo();

  const getFeatureTags = () => {
    const features = [];
    
    if (config.features.plcCommunication) {
      features.push({ key: 'plc', label: 'PLC通信', enabled: true });
    }
    if (config.features.cloudSync) {
      features.push({ key: 'sync', label: '云端同步', enabled: true });
    }
    if (config.features.multiSiteManagement) {
      features.push({ key: 'multi', label: '多站点管理', enabled: true });
    }
    if (config.features.advancedAnalytics) {
      features.push({ key: 'analytics', label: '高级分析', enabled: true });
    }
    
    return features;
  };

  const features = getFeatureTags();

  return (
    <Alert
      type={modeInfo.type}
      icon={modeInfo.icon}
      message={
        <Space size="middle" style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <strong>{modeInfo.title}</strong>
            <span style={{ opacity: 0.85 }}>{modeInfo.description}</span>
          </Space>
          <Space size="small">
            <Tooltip title="数据库类型">
              <Tag icon={<DatabaseOutlined />} color={config.database === 'postgres' ? 'blue' : 'green'}>
                {config.database.toUpperCase()}
              </Tag>
            </Tooltip>
            {features.map(feature => (
              <Tooltip key={feature.key} title={`${feature.label}已启用`}>
                <Tag icon={<CheckCircleOutlined />} color="success">
                  {feature.label}
                </Tag>
              </Tooltip>
            ))}
          </Space>
        </Space>
      }
      style={{ marginBottom: 16 }}
      closable
    />
  );
};

export default ConfigStatusBanner;
