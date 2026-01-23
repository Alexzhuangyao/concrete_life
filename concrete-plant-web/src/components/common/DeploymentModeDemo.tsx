import React from 'react';
import { Card, Space, Divider, Typography } from 'antd';
import { DeploymentModeBadge } from './DeploymentModeBadge';
import { useRuntimeConfig } from '../../hooks/useRuntimeConfig';

const { Title, Paragraph, Text } = Typography;

/**
 * Demo component to showcase the DeploymentModeBadge
 */
export const DeploymentModeDemo: React.FC = () => {
  const { deploymentMode, environment, config } = useRuntimeConfig();

  return (
    <Card title="部署模式指示器演示" style={{ maxWidth: 800, margin: '20px auto' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={4}>当前部署模式</Title>
          <DeploymentModeBadge />
        </div>

        <Divider />

        <div>
          <Title level={4}>模式说明</Title>
          <Space direction="vertical" size="middle">
            <div>
              <Text strong>🖥️ 本地模式 (Edge)</Text>
              <Paragraph>
                在边缘设备上运行，使用本地 SQLite 数据库，适合工厂现场部署
              </Paragraph>
            </div>
            <div>
              <Text strong>☁️ 云端模式 (Cloud)</Text>
              <Paragraph>
                在云服务器上运行，使用 PostgreSQL 数据库，支持多站点集中管理
              </Paragraph>
            </div>
            <div>
              <Text strong>💻 开发模式 (Development)</Text>
              <Paragraph>
                本地开发环境，用于功能开发和测试
              </Paragraph>
            </div>
          </Space>
        </div>

        <Divider />

        <div>
          <Title level={4}>当前配置信息</Title>
          <pre style={{ 
            background: 'var(--bg-tertiary)', 
            padding: 16, 
            borderRadius: 4,
            overflow: 'auto'
          }}>
            {JSON.stringify({ deploymentMode, environment, config }, null, 2)}
          </pre>
        </div>
      </Space>
    </Card>
  );
};

export default DeploymentModeDemo;
