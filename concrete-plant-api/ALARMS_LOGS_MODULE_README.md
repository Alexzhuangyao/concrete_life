# 告警管理模块文档

## 模块概述

告警管理模块是混凝土搅拌站管理系统的重要支持模块，负责监控系统运行状态，及时发现和处理异常情况。该模块实现了告警的自动检测、创建、通知和处理全流程管理。

## 功能特性

### 1. 告警管理
- ✅ 创建告警（手动/自动）
- ✅ 查询告警列表（支持多条件筛选和分页）
- ✅ 查询告警详情
- ✅ 更新告警信息
- ✅ 删除告警

### 2. 告警类型
- ✅ 低库存告警（low_stock）
- ✅ 车辆故障告警（vehicle_fault）
- ✅ 设备故障告警（equipment_fault）
- ✅ 任务超时告警（task_timeout）
- ✅ 质量问题告警（quality_issue）
- ✅ 系统错误告警（system_error）
- ✅ 其他告警（other）

### 3. 告警级别
- ✅ 紧急（critical）- 需要立即处理
- ✅ 高（high）- 需要尽快处理
- ✅ 中（medium）- 需要关注
- ✅ 低（low）- 一般提醒

### 4. 告警状态
- ✅ 待处理（pending）
- ✅ 已确认（acknowledged）
- ✅ 已解决（resolved）
- ✅ 已忽略（ignored）

### 5. 告警处理
- ✅ 确认告警
- ✅ 解决告警
- ✅ 忽略告警
- ✅ 批量确认
- ✅ 批量解决

### 6. 自动检测
- ✅ 低库存材料检测
- ✅ 车辆故障检测
- ✅ 任务超时检测
- ✅ 自动创建告警

### 7. 统计分析
- ✅ 告警总数统计
- ✅ 按状态统计
- ✅ 按级别统计
- ✅ 按类型统计
- ✅ 最近告警查询

## API 接口

### 1. 创建告警

**接口**: `POST /alarms`

**权限**: admin, manager

**请求体**:
```json
{
  "type": "low_stock",
  "level": "high",
  "title": "材料库存不足",
  "message": "水泥库存不足，当前库存：500kg，最小库存：1000kg",
  "source": "material",
  "sourceId": 1,
  "siteId": 1,
  "data": {
    "materialId": 1,
    "materialName": "水泥",
    "currentStock": 500,
    "minStock": 1000
  }
}
```

### 2. 查询告警列表

**接口**: `GET /alarms`

**查询参数**:
- `page`: 页码
- `limit`: 每页数量
- `type`: 告警类型
- `level`: 告警级别
- `status`: 告警状态
- `source`: 来源类型
- `siteId`: 站点ID
- `startDate`: 开始日期
- `endDate`: 结束日期

### 3. 确认告警

**接口**: `POST /alarms/:id/acknowledge`

**权限**: admin, manager, operator

**请求体**:
```json
{
  "remarks": "已通知相关人员处理"
}
```

### 4. 解决告警

**接口**: `POST /alarms/:id/resolve`

**权限**: admin, manager, operator

**请求体**:
```json
{
  "solution": "已补充库存，问题已解决"
}
```

### 5. 忽略告警

**接口**: `POST /alarms/:id/ignore`

**权限**: admin, manager

**请求体**:
```json
{
  "reason": "误报，实际库存充足"
}
```

### 6. 批量确认告警

**接口**: `POST /alarms/batch-acknowledge`

**请求体**:
```json
{
  "ids": [1, 2, 3],
  "remarks": "批量确认"
}
```

### 7. 批量解决告警

**接口**: `POST /alarms/batch-resolve`

**请求体**:
```json
{
  "ids": [1, 2, 3],
  "solution": "批量解决"
}
```

### 8. 自动检查并创建告警

**接口**: `POST /alarms/check`

**权限**: admin, manager

**说明**: 系统自动检查低库存、车辆故障、任务超时等情况，并创建相应告警

### 9. 获取告警统计

**接口**: `GET /alarms/statistics`

**查询参数**:
- `siteId`: 站点ID（可选）
- `startDate`: 开始日期（可选）
- `endDate`: 结束日期（可选）

### 10. 获取最近告警

**接口**: `GET /alarms/recent`

**查询参数**:
- `limit`: 数量限制（默认：10）
- `siteId`: 站点ID（可选）

## 自动检测规则

### 1. 低库存检测
- **触发条件**: 材料当前库存 ≤ 最小库存
- **告警级别**: 
  - 当前库存 ≤ 最小库存 × 50%: high
  - 当前库存 ≤ 最小库存: medium
- **检测频率**: 建议每小时检测一次

### 2. 车辆故障检测
- **触发条件**: 车辆状态为 fault
- **告警级别**: high
- **检测频率**: 实时检测

### 3. 任务超时检测
- **触发条件**: 任务创建超过4小时仍未完成
- **告警级别**: medium
- **检测频率**: 建议每30分钟检测一次

## 使用场景

### 1. 库存预警
```typescript
// 自动检测低库存并创建告警
const result = await fetch('/alarms/check', { method: 'POST' });
console.log(`创建了 ${result.count} 条新告警`);
```

### 2. 告警处理流程
```typescript
// 1. 查询待处理告警
const alarms = await fetch('/alarms?status=pending&level=high');

// 2. 确认告警
await fetch(`/alarms/${alarmId}/acknowledge`, {
  method: 'POST',
  body: JSON.stringify({ remarks: '正在处理' })
});

// 3. 处理问题...

// 4. 解决告警
await fetch(`/alarms/${alarmId}/resolve`, {
  method: 'POST',
  body: JSON.stringify({ solution: '问题已解决' })
});
```

### 3. 批量处理
```typescript
// 批量确认多个告警
await fetch('/alarms/batch-acknowledge', {
  method: 'POST',
  body: JSON.stringify({
    ids: [1, 2, 3, 4, 5],
    remarks: '批量确认处理'
  })
});
```

### 4. 统计分析
```typescript
// 获取告警统计
const stats = await fetch('/alarms/statistics?siteId=1');
console.log(`待处理: ${stats.byStatus.pending}`);
console.log(`紧急告警: ${stats.byLevel.critical}`);
```

## 定时任务建议

建议使用定时任务定期检查系统状态并创建告警：

```typescript
// 使用 @nestjs/schedule
import { Cron, CronExpression } from '@nestjs/schedule';

@Cron(CronExpression.EVERY_HOUR)
async handleCron() {
  await this.alarmsService.checkAndCreateAlarms();
}
```

## 扩展功能建议

### 未来可能的扩展
1. 告警通知（邮件、短信、推送）
2. 告警规则配置
3. 告警升级机制
4. 告警报表
5. 告警趋势分析
6. 告警关联分析
7. 自定义告警规则
8. 告警模板管理

---

# 日志管理模块文档

## 模块概述

日志管理模块负责记录系统中所有用户操作，提供完整的审计追踪功能。该模块自动记录所有修改操作，支持日志查询、统计和导出。

## 功能特性

### 1. 自动记录
- ✅ 自动记录所有修改操作（POST, PUT, PATCH, DELETE）
- ✅ 记录操作用户
- ✅ 记录操作时间
- ✅ 记录IP地址和User-Agent
- ✅ 记录请求详情

### 2. 日志查询
- ✅ 分页查询
- ✅ 按用户筛选
- ✅ 按操作类型筛选
- ✅ 按模块筛选
- ✅ 按时间范围筛选

### 3. 统计分析
- ✅ 总日志数统计
- ✅ 按模块统计
- ✅ 按操作类型统计
- ✅ 活跃用户统计
- ✅ 今日统计

### 4. 历史查询
- ✅ 用户操作历史
- ✅ 模块操作历史
- ✅ 最近操作记录

### 5. 日志管理
- ✅ 删除过期日志
- ✅ 导出日志

## API 接口

### 1. 查询日志列表

**接口**: `GET /logs`

**权限**: admin, manager

**查询参数**:
- `page`: 页码
- `limit`: 每页数量
- `userId`: 用户ID
- `action`: 操作类型
- `module`: 模块名称
- `startDate`: 开始日期
- `endDate`: 结束日期

### 2. 查询日志详情

**接口**: `GET /logs/:id`

**权限**: admin, manager

### 3. 获取日志统计

**接口**: `GET /logs/statistics`

**权限**: admin, manager

**查询参数**:
- `startDate`: 开始日期（可选）
- `endDate`: 结束日期（可选）

### 4. 获取今日统计

**接口**: `GET /logs/today`

**权限**: admin, manager

### 5. 获取最近日志

**接口**: `GET /logs/recent`

**权限**: admin, manager

**查询参数**:
- `limit`: 数量限制（默认：10）

### 6. 获取用户操作历史

**接口**: `GET /logs/user/:userId`

**权限**: admin, manager

**查询参数**:
- `limit`: 数量限制（默认：20）

### 7. 获取模块操作历史

**接口**: `GET /logs/module/:module`

**权限**: admin, manager

**查询参数**:
- `limit`: 数量限制（默认：20）

### 8. 导出日志

**接口**: `GET /logs/export`

**权限**: admin, manager

**查询参数**: 与查询日志列表相同

### 9. 删除过期日志

**接口**: `DELETE /logs/expired`

**权限**: admin

**查询参数**:
- `days`: 保留天数（默认：90天）

## 自动记录机制

### LoggingInterceptor

系统使用拦截器自动记录所有修改操作：

```typescript
// 自动记录以下操作
- POST: 创建操作
- PUT/PATCH: 更新操作
- DELETE: 删除操作

// 记录内容
- 用户ID
- 操作类型
- 模块名称
- 操作描述
- 请求详情（method, url, body）
- IP地址
- User-Agent
- 响应时间
```

### 排除规则

以下接口不记录日志：
- GET 请求（查询操作）
- `/auth/login` - 登录接口
- `/auth/register` - 注册接口

## 使用场景

### 1. 审计追踪
```typescript
// 查询某用户的所有操作
const logs = await fetch('/logs?userId=1&startDate=2026-01-01&endDate=2026-01-31');

// 查看操作详情
logs.data.forEach(log => {
  console.log(`${log.user.name} 在 ${log.created_at} ${log.description}`);
});
```

### 2. 安全审计
```typescript
// 查询删除操作
const deleteLogs = await fetch('/logs?action=delete');

// 查询特定模块的操作
const orderLogs = await fetch('/logs/module/orders');
```

### 3. 用户行为分析
```typescript
// 获取活跃用户
const stats = await fetch('/logs/statistics');
console.log('Top 10 活跃用户:', stats.topUsers);

// 获取今日统计
const today = await fetch('/logs/today');
console.log(`今日操作数: ${today.total}`);
```

### 4. 日志维护
```typescript
// 删除90天前的日志
await fetch('/logs/expired?days=90', { method: 'DELETE' });

// 导出日志
const logs = await fetch('/logs/export?startDate=2026-01-01&endDate=2026-01-31');
```

## 日志保留策略

建议的日志保留策略：
- **操作日志**: 保留90天
- **安全日志**: 保留180天
- **审计日志**: 保留1年

可以使用定时任务自动清理过期日志：

```typescript
@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
async cleanupLogs() {
  await this.logsService.deleteExpiredLogs(90);
}
```

## 总结

告警和日志管理模块为系统提供了：
- ✅ 完整的告警监控和处理机制
- ✅ 自动化的异常检测
- ✅ 全面的操作审计追踪
- ✅ 灵活的查询和统计功能
- ✅ 完善的权限控制

这两个模块是系统运维和安全管理的重要基础设施。
