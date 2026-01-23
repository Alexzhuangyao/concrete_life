// 环境检测
export { EnvironmentDetector, DeploymentMode } from './utils/environment';

// 配置管理
export { ConfigManager } from './config/app.config';
export type { AppConfig, DatabaseConfig, RedisConfig, PLCConfig, CloudSyncConfig } from './config/app.config';

// 功能管理
export { FeatureManager } from './config/features';
export type { FeatureFlags } from './config/features';

// 数据库适配器
export { DatabaseFactory } from './adapters/database.adapter';
export type { DatabaseAdapter } from './adapters/database.adapter';
