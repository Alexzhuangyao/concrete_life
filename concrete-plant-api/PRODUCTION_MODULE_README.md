# 生产管理模块文档

## 模块概述

生产管理模块是混凝土搅拌站管理系统的核心业务模块之一，负责管理生产批次、配料记录和生产统计。该模块实现了从生产计划到生产完成的全流程管理。

## 功能特性

### 1. 生产批次管理
- ✅ 创建生产批次（自动生成批次号）
- ✅ 查询批次列表（支持多条件筛选和分页）
- ✅ 查询批次详情（包含完整的配料记录）
- ✅ 更新批次信息
- ✅ 开始生产（状态流转）
- ✅ 完成生产（记录实际产量）
- ✅ 批次状态管理（待生产、生产中、已完成、已取消）

### 2. 配料记录管理
- ✅ 自动根据配方创建配料记录
- ✅ 手动创建配料记录
- ✅ 更新实际用量
- ✅ 自动计算偏差率
- ✅ 记录操作人员信息

### 3. 生产统计
- ✅ 批次数量统计（总数、待生产、生产中、已完成）
- ✅ 总产量统计
- ✅ 支持按站点和时间范围筛选

## 数据模型

### 生产批次 (production_batches)

```typescript
{
  id: number;                    // 批次ID
  site_id: number;               // 站点ID
  order_id: number;              // 订单ID
  recipe_id: number;             // 配方ID
  batch_number: string;          // 批次号（自动生成）
  planned_quantity: number;      // 计划产量（立方米）
  actual_quantity: number;       // 实际产量（立方米）
  status: string;                // 状态：pending/in_progress/completed/cancelled
  start_time: Date;              // 开始时间
  end_time: Date;                // 结束时间
  operator_id: number;           // 操作员ID
  remarks: string;               // 备注
  created_at: Date;              // 创建时间
  updated_at: Date;              // 更新时间
}
```

### 配料记录 (batch_records)

```typescript
{
  id: number;                    // 记录ID
  batch_id: number;              // 批次ID
  material_id: number;           // 材料ID
  planned_quantity: number;      // 计划用量（kg）
  actual_quantity: number;       // 实际用量（kg）
  deviation: number;             // 偏差率（%）
  operator_id: number;           // 操作员ID
  remarks: string;               // 备注
  created_at: Date;              // 创建时间
  updated_at: Date;              // 更新时间
}
```

## API 接口

### 1. 创建生产批次

**接口**: `POST /production/batches`

**请求体**:
```json
{
  "siteId": 1,
  "orderId": 1,
  "recipeId": 1,
  "plannedQuantity": 10.5,
  "records": [
    {
      "materialId": 1,
      "plannedQuantity": 350,
      "actualQuantity": 352,
      "remarks": "水泥"
    }
  ],
  "remarks": "紧急订单"
}
```

**响应**:
```json
{
  "id": 1,
  "site_id": 1,
  "order_id": 1,
  "recipe_id": 1,
  "batch_number": "PC202601260001",
  "planned_quantity": 10.5,
  "actual_quantity": 0,
  "status": "pending",
  "operator_id": 1,
  "remarks": "紧急订单",
  "site": { ... },
  "order": { ... },
  "recipe": { ... },
  "operator": { ... },
  "records": [ ... ]
}
```

**说明**:
- 批次号格式：PC + 日期(YYYYMMDD) + 4位序号
- 如果不提供 records，系统会根据配方自动创建配料记录
- 只能使用已发布状态的配方

### 2. 查询批次列表

**接口**: `GET /production/batches`

**查询参数**:
- `page`: 页码（默认：1）
- `limit`: 每页数量（默认：10）
- `sortBy`: 排序字段（默认：created_at）
- `sortOrder`: 排序方式（asc/desc，默认：desc）
- `siteId`: 站点ID
- `orderId`: 订单ID
- `recipeId`: 配方ID
- `status`: 状态（pending/in_progress/completed/cancelled）
- `batchNumber`: 批次号（模糊查询）
- `startDate`: 开始日期
- `endDate`: 结束日期

**响应**:
```json
{
  "data": [
    {
      "id": 1,
      "batch_number": "PC202601260001",
      "planned_quantity": 10.5,
      "actual_quantity": 10.3,
      "status": "completed",
      "site": { ... },
      "order": { ... },
      "recipe": { ... },
      "operator": { ... },
      "_count": {
        "records": 5
      }
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 10,
  "totalPages": 10
}
```

### 3. 查询批次详情

**接口**: `GET /production/batches/:id`

**响应**:
```json
{
  "id": 1,
  "batch_number": "PC202601260001",
  "planned_quantity": 10.5,
  "actual_quantity": 10.3,
  "status": "completed",
  "start_time": "2026-01-26T08:00:00Z",
  "end_time": "2026-01-26T09:30:00Z",
  "site": { ... },
  "order": { ... },
  "recipe": {
    "id": 1,
    "name": "C30标准配方",
    "grade": { ... },
    "details": [
      {
        "material": { ... },
        "quantity": 350
      }
    ]
  },
  "operator": { ... },
  "records": [
    {
      "id": 1,
      "material_id": 1,
      "planned_quantity": 350,
      "actual_quantity": 352,
      "deviation": 0.57,
      "material": { ... },
      "operator": { ... }
    }
  ]
}
```

### 4. 更新批次信息

**接口**: `PATCH /production/batches/:id`

**请求体**:
```json
{
  "plannedQuantity": 11.0,
  "actualQuantity": 10.8,
  "status": "in_progress",
  "startTime": "2026-01-26T08:00:00Z",
  "endTime": "2026-01-26T09:30:00Z",
  "remarks": "更新备注"
}
```

**说明**:
- 已完成的批次不能修改
- 所有字段都是可选的

### 5. 开始生产

**接口**: `POST /production/batches/:id/start`

**响应**:
```json
{
  "id": 1,
  "status": "in_progress",
  "start_time": "2026-01-26T08:00:00Z",
  ...
}
```

**说明**:
- 只能开始状态为 pending 的批次
- 自动记录开始时间

### 6. 完成生产

**接口**: `POST /production/batches/:id/complete`

**请求体**:
```json
{
  "actualQuantity": 10.3
}
```

**响应**:
```json
{
  "id": 1,
  "status": "completed",
  "actual_quantity": 10.3,
  "end_time": "2026-01-26T09:30:00Z",
  ...
}
```

**说明**:
- 只能完成状态为 in_progress 的批次
- 必须所有配料记录都已完成（actual_quantity > 0）
- 自动记录结束时间

### 7. 创建配料记录

**接口**: `POST /production/records`

**请求体**:
```json
{
  "batchId": 1,
  "materialId": 1,
  "plannedQuantity": 350,
  "actualQuantity": 352,
  "remarks": "水泥"
}
```

**响应**:
```json
{
  "id": 1,
  "batch_id": 1,
  "material_id": 1,
  "planned_quantity": 350,
  "actual_quantity": 352,
  "deviation": 0.57,
  "operator_id": 1,
  "batch": { ... },
  "material": { ... },
  "operator": { ... }
}
```

**说明**:
- 已完成的批次不能添加配料记录
- 系统自动计算偏差率：(实际用量 - 计划用量) / 计划用量 × 100%

### 8. 更新配料记录

**接口**: `PATCH /production/records/:id`

**请求体**:
```json
{
  "actualQuantity": 352
}
```

**响应**:
```json
{
  "id": 1,
  "actual_quantity": 352,
  "deviation": 0.57,
  ...
}
```

**说明**:
- 已完成批次的配料记录不能修改
- 系统自动重新计算偏差率

### 9. 获取生产统计

**接口**: `GET /production/statistics`

**查询参数**:
- `siteId`: 站点ID（可选）
- `startDate`: 开始日期（可选）
- `endDate`: 结束日期（可选）

**响应**:
```json
{
  "totalBatches": 100,
  "pendingBatches": 10,
  "inProgressBatches": 5,
  "completedBatches": 85,
  "totalProduction": 1050.5
}
```

## 业务流程

### 生产批次生命周期

```
1. 创建批次 (pending)
   ↓
2. 开始生产 (in_progress)
   ↓
3. 配料记录更新
   ↓
4. 完成生产 (completed)
```

### 配料记录流程

```
1. 创建批次时自动生成配料记录（根据配方）
   ↓
2. 生产过程中更新实际用量
   ↓
3. 系统自动计算偏差率
   ↓
4. 所有配料记录完成后才能完成批次
```

## 业务规则

### 批次管理规则
1. 批次号自动生成，格式：PC + 日期 + 序号
2. 只能使用已发布状态的配方
3. 已完成的批次不能修改
4. 完成批次前必须完成所有配料记录

### 配料记录规则
1. 自动根据配方创建配料记录
2. 支持手动添加额外的配料记录
3. 自动计算偏差率
4. 已完成批次的配料记录不能修改

### 状态流转规则
- pending → in_progress：开始生产
- in_progress → completed：完成生产
- 任何状态 → cancelled：取消生产

## 错误处理

### 常见错误码

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| 404 | 订单/配方/批次不存在 | 检查ID是否正确 |
| 400 | 只能使用已发布的配方 | 确保配方状态为 published |
| 400 | 已完成的批次不能修改 | 检查批次状态 |
| 400 | 只能开始待生产的批次 | 检查批次状态是否为 pending |
| 400 | 只能完成进行中的批次 | 检查批次状态是否为 in_progress |
| 400 | 还有配料记录未完成 | 完成所有配料记录后再完成批次 |

## 性能优化

### 数据库查询优化
1. 使用 Prisma 的 include 预加载关联数据
2. 批量查询使用分页
3. 统计查询使用聚合函数
4. 合理使用索引（batch_number, status, created_at）

### 事务处理
- 创建批次和配料记录使用事务保证数据一致性

## 使用示例

### 完整的生产流程示例

```typescript
// 1. 创建生产批次
const batch = await fetch('/production/batches', {
  method: 'POST',
  body: JSON.stringify({
    siteId: 1,
    orderId: 1,
    recipeId: 1,
    plannedQuantity: 10.5,
    remarks: '紧急订单'
  })
});

// 2. 开始生产
await fetch(`/production/batches/${batch.id}/start`, {
  method: 'POST'
});

// 3. 更新配料记录
for (const record of batch.records) {
  await fetch(`/production/records/${record.id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      actualQuantity: record.planned_quantity + 2 // 实际用量
    })
  });
}

// 4. 完成生产
await fetch(`/production/batches/${batch.id}/complete`, {
  method: 'POST',
  body: JSON.stringify({
    actualQuantity: 10.3 // 实际产量
  })
});

// 5. 查看统计
const stats = await fetch('/production/statistics?siteId=1');
```

## 数据验证

### 创建批次验证
- siteId: 必填，数字
- orderId: 必填，数字
- recipeId: 必填，数字
- plannedQuantity: 必填，数字，≥0
- records: 可选，数组
- remarks: 可选，字符串

### 配料记录验证
- batchId: 必填，数字
- materialId: 必填，数字
- plannedQuantity: 必填，数字，≥0
- actualQuantity: 可选，数字，≥0
- remarks: 可选，字符串

## 扩展功能建议

### 未来可能的扩展
1. 质量检测记录
2. 生产异常记录
3. 设备使用记录
4. 能耗统计
5. 生产效率分析
6. 配料偏差预警
7. 生产计划排程
8. 实时生产监控

## 总结

生产管理模块实现了混凝土搅拌站的核心生产流程管理，包括：
- ✅ 完整的批次生命周期管理
- ✅ 精确的配料记录跟踪
- ✅ 实时的生产统计分析
- ✅ 严格的业务规则控制
- ✅ 完善的错误处理机制

该模块为混凝土搅拌站提供了可靠的生产管理解决方案。
