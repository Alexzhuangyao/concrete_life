import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigManager, FeatureManager, EnvironmentDetector } from '@concrete-plant/core';

@Injectable()
export class AppService implements OnModuleInit {
  onModuleInit() {
    // 初始化配置和功能管理器
    const config = ConfigManager.getConfig();
    FeatureManager.initialize();
    
    console.log('='.repeat(60));
    console.log('🏭 混凝土搅拌站管理系统');
    console.log('='.repeat(60));
    console.log(`📍 部署模式: ${config.mode.toUpperCase()}`);
    console.log(`🔌 端口: ${config.port}`);
    console.log(`💾 数据库: ${config.database.type.toUpperCase()}`);
    
    if (EnvironmentDetector.isCloud()) {
      console.log(`☁️  云端模式 - 多站点管理`);
      console.log(`   - Redis: ${config.redis?.host || 'N/A'}`);
    } else if (EnvironmentDetector.isEdge()) {
      console.log(`🏭 边缘模式 - 现场控制`);
      console.log(`   - PLC: ${config.plc?.enabled ? config.plc.host : '未启用'}`);
      console.log(`   - 云端同步: ${config.cloudSync?.enabled ? '已启用' : '未启用'}`);
    }
    
    console.log('\n📋 启用的功能:');
    const features = FeatureManager.getAll();
    Object.entries(features).forEach(([key, enabled]) => {
      if (enabled) {
        console.log(`   ✅ ${key}`);
      }
    });
    console.log('='.repeat(60));
  }

  getHealth() {
    const config = ConfigManager.getConfig();
    const features = FeatureManager.getAll();
    
    return {
      status: 'ok',
      mode: config.mode,
      timestamp: new Date().toISOString(),
      features: features,
      config: {
        port: config.port,
        database: config.database.type,
        plc: config.plc?.enabled || false,
        cloudSync: config.cloudSync?.enabled || false,
      },
    };
  }
}
