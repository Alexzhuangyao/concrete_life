import React, { useState, useEffect } from 'react';
import { Modal, Radio, Space, Typography, Divider, message, Button } from 'antd';
import { CloudOutlined, LaptopOutlined, SettingOutlined, ReloadOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface DevModeConfigSwitcherProps {
  visible: boolean;
  onClose: () => void;
}

type DevConfigMode = 'cloud' | 'edge';

/**
 * 开发模式配置切换器
 * 允许在开发环境下切换云端/本地配置进行测试
 */
export const DevModeConfigSwitcher: React.FC<DevModeConfigSwitcherProps> = ({
  visible,
  onClose,
}) => {
  const [selectedMode, setSelectedMode] = useState<DevConfigMode>('edge');
  const [currentMode, setCurrentMode] = useState<DevConfigMode>('edge');
  const [loading, setLoading] = useState(false);

  // 加载当前配置
  useEffect(() => {
    if (visible) {
      loadCurrentConfig();
    }
  }, [visible]);

  const loadCurrentConfig = async () => {
    try {
      const mode = localStorage.getItem('dev_config_mode') as DevConfigMode;
      if (mode) {
        setSelectedMode(mode);
        setCurrentMode(mode);
      }
    } catch (error) {
      console.error('Failed to load dev config:', error);
    }
  };

  const handleApply = async () => {
    setLoading(true);
    try {
      // 保存到 localStorage
      localStorage.setItem('dev_config_mode', selectedMode);
      
      message.success({
        content: `已切换到${selectedMode === 'cloud' ? '云端' : '本地'}模式配置，页面将刷新...`,
        duration: 2,
      });

      // 延迟刷新页面以应用新配置
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      message.error('配置切换失败');
      console.error('Failed to switch config:', error);
      setLoading(false);
    }
  };

  const handleReset = () => {
    localStorage.removeItem('dev_config_mode');
    message.info('已重置为默认配置，页面将刷新...');
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  return (
    <Modal
      title={
        <Space>
          <SettingOutlined />
          <span>开发模式配置切换</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="reset" icon={<ReloadOutlined />} onClick={handleReset}>
          重置默认
        </Button>,
        <Button key="cancel" onClick={onClose}>
          取消
        </Button>,
        <Button
          key="apply"
          type="primary"
          loading={loading}
          onClick={handleApply}
          disabled={selectedMode === currentMode}
        >
          应用并刷新
        </Button>,
      ]}
      width={600}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Paragraph type="secondary">
            在开发模式下，您可以切换不同的配置来测试云端或本地部署场景。
          </Paragraph>
        </div>

        <Divider />

        <div>
          <Title level={5}>选择配置模式</Title>
          <Radio.Group
            value={selectedMode}
            onChange={(e) => setSelectedMode(e.target.value)}
            style={{ width: '100%' }}
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Radio value="edge" style={{ width: '100%' }}>
                <div style={{ marginLeft: 8 }}>
                  <Space>
                    <LaptopOutlined style={{ fontSize: 16, color: '#52c41a' }} />
                    <Text strong>本地模式 (Edge)</Text>
                  </Space>
                  <div style={{ marginTop: 4 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      • 使用 SQLite 数据库
                      <br />
                      • 启用 PLC 通信功能
                      <br />
                      • 启用云端同步功能
                      <br />
                      • 模拟边缘设备部署场景
                    </Text>
                  </div>
                </div>
              </Radio>

              <Radio value="cloud" style={{ width: '100%' }}>
                <div style={{ marginLeft: 8 }}>
                  <Space>
                    <CloudOutlined style={{ fontSize: 16, color: '#1890ff' }} />
                    <Text strong>云端模式 (Cloud)</Text>
                  </Space>
                  <div style={{ marginTop: 4 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      • 使用 PostgreSQL 数据库
                      <br />
                      • 启用多站点管理
                      <br />
                      • 启用高级分析功能
                      <br />
                      • 模拟云端服务器部署场景
                    </Text>
                  </div>
                </div>
              </Radio>
            </Space>
          </Radio.Group>
        </div>

        <Divider />

        <div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            💡 提示：切换配置后页面会自动刷新以应用新的配置。后端 API 需要相应配置环境变量。
          </Text>
        </div>
      </Space>
    </Modal>
  );
};

export default DevModeConfigSwitcher;
