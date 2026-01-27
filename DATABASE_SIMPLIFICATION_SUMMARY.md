# 数据库简化总结

## 📋 变更概述

本次数据库简化删除了12张表，将数据库从原来的39张表精简到27张表，使系统更加简洁高效。

## 🗑️ 已删除的表

### 1. 设备配件表 (equipment_parts)
- **原因**: 简化设备管理，配件管理可以通过其他方式实现
- **影响**: 不再跟踪设备配件的详细信息和寿命

### 2. 设备分配关系表 (equipment_assignments)
- **原因**: 简化设备与人员的关系管理
- **替代方案**: 在设备表中添加 `responsible_person` 字段直接记录负责人
- **影响**: 不再记录历史分配记录，只保留当前负责人

### 3. 排队管理表 (queue)
- **原因**: 简化车辆调度流程
- **影响**: 不再跟踪车辆排队和装车的详细时间节点

### 4. 远端配置表 (remote_configs)
- **原因**: 使用云边同步方案替代
- **替代方案**: 使用 `cloud_sync_config` 表
- **影响**: 远端订单同步功能由云边同步统一管理

### 5. 远端订单日志表 (remote_order_logs)
- **原因**: 使用云边同步方案替代
- **替代方案**: 使用 `cloud_sync_logs` 表
- **影响**: 同步日志统一管理

### 6. 质量检测记录表 (quality_tests)
- **原因**: 简化质量管理流程
- **影响**: 不再记录通用质量检测数据

### 7. 坍落度检测表 (slump_tests)
- **原因**: 简化质量检测流程
- **影响**: 不再单独记录坍落度检测数据

### 8. 强度检测表 (strength_tests)
- **原因**: 简化质量检测流程
- **影响**: 不再单独记录强度检测数据

### 9. 计费记录表 (billing_records)
- **原因**: 简化财务管理
- **影响**: 计费信息可以从订单表中获取

### 10. 对账记录表 (reconciliation_records)
- **原因**: 简化财务管理
- **影响**: 不再记录月度对账信息

### 11. 设备运行统计表 (equipment_daily_stats)
- **原因**: 简化统计功能
- **影响**: 设备运行数据可以从 `equipment_metrics` 表实时计算

### 12. 用户角色关联表 (user_roles)
- **原因**: 简化用户角色管理
- **替代方案**: 在用户表中直接添加 `role_id` 字段
- **影响**: 用户只能有一个角色，不再支持多角色或多站点角色

## ✨ 新增字段

### equipment 表
- **新增字段**: `responsible_user_id BIGINT` - 负责人用户ID
- **用途**: 直接关联到 users 表，记录设备的当前负责人
- **外键**: FOREIGN KEY (responsible_user_id) REFERENCES users(id) ON DELETE SET NULL
- **优势**: 可以通过 JOIN 查询获取负责人的完整信息

### users 表
- **新增字段**: `role_id BIGINT` - 角色ID
- **用途**: 直接记录用户的角色，替代原来的用户角色关联表
- **外键**: FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL

## 📊 数据库结构对比

| 项目 | 修改前 | 修改后 | 变化 |
|------|--------|--------|------|
| 总表数 | 39 | 27 | -12 |
| 基础管理表 | 4 | 3 | -1 |
| 设备管理表 | 5 | 2 | -3 |
| 订单任务表 | 5 | 3 | -2 |
| 物料管理表 | 7 | 7 | 0 |
| 生产控制表 | 3 | 3 | 0 |
| 质量计费表 | 5 | 0 | -5 |
| 日志告警表 | 5 | 5 | 0 |
| 系统配置表 | 2 | 2 | 0 |
| 统计分析表 | 3 | 2 | -1 |

## 📁 已更新的文件

### 数据库架构文件
1. ✅ `database-schema.sql` - MySQL 数据库架构
2. ✅ `database-schema-sqlite.sql` - SQLite 数据库架构

### 云边同步相关文件
3. ✅ `migrations/add-cloud-sync-support.sql` - 同步支持迁移脚本
4. ✅ `packages/core/src/services/cloud-sync.service.ts` - 同步服务代码

### 文档文件
5. ✅ `database-design-tasks.md` - 数据库设计文档
6. ✅ `CLOUD_EDGE_SYNC_DESIGN.md` - 云边同步设计文档
7. ✅ `CLOUD_SYNC_SUMMARY.md` - 云边同步总结文档
8. ✅ `CLOUD_SYNC_QUICKSTART.md` - 云边同步快速开始文档

## 🔄 云边同步表列表（更新后）

现在支持同步的表共 **8 张**：

1. ✅ `orders` - 订单数据（高优先级，实时同步）
2. ✅ `tasks` - 任务数据（高优先级，实时同步）
3. ✅ `production_batches` - 生产批次（高优先级，批量同步）
4. ✅ `batching_records` - 配料记录（高优先级，批量同步）
5. ✅ `equipment_metrics` - 设备指标（低优先级，批量同步）
6. ✅ `material_transactions` - 物料变动（中优先级，批量同步）
7. ✅ `alarms` - 告警记录（中优先级，批量同步）
8. ✅ `daily_production_stats` - 日生产统计（低优先级，批量同步）

## 📝 角色权限更新

### 修改前
- 生产操作员: `["production.*", "quality.*"]`
- 调度员: `["order.*", "task.*", "queue.*"]`
- 司机: `["task.view", "queue.view"]`

### 修改后
- 生产操作员: `["production.*"]` - 移除 quality 权限
- 调度员: `["order.*", "task.*"]` - 移除 queue 权限
- 司机: `["task.view"]` - 移除 queue 权限

## 🎯 核心表结构（27张表）

### 1. 基础管理表 (3张)
- `sites` - 站点信息
- `users` - 用户信息（含 role_id 字段）
- `roles` - 角色权限

### 2. 设备管理表 (2张)
- `equipment` - 设备基本信息（含 responsible_user_id 字段）
- `equipment_metrics` - 设备运行指标

### 3. 订单任务表 (3张)
- `orders` - 订单主表
- `order_items` - 订单明细
- `tasks` - 任务派单

### 4. 物料管理表 (7张)
- `materials` - 原材料信息
- `material_stocks` - 原材料库存
- `material_transactions` - 库存变动记录
- `concrete_grades` - 混凝土等级
- `recipes` - 配方主表
- `recipe_items` - 配方明细
- `strategies` - 自动矫正策略

### 5. 生产控制表 (3张)
- `production_batches` - 生产批次
- `batching_records` - 配料记录
- `production_components` - 生产控制布局

### 6. 日志告警表 (5张)
- `operation_logs` - 操作日志
- `alarms` - 告警记录
- `alarm_rules` - 告警规则
- `alarm_notifications` - 告警通知
- `alarm_subscriptions` - 告警订阅

### 7. 系统配置表 (2张)
- `system_settings` - 系统配置
- `dictionaries` - 数据字典

### 8. 统计分析表 (2张)
- `daily_production_stats` - 日生产统计
- `monthly_production_stats` - 月生产统计

## 💡 迁移建议

### 对于现有数据
如果您已经有生产数据，建议：

1. **备份数据**: 在执行任何迁移前，完整备份现有数据库
2. **数据迁移**: 
   - 将 `equipment_assignments` 表中的当前分配关系迁移到 `equipment.responsible_person` 字段
   - 导出需要保留的历史数据（如质量检测、计费记录等）到归档表或文件
3. **测试验证**: 在测试环境中验证所有功能正常工作
4. **逐步迁移**: 建议先在测试环境运行一段时间，确认无问题后再迁移生产环境

### 迁移脚本示例

```sql
-- 1. 备份数据
CREATE TABLE equipment_assignments_backup AS SELECT * FROM equipment_assignments;
CREATE TABLE quality_tests_backup AS SELECT * FROM quality_tests;
CREATE TABLE user_roles_backup AS SELECT * FROM user_roles;
-- ... 其他需要备份的表

-- 2. 迁移设备负责人数据
UPDATE equipment e
SET responsible_user_id = (
    SELECT user_id 
    FROM equipment_assignments ea
    WHERE ea.equipment_id = e.id 
    AND ea.status = 'active'
    ORDER BY ea.assigned_date DESC
    LIMIT 1
);

-- 3. 迁移用户角色数据（取用户的第一个角色）
UPDATE users u
SET role_id = (
    SELECT role_id 
    FROM user_roles ur
    WHERE ur.user_id = u.id
    ORDER BY ur.created_at ASC
    LIMIT 1
);

-- 4. 删除旧表（确认数据已备份后执行）
-- DROP TABLE equipment_parts;
-- DROP TABLE equipment_assignments;
-- DROP TABLE user_roles;
-- ... 其他表
```

## ✅ 验证清单

- [x] MySQL 数据库架构已更新（27张表）
- [x] SQLite 数据库架构已更新（27张表）
- [x] 设备表已添加 responsible_user_id 字段（外键关联到 users 表）
- [x] 用户表已添加 role_id 字段
- [x] 用户角色关联表已删除
- [x] 云边同步迁移脚本已更新（8张表）
- [x] 云边同步服务代码已更新（8张表）
- [x] 所有文档已更新
- [x] 角色权限已更新
- [x] 初始化数据已更新

## 🚀 下一步

1. **测试验证**: 在测试环境中创建数据库并验证所有功能
2. **应用开发**: 根据新的数据库结构调整应用代码
3. **数据迁移**: 如有现有数据，执行数据迁移脚本
4. **部署上线**: 在生产环境中部署新的数据库结构

## 📞 注意事项

- 所有删除的表的数据将无法恢复，请务必在删除前做好备份
- 如果后续需要恢复某些功能，可以参考备份文件重新创建相应的表
- 云边同步功能已相应调整，只同步保留的8张核心业务表
- 建议在应用层面实现必要的业务逻辑补偿（如设备配件管理、质量检测等）

---

**变更日期**: 2026-01-23  
**变更人**: 系统管理员  
**版本**: v2.0 - 简化版
