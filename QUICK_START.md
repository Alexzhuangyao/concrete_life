# 🎉 云边一体化架构 - 快速上手指南

## 📋 目录

1. [项目概述](#项目概述)
2. [快速开始](#快速开始)
3. [部署方式](#部署方式)
4. [使用示例](#使用示例)
5. [常见问题](#常见问题)

---

## 项目概述

混凝土搅拌站管理系统现已支持**云边一体化部署**，一套代码可以部署为：

- ☁️ **云端模式** - 集中管理多个搅拌站
- 🏭 **边缘模式** - 现场控制和数据采集
- 💻 **开发模式** - 本地开发和测试

---

## 快速开始

### 1️⃣ 测试实施效果

```bash
cd /Users/alexzhuang/Downloads/concrete_life
./scripts/test-implementation.sh
```

这会测试：
- ✅ 核心包构建
- ✅ 云端模式配置
- ✅ 边缘模式配置
- ✅ 自动环境检测

### 2️⃣ 部署系统

```bash
./scripts/deploy.sh
```

然后选择部署模式：
1. 云端部署
2. 边缘节点部署
3. 开发环境

---

## 部署方式

### 方式 1：云端部署 ☁️

**适用场景：**
- 总部集中管理
- 多站点数据汇总
- 高级数据分析

**步骤：**
```bash
# 1. 运行部署脚本
./scripts/deploy.sh
# 选择 1) 云端部署

# 2. 编辑配置文件
cd concrete-plant-api
nano .env

# 3. 配置数据库
DATABASE_URL=postgresql://user:pass@localhost:5432/concrete
REDIS_URL=redis://localhost:6379
```

**访问：** http://localhost:3001

---

### 方式 2：边缘节点部署 🏭

**适用场景：**
- 搅拌站现场
- PLC 设备控制
- 离线运行

**步骤：**
```bash
# 1. 运行部署脚本
./scripts/deploy.sh
# 选择 2) 边缘节点部署

# 2. 输入站点信息
站点ID: 1
站点名称: 杭州总站
云端API地址: http://cloud.example.com:3001

# 3. 配置 PLC（可选）
cd concrete-plant-api
nano .env
# 修改 PLC_HOST=192.168.1.100
```

**访问：** http://localhost:3000

---

### 方式 3：开发环境 💻

**适用场景：**
- 本地开发
- 功能测试

**步骤：**
```bash
# 运行部署脚本
./scripts/deploy.sh
# 选择 3) 开发环境
```

**访问：**
- 前端：http://localhost:5173
- 后端：http://localhost:3001

---

## 使用示例

### 后端代码示例

```typescript
import { FeatureManager, ConfigManager, EnvironmentDetector } from '@concrete-plant/core';

// 1. 检查部署模式
if (EnvironmentDetector.isCloud()) {
  console.log('云端模式');
} else if (EnvironmentDetector.isEdge()) {
  console.log('边缘模式');
}

// 2. 检查功能是否启用
if (FeatureManager.isEnabled('plcCommunication')) {
  // 启用 PLC 通信
  await this.plcService.connect();
}

if (FeatureManager.isEnabled('multiSiteManagement')) {
  // 启用多站点管理
  await this.siteService.loadAllSites();
}

// 3. 获取配置
const config = ConfigManager.getConfig();
console.log('数据库类型:', config.database.type);
console.log('端口:', config.port);
```

### 前端代码示例

```typescript
import { useRuntimeConfig, useFeature, useDeploymentMode } from '../hooks/useRuntimeConfig';

const Dashboard = () => {
  // 1. 获取运行时配置
  const { config, loading } = useRuntimeConfig();
  
  // 2. 检查功能
  const hasMultiSite = useFeature('multiSiteManagement');
  const hasPLC = useFeature('plcCommunication');
  
  // 3. 检查部署模式
  const { isCloud, isEdge } = useDeploymentMode();
  
  if (loading) return <Spin />;
  
  return (
    <div>
      {/* 显示部署模式 */}
      {isCloud && <Tag color="blue">云端模式</Tag>}
      {isEdge && <Tag color="green">边缘模式</Tag>}
      
      {/* 条件渲染功能 */}
      {hasMultiSite && <MultiSiteSelector />}
      {hasPLC && <PLCMonitor />}
      
      {/* 显示配置信息 */}
      <p>数据库: {config?.database}</p>
    </div>
  );
};
```

---

## 常见问题

### Q1: 如何切换部署模式？

**A:** 通过环境变量 `DEPLOYMENT_MODE` 控制：

```bash
# 云端模式
export DEPLOYMENT_MODE=cloud

# 边缘模式
export DEPLOYMENT_MODE=edge

# 或者在 .env 文件中设置
DEPLOYMENT_MODE=cloud
```

### Q2: 如何查看当前部署模式？

**A:** 访问 API 端点：

```bash
curl http://localhost:3001/api/config/runtime
```

或在代码中：

```typescript
const config = ConfigManager.getConfig();
console.log('当前模式:', config.mode);
```

### Q3: 云端和边缘有什么区别？

**A:** 功能对比：

| 功能 | 云端 | 边缘 |
|------|------|------|
| 多站点管理 | ✅ | ❌ |
| PLC 通信 | ❌ | ✅ |
| 离线运行 | ❌ | ✅ |
| 高级分析 | ✅ | ❌ |

### Q4: 如何添加新功能？

**A:** 在 `packages/core/src/config/features.ts` 中添加：

```typescript
export interface FeatureFlags {
  // ... 现有功能
  myNewFeature: boolean;  // 新功能
}

// 在云端配置中启用
const cloudFeatures: FeatureFlags = {
  // ...
  myNewFeature: true,
};
```

### Q5: 边缘节点如何同步数据到云端？

**A:** 配置云端 API 地址：

```bash
# .env
CLOUD_API_URL=http://cloud.example.com:3001
CLOUD_API_KEY=your-api-key
SYNC_INTERVAL=30000  # 30秒同步一次
```

### Q6: 如何调试？

**A:** 使用开发模式：

```bash
# 启动开发环境
./scripts/deploy.sh
# 选择 3) 开发环境

# 或手动启动
cd concrete-plant-api
DEPLOYMENT_MODE=edge npm run start:dev
```

---

## 📚 相关文档

| 文档 | 说明 |
|------|------|
| [FINAL_SUMMARY.md](FINAL_SUMMARY.md) | 最终总结 |
| [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) | 实施总结 |
| [CLOUD_EDGE_IMPLEMENTATION.md](CLOUD_EDGE_IMPLEMENTATION.md) | 实施指南 |
| [packages/core/README.md](packages/core/README.md) | 核心包文档 |

---

## 🎯 下一步

1. ✅ 运行测试脚本验证功能
2. ✅ 选择合适的部署模式
3. ✅ 配置环境变量
4. ✅ 启动系统
5. ✅ 开始使用

---

## 💡 提示

- 💾 **数据库**：云端用 PostgreSQL，边缘用 SQLite
- 🔌 **PLC**：只在边缘模式启用
- ☁️ **同步**：边缘节点自动同步数据到云端
- 📊 **分析**：高级分析功能只在云端可用

---

**🎊 开始使用云边一体化架构吧！** 🚀

有问题？查看文档或运行测试脚本！
