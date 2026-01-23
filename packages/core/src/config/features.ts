import { DeploymentMode, EnvironmentDetector } from '../utils/environment';

/**
 * 功能特性标志
 */
export interface FeatureFlags {
  // PLC 通信（仅边缘）
  plcCommunication: boolean;
  
  // 实时监控
  realtimeMonitoring: boolean;
  
  // 云端同步（仅边缘）
  cloudSync: boolean;
  
  // 多站点管理（仅云端）
  multiSiteManagement: boolean;
  
  // 高级分析（仅云端）
  advancedAnalytics: boolean;
  
  // 离线模式（仅边缘）
  offlineMode: boolean;
  
  // 数据导出
  dataExport: boolean;
  
  // 报表生成
  reportGeneration: boolean;
  
  // 告警推送
  alarmNotification: boolean;
  
  // 远程控制（仅云端）
  remoteControl: boolean;
}

/**
 * 功能管理器
 * 根据部署模式自动启用/禁用功能
 */
export class FeatureManager {
  private static features: FeatureFlags | null = null;

  /**
   * 初始化功能标志
   */
  static initialize(): void {
    const mode = EnvironmentDetector.getMode();
    
    // 云端配置
    const cloudFeatures: FeatureFlags = {
      plcCommunication: false,
      realtimeMonitoring: true,
      cloudSync: false,
      multiSiteManagement: true,
      advancedAnalytics: true,
      offlineMode: false,
      dataExport: true,
      reportGeneration: true,
      alarmNotification: true,
      remoteControl: true,
    };
    
    // 边缘配置
    const edgeFeatures: FeatureFlags = {
      plcCommunication: true,
      realtimeMonitoring: true,
      cloudSync: true,
      multiSiteManagement: false,
      advancedAnalytics: false,
      offlineMode: true,
      dataExport: true,
      reportGeneration: false,
      alarmNotification: true,
      remoteControl: false,
    };
    
    // 混合配置（所有功能都启用）
    const hybridFeatures: FeatureFlags = {
      plcCommunication: true,
      realtimeMonitoring: true,
      cloudSync: true,
      multiSiteManagement: true,
      advancedAnalytics: true,
      offlineMode: true,
      dataExport: true,
      reportGeneration: true,
      alarmNotification: true,
      remoteControl: true,
    };
    
    switch (mode) {
      case DeploymentMode.CLOUD:
        this.features = cloudFeatures;
        break;
      case DeploymentMode.EDGE:
        this.features = edgeFeatures;
        break;
      case DeploymentMode.HYBRID:
        this.features = hybridFeatures;
        break;
    }
    
    console.log(`[FeatureManager] 初始化完成 - 模式: ${mode}`);
    console.log(`[FeatureManager] 功能标志:`, this.features);
  }

  /**
   * 检查功能是否启用
   */
  static isEnabled(feature: keyof FeatureFlags): boolean {
    if (!this.features) {
      this.initialize();
    }
    return this.features![feature];
  }

  /**
   * 获取所有功能标志
   */
  static getAll(): FeatureFlags {
    if (!this.features) {
      this.initialize();
    }
    return { ...this.features! };
  }

  /**
   * 获取当前部署模式
   */
  static getMode(): DeploymentMode {
    return EnvironmentDetector.getMode();
  }

  /**
   * 重置（用于测试）
   */
  static reset(): void {
    this.features = null;
    EnvironmentDetector.reset();
  }
}
