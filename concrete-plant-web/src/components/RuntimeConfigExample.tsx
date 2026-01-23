/**
 * 运行时配置示例
 * 
 * 在组件中使用运行时配置来控制功能显示
 */

import React from 'react';
import { useRuntimeConfig, useFeature, useDeploymentMode } from '../hooks/useRuntimeConfig';
import { Card, Tag, Spin, Alert } from 'antd';
import { CloudOutlined, DatabaseOutlined, ApiOutlined } from '@ant-design/icons';

export const RuntimeConfigExample: React.FC = () => {
  const { config, loading, error } = useRuntimeConfig();
  const { mode, isCloud, isEdge } = useDeploymentMode();
  
  // 检查特定功能
  const hasMultiSite = useFeature('multiSiteManagement');
  const hasPLC = useFeature('plcCommunication');
  const hasCloudSync = useFeature('cloudSync');

  if (loading) {
    return <Spin tip="加载配置中..." />;
  }

  if (error) {
    return <Alert message="配置加载失败" description={error.message} type="error" />;
  }

  return (
    <Card title="运行时配置">
      <div style={{ marginBottom: 16 }}>
        <Tag color={isCloud ? 'blue' : isEdge ? 'green' : 'orange'} icon={<CloudOutlined />}>
          {mode.toUpperCase()} 模式
        </Tag>
        <Tag icon={<DatabaseOutlined />}>
          {config?.database.toUpperCase()}
        </Tag>
      </div>

      <div>
        <h4>启用的功能：</h4>
        <ul>
          {config && Object.entries(config.features).map(([key, enabled]) => (
            enabled && <li key={key}>{key}</li>
          ))}
        </ul>
      </div>

      {/* 条件渲染示例 */}
      {hasMultiSite && (
        <Alert message="多站点管理已启用" type="info" style={{ marginTop: 16 }} />
      )}

      {hasPLC && (
        <Alert 
          message={`PLC 通信已启用 - ${config?.plc.host}`} 
          type="success" 
          style={{ marginTop: 16 }} 
        />
      )}

      {hasCloudSync && (
        <Alert 
          message={`云端同步已启用 - ${config?.cloudSync.apiUrl}`} 
          type="info" 
          style={{ marginTop: 16 }} 
        />
      )}
    </Card>
  );
};
