# 核心包 (@concrete-plant/core)

混凝土搅拌站管理系统的核心包，包含云边一体化的核心逻辑。

## 功能

- 🔍 **环境检测** - 自动检测云端/边缘部署模式
- ⚙️ **配置管理** - 统一的配置管理系统
- 🎛️ **功能开关** - 基于部署模式的功能开关
- 🔌 **数据库适配器** - 统一的数据库访问接口

## 使用方法

```typescript
import { EnvironmentDetector, FeatureManager, ConfigManager } from '@concrete-plant/core';

// 检测部署模式
const mode = EnvironmentDetector.getMode();
console.log('当前模式:', mode); // 'cloud' | 'edge' | 'hybrid'

// 获取配置
const config = ConfigManager.getConfig();
console.log('数据库类型:', config.database.type);

// 检查功能是否启用
if (FeatureManager.isEnabled('plcCommunication')) {
  // 启用 PLC 通信
}

if (FeatureManager.isEnabled('multiSiteManagement')) {
  // 启用多站点管理
}
```

## 环境变量

### 通用配置
- `DEPLOYMENT_MODE` - 部署模式 (cloud/edge/hybrid)
- `PORT` - 服务端口
- `LOG_LEVEL` - 日志级别

### 云端配置
- `DATABASE_URL` 或 `POSTGRES_URL` - PostgreSQL 连接字符串
- `REDIS_URL` - Redis 连接字符串

### 边缘配置
- `SQLITE_PATH` - SQLite 数据库路径
- `PLC_HOST` - PLC 设备地址
- `PLC_PORT` - PLC 端口
- `CLOUD_API_URL` - 云端 API 地址
- `SITE_ID` - 站点 ID

## 构建

```bash
npm run build
```
