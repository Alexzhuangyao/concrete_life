# 云边数据同步架构设计

## 📋 概述

本文档描述了混凝土搅拌站管理系统的云边数据同步架构。**云端和边缘使用完全相同的数据库表结构**，边缘站点定时将数据推送到云端，实现数据的统一管理和分析。

## 🏗️ 架构设计

### 核心原则
- ✅ **统一表结构**：云端和边缘使用相同的数据库Schema
- ✅ **边缘优先**：边缘站点独立运行，不依赖云端
- ✅ **定时同步**：边缘定时推送数据到云端
- ✅ **增量同步**：只同步变更的数据，减少网络传输
- ✅ **离线容错**：网络断开时边缘继续工作，恢复后自动同步

### 架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        云端 (Cloud)                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │          MySQL Database (统一Schema)                    │ │
│  │  - 接收所有边缘站点的数据                                │ │
│  │  - 提供全局数据分析和报表                                │ │
│  │  - 支持跨站点数据查询                                    │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │          Sync API Server                                │ │
│  │  - 接收边缘数据推送                                      │ │
│  │  - 数据验证和冲突解决                                    │ │
│  │  - 同步状态管理                                          │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ▲ ▲ ▲
                            │ │ │ HTTPS (定时推送)
                            │ │ │
        ┌───────────────────┘ │ └───────────────────┐
        │                     │                     │
┌───────▼──────┐    ┌────────▼─────┐    ┌─────────▼──────┐
│ 边缘站点 1    │    │ 边缘站点 2    │    │ 边缘站点 3     │
│ (Edge Site)  │    │ (Edge Site)  │    │ (Edge Site)    │
│              │    │              │    │                │
│ SQLite/MySQL │    │ SQLite/MySQL │    │ SQLite/MySQL   │
│ (统一Schema) │    │ (统一Schema) │    │ (统一Schema)   │
│              │    │              │    │                │
│ Sync Client  │    │ Sync Client  │    │ Sync Client    │
│ - 定时任务    │    │ - 定时任务    │    │ - 定时任务     │
│ - 增量检测    │    │ - 增量检测    │    │ - 增量检测     │
│ - 数据推送    │    │ - 数据推送    │    │ - 数据推送     │
└──────────────┘    └──────────────┘    └────────────────┘
```

## 🗄️ 数据库设计增强

### 1. 添加同步支持字段

为需要同步的表添加以下字段：

```sql
-- 同步元数据字段（添加到需要同步的表）
ALTER TABLE orders ADD COLUMN sync_status ENUM('pending', 'synced', 'failed') DEFAULT 'pending' COMMENT '同步状态';
ALTER TABLE orders ADD COLUMN sync_version BIGINT DEFAULT 1 COMMENT '数据版本号，每次更新递增';
ALTER TABLE orders ADD COLUMN last_sync_at TIMESTAMP NULL COMMENT '最后同步时间';
ALTER TABLE orders ADD COLUMN sync_hash VARCHAR(64) COMMENT '数据哈希值，用于检测变更';

-- 为其他需要同步的表添加相同字段
ALTER TABLE tasks ADD COLUMN sync_status ENUM('pending', 'synced', 'failed') DEFAULT 'pending';
ALTER TABLE tasks ADD COLUMN sync_version BIGINT DEFAULT 1;
ALTER TABLE tasks ADD COLUMN last_sync_at TIMESTAMP NULL;
ALTER TABLE tasks ADD COLUMN sync_hash VARCHAR(64);

ALTER TABLE production_batches ADD COLUMN sync_status ENUM('pending', 'synced', 'failed') DEFAULT 'pending';
ALTER TABLE production_batches ADD COLUMN sync_version BIGINT DEFAULT 1;
ALTER TABLE production_batches ADD COLUMN last_sync_at TIMESTAMP NULL;
ALTER TABLE production_batches ADD COLUMN sync_hash VARCHAR(64);

ALTER TABLE quality_tests ADD COLUMN sync_status ENUM('pending', 'synced', 'failed') DEFAULT 'pending';
ALTER TABLE quality_tests ADD COLUMN sync_version BIGINT DEFAULT 1;
ALTER TABLE quality_tests ADD COLUMN last_sync_at TIMESTAMP NULL;
ALTER TABLE quality_tests ADD COLUMN sync_hash VARCHAR(64);

ALTER TABLE equipment_metrics ADD COLUMN sync_status ENUM('pending', 'synced', 'failed') DEFAULT 'pending';
ALTER TABLE equipment_metrics ADD COLUMN sync_version BIGINT DEFAULT 1;
ALTER TABLE equipment_metrics ADD COLUMN last_sync_at TIMESTAMP NULL;
ALTER TABLE equipment_metrics ADD COLUMN sync_hash VARCHAR(64);

-- 创建同步索引
CREATE INDEX idx_orders_sync_status ON orders(sync_status, updated_at);
CREATE INDEX idx_tasks_sync_status ON tasks(sync_status, updated_at);
CREATE INDEX idx_batches_sync_status ON production_batches(sync_status, updated_at);
CREATE INDEX idx_quality_sync_status ON quality_tests(sync_status, updated_at);
CREATE INDEX idx_metrics_sync_status ON equipment_metrics(sync_status, updated_at);
```

### 2. 云边同步配置表

```sql
-- 云边同步配置表（边缘站点使用）
CREATE TABLE cloud_sync_config (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '配置ID',
    site_id BIGINT NOT NULL COMMENT '站点ID',
    cloud_api_url VARCHAR(255) NOT NULL COMMENT '云端API地址',
    api_key VARCHAR(255) NOT NULL COMMENT 'API密钥',
    sync_enabled BOOLEAN DEFAULT TRUE COMMENT '是否启用同步',
    sync_interval INT DEFAULT 5 COMMENT '同步间隔（分钟）',
    batch_size INT DEFAULT 100 COMMENT '每批同步记录数',
    retry_times INT DEFAULT 3 COMMENT '失败重试次数',
    last_sync_time TIMESTAMP COMMENT '最后同步时间',
    last_sync_status ENUM('success', 'failed', 'running') COMMENT '最后同步状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE,
    UNIQUE KEY uk_site_id (site_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='云边同步配置表';

-- 同步日志表
CREATE TABLE cloud_sync_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '日志ID',
    site_id BIGINT NOT NULL COMMENT '站点ID',
    sync_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '同步时间',
    table_name VARCHAR(50) NOT NULL COMMENT '同步的表名',
    records_count INT DEFAULT 0 COMMENT '同步记录数',
    success_count INT DEFAULT 0 COMMENT '成功数量',
    failed_count INT DEFAULT 0 COMMENT '失败数量',
    duration_ms INT COMMENT '同步耗时（毫秒）',
    status ENUM('success', 'partial', 'failed') COMMENT '同步状态',
    error_message TEXT COMMENT '错误信息',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE,
    INDEX idx_site_time (site_id, sync_time),
    INDEX idx_table_name (table_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='云边同步日志表';

-- 同步冲突记录表
CREATE TABLE cloud_sync_conflicts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '冲突ID',
    site_id BIGINT NOT NULL COMMENT '站点ID',
    table_name VARCHAR(50) NOT NULL COMMENT '表名',
    record_id BIGINT NOT NULL COMMENT '记录ID',
    edge_data JSON COMMENT '边缘数据',
    cloud_data JSON COMMENT '云端数据',
    conflict_type ENUM('version', 'data', 'deleted') COMMENT '冲突类型',
    resolution ENUM('pending', 'use_edge', 'use_cloud', 'manual') DEFAULT 'pending' COMMENT '解决方案',
    resolved_at TIMESTAMP COMMENT '解决时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE,
    INDEX idx_site_table (site_id, table_name),
    INDEX idx_resolution (resolution)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='同步冲突记录表';
```

## 🔄 同步策略

### 1. 需要同步的数据表

#### 高优先级（实时业务数据）
- ✅ `orders` - 订单数据
- ✅ `tasks` - 任务数据
- ✅ `production_batches` - 生产批次
- ✅ `quality_tests` - 质量检测
- ✅ `equipment_metrics` - 设备指标

#### 中优先级（运营数据）
- ✅ `material_transactions` - 物料变动
- ✅ `billing_records` - 计费记录
- ✅ `alarms` - 告警记录

#### 低优先级（统计数据）
- ✅ `daily_production_stats` - 日生产统计
- ✅ `equipment_daily_stats` - 设备统计

#### 不需要同步的表（配置类数据）
- ❌ `sites` - 站点信息（云端管理）
- ❌ `users` - 用户信息（各站点独立）
- ❌ `roles` - 角色权限（各站点独立）
- ❌ `materials` - 原材料定义（各站点独立）
- ❌ `recipes` - 配方（各站点独立）

### 2. 同步时机

```javascript
// 同步触发条件
const syncTriggers = {
  // 定时同步（主要方式）
  scheduled: {
    interval: '5分钟', // 可配置
    condition: 'sync_status = pending'
  },
  
  // 实时同步（重要数据）
  realtime: {
    tables: ['orders', 'tasks'],
    trigger: 'on_create_or_update',
    delay: '30秒' // 防抖
  },
  
  // 批量同步（大量数据）
  batch: {
    interval: '1小时',
    tables: ['equipment_metrics'],
    batchSize: 1000
  }
};
```

### 3. 增量同步算法

```sql
-- 查询需要同步的记录
SELECT * FROM orders 
WHERE site_id = ? 
  AND (
    sync_status = 'pending' 
    OR sync_status = 'failed'
    OR (updated_at > last_sync_at AND sync_status = 'synced')
  )
ORDER BY updated_at ASC
LIMIT 100;
```

## 🔌 API 接口设计

### 云端接收接口

```typescript
// POST /api/sync/push
interface SyncPushRequest {
  siteId: number;
  apiKey: string;
  syncBatch: {
    tableName: string;
    records: Array<{
      id: number;
      data: any;
      syncVersion: number;
      syncHash: string;
      operation: 'insert' | 'update' | 'delete';
    }>;
  }[];
}

interface SyncPushResponse {
  success: boolean;
  results: Array<{
    tableName: string;
    successCount: number;
    failedCount: number;
    conflicts: Array<{
      recordId: number;
      reason: string;
    }>;
  }>;
  nextSyncTime: string;
}
```

### 边缘同步客户端

```typescript
// 边缘站点同步服务
class EdgeSyncService {
  private config: CloudSyncConfig;
  private syncInterval: NodeJS.Timer;

  async start() {
    // 加载配置
    this.config = await this.loadConfig();
    
    // 启动定时同步
    this.syncInterval = setInterval(
      () => this.performSync(),
      this.config.syncInterval * 60 * 1000
    );
    
    // 立即执行一次
    await this.performSync();
  }

  async performSync() {
    try {
      // 1. 查询待同步数据
      const pendingData = await this.getPendingData();
      
      if (pendingData.length === 0) {
        console.log('No data to sync');
        return;
      }

      // 2. 分批推送到云端
      const results = await this.pushToCloud(pendingData);
      
      // 3. 更新同步状态
      await this.updateSyncStatus(results);
      
      // 4. 记录同步日志
      await this.logSyncResult(results);
      
    } catch (error) {
      console.error('Sync failed:', error);
      await this.logSyncError(error);
    }
  }

  private async getPendingData() {
    const tables = [
      'orders',
      'tasks', 
      'production_batches',
      'quality_tests',
      'equipment_metrics'
    ];
    
    const data = [];
    
    for (const table of tables) {
      const records = await db.query(`
        SELECT * FROM ${table}
        WHERE site_id = ? 
          AND sync_status IN ('pending', 'failed')
        ORDER BY updated_at ASC
        LIMIT ?
      `, [this.config.siteId, this.config.batchSize]);
      
      if (records.length > 0) {
        data.push({
          tableName: table,
          records: records.map(r => ({
            id: r.id,
            data: r,
            syncVersion: r.sync_version,
            syncHash: this.calculateHash(r),
            operation: r.sync_version === 1 ? 'insert' : 'update'
          }))
        });
      }
    }
    
    return data;
  }

  private async pushToCloud(data: any[]) {
    const response = await fetch(
      `${this.config.cloudApiUrl}/api/sync/push`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.config.apiKey,
          'X-Site-Id': this.config.siteId.toString()
        },
        body: JSON.stringify({
          siteId: this.config.siteId,
          apiKey: this.config.apiKey,
          syncBatch: data
        })
      }
    );
    
    if (!response.ok) {
      throw new Error(`Sync failed: ${response.statusText}`);
    }
    
    return await response.json();
  }

  private async updateSyncStatus(results: any) {
    for (const result of results.results) {
      const { tableName, successCount, conflicts } = result;
      
      // 更新成功的记录
      await db.query(`
        UPDATE ${tableName}
        SET sync_status = 'synced',
            last_sync_at = NOW()
        WHERE site_id = ?
          AND sync_status = 'pending'
        LIMIT ?
      `, [this.config.siteId, successCount]);
      
      // 标记冲突的记录
      if (conflicts.length > 0) {
        const conflictIds = conflicts.map(c => c.recordId);
        await db.query(`
          UPDATE ${tableName}
          SET sync_status = 'failed'
          WHERE id IN (?)
        `, [conflictIds]);
      }
    }
  }

  private calculateHash(record: any): string {
    // 计算数据哈希值，用于检测变更
    const crypto = require('crypto');
    const data = JSON.stringify(record);
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}
```

## 🛡️ 冲突解决策略

### 1. 版本冲突

```typescript
// 基于版本号的冲突检测
if (edgeVersion !== cloudVersion) {
  // 记录冲突
  await recordConflict({
    type: 'version',
    edgeData,
    cloudData,
    resolution: 'use_latest' // 使用最新的数据
  });
}
```

### 2. 数据冲突

```typescript
// 基于时间戳的冲突解决
if (edgeUpdatedAt > cloudUpdatedAt) {
  // 边缘数据更新，使用边缘数据
  await updateCloudData(edgeData);
} else {
  // 云端数据更新，通知边缘
  await notifyEdgeConflict(cloudData);
}
```

### 3. 删除冲突

```typescript
// 软删除标记
if (edgeDeleted && !cloudDeleted) {
  await markCloudDeleted(recordId);
}
```

## 📊 监控和管理

### 1. 同步状态监控

```sql
-- 查看同步状态
SELECT 
  table_name,
  COUNT(*) as total,
  SUM(CASE WHEN sync_status = 'pending' THEN 1 ELSE 0 END) as pending,
  SUM(CASE WHEN sync_status = 'synced' THEN 1 ELSE 0 END) as synced,
  SUM(CASE WHEN sync_status = 'failed' THEN 1 ELSE 0 END) as failed
FROM (
  SELECT 'orders' as table_name, sync_status FROM orders WHERE site_id = ?
  UNION ALL
  SELECT 'tasks', sync_status FROM tasks WHERE site_id = ?
  UNION ALL
  SELECT 'production_batches', sync_status FROM production_batches WHERE site_id = ?
) t
GROUP BY table_name;
```

### 2. 同步性能监控

```sql
-- 查看同步日志
SELECT 
  DATE(sync_time) as date,
  table_name,
  COUNT(*) as sync_count,
  SUM(records_count) as total_records,
  AVG(duration_ms) as avg_duration,
  SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as success_count,
  SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_count
FROM cloud_sync_logs
WHERE site_id = ?
  AND sync_time >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY DATE(sync_time), table_name
ORDER BY date DESC, table_name;
```

## 🚀 部署配置

### 边缘站点配置

```yaml
# config/sync.yml
cloud_sync:
  enabled: true
  cloud_api_url: "https://cloud.example.com"
  api_key: "your-api-key-here"
  site_id: 1
  
  # 同步间隔（分钟）
  sync_interval: 5
  
  # 批量大小
  batch_size: 100
  
  # 重试配置
  retry:
    max_attempts: 3
    backoff_seconds: 60
  
  # 同步表配置
  tables:
    - name: orders
      priority: high
      realtime: true
    - name: tasks
      priority: high
      realtime: true
    - name: production_batches
      priority: high
      realtime: false
    - name: quality_tests
      priority: medium
      realtime: false
    - name: equipment_metrics
      priority: low
      realtime: false
      batch_interval: 3600  # 1小时批量同步
```

### 云端配置

```yaml
# config/cloud.yml
sync_server:
  port: 3001
  
  # API认证
  auth:
    enabled: true
    key_header: "X-API-Key"
  
  # 数据验证
  validation:
    enabled: true
    max_batch_size: 1000
  
  # 冲突解决
  conflict_resolution:
    strategy: "latest_wins"  # latest_wins | manual | edge_priority
    
  # 性能优化
  performance:
    bulk_insert: true
    transaction_batch_size: 100
```

## 📝 使用示例

### 初始化同步配置

```sql
-- 边缘站点初始化
INSERT INTO cloud_sync_config (
  site_id, 
  cloud_api_url, 
  api_key, 
  sync_enabled, 
  sync_interval,
  batch_size
) VALUES (
  1,
  'https://cloud.example.com',
  'your-api-key-here',
  TRUE,
  5,
  100
);
```

### 启动同步服务

```bash
# 边缘站点
npm run sync:start

# 查看同步状态
npm run sync:status

# 手动触发同步
npm run sync:trigger

# 查看同步日志
npm run sync:logs
```

## ⚠️ 注意事项

1. **网络要求**
   - 边缘站点需要能访问云端API
   - 建议使用HTTPS加密传输
   - 考虑网络带宽限制

2. **数据安全**
   - API密钥妥善保管
   - 敏感数据加密传输
   - 定期更换API密钥

3. **性能优化**
   - 合理设置同步间隔
   - 使用批量操作
   - 避免高峰期同步大量数据

4. **故障恢复**
   - 边缘站点离线时数据继续累积
   - 网络恢复后自动补偿同步
   - 保留同步失败记录供人工处理

5. **数据一致性**
   - 云端数据仅供查询和分析
   - 边缘站点是数据的权威来源
   - 避免在云端直接修改边缘数据

## 🎯 总结

这个云边同步方案具有以下优势：

✅ **统一架构**：云边使用相同的数据库表结构，便于维护
✅ **边缘自治**：边缘站点可独立运行，不依赖云端
✅ **增量同步**：只同步变更数据，节省带宽
✅ **容错能力**：网络故障时自动重试和补偿
✅ **灵活配置**：支持不同表的不同同步策略
✅ **冲突处理**：自动检测和解决数据冲突
✅ **监控完善**：提供详细的同步日志和状态监控
