import { EnvironmentDetector, DeploymentMode } from '../utils/environment';

/**
 * 数据库配置
 */
export interface DatabaseConfig {
  type: 'postgres' | 'sqlite';
  url?: string;
  path?: string;
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
}

/**
 * Redis 配置
 */
export interface RedisConfig {
  url?: string;
  host?: string;
  port?: number;
  password?: string;
}

/**
 * PLC 配置
 */
export interface PLCConfig {
  enabled: boolean;
  host?: string;
  port?: number;
  protocol?: 'modbus' | 'opcua' | 'ethernet-ip';
}

/**
 * 云端同步配置
 */
export interface CloudSyncConfig {
  enabled: boolean;
  apiUrl?: string;
  siteId?: string;
  syncInterval?: number;
  apiKey?: string;
}

/**
 * 应用配置
 */
export interface AppConfig {
  mode: DeploymentMode;
  port: number;
  logLevel: string;
  database: DatabaseConfig;
  redis?: RedisConfig;
  plc?: PLCConfig;
  cloudSync?: CloudSyncConfig;
}

/**
 * 配置管理器
 */
export class ConfigManager {
  private static config: AppConfig | null = null;

  /**
   * 获取配置
   */
  static getConfig(): AppConfig {
    if (this.config) {
      return this.config;
    }

    const mode = EnvironmentDetector.getMode();
    
    if (mode === DeploymentMode.CLOUD) {
      this.config = this.getCloudConfig();
    } else if (mode === DeploymentMode.EDGE) {
      this.config = this.getEdgeConfig();
    } else {
      this.config = this.getHybridConfig();
    }

    console.log(`[ConfigManager] 配置加载完成 - 模式: ${mode}`);
    return this.config;
  }

  /**
   * 云端配置
   */
  private static getCloudConfig(): AppConfig {
    return {
      mode: DeploymentMode.CLOUD,
      port: parseInt(process.env.PORT || '3001'),
      logLevel: process.env.LOG_LEVEL || 'info',
      database: {
        type: 'postgres',
        url: process.env.DATABASE_URL || process.env.POSTGRES_URL,
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'concrete_plant',
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
      },
      redis: {
        url: process.env.REDIS_URL,
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
      },
      plc: {
        enabled: false,
      },
      cloudSync: {
        enabled: false,
      },
    };
  }

  /**
   * 边缘配置
   */
  private static getEdgeConfig(): AppConfig {
    return {
      mode: DeploymentMode.EDGE,
      port: parseInt(process.env.PORT || '3000'),
      logLevel: process.env.LOG_LEVEL || 'info',
      database: {
        type: 'sqlite',
        path: process.env.SQLITE_PATH || './data/edge.db',
      },
      plc: {
        enabled: true,
        host: process.env.PLC_HOST || '192.168.1.100',
        port: parseInt(process.env.PLC_PORT || '502'),
        protocol: (process.env.PLC_PROTOCOL as any) || 'modbus',
      },
      cloudSync: {
        enabled: true,
        apiUrl: process.env.CLOUD_API_URL || 'http://localhost:3001',
        siteId: process.env.SITE_ID || '1',
        syncInterval: parseInt(process.env.SYNC_INTERVAL || '30000'),
        apiKey: process.env.CLOUD_API_KEY,
      },
    };
  }

  /**
   * 混合配置
   */
  private static getHybridConfig(): AppConfig {
    return {
      mode: DeploymentMode.HYBRID,
      port: parseInt(process.env.PORT || '3000'),
      logLevel: process.env.LOG_LEVEL || 'debug',
      database: {
        type: 'sqlite',
        path: process.env.SQLITE_PATH || './data/hybrid.db',
      },
      plc: {
        enabled: !!process.env.PLC_HOST,
        host: process.env.PLC_HOST,
        port: parseInt(process.env.PLC_PORT || '502'),
      },
      cloudSync: {
        enabled: false,
      },
    };
  }

  /**
   * 重置配置（用于测试）
   */
  static reset(): void {
    this.config = null;
  }
}
