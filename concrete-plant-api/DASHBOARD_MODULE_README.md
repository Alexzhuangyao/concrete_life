# 仪表盘模块文档

## 模块概述

仪表盘模块是混凝土搅拌站管理系统的数据展示中心，提供全面的数据概览、趋势分析和实时监控功能。该模块整合了订单、生产、任务、车辆、材料等各个业务模块的数据，为管理者提供直观的决策支持。

## 功能特性

### 1. 数据概览
- ✅ 订单统计（总数、今日、待处理、已完成）
- ✅ 生产统计（批次数、今日产量、进行中批次）
- ✅ 任务统计（总数、待分配、进行中、已完成）
- ✅ 车辆统计（总数、可用、使用中）
- ✅ 材料统计（总数、低库存预警）
- ✅ 最近记录（订单、批次、任务）

### 2. 趋势分析
- ✅ 生产趋势图（最近N天的批次数和产量）
- ✅ 订单趋势图（最近N天的订单数）
- ✅ 可自定义天数（默认7天）

### 3. 状态分布
- ✅ 订单状态分布（饼图数据）
- ✅ 任务状态分布（饼图数据）
- ✅ 车辆利用率统计

### 4. 预警信息
- ✅ 低库存材料列表（前10个）
- ✅ 库存率计算
- ✅ 缺货量计算

### 5. 实时数据
- ✅ 进行中的生产批次
- ✅ 进行中的任务
- ✅ 使用中的车辆
- ✅ 实时时间戳

### 6. 月度统计
- ✅ 月度订单数
- ✅ 月度批次数
- ✅ 月度总产量
- ✅ 月度任务数
- ✅ 任务完成率

## API 接口

### 1. 获取数据概览

**接口**: `GET /dashboard/overview`

**查询参数**:
- `siteId`: 站点ID（可选）

**响应**:
```json
{
  "orders": {
    "total": 100,
    "today": 5,
    "pending": 10,
    "completed": 80,
    "recent": [
      {
        "id": 1,
        "order_number": "ORD20260126001",
        "customer": { ... },
        "site": { ... },
        "status": "confirmed",
        "created_at": "2026-01-26T08:00:00Z"
      }
    ]
  },
  "production": {
    "totalBatches": 200,
    "todayBatches": 8,
    "inProgressBatches": 2,
    "todayProduction": 85.5,
    "recent": [
      {
        "id": 1,
        "batch_number": "PC202601260001",
        "order": { ... },
        "recipe": { ... },
        "status": "completed",
        "actual_quantity": 10.5
      }
    ]
  },
  "tasks": {
    "total": 150,
    "pending": 5,
    "inProgress": 3,
    "completed": 140,
    "recent": [
      {
        "id": 1,
        "order": { ... },
        "vehicle": { ... },
        "driver": { ... },
        "status": "in_progress"
      }
    ]
  },
  "vehicles": {
    "total": 20,
    "available": 15,
    "inUse": 5
  },
  "materials": {
    "total": 50,
    "lowStock": 3
  }
}
```

### 2. 获取生产趋势

**接口**: `GET /dashboard/production-trend`

**查询参数**:
- `siteId`: 站点ID（可选）
- `days`: 天数（默认：7）

**响应**:
```json
[
  {
    "date": "2026-01-20",
    "batches": 10,
    "production": 105.5
  },
  {
    "date": "2026-01-21",
    "batches": 12,
    "production": 125.0
  },
  ...
]
```

### 3. 获取订单趋势

**接口**: `GET /dashboard/order-trend`

**查询参数**:
- `siteId`: 站点ID（可选）
- `days`: 天数（默认：7）

**响应**:
```json
[
  {
    "date": "2026-01-20",
    "orders": 5
  },
  {
    "date": "2026-01-21",
    "orders": 8
  },
  ...
]
```

### 4. 获取订单状态分布

**接口**: `GET /dashboard/order-status-distribution`

**查询参数**:
- `siteId`: 站点ID（可选）

**响应**:
```json
[
  {
    "status": "pending",
    "count": 10,
    "label": "待确认"
  },
  {
    "status": "confirmed",
    "count": 15,
    "label": "已确认"
  },
  {
    "status": "in_production",
    "count": 5,
    "label": "生产中"
  },
  {
    "status": "completed",
    "count": 80,
    "label": "已完成"
  },
  {
    "status": "cancelled",
    "count": 2,
    "label": "已取消"
  }
]
```

### 5. 获取任务状态分布

**接口**: `GET /dashboard/task-status-distribution`

**查询参数**:
- `siteId`: 站点ID（可选）

**响应**:
```json
[
  {
    "status": "pending",
    "count": 5,
    "label": "待分配"
  },
  {
    "status": "assigned",
    "count": 3,
    "label": "已分配"
  },
  {
    "status": "in_progress",
    "count": 2,
    "label": "进行中"
  },
  {
    "status": "loading",
    "count": 1,
    "label": "装载中"
  },
  {
    "status": "transporting",
    "count": 1,
    "label": "运输中"
  },
  {
    "status": "unloading",
    "count": 1,
    "label": "卸载中"
  },
  {
    "status": "completed",
    "count": 140,
    "label": "已完成"
  }
]
```

### 6. 获取车辆利用率

**接口**: `GET /dashboard/vehicle-utilization`

**查询参数**:
- `siteId`: 站点ID（可选）

**响应**:
```json
{
  "total": 20,
  "available": 15,
  "inUse": 5,
  "maintenance": 0,
  "fault": 0,
  "utilizationRate": "25.00",
  "availableRate": "75.00"
}
```

### 7. 获取低库存材料

**接口**: `GET /dashboard/low-stock-materials`

**查询参数**:
- `siteId`: 站点ID（可选）

**响应**:
```json
[
  {
    "id": 1,
    "name": "水泥",
    "current_stock": 500,
    "min_stock": 1000,
    "unit": "kg",
    "stockRate": "50.00",
    "shortage": 500
  },
  {
    "id": 2,
    "name": "砂",
    "current_stock": 800,
    "min_stock": 2000,
    "unit": "kg",
    "stockRate": "40.00",
    "shortage": 1200
  }
]
```

### 8. 获取实时数据

**接口**: `GET /dashboard/realtime`

**查询参数**:
- `siteId`: 站点ID（可选）

**响应**:
```json
{
  "production": [
    {
      "id": 1,
      "batch_number": "PC202601260001",
      "order": { ... },
      "recipe": { ... },
      "status": "in_progress",
      "start_time": "2026-01-26T08:00:00Z"
    }
  ],
  "tasks": [
    {
      "id": 1,
      "order": { ... },
      "vehicle": { ... },
      "driver": { ... },
      "status": "in_progress"
    }
  ],
  "vehicles": [
    {
      "id": 1,
      "plate_number": "粤A12345",
      "status": "in_use",
      "tasks": [
        {
          "id": 1,
          "status": "in_progress"
        }
      ]
    }
  ],
  "timestamp": "2026-01-26T10:30:00Z"
}
```

### 9. 获取月度统计

**接口**: `GET /dashboard/monthly-statistics`

**查询参数**:
- `siteId`: 站点ID（可选）
- `year`: 年份（可选，默认当前年）
- `month`: 月份（可选，默认当前月）

**响应**:
```json
{
  "year": 2026,
  "month": 1,
  "orders": 100,
  "batches": 200,
  "production": 2100.5,
  "tasks": 150,
  "completedTasks": 140,
  "taskCompletionRate": "93.33"
}
```

## 数据来源

### 订单数据
- 来源：`orders` 表
- 统计维度：总数、今日、状态分布
- 关联：客户、站点

### 生产数据
- 来源：`production_batches` 表
- 统计维度：批次数、产量、状态
- 关联：订单、配方、站点

### 任务数据
- 来源：`tasks` 表
- 统计维度：总数、状态分布
- 关联：订单、车辆、司机

### 车辆数据
- 来源：`vehicles` 表
- 统计维度：总数、状态分布、利用率
- 关联：任务

### 材料数据
- 来源：`materials` 表
- 统计维度：总数、低库存预警
- 计算：库存率、缺货量

## 性能优化

### 1. 并行查询
- 使用 `Promise.all()` 并行执行多个查询
- 减少总查询时间
- 提高响应速度

### 2. 数据聚合
- 使用 Prisma 的 `aggregate` 进行数据聚合
- 在数据库层面完成计算
- 减少数据传输量

### 3. 限制返回数量
- 最近记录限制为5条
- 低库存材料限制为10条
- 避免返回过多数据

### 4. 索引优化
建议在以下字段创建索引：
- `orders.created_at`
- `orders.status`
- `production_batches.created_at`
- `production_batches.status`
- `tasks.created_at`
- `tasks.status`
- `vehicles.status`
- `materials.current_stock`

## 使用场景

### 1. 管理驾驶舱
```typescript
// 获取完整的数据概览
const overview = await fetch('/dashboard/overview?siteId=1');

// 显示关键指标
console.log(`今日订单: ${overview.orders.today}`);
console.log(`今日产量: ${overview.production.todayProduction}m³`);
console.log(`进行中任务: ${overview.tasks.inProgress}`);
console.log(`可用车辆: ${overview.vehicles.available}`);
console.log(`低库存材料: ${overview.materials.lowStock}`);
```

### 2. 趋势分析
```typescript
// 获取最近7天的生产趋势
const productionTrend = await fetch('/dashboard/production-trend?days=7');

// 绘制趋势图
const dates = productionTrend.map(d => d.date);
const batches = productionTrend.map(d => d.batches);
const production = productionTrend.map(d => d.production);
```

### 3. 状态监控
```typescript
// 获取订单状态分布
const orderDistribution = await fetch('/dashboard/order-status-distribution');

// 绘制饼图
const labels = orderDistribution.map(d => d.label);
const data = orderDistribution.map(d => d.count);
```

### 4. 预警提醒
```typescript
// 获取低库存材料
const lowStockMaterials = await fetch('/dashboard/low-stock-materials');

// 显示预警
lowStockMaterials.forEach(material => {
  if (material.stockRate < 50) {
    console.warn(`${material.name} 库存不足，当前库存率: ${material.stockRate}%`);
  }
});
```

### 5. 实时监控
```typescript
// 定时获取实时数据（每30秒）
setInterval(async () => {
  const realtime = await fetch('/dashboard/realtime');
  
  console.log(`进行中的生产批次: ${realtime.production.length}`);
  console.log(`进行中的任务: ${realtime.tasks.length}`);
  console.log(`使用中的车辆: ${realtime.vehicles.length}`);
  console.log(`更新时间: ${realtime.timestamp}`);
}, 30000);
```

### 6. 月度报表
```typescript
// 获取当月统计
const monthly = await fetch('/dashboard/monthly-statistics');

console.log(`${monthly.year}年${monthly.month}月统计报表`);
console.log(`订单数: ${monthly.orders}`);
console.log(`生产批次: ${monthly.batches}`);
console.log(`总产量: ${monthly.production}m³`);
console.log(`任务完成率: ${monthly.taskCompletionRate}%`);
```

## 前端集成建议

### 1. 数据刷新策略
- 概览数据：每分钟刷新一次
- 趋势数据：每5分钟刷新一次
- 实时数据：每30秒刷新一次
- 月度统计：手动刷新或每小时刷新

### 2. 图表库推荐
- **ECharts**: 功能强大，适合复杂图表
- **Chart.js**: 轻量级，适合简单图表
- **Recharts**: React专用，组件化设计

### 3. 布局建议
```
+------------------+------------------+------------------+
|   今日订单: 5    |  今日产量: 85m³  |  进行中任务: 3   |
+------------------+------------------+------------------+
|   可用车辆: 15   |  低库存材料: 3   |  车辆利用率: 25% |
+------------------+------------------+------------------+
|                                                        |
|              生产趋势图（折线图）                       |
|                                                        |
+------------------+------------------+------------------+
|  订单状态分布    |  任务状态分布    |  车辆利用率      |
|   （饼图）       |   （饼图）       |   （环形图）     |
+------------------+------------------+------------------+
|  最近订单        |  最近批次        |  低库存材料      |
|  （列表）        |  （列表）        |  （列表）        |
+------------------+------------------+------------------+
```

## 扩展功能建议

### 未来可能的扩展
1. **自定义仪表盘**
   - 用户可自定义显示的指标
   - 拖拽式布局调整
   - 保存个人配置

2. **高级分析**
   - 同比/环比分析
   - 预测分析
   - 异常检测

3. **导出功能**
   - 导出为PDF报表
   - 导出为Excel
   - 定时邮件发送

4. **告警功能**
   - 低库存告警
   - 生产异常告警
   - 任务延迟告警

5. **多维度分析**
   - 按客户分析
   - 按配方分析
   - 按时间段分析

## 总结

仪表盘模块实现了：
- ✅ 全面的数据概览（5大业务维度）
- ✅ 直观的趋势分析（生产、订单）
- ✅ 清晰的状态分布（订单、任务）
- ✅ 实用的预警功能（低库存）
- ✅ 实时的数据监控（生产、任务、车辆）
- ✅ 完整的月度统计（6项指标）
- ✅ 高性能的查询优化（并行查询、数据聚合）

该模块为管理者提供了全面、直观、实时的数据支持，是系统的核心展示中心。
