# 云边一体化架构 - 实施指南

## ✅ 已完成的工作

### 1. 核心包 (`packages/core`)
- ✅ 环境检测器 (`EnvironmentDetector`)
- ✅ 配置管理器 (`ConfigManager`)
- ✅ 功能管理器 (`FeatureManager`)
- ✅ 数据库适配器接口 (`DatabaseAdapter`)

### 2. 后端集成 (`concrete-plant-api`)
- ✅ 更新了 `app.controller.ts` - 添加运行时配置 API
- ✅ 更新了 `app.service.ts` - 启动时显示部署模式
- ✅ 创建了环境配置示例文件

### 3. 前端集成 (`concrete-plant-web`)
- ✅ 创建了 `useRuntimeConfig` Hook
- ✅ 创建了功能检查 Hook
- ✅ 创建了部署模式检查 Hook
- ✅ 提供了使用示例组件

### 4. 部署脚本
- ✅ 统一部署脚本 (`scripts/deploy.sh`)
- ✅ 支持云端/边缘/开发三种模式

---

## 🚀 使用方法

### 方式 1：使用部署脚本（推荐）

```bash
cd /Users/alexzhuang/Downloads/concrete_life
./scripts/deploy.sh
```

然后选择部署模式：
1. 云端部署
2. 边缘节点部署
3. 开发环境

### 方式 2：手动部署

#### 云端部署

```bash
# 1. 构建核心包
cd packages/core
npm install && npm run build

# 2. 配置环境变量
cd ../../concrete-plant-api
cp .env.cloud.example .env
# 编辑 .env 文件，配置 PostgreSQL 和 Redis

# 3. 启动服务
export DEPLOYMENT_MODE=cloud
npm install
npm run start:prod
```

#### 边缘节点部署

```bash
# 1. 构建核心包
cd packages/core
npm install && npm run build

# 2. 配置环境变量
cd ../../concrete-plant-api
cp .env.edge.example .env
# 编辑 .env 文件，配置站点信息和 PLC

# 3. 启动服务
export DEPLOYMENT_MODE=edge
npm install
npm run start:prod
```

---

## 📋 环境变量说明

### 云端模式 (`.env.cloud.example`)
```bash
DEPLOYMENT_MODE=cloud
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
```

### 边缘模式 (`.env.edge.example`)
```bash
DEPLOYMENT_MODE=edge
SQLITE_PATH=./data/edge.db
SITE_ID=1
CLOUD_API_URL=http://cloud.example.com
PLC_HOST=192.168.1.100
```

---

## 🎯 功能特性

### 云端模式启用的功能
- ✅ 多站点管理
- ✅ 高级分析
- ✅ 报表生成
- ✅ 远程控制
- ❌ PLC 通信
- ❌ 离线模式

### 边缘模式启用的功能
- ✅ PLC 通信
- ✅ 实时监控
- ✅ 云端同步
- ✅ 离线模式
- ❌ 多站点管理
- ❌ 高级分析

---

## 💻 前端使用示例

### 1. 获取运行时配置

```typescript
import { useRuntimeConfig } from '../hooks/useRuntimeConfig';

const MyComponent = () => {
  const { config, loading } = useRuntimeConfig();
  
  if (loading) return <Spin />;
  
  return (
    <div>
      <p>当前模式: {config?.mode}</p>
      <p>数据库: {config?.database}</p>
    </div>
  );
};
```

### 2. 检查功能是否启用

```typescript
import { useFeature } from '../hooks/useRuntimeConfig';

const Dashboard = () => {
  const hasMultiSite = useFeature('multiSiteManagement');
  const hasPLC = useFeature('plcCommunication');
  
  return (
    <div>
      {hasMultiSite && <MultiSiteSelector />}
      {hasPLC && <PLCMonitor />}
    </div>
  );
};
```

### 3. 检查部署模式

```typescript
import { useDeploymentMode } from '../hooks/useRuntimeConfig';

const Header = () => {
  const { isCloud, isEdge } = useDeploymentMode();
  
  return (
    <div>
      {isCloud && <Tag color="blue">云端</Tag>}
      {isEdge && <Tag color="green">边缘</Tag>}
    </div>
  );
};
```

---

## 🔧 后端使用示例

### 1. 检查功能是否启用

```typescript
import { FeatureManager } from '@concrete-plant/core';

if (FeatureManager.isEnabled('plcCommunication')) {
  // 启用 PLC 通信
  await this.plcService.connect();
}

if (FeatureManager.isEnabled('cloudSync')) {
  // 启用云端同步
  await this.syncService.start();
}
```

### 2. 获取配置

```typescript
import { ConfigManager } from '@concrete-plant/core';

const config = ConfigManager.getConfig();

if (config.mode === 'edge') {
  console.log('边缘模式 - 站点ID:', config.cloudSync?.siteId);
}
```

---

## 📊 API 端点

### 获取运行时配置
```
GET /api/config/runtime
```

响应示例：
```json
{
  "mode": "edge",
  "features": {
    "plcCommunication": true,
    "multiSiteManagement": false,
    ...
  },
  "database": "sqlite",
  "plc": {
    "enabled": true,
    "host": "192.168.1.100"
  },
  "cloudSync": {
    "enabled": true,
    "apiUrl": "http://cloud.example.com"
  }
}
```

---

## 🎉 下一步

1. **构建核心包**
   ```bash
   cd packages/core
   npm install && npm run build
   ```

2. **更新后端依赖**
   ```bash
   cd concrete-plant-api
   npm install @concrete-plant/core@file:../packages/core
   ```

3. **测试运行**
   ```bash
   # 云端模式
   DEPLOYMENT_MODE=cloud npm run start:dev
   
   # 边缘模式
   DEPLOYMENT_MODE=edge npm run start:dev
   ```

4. **查看启动日志**
   - 会显示当前部署模式
   - 会显示启用的功能列表
   - 会显示数据库类型

---

## 📚 相关文档

- [核心包 README](../packages/core/README.md)
- [云端配置示例](../concrete-plant-api/.env.cloud.example)
- [边缘配置示例](../concrete-plant-api/.env.edge.example)

---

**现在你的系统已经支持云边一体化部署了！** 🎊
