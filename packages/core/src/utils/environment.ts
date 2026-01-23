/**
 * 部署模式枚举
 */
export enum DeploymentMode {
  CLOUD = 'cloud',    // 云端模式
  EDGE = 'edge',      // 边缘模式
  HYBRID = 'hybrid'   // 混合模式
}

/**
 * 环境检测器
 * 自动检测当前运行环境是云端还是边缘节点
 */
export class EnvironmentDetector {
  private static cachedMode: DeploymentMode | null = null;

  /**
   * 获取当前部署模式
   */
  static getMode(): DeploymentMode {
    if (this.cachedMode) {
      return this.cachedMode;
    }

    // 1. 优先使用环境变量
    const envMode = process.env.DEPLOYMENT_MODE?.toLowerCase();
    if (envMode === 'cloud') {
      this.cachedMode = DeploymentMode.CLOUD;
      return DeploymentMode.CLOUD;
    }
    if (envMode === 'edge') {
      this.cachedMode = DeploymentMode.EDGE;
      return DeploymentMode.EDGE;
    }

    // 2. 自动检测
    if (this.hasCloudFeatures()) {
      this.cachedMode = DeploymentMode.CLOUD;
      return DeploymentMode.CLOUD;
    }
    
    if (this.hasEdgeFeatures()) {
      this.cachedMode = DeploymentMode.EDGE;
      return DeploymentMode.EDGE;
    }

    // 3. 默认为混合模式
    this.cachedMode = DeploymentMode.HYBRID;
    return DeploymentMode.HYBRID;
  }

  /**
   * 检测是否有云端特征
   */
  private static hasCloudFeatures(): boolean {
    return !!(
      process.env.POSTGRES_URL ||
      process.env.DATABASE_URL?.includes('postgres') ||
      process.env.REDIS_URL
    );
  }

  /**
   * 检测是否有边缘特征
   */
  private static hasEdgeFeatures(): boolean {
    return !!(
      process.env.PLC_HOST ||
      process.env.SQLITE_PATH ||
      process.env.SITE_ID ||
      process.env.CLOUD_API_URL
    );
  }

  /**
   * 判断是否为云端模式
   */
  static isCloud(): boolean {
    return this.getMode() === DeploymentMode.CLOUD;
  }

  /**
   * 判断是否为边缘模式
   */
  static isEdge(): boolean {
    return this.getMode() === DeploymentMode.EDGE;
  }

  /**
   * 重置缓存（用于测试）
   */
  static reset(): void {
    this.cachedMode = null;
  }
}
