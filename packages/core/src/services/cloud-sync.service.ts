/**
 * 云边数据同步服务 - 边缘站点实现
 * 
 * 功能：
 * 1. 定时扫描待同步数据
 * 2. 批量推送到云端
 * 3. 处理同步结果和冲突
 * 4. 记录同步日志
 */

import crypto from 'crypto';
import fetch from 'node-fetch';

interface SyncConfig {
  siteId: number;
  cloudApiUrl: string;
  apiKey: string;
  syncEnabled: boolean;
  syncInterval: number;
  batchSize: number;
  retryTimes: number;
  retryDelay: number;
}

interface SyncRecord {
  id: number;
  data: any;
  syncVersion: number;
  syncHash: string;
  operation: 'insert' | 'update' | 'delete';
}

interface SyncBatch {
  tableName: string;
  records: SyncRecord[];
}

interface SyncResult {
  success: boolean;
  results: Array<{
    tableName: string;
    successCount: number;
    failedCount: number;
    conflicts: Array<{
      recordId: number;
      reason: string;
      cloudVersion?: number;
      edgeVersion?: number;
    }>;
  }>;
  nextSyncTime?: string;
}

export class CloudSyncService {
  private config: SyncConfig | null = null;
  private syncInterval: NodeJS.Timer | null = null;
  private isSyncing = false;
  private db: any; // 数据库连接

  // 需要同步的表配置
  private readonly SYNC_TABLES = [
    { name: 'orders', priority: 'high', realtime: true },
    { name: 'tasks', priority: 'high', realtime: true },
    { name: 'production_batches', priority: 'high', realtime: false },
    { name: 'batching_records', priority: 'high', realtime: false },
    { name: 'quality_tests', priority: 'medium', realtime: false },
    { name: 'slump_tests', priority: 'medium', realtime: false },
    { name: 'strength_tests', priority: 'medium', realtime: false },
    { name: 'equipment_metrics', priority: 'low', realtime: false },
    { name: 'material_transactions', priority: 'medium', realtime: false },
    { name: 'billing_records', priority: 'medium', realtime: false },
    { name: 'alarms', priority: 'medium', realtime: false },
    { name: 'daily_production_stats', priority: 'low', realtime: false },
    { name: 'equipment_daily_stats', priority: 'low', realtime: false },
  ];

  constructor(db: any) {
    this.db = db;
  }

  /**
   * 启动同步服务
   */
  async start(): Promise<void> {
    console.log('🚀 启动云边同步服务...');

    try {
      // 加载配置
      this.config = await this.loadConfig();

      if (!this.config.syncEnabled) {
        console.log('⚠️  同步服务已禁用');
        return;
      }

      console.log(`✅ 同步配置加载成功`);
      console.log(`   站点ID: ${this.config.siteId}`);
      console.log(`   云端地址: ${this.config.cloudApiUrl}`);
      console.log(`   同步间隔: ${this.config.syncInterval}分钟`);
      console.log(`   批量大小: ${this.config.batchSize}`);

      // 立即执行一次同步
      await this.performSync();

      // 启动定时同步
      this.syncInterval = setInterval(
        () => this.performSync(),
        this.config.syncInterval * 60 * 1000
      );

      console.log('✅ 同步服务已启动');
    } catch (error) {
      console.error('❌ 启动同步服务失败:', error);
      throw error;
    }
  }

  /**
   * 停止同步服务
   */
  stop(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    console.log('🛑 同步服务已停止');
  }

  /**
   * 执行同步
   */
  async performSync(): Promise<void> {
    if (this.isSyncing) {
      console.log('⏳ 同步正在进行中，跳过本次执行');
      return;
    }

    if (!this.config) {
      console.error('❌ 同步配置未加载');
      return;
    }

    this.isSyncing = true;
    const startTime = Date.now();

    try {
      console.log(`\n📤 开始同步 [${new Date().toLocaleString()}]`);

      // 更新同步状态为运行中
      await this.updateSyncStatus('running', null);

      // 1. 查询待同步数据
      const pendingData = await this.getPendingData();

      if (pendingData.length === 0) {
        console.log('✅ 没有待同步的数据');
        await this.updateSyncStatus('success', null);
        return;
      }

      console.log(`📊 待同步数据统计:`);
      pendingData.forEach(batch => {
        console.log(`   ${batch.tableName}: ${batch.records.length} 条记录`);
      });

      // 2. 推送到云端
      const result = await this.pushToCloud(pendingData);

      // 3. 更新同步状态
      await this.updateSyncStatus(
        result.success ? 'success' : 'failed',
        result.success ? null : '部分数据同步失败'
      );

      // 4. 处理同步结果
      await this.processSyncResult(result);

      // 5. 记录同步日志
      await this.logSyncResult(pendingData, result, Date.now() - startTime);

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`✅ 同步完成，耗时: ${duration}秒\n`);
    } catch (error) {
      console.error('❌ 同步失败:', error);
      await this.updateSyncStatus('failed', (error as Error).message);
      await this.logSyncError(error as Error);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * 加载同步配置
   */
  private async loadConfig(): Promise<SyncConfig> {
    const result = await this.db.query(`
      SELECT * FROM cloud_sync_config 
      WHERE site_id = (SELECT id FROM sites LIMIT 1)
      LIMIT 1
    `);

    if (!result || result.length === 0) {
      throw new Error('同步配置不存在');
    }

    return {
      siteId: result[0].site_id,
      cloudApiUrl: result[0].cloud_api_url,
      apiKey: result[0].api_key,
      syncEnabled: result[0].sync_enabled,
      syncInterval: result[0].sync_interval,
      batchSize: result[0].batch_size,
      retryTimes: result[0].retry_times,
      retryDelay: result[0].retry_delay,
    };
  }

  /**
   * 获取待同步数据
   */
  private async getPendingData(): Promise<SyncBatch[]> {
    const batches: SyncBatch[] = [];

    for (const table of this.SYNC_TABLES) {
      try {
        const records = await this.db.query(`
          SELECT * FROM ${table.name}
          WHERE site_id = ? 
            AND sync_status IN ('pending', 'failed')
          ORDER BY updated_at ASC
          LIMIT ?
        `, [this.config!.siteId, this.config!.batchSize]);

        if (records && records.length > 0) {
          batches.push({
            tableName: table.name,
            records: records.map((r: any) => ({
              id: r.id,
              data: this.sanitizeData(r),
              syncVersion: r.sync_version || 1,
              syncHash: this.calculateHash(r),
              operation: r.sync_version === 1 ? 'insert' : 'update',
            })),
          });
        }
      } catch (error) {
        console.error(`❌ 查询表 ${table.name} 失败:`, error);
      }
    }

    return batches;
  }

  /**
   * 推送数据到云端
   */
  private async pushToCloud(batches: SyncBatch[]): Promise<SyncResult> {
    const maxRetries = this.config!.retryTimes;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 推送数据到云端 (尝试 ${attempt}/${maxRetries})...`);

        const response = await fetch(
          `${this.config!.cloudApiUrl}/api/sync/push`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-API-Key': this.config!.apiKey,
              'X-Site-Id': this.config!.siteId.toString(),
            },
            body: JSON.stringify({
              siteId: this.config!.siteId,
              apiKey: this.config!.apiKey,
              syncBatch: batches,
              timestamp: new Date().toISOString(),
            }),
            timeout: 30000, // 30秒超时
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result: SyncResult = await response.json();
        console.log('✅ 数据推送成功');
        return result;
      } catch (error) {
        lastError = error as Error;
        console.error(`❌ 推送失败 (尝试 ${attempt}/${maxRetries}):`, error);

        if (attempt < maxRetries) {
          const delay = this.config!.retryDelay * attempt;
          console.log(`⏳ ${delay}秒后重试...`);
          await this.sleep(delay * 1000);
        }
      }
    }

    // 所有重试都失败
    throw lastError || new Error('推送失败');
  }

  /**
   * 处理同步结果
   */
  private async processSyncResult(result: SyncResult): Promise<void> {
    for (const tableResult of result.results) {
      const { tableName, successCount, failedCount, conflicts } = tableResult;

      // 更新成功的记录
      if (successCount > 0) {
        await this.db.query(`
          UPDATE ${tableName}
          SET sync_status = 'synced',
              last_sync_at = NOW()
          WHERE site_id = ?
            AND sync_status = 'pending'
          ORDER BY updated_at ASC
          LIMIT ?
        `, [this.config!.siteId, successCount]);

        console.log(`   ✅ ${tableName}: ${successCount} 条记录同步成功`);
      }

      // 处理冲突
      if (conflicts && conflicts.length > 0) {
        console.log(`   ⚠️  ${tableName}: ${conflicts.length} 条记录存在冲突`);

        for (const conflict of conflicts) {
          await this.recordConflict(tableName, conflict);
        }
      }

      // 标记失败的记录
      if (failedCount > 0) {
        console.log(`   ❌ ${tableName}: ${failedCount} 条记录同步失败`);
      }
    }
  }

  /**
   * 记录冲突
   */
  private async recordConflict(tableName: string, conflict: any): Promise<void> {
    try {
      // 获取边缘数据
      const edgeData = await this.db.query(
        `SELECT * FROM ${tableName} WHERE id = ?`,
        [conflict.recordId]
      );

      await this.db.query(`
        INSERT INTO cloud_sync_conflicts (
          site_id, table_name, record_id, 
          edge_data, edge_version, 
          conflict_type, resolution
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        this.config!.siteId,
        tableName,
        conflict.recordId,
        JSON.stringify(edgeData[0] || {}),
        conflict.edgeVersion,
        'version',
        'pending',
      ]);

      // 标记记录为失败状态
      await this.db.query(
        `UPDATE ${tableName} SET sync_status = 'failed' WHERE id = ?`,
        [conflict.recordId]
      );
    } catch (error) {
      console.error('记录冲突失败:', error);
    }
  }

  /**
   * 记录同步日志
   */
  private async logSyncResult(
    batches: SyncBatch[],
    result: SyncResult,
    duration: number
  ): Promise<void> {
    for (const batch of batches) {
      const tableResult = result.results.find(r => r.tableName === batch.tableName);

      if (tableResult) {
        await this.db.query(`
          INSERT INTO cloud_sync_logs (
            site_id, sync_time, table_name,
            records_count, success_count, failed_count,
            duration_ms, status
          ) VALUES (?, NOW(), ?, ?, ?, ?, ?, ?)
        `, [
          this.config!.siteId,
          batch.tableName,
          batch.records.length,
          tableResult.successCount,
          tableResult.failedCount,
          duration,
          tableResult.failedCount === 0 ? 'success' : 
            tableResult.successCount > 0 ? 'partial' : 'failed',
        ]);
      }
    }
  }

  /**
   * 记录同步错误
   */
  private async logSyncError(error: Error): Promise<void> {
    try {
      await this.db.query(`
        INSERT INTO cloud_sync_logs (
          site_id, sync_time, table_name,
          records_count, success_count, failed_count,
          status, error_message
        ) VALUES (?, NOW(), ?, 0, 0, 0, 'failed', ?)
      `, [this.config!.siteId, 'all', error.message]);
    } catch (err) {
      console.error('记录错误日志失败:', err);
    }
  }

  /**
   * 更新同步状态
   */
  private async updateSyncStatus(
    status: 'success' | 'failed' | 'running',
    errorMessage: string | null
  ): Promise<void> {
    await this.db.query(`
      UPDATE cloud_sync_config
      SET last_sync_time = NOW(),
          last_sync_status = ?,
          last_error_message = ?
      WHERE site_id = ?
    `, [status, errorMessage, this.config!.siteId]);
  }

  /**
   * 计算数据哈希值
   */
  private calculateHash(data: any): string {
    // 移除同步相关字段
    const { sync_status, sync_version, last_sync_at, sync_hash, ...cleanData } = data;
    const jsonStr = JSON.stringify(cleanData);
    return crypto.createHash('sha256').update(jsonStr).digest('hex');
  }

  /**
   * 清理数据（移除同步字段）
   */
  private sanitizeData(data: any): any {
    const { sync_status, sync_version, last_sync_at, sync_hash, ...cleanData } = data;
    return cleanData;
  }

  /**
   * 延迟函数
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 手动触发同步
   */
  async triggerSync(): Promise<void> {
    console.log('🔄 手动触发同步...');
    await this.performSync();
  }

  /**
   * 获取同步状态
   */
  async getSyncStatus(): Promise<any> {
    const result = await this.db.query(`
      SELECT * FROM v_sync_status_summary
      WHERE site_id = ?
    `, [this.config?.siteId]);

    return result[0] || null;
  }

  /**
   * 获取同步日志
   */
  async getSyncLogs(limit: number = 50): Promise<any[]> {
    return await this.db.query(`
      SELECT * FROM cloud_sync_logs
      WHERE site_id = ?
      ORDER BY sync_time DESC
      LIMIT ?
    `, [this.config?.siteId, limit]);
  }

  /**
   * 获取待处理冲突
   */
  async getPendingConflicts(): Promise<any[]> {
    return await this.db.query(`
      SELECT * FROM cloud_sync_conflicts
      WHERE site_id = ?
        AND resolution = 'pending'
      ORDER BY created_at DESC
    `, [this.config?.siteId]);
  }

  /**
   * 解决冲突
   */
  async resolveConflict(
    conflictId: number,
    resolution: 'use_edge' | 'use_cloud' | 'manual',
    userId?: number,
    note?: string
  ): Promise<void> {
    await this.db.query(`
      UPDATE cloud_sync_conflicts
      SET resolution = ?,
          resolved_by = ?,
          resolved_at = NOW(),
          resolution_note = ?
      WHERE id = ?
    `, [resolution, userId, note, conflictId]);

    console.log(`✅ 冲突 #${conflictId} 已解决: ${resolution}`);
  }
}

// 导出单例
let syncServiceInstance: CloudSyncService | null = null;

export function initSyncService(db: any): CloudSyncService {
  if (!syncServiceInstance) {
    syncServiceInstance = new CloudSyncService(db);
  }
  return syncServiceInstance;
}

export function getSyncService(): CloudSyncService {
  if (!syncServiceInstance) {
    throw new Error('同步服务未初始化');
  }
  return syncServiceInstance;
}
