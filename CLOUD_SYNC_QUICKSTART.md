# 云边数据同步 - 快速开始指南

## 📋 概述

本指南帮助您快速配置和启动云边数据同步功能。

## 🚀 快速开始

### 1. 数据库迁移

首先执行数据库迁移脚本，为现有表添加同步支持：

```bash
# 在边缘站点和云端数据库都需要执行
mysql -u root -p concrete_plant < migrations/add-cloud-sync-support.sql
```

### 2. 配置同步参数

修改 `cloud_sync_config` 表中的配置：

```sql
-- 更新云端API地址和密钥
UPDATE cloud_sync_config 
SET cloud_api_url = 'https://your-cloud-api.com',
    api_key = 'your-secure-api-key-here',
    sync_enabled = TRUE,
    sync_interval = 5,  -- 5分钟同步一次
    batch_size = 100    -- 每批100条记录
WHERE site_id = 1;
```

### 3. 启动同步服务（边缘站点）

```typescript
// src/index.ts
import { initSyncService } from './services/cloud-sync.service';
import { db } from './database';

async function main() {
  // 初始化同步服务
  const syncService = initSyncService(db);
  
  // 启动同步
  await syncService.start();
  
  console.log('✅ 应用启动成功，同步服务已运行');
}

main().catch(console.error);
```

### 4. 云端API实现

在云端实现数据接收接口：

```typescript
// cloud-api/src/routes/sync.routes.ts
import express from 'express';
import { SyncController } from '../controllers/sync.controller';

const router = express.Router();
const syncController = new SyncController();

// 接收边缘数据推送
router.post('/push', syncController.receivePush);

export default router;
```

```typescript
// cloud-api/src/controllers/sync.controller.ts
import { Request, Response } from 'express';

export class SyncController {
  async receivePush(req: Request, res: Response) {
    try {
      const { siteId, apiKey, syncBatch, timestamp } = req.body;
      
      // 1. 验证API密钥
      const isValid = await this.validateApiKey(siteId, apiKey);
      if (!isValid) {
        return res.status(401).json({ 
          success: false, 
          error: 'Invalid API key' 
        });
      }
      
      // 2. 处理同步数据
      const results = [];
      
      for (const batch of syncBatch) {
        const result = await this.processBatch(siteId, batch);
        results.push(result);
      }
      
      // 3. 返回结果
      res.json({
        success: true,
        results,
        nextSyncTime: new Date(Date.now() + 5 * 60 * 1000).toISOString()
      });
      
    } catch (error) {
      console.error('Sync error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }
  
  private async validateApiKey(siteId: number, apiKey: string): Promise<boolean> {
    // 从数据库验证API密钥
    const result = await db.query(
      'SELECT 1 FROM cloud_sync_config WHERE site_id = ? AND api_key = ?',
      [siteId, apiKey]
    );
    return result.length > 0;
  }
  
  private async processBatch(siteId: number, batch: any) {
    const { tableName, records } = batch;
    let successCount = 0;
    let failedCount = 0;
    const conflicts = [];
    
    for (const record of records) {
      try {
        // 检查是否存在冲突
        const existing = await this.checkExisting(tableName, record.id);
        
        if (existing && existing.sync_version > record.syncVersion) {
          // 版本冲突
          conflicts.push({
            recordId: record.id,
            reason: 'Version conflict',
            cloudVersion: existing.sync_version,
            edgeVersion: record.syncVersion
          });
          failedCount++;
          continue;
        }
        
        // 插入或更新数据
        if (record.operation === 'insert') {
          await this.insertRecord(tableName, record.data);
        } else {
          await this.updateRecord(tableName, record.id, record.data);
        }
        
        successCount++;
      } catch (error) {
        console.error(`Failed to process record ${record.id}:`, error);
        failedCount++;
      }
    }
    
    return {
      tableName,
      successCount,
      failedCount,
      conflicts
    };
  }
  
  private async checkExisting(tableName: string, id: number) {
    const result = await db.query(
      `SELECT sync_version FROM ${tableName} WHERE id = ?`,
      [id]
    );
    return result[0] || null;
  }
  
  private async insertRecord(tableName: string, data: any) {
    const fields = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    const values = Object.values(data);
    
    await db.query(
      `INSERT INTO ${tableName} (${fields}) VALUES (${placeholders})`,
      values
    );
  }
  
  private async updateRecord(tableName: string, id: number, data: any) {
    const updates = Object.keys(data)
      .filter(key => key !== 'id')
      .map(key => `${key} = ?`)
      .join(', ');
    const values = Object.keys(data)
      .filter(key => key !== 'id')
      .map(key => data[key]);
    
    await db.query(
      `UPDATE ${tableName} SET ${updates} WHERE id = ?`,
      [...values, id]
    );
  }
}
```

## 📊 监控和管理

### 查看同步状态

```sql
-- 查看所有站点的同步状态
SELECT * FROM v_sync_status_summary;

-- 查看待同步数据统计
CALL sp_get_pending_sync_stats(1);  -- 站点ID
```

### 查看同步日志

```sql
-- 最近的同步日志
SELECT 
  sync_time,
  table_name,
  records_count,
  success_count,
  failed_count,
  duration_ms,
  status
FROM cloud_sync_logs
WHERE site_id = 1
ORDER BY sync_time DESC
LIMIT 20;
```

### 查看冲突记录

```sql
-- 待处理的冲突
SELECT 
  id,
  table_name,
  record_id,
  conflict_type,
  created_at
FROM cloud_sync_conflicts
WHERE site_id = 1 
  AND resolution = 'pending'
ORDER BY created_at DESC;
```

### 手动触发同步

```typescript
import { getSyncService } from './services/cloud-sync.service';

// 手动触发同步
await getSyncService().triggerSync();
```

### 解决冲突

```typescript
import { getSyncService } from './services/cloud-sync.service';

// 使用边缘数据
await getSyncService().resolveConflict(
  conflictId, 
  'use_edge', 
  userId, 
  '边缘数据更准确'
);

// 使用云端数据
await getSyncService().resolveConflict(
  conflictId, 
  'use_cloud', 
  userId, 
  '云端数据已修正'
);
```

## 🔧 高级配置

### 自定义同步表配置

```sql
-- 修改特定表的同步配置
UPDATE cloud_sync_table_config
SET priority = 'high',
    realtime = TRUE,
    batch_size = 50
WHERE site_id = 1 
  AND table_name = 'orders';
```

### 禁用特定表的同步

```sql
UPDATE cloud_sync_table_config
SET enabled = FALSE
WHERE site_id = 1 
  AND table_name = 'equipment_metrics';
```

### 重置同步状态

```sql
-- 重置特定表的同步状态（用于故障恢复）
CALL sp_reset_sync_status(1, 'orders');  -- 站点ID, 表名
```

## 🛡️ 安全建议

1. **API密钥管理**
   - 使用强随机密钥
   - 定期更换密钥
   - 不要在代码中硬编码密钥

2. **网络安全**
   - 使用HTTPS加密传输
   - 配置防火墙规则
   - 限制API访问频率

3. **数据验证**
   - 验证数据完整性
   - 检查数据格式
   - 防止SQL注入

## 📈 性能优化

### 1. 调整同步间隔

```sql
-- 根据数据量调整同步间隔
UPDATE cloud_sync_config
SET sync_interval = 10  -- 改为10分钟
WHERE site_id = 1;
```

### 2. 调整批量大小

```sql
-- 增加批量大小以提高效率
UPDATE cloud_sync_config
SET batch_size = 200
WHERE site_id = 1;
```

### 3. 分时段同步

```typescript
// 在业务低峰期增加同步频率
const hour = new Date().getHours();
const interval = (hour >= 22 || hour <= 6) ? 2 : 10;  // 夜间2分钟，白天10分钟
```

## 🐛 故障排查

### 同步失败

```sql
-- 查看失败的同步记录
SELECT * FROM cloud_sync_logs
WHERE site_id = 1 
  AND status = 'failed'
ORDER BY sync_time DESC
LIMIT 10;
```

### 网络问题

```bash
# 测试云端API连接
curl -X POST https://your-cloud-api.com/api/sync/push \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{"test": true}'
```

### 数据积压

```sql
-- 查看各表的待同步数据量
SELECT 
  'orders' as table_name,
  COUNT(*) as pending_count
FROM orders 
WHERE site_id = 1 AND sync_status = 'pending'
UNION ALL
SELECT 'tasks', COUNT(*) FROM tasks 
WHERE site_id = 1 AND sync_status = 'pending'
UNION ALL
SELECT 'production_batches', COUNT(*) FROM production_batches 
WHERE site_id = 1 AND sync_status = 'pending';
```

## 📝 常见问题

### Q: 同步服务启动失败？
A: 检查数据库连接和配置表是否正确初始化。

### Q: 数据一直显示待同步？
A: 检查网络连接和云端API是否正常运行。

### Q: 出现大量冲突？
A: 检查时钟同步，确保边缘和云端时间一致。

### Q: 同步性能慢？
A: 调整批量大小和同步间隔，考虑网络带宽限制。

## 🎯 最佳实践

1. **定期监控**
   - 每天检查同步日志
   - 关注失败和冲突记录
   - 监控同步延迟

2. **数据备份**
   - 定期备份边缘数据库
   - 云端保留历史数据
   - 测试恢复流程

3. **渐进式部署**
   - 先在测试环境验证
   - 从单个站点开始
   - 逐步扩展到所有站点

4. **文档维护**
   - 记录配置变更
   - 更新操作手册
   - 培训运维人员

## 📞 技术支持

如有问题，请查看：
- 详细设计文档: `CLOUD_EDGE_SYNC_DESIGN.md`
- 数据库迁移脚本: `migrations/add-cloud-sync-support.sql`
- 服务实现代码: `packages/core/src/services/cloud-sync.service.ts`
