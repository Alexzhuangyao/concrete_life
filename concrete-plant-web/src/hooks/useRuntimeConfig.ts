import { useState, useEffect, useMemo } from 'react';

/**
 * 运行时配置接口
 */
export interface RuntimeConfig {
  mode: 'cloud' | 'edge' | 'hybrid';
  features: {
    plcCommunication: boolean;
    realtimeMonitoring: boolean;
    cloudSync: boolean;
    multiSiteManagement: boolean;
    advancedAnalytics: boolean;
    offlineMode: boolean;
    dataExport: boolean;
    reportGeneration: boolean;
    alarmNotification: boolean;
    remoteControl: boolean;
  };
  database: 'postgres' | 'sqlite';
  plc: {
    enabled: boolean;
    host?: string;
  };
  cloudSync: {
    enabled: boolean;
    apiUrl?: string;
  };
}

// 全局配置缓存，避免重复加载
let globalConfig: RuntimeConfig | null = null;
let globalConfigPromise: Promise<RuntimeConfig> | null = null;

/**
 * 加载配置（带缓存）
 */
const loadConfig = async (): Promise<RuntimeConfig> => {
  // 如果已经有缓存，直接返回
  if (globalConfig) {
    return globalConfig;
  }

  // 如果正在加载，返回同一个 Promise
  if (globalConfigPromise) {
    return globalConfigPromise;
  }

  // 开始加载
  globalConfigPromise = (async () => {
    let data: RuntimeConfig;
    
    try {
      const response = await fetch('/api/config/runtime');
      if (!response.ok) {
        throw new Error('Failed to fetch runtime config');
      }
      data = await response.json();
    } catch (apiError) {
      // 如果 API 不可用，使用默认配置
      console.warn('[useRuntimeConfig] API 不可用，使用默认配置');
      data = {
        mode: 'hybrid',
        features: {
          plcCommunication: false,
          realtimeMonitoring: true,
          cloudSync: false,
          multiSiteManagement: false,
          advancedAnalytics: false,
          offlineMode: true,
          dataExport: true,
          reportGeneration: true,
          alarmNotification: true,
          remoteControl: false,
        },
        database: 'sqlite',
        plc: {
          enabled: false,
        },
        cloudSync: {
          enabled: false,
        },
      };
    }
    
    // 在开发模式下，允许通过 localStorage 覆盖配置
    if (data.mode === 'hybrid' || import.meta.env.DEV) {
      const devConfigMode = localStorage.getItem('dev_config_mode') as 'cloud' | 'edge' | null;
      if (devConfigMode) {
        console.log(`[useRuntimeConfig] 使用开发配置: ${devConfigMode}`);
        data.mode = devConfigMode;
        
        // 根据选择的模式调整配置
        if (devConfigMode === 'cloud') {
          data.database = 'postgres';
          data.features.multiSiteManagement = true;
          data.features.advancedAnalytics = true;
          data.features.plcCommunication = false;
          data.features.cloudSync = false;
          data.plc.enabled = false;
          data.cloudSync.enabled = false;
        } else if (devConfigMode === 'edge') {
          data.database = 'sqlite';
          data.features.multiSiteManagement = false;
          data.features.advancedAnalytics = false;
          data.features.plcCommunication = true;
          data.features.cloudSync = true;
          data.plc.enabled = true;
          data.cloudSync.enabled = true;
        }
      } else {
        console.log(`[useRuntimeConfig] 使用默认配置: ${data.mode}`);
      }
    }
    
    console.log('[useRuntimeConfig] 最终配置:', data);
    globalConfig = data;
    globalConfigPromise = null;
    return data;
  })();

  return globalConfigPromise;
};

/**
 * 清除配置缓存（用于刷新配置）
 */
export const clearConfigCache = () => {
  globalConfig = null;
  globalConfigPromise = null;
};

/**
 * 运行时配置 Hook
 * 从后端获取当前部署模式和功能配置
 * 在开发模式下支持通过 localStorage 覆盖配置
 */
export const useRuntimeConfig = () => {
  const [config, setConfig] = useState<RuntimeConfig | null>(globalConfig);
  const [loading, setLoading] = useState(!globalConfig);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // 如果已经有缓存，直接使用
    if (globalConfig) {
      setConfig(globalConfig);
      setLoading(false);
      return;
    }

    const fetchConfig = async () => {
      try {
        const data = await loadConfig();
        setConfig(data);
      } catch (err) {
        setError(err as Error);
        console.error('Failed to load runtime config:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();

    // 监听 storage 事件（跨标签页同步）
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'dev_config_mode') {
        console.log('[useRuntimeConfig] localStorage 变化，清除缓存并重新加载');
        clearConfigCache();
        fetchConfig();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return useMemo(() => ({ 
    config, 
    loading, 
    error,
    deploymentMode: config?.mode || 'hybrid',
    isLoading: loading,
  }), [config, loading, error]);
};

/**
 * 功能检查 Hook
 * 检查特定功能是否启用
 */
export const useFeature = (featureName: keyof RuntimeConfig['features']) => {
  const { config, loading } = useRuntimeConfig();
  
  if (loading || !config) {
    return false;
  }
  
  return config.features[featureName];
};

/**
 * 部署模式检查 Hook
 */
export const useDeploymentMode = () => {
  const { config, loading } = useRuntimeConfig();
  
  return {
    mode: config?.mode || 'hybrid',
    isCloud: config?.mode === 'cloud',
    isEdge: config?.mode === 'edge',
    isHybrid: config?.mode === 'hybrid',
    loading,
  };
};
