-- ============================================================================
-- 云边数据同步支持 - 数据库迁移脚本
-- ============================================================================
-- 说明：为现有表添加同步支持字段，创建同步配置和日志表
-- 执行：在边缘站点和云端数据库都需要执行此脚本
-- ============================================================================

-- ============================================================================
-- 1. 为需要同步的表添加同步字段
-- ============================================================================

-- 订单表
ALTER TABLE orders 
ADD COLUMN sync_status ENUM('pending', 'synced', 'failed') DEFAULT 'pending' COMMENT '同步状态：pending-待同步，synced-已同步，failed-同步失败',
ADD COLUMN sync_version BIGINT DEFAULT 1 COMMENT '数据版本号，每次更新递增',
ADD COLUMN last_sync_at TIMESTAMP NULL COMMENT '最后同步时间',
ADD COLUMN sync_hash VARCHAR(64) COMMENT '数据哈希值，用于检测变更';

CREATE INDEX idx_orders_sync_status ON orders(sync_status, updated_at);

-- 任务表
ALTER TABLE tasks 
ADD COLUMN sync_status ENUM('pending', 'synced', 'failed') DEFAULT 'pending' COMMENT '同步状态',
ADD COLUMN sync_version BIGINT DEFAULT 1 COMMENT '数据版本号',
ADD COLUMN last_sync_at TIMESTAMP NULL COMMENT '最后同步时间',
ADD COLUMN sync_hash VARCHAR(64) COMMENT '数据哈希值';

CREATE INDEX idx_tasks_sync_status ON tasks(sync_status, updated_at);

-- 生产批次表
ALTER TABLE production_batches 
ADD COLUMN sync_status ENUM('pending', 'synced', 'failed') DEFAULT 'pending' COMMENT '同步状态',
ADD COLUMN sync_version BIGINT DEFAULT 1 COMMENT '数据版本号',
ADD COLUMN last_sync_at TIMESTAMP NULL COMMENT '最后同步时间',
ADD COLUMN sync_hash VARCHAR(64) COMMENT '数据哈希值';

CREATE INDEX idx_batches_sync_status ON production_batches(sync_status, updated_at);

-- 配料记录表
ALTER TABLE batching_records 
ADD COLUMN sync_status ENUM('pending', 'synced', 'failed') DEFAULT 'pending' COMMENT '同步状态',
ADD COLUMN sync_version BIGINT DEFAULT 1 COMMENT '数据版本号',
ADD COLUMN last_sync_at TIMESTAMP NULL COMMENT '最后同步时间',
ADD COLUMN sync_hash VARCHAR(64) COMMENT '数据哈希值';

CREATE INDEX idx_batching_sync_status ON batching_records(sync_status, updated_at);

-- 质量检测表
ALTER TABLE quality_tests 
ADD COLUMN sync_status ENUM('pending', 'synced', 'failed') DEFAULT 'pending' COMMENT '同步状态',
ADD COLUMN sync_version BIGINT DEFAULT 1 COMMENT '数据版本号',
ADD COLUMN last_sync_at TIMESTAMP NULL COMMENT '最后同步时间',
ADD COLUMN sync_hash VARCHAR(64) COMMENT '数据哈希值';

CREATE INDEX idx_quality_sync_status ON quality_tests(sync_status, updated_at);

-- 坍落度检测表
ALTER TABLE slump_tests 
ADD COLUMN sync_status ENUM('pending', 'synced', 'failed') DEFAULT 'pending' COMMENT '同步状态',
ADD COLUMN sync_version BIGINT DEFAULT 1 COMMENT '数据版本号',
ADD COLUMN last_sync_at TIMESTAMP NULL COMMENT '最后同步时间',
ADD COLUMN sync_hash VARCHAR(64) COMMENT '数据哈希值';

CREATE INDEX idx_slump_sync_status ON slump_tests(sync_status, updated_at);

-- 强度检测表
ALTER TABLE strength_tests 
ADD COLUMN sync_status ENUM('pending', 'synced', 'failed') DEFAULT 'pending' COMMENT '同步状态',
ADD COLUMN sync_version BIGINT DEFAULT 1 COMMENT '数据版本号',
ADD COLUMN last_sync_at TIMESTAMP NULL COMMENT '最后同步时间',
ADD COLUMN sync_hash VARCHAR(64) COMMENT '数据哈希值';

CREATE INDEX idx_strength_sync_status ON strength_tests(sync_status, updated_at);

-- 设备指标表
ALTER TABLE equipment_metrics 
ADD COLUMN sync_status ENUM('pending', 'synced', 'failed') DEFAULT 'pending' COMMENT '同步状态',
ADD COLUMN sync_version BIGINT DEFAULT 1 COMMENT '数据版本号',
ADD COLUMN last_sync_at TIMESTAMP NULL COMMENT '最后同步时间',
ADD COLUMN sync_hash VARCHAR(64) COMMENT '数据哈希值';

CREATE INDEX idx_metrics_sync_status ON equipment_metrics(sync_status, updated_at);

-- 物料变动记录表
ALTER TABLE material_transactions 
ADD COLUMN sync_status ENUM('pending', 'synced', 'failed') DEFAULT 'pending' COMMENT '同步状态',
ADD COLUMN sync_version BIGINT DEFAULT 1 COMMENT '数据版本号',
ADD COLUMN last_sync_at TIMESTAMP NULL COMMENT '最后同步时间',
ADD COLUMN sync_hash VARCHAR(64) COMMENT '数据哈希值';

CREATE INDEX idx_material_trans_sync_status ON material_transactions(sync_status, updated_at);

-- 计费记录表
ALTER TABLE billing_records 
ADD COLUMN sync_status ENUM('pending', 'synced', 'failed') DEFAULT 'pending' COMMENT '同步状态',
ADD COLUMN sync_version BIGINT DEFAULT 1 COMMENT '数据版本号',
ADD COLUMN last_sync_at TIMESTAMP NULL COMMENT '最后同步时间',
ADD COLUMN sync_hash VARCHAR(64) COMMENT '数据哈希值';

CREATE INDEX idx_billing_sync_status ON billing_records(sync_status, updated_at);

-- 告警记录表
ALTER TABLE alarms 
ADD COLUMN sync_status ENUM('pending', 'synced', 'failed') DEFAULT 'pending' COMMENT '同步状态',
ADD COLUMN sync_version BIGINT DEFAULT 1 COMMENT '数据版本号',
ADD COLUMN last_sync_at TIMESTAMP NULL COMMENT '最后同步时间',
ADD COLUMN sync_hash VARCHAR(64) COMMENT '数据哈希值';

CREATE INDEX idx_alarms_sync_status ON alarms(sync_status, updated_at);

-- 日生产统计表
ALTER TABLE daily_production_stats 
ADD COLUMN sync_status ENUM('pending', 'synced', 'failed') DEFAULT 'pending' COMMENT '同步状态',
ADD COLUMN sync_version BIGINT DEFAULT 1 COMMENT '数据版本号',
ADD COLUMN last_sync_at TIMESTAMP NULL COMMENT '最后同步时间',
ADD COLUMN sync_hash VARCHAR(64) COMMENT '数据哈希值';

CREATE INDEX idx_daily_stats_sync_status ON daily_production_stats(sync_status, updated_at);

-- 设备运行统计表
ALTER TABLE equipment_daily_stats 
ADD COLUMN sync_status ENUM('pending', 'synced', 'failed') DEFAULT 'pending' COMMENT '同步状态',
ADD COLUMN sync_version BIGINT DEFAULT 1 COMMENT '数据版本号',
ADD COLUMN last_sync_at TIMESTAMP NULL COMMENT '最后同步时间',
ADD COLUMN sync_hash VARCHAR(64) COMMENT '数据哈希值';

CREATE INDEX idx_equipment_stats_sync_status ON equipment_daily_stats(sync_status, updated_at);

-- ============================================================================
-- 2. 创建云边同步配置表
-- ============================================================================

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
    retry_delay INT DEFAULT 60 COMMENT '重试延迟（秒）',
    last_sync_time TIMESTAMP NULL COMMENT '最后同步时间',
    last_sync_status ENUM('success', 'failed', 'running') COMMENT '最后同步状态',
    last_error_message TEXT COMMENT '最后错误信息',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE,
    UNIQUE KEY uk_site_id (site_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='云边同步配置表';

-- ============================================================================
-- 3. 创建同步日志表
-- ============================================================================

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
    status ENUM('success', 'partial', 'failed') COMMENT '同步状态：success-全部成功，partial-部分成功，failed-全部失败',
    error_message TEXT COMMENT '错误信息',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE,
    INDEX idx_site_time (site_id, sync_time),
    INDEX idx_table_name (table_name),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='云边同步日志表';

-- ============================================================================
-- 4. 创建同步冲突记录表
-- ============================================================================

-- 同步冲突记录表
CREATE TABLE cloud_sync_conflicts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '冲突ID',
    site_id BIGINT NOT NULL COMMENT '站点ID',
    table_name VARCHAR(50) NOT NULL COMMENT '表名',
    record_id BIGINT NOT NULL COMMENT '记录ID',
    edge_data JSON COMMENT '边缘数据（JSON格式）',
    cloud_data JSON COMMENT '云端数据（JSON格式）',
    edge_version BIGINT COMMENT '边缘数据版本',
    cloud_version BIGINT COMMENT '云端数据版本',
    conflict_type ENUM('version', 'data', 'deleted') COMMENT '冲突类型：version-版本冲突，data-数据冲突，deleted-删除冲突',
    resolution ENUM('pending', 'use_edge', 'use_cloud', 'manual') DEFAULT 'pending' COMMENT '解决方案：pending-待处理，use_edge-使用边缘数据，use_cloud-使用云端数据，manual-人工处理',
    resolved_by BIGINT COMMENT '解决人ID',
    resolved_at TIMESTAMP NULL COMMENT '解决时间',
    resolution_note TEXT COMMENT '解决说明',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE,
    FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_site_table (site_id, table_name),
    INDEX idx_resolution (resolution),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='同步冲突记录表';

-- ============================================================================
-- 5. 创建同步表配置表
-- ============================================================================

-- 同步表配置表
CREATE TABLE cloud_sync_table_config (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '配置ID',
    site_id BIGINT NOT NULL COMMENT '站点ID',
    table_name VARCHAR(50) NOT NULL COMMENT '表名',
    enabled BOOLEAN DEFAULT TRUE COMMENT '是否启用同步',
    priority ENUM('high', 'medium', 'low') DEFAULT 'medium' COMMENT '同步优先级',
    realtime BOOLEAN DEFAULT FALSE COMMENT '是否实时同步',
    batch_interval INT COMMENT '批量同步间隔（秒），NULL表示使用全局配置',
    batch_size INT COMMENT '批量大小，NULL表示使用全局配置',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE,
    UNIQUE KEY uk_site_table (site_id, table_name),
    INDEX idx_enabled (enabled),
    INDEX idx_priority (priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='同步表配置表';

-- ============================================================================
-- 6. 创建触发器自动更新版本号
-- ============================================================================

-- 订单表触发器
DELIMITER $$
CREATE TRIGGER orders_before_update 
BEFORE UPDATE ON orders
FOR EACH ROW
BEGIN
    IF NEW.sync_status != OLD.sync_status OR 
       NEW.updated_at != OLD.updated_at THEN
        SET NEW.sync_version = OLD.sync_version + 1;
        IF NEW.sync_status != 'synced' THEN
            SET NEW.sync_status = 'pending';
        END IF;
    END IF;
END$$
DELIMITER ;

-- 任务表触发器
DELIMITER $$
CREATE TRIGGER tasks_before_update 
BEFORE UPDATE ON tasks
FOR EACH ROW
BEGIN
    IF NEW.sync_status != OLD.sync_status OR 
       NEW.updated_at != OLD.updated_at THEN
        SET NEW.sync_version = OLD.sync_version + 1;
        IF NEW.sync_status != 'synced' THEN
            SET NEW.sync_status = 'pending';
        END IF;
    END IF;
END$$
DELIMITER ;

-- 生产批次表触发器
DELIMITER $$
CREATE TRIGGER production_batches_before_update 
BEFORE UPDATE ON production_batches
FOR EACH ROW
BEGIN
    IF NEW.sync_status != OLD.sync_status OR 
       NEW.updated_at != OLD.updated_at THEN
        SET NEW.sync_version = OLD.sync_version + 1;
        IF NEW.sync_status != 'synced' THEN
            SET NEW.sync_status = 'pending';
        END IF;
    END IF;
END$$
DELIMITER ;

-- ============================================================================
-- 7. 插入默认配置数据
-- ============================================================================

-- 为每个站点插入默认同步配置（需要根据实际情况修改）
INSERT INTO cloud_sync_config (site_id, cloud_api_url, api_key, sync_enabled, sync_interval, batch_size)
SELECT 
    id,
    'https://cloud.example.com',  -- 修改为实际的云端API地址
    CONCAT('site_', id, '_', MD5(RAND())),  -- 生成临时API密钥，实际使用时需要替换
    TRUE,
    5,
    100
FROM sites
WHERE id NOT IN (SELECT site_id FROM cloud_sync_config);

-- 插入默认表同步配置
INSERT INTO cloud_sync_table_config (site_id, table_name, enabled, priority, realtime) 
SELECT s.id, t.table_name, t.enabled, t.priority, t.realtime
FROM sites s
CROSS JOIN (
    SELECT 'orders' as table_name, TRUE as enabled, 'high' as priority, TRUE as realtime
    UNION ALL SELECT 'tasks', TRUE, 'high', TRUE
    UNION ALL SELECT 'production_batches', TRUE, 'high', FALSE
    UNION ALL SELECT 'batching_records', TRUE, 'high', FALSE
    UNION ALL SELECT 'quality_tests', TRUE, 'medium', FALSE
    UNION ALL SELECT 'slump_tests', TRUE, 'medium', FALSE
    UNION ALL SELECT 'strength_tests', TRUE, 'medium', FALSE
    UNION ALL SELECT 'equipment_metrics', TRUE, 'low', FALSE
    UNION ALL SELECT 'material_transactions', TRUE, 'medium', FALSE
    UNION ALL SELECT 'billing_records', TRUE, 'medium', FALSE
    UNION ALL SELECT 'alarms', TRUE, 'medium', FALSE
    UNION ALL SELECT 'daily_production_stats', TRUE, 'low', FALSE
    UNION ALL SELECT 'equipment_daily_stats', TRUE, 'low', FALSE
) t
WHERE NOT EXISTS (
    SELECT 1 FROM cloud_sync_table_config 
    WHERE site_id = s.id AND table_name = t.table_name
);

-- ============================================================================
-- 8. 创建同步状态查询视图
-- ============================================================================

-- 同步状态汇总视图
CREATE OR REPLACE VIEW v_sync_status_summary AS
SELECT 
    s.id as site_id,
    s.name as site_name,
    s.code as site_code,
    c.sync_enabled,
    c.last_sync_time,
    c.last_sync_status,
    (SELECT COUNT(*) FROM orders WHERE site_id = s.id AND sync_status = 'pending') as orders_pending,
    (SELECT COUNT(*) FROM tasks WHERE site_id = s.id AND sync_status = 'pending') as tasks_pending,
    (SELECT COUNT(*) FROM production_batches WHERE site_id = s.id AND sync_status = 'pending') as batches_pending,
    (SELECT COUNT(*) FROM quality_tests WHERE site_id = s.id AND sync_status = 'pending') as quality_pending,
    (SELECT COUNT(*) FROM equipment_metrics WHERE site_id = s.id AND sync_status = 'pending') as metrics_pending,
    (SELECT COUNT(*) FROM cloud_sync_conflicts WHERE site_id = s.id AND resolution = 'pending') as conflicts_pending
FROM sites s
LEFT JOIN cloud_sync_config c ON s.id = c.site_id;

-- ============================================================================
-- 9. 创建存储过程
-- ============================================================================

-- 重置同步状态（用于测试或故障恢复）
DELIMITER $$
CREATE PROCEDURE sp_reset_sync_status(
    IN p_site_id BIGINT,
    IN p_table_name VARCHAR(50)
)
BEGIN
    DECLARE sql_stmt VARCHAR(500);
    
    SET sql_stmt = CONCAT(
        'UPDATE ', p_table_name, 
        ' SET sync_status = ''pending'', ',
        'sync_version = sync_version + 1, ',
        'last_sync_at = NULL ',
        'WHERE site_id = ', p_site_id
    );
    
    SET @sql = sql_stmt;
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
    
    SELECT CONCAT('Reset sync status for table: ', p_table_name) as result;
END$$
DELIMITER ;

-- 获取待同步数据统计
DELIMITER $$
CREATE PROCEDURE sp_get_pending_sync_stats(
    IN p_site_id BIGINT
)
BEGIN
    SELECT 
        'orders' as table_name,
        COUNT(*) as pending_count,
        MIN(updated_at) as oldest_update,
        MAX(updated_at) as latest_update
    FROM orders 
    WHERE site_id = p_site_id AND sync_status = 'pending'
    
    UNION ALL
    
    SELECT 
        'tasks',
        COUNT(*),
        MIN(updated_at),
        MAX(updated_at)
    FROM tasks 
    WHERE site_id = p_site_id AND sync_status = 'pending'
    
    UNION ALL
    
    SELECT 
        'production_batches',
        COUNT(*),
        MIN(updated_at),
        MAX(updated_at)
    FROM production_batches 
    WHERE site_id = p_site_id AND sync_status = 'pending'
    
    UNION ALL
    
    SELECT 
        'quality_tests',
        COUNT(*),
        MIN(updated_at),
        MAX(updated_at)
    FROM quality_tests 
    WHERE site_id = p_site_id AND sync_status = 'pending'
    
    UNION ALL
    
    SELECT 
        'equipment_metrics',
        COUNT(*),
        MIN(updated_at),
        MAX(updated_at)
    FROM equipment_metrics 
    WHERE site_id = p_site_id AND sync_status = 'pending';
END$$
DELIMITER ;

-- ============================================================================
-- 完成
-- ============================================================================

SELECT '云边同步支持已成功添加！' as message;
SELECT '请根据实际情况修改 cloud_sync_config 表中的 cloud_api_url 和 api_key' as note;
