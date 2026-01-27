# 站点管理模块文档

## 模块概述

站点管理模块是混凝土搅拌站管理系统的基础支持模块，负责管理生产站点、配送站点和混合站点的基本信息、状态和统计数据。该模块为其他业务模块提供站点数据支持。

## 功能特性

### 1. 站点管理
- ✅ 创建站点（支持3种类型）
- ✅ 查询站点列表（支持多条件筛选和分页）
- ✅ 查询站点详情（包含关联数据统计）
- ✅ 更新站点信息
- ✅ 删除站点（带关联数据检查）
- ✅ 更新站点状态（active/inactive/maintenance）

### 2. 站点类型
- ✅ 生产站点（production）- 混凝土生产
- ✅ 配送站点（distribution）- 物流配送
- ✅ 混合站点（mixed）- 生产+配送

### 3. 站点统计
- ✅ 全局统计（所有站点）
- ✅ 单站点统计（订单、批次、车辆、材料）
- ✅ 详细统计（包含今日数据和状态分布）

### 4. 地理位置功能
- ✅ 经纬度存储
- ✅ 附近站点查询（基于距离）
- ✅ 距离计算（Haversine公式）

### 5. 关联数据统计
- ✅ 订单数量
- ✅ 生产批次数量
- ✅ 任务数量
- ✅ 车辆数量
- ✅ 材料数量

## 数据模型

### 站点 (sites)

```typescript
{
  id: number;                    // 站点ID
  code: string;                  // 站点代码（唯一）
  name: string;                  // 站点名称
  type: string;                  // 站点类型：production/distribution/mixed
  address: string;               // 地址
  contact_person: string;        // 联系人
  contact_phone: string;         // 联系电话
  manager_id: number;            // 负责人ID
  latitude: number;              // 纬度
  longitude: number;             // 经度
  status: string;                // 状态：active/inactive/maintenance
  remarks: string;               // 备注
  created_at: Date;              // 创建时间
  updated_at: Date;              // 更新时间
}
```

## API 接口

### 1. 创建站点

**接口**: `POST /sites`

**权限**: admin, manager

**请求体**:
```json
{
  "code": "SH001",
  "name": "上海生产站点",
  "type": "production",
  "address": "上海市浦东新区XX路XX号",
  "contactPerson": "张三",
  "contactPhone": "13800138000",
  "managerId": 1,
  "latitude": 31.2304,
  "longitude": 121.4737,
  "remarks": "主要生产站点"
}
```

**响应**:
```json
{
  "id": 1,
  "code": "SH001",
  "name": "上海生产站点",
  "type": "production",
  "address": "上海市浦东新区XX路XX号",
  "contact_person": "张三",
  "contact_phone": "13800138000",
  "manager_id": 1,
  "latitude": 31.2304,
  "longitude": 121.4737,
  "status": "active",
  "remarks": "主要生产站点",
  "manager": {
    "id": 1,
    "username": "admin",
    "name": "管理员"
  },
  "created_at": "2026-01-26T10:00:00Z",
  "updated_at": "2026-01-26T10:00:00Z"
}
```

**说明**:
- 站点代码必须唯一
- 如果指定负责人，会验证负责人是否存在
- 新创建的站点默认状态为 active

### 2. 查询站点列表

**接口**: `GET /sites`

**查询参数**:
- `page`: 页码（默认：1）
- `limit`: 每页数量（默认：10）
- `sortBy`: 排序字段（默认：created_at）
- `sortOrder`: 排序方式（asc/desc，默认：desc）
- `code`: 站点代码（模糊查询）
- `name`: 站点名称（模糊查询）
- `type`: 站点类型（production/distribution/mixed）
- `status`: 状态（active/inactive/maintenance）
- `managerId`: 负责人ID

**响应**:
```json
{
  "data": [
    {
      "id": 1,
      "code": "SH001",
      "name": "上海生产站点",
      "type": "production",
      "address": "上海市浦东新区XX路XX号",
      "status": "active",
      "manager": {
        "id": 1,
        "username": "admin",
        "name": "管理员"
      },
      "_count": {
        "orders": 100,
        "tasks": 50,
        "production_batches": 200,
        "vehicles": 20,
        "materials": 30
      },
      "created_at": "2026-01-26T10:00:00Z"
    }
  ],
  "total": 10,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

### 3. 查询站点详情

**接口**: `GET /sites/:id`

**响应**:
```json
{
  "id": 1,
  "code": "SH001",
  "name": "上海生产站点",
  "type": "production",
  "address": "上海市浦东新区XX路XX号",
  "contact_person": "张三",
  "contact_phone": "13800138000",
  "manager_id": 1,
  "latitude": 31.2304,
  "longitude": 121.4737,
  "status": "active",
  "remarks": "主要生产站点",
  "manager": {
    "id": 1,
    "username": "admin",
    "name": "管理员",
    "phone": "13800138000",
    "email": "admin@example.com"
  },
  "_count": {
    "orders": 100,
    "tasks": 50,
    "production_batches": 200,
    "vehicles": 20,
    "materials": 30
  },
  "created_at": "2026-01-26T10:00:00Z",
  "updated_at": "2026-01-26T10:00:00Z"
}
```

### 4. 更新站点信息

**接口**: `PATCH /sites/:id`

**权限**: admin, manager

**请求体**:
```json
{
  "name": "上海生产站点（更新）",
  "contactPerson": "李四",
  "contactPhone": "13900139000",
  "status": "maintenance",
  "remarks": "维护中"
}
```

**说明**:
- 所有字段都是可选的
- 如果更新站点代码，会检查是否与其他站点冲突
- 如果更新负责人，会验证负责人是否存在

### 5. 删除站点

**接口**: `DELETE /sites/:id`

**权限**: admin

**响应**:
```json
{
  "message": "站点删除成功"
}
```

**说明**:
- 删除前会检查是否有关联数据（订单、批次、任务、车辆、材料）
- 如果存在关联数据，会返回错误提示
- 建议先删除或转移关联数据后再删除站点

### 6. 更新站点状态

**接口**: `PATCH /sites/:id/status`

**权限**: admin, manager

**请求体**:
```json
{
  "status": "maintenance"
}
```

**响应**:
```json
{
  "id": 1,
  "status": "maintenance",
  ...
}
```

**说明**:
- 状态可选值：active（运行中）、inactive（停用）、maintenance（维护中）

### 7. 获取站点统计

**接口**: `GET /sites/statistics`

**查询参数**:
- `id`: 站点ID（可选，不传则统计所有站点）

**响应**:
```json
{
  "totalSites": 10,
  "activeSites": 8,
  "inactiveSites": 1,
  "maintenanceSites": 1,
  "totalOrders": 1000,
  "totalBatches": 2000,
  "totalVehicles": 200,
  "totalMaterials": 300
}
```

### 8. 获取站点详细统计

**接口**: `GET /sites/:id/statistics`

**响应**:
```json
{
  "site": {
    "id": 1,
    "code": "SH001",
    "name": "上海生产站点",
    ...
  },
  "today": {
    "orders": 5,
    "batches": 8,
    "production": 85.5
  },
  "distribution": {
    "orders": [
      { "status": "pending", "_count": 10 },
      { "status": "confirmed", "_count": 15 },
      { "status": "completed", "_count": 75 }
    ],
    "tasks": [
      { "status": "pending", "_count": 5 },
      { "status": "in_progress", "_count": 3 },
      { "status": "completed", "_count": 42 }
    ],
    "vehicles": [
      { "status": "available", "_count": 15 },
      { "status": "in_use", "_count": 5 }
    ]
  },
  "alerts": {
    "lowStockMaterials": 3
  }
}
```

### 9. 查询附近站点

**接口**: `GET /sites/nearby`

**查询参数**:
- `latitude`: 纬度（必填）
- `longitude`: 经度（必填）
- `radius`: 半径（km，默认：50）

**响应**:
```json
[
  {
    "id": 1,
    "code": "SH001",
    "name": "上海生产站点",
    "type": "production",
    "address": "上海市浦东新区XX路XX号",
    "latitude": 31.2304,
    "longitude": 121.4737,
    "status": "active",
    "manager": { ... },
    "distance": 5.2
  },
  {
    "id": 2,
    "code": "SH002",
    "name": "上海配送站点",
    "distance": 12.8
  }
]
```

**说明**:
- 只返回状态为 active 的站点
- 结果按距离从近到远排序
- 使用 Haversine 公式计算实际距离

## 业务规则

### 站点代码规则
- 必须唯一
- 建议格式：城市代码 + 序号（如：SH001）
- 不可修改为已存在的代码

### 站点类型说明
- **production**: 生产站点，主要用于混凝土生产
- **distribution**: 配送站点，主要用于物流配送
- **mixed**: 混合站点，同时具备生产和配送功能

### 站点状态说明
- **active**: 运行中，可正常使用
- **inactive**: 已停用，不可使用
- **maintenance**: 维护中，暂时不可使用

### 删除限制
- 存在关联订单时不可删除
- 存在关联任务时不可删除
- 存在关联批次时不可删除
- 存在关联车辆时不可删除
- 存在关联材料时不可删除

## 使用场景

### 1. 站点管理
```typescript
// 创建新站点
const site = await fetch('/sites', {
  method: 'POST',
  body: JSON.stringify({
    code: 'SH001',
    name: '上海生产站点',
    type: 'production',
    address: '上海市浦东新区XX路XX号',
    contactPerson: '张三',
    contactPhone: '13800138000',
    managerId: 1,
    latitude: 31.2304,
    longitude: 121.4737
  })
});

// 查询站点列表
const sites = await fetch('/sites?type=production&status=active');

// 更新站点状态
await fetch('/sites/1/status', {
  method: 'PATCH',
  body: JSON.stringify({ status: 'maintenance' })
});
```

### 2. 站点统计
```typescript
// 获取所有站点统计
const stats = await fetch('/sites/statistics');
console.log(`总站点数: ${stats.totalSites}`);
console.log(`运行中: ${stats.activeSites}`);

// 获取单个站点详细统计
const detailedStats = await fetch('/sites/1/statistics');
console.log(`今日订单: ${detailedStats.today.orders}`);
console.log(`今日产量: ${detailedStats.today.production}m³`);
```

### 3. 附近站点查询
```typescript
// 查询附近50km内的站点
const nearbySites = await fetch(
  '/sites/nearby?latitude=31.2304&longitude=121.4737&radius=50'
);

nearbySites.forEach(site => {
  console.log(`${site.name} - 距离: ${site.distance}km`);
});
```

### 4. 站点选择器
```typescript
// 获取所有运行中的站点用于下拉选择
const activeSites = await fetch('/sites?status=active&limit=100');

// 渲染选择器
activeSites.data.forEach(site => {
  console.log(`${site.code} - ${site.name}`);
});
```

## 性能优化

### 1. 查询优化
- 使用 Prisma include 预加载关联数据
- 使用 _count 进行关联数据计数
- 合理使用分页避免一次性加载过多数据

### 2. 索引建议
建议在以下字段创建索引：
- `code` - 唯一索引
- `status` - 普通索引
- `type` - 普通索引
- `manager_id` - 普通索引
- `latitude, longitude` - 复合索引（用于地理查询）

### 3. 距离计算优化
- 先使用矩形范围过滤（快速）
- 再使用 Haversine 公式精确计算（慢）
- 对于大量站点，可考虑使用地理空间数据库

## 错误处理

### 常见错误码

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| 404 | 站点不存在 | 检查站点ID是否正确 |
| 404 | 负责人不存在 | 检查负责人ID是否正确 |
| 409 | 站点代码已存在 | 使用不同的站点代码 |
| 400 | 站点存在关联数据 | 先删除或转移关联数据 |

## 扩展功能建议

### 未来可能的扩展
1. 站点容量管理（最大产能、存储容量）
2. 站点工作时间配置
3. 站点设备管理
4. 站点人员管理
5. 站点成本核算
6. 站点绩效评估
7. 站点间调度优化
8. 地图可视化展示

## 总结

站点管理模块实现了：
- ✅ 完整的站点CRUD操作
- ✅ 灵活的站点类型和状态管理
- ✅ 全面的统计功能（全局和单站点）
- ✅ 实用的地理位置功能（附近站点查询）
- ✅ 严格的关联数据检查
- ✅ 完善的权限控制

该模块为整个系统提供了可靠的站点数据支持，是其他业务模块的基础。
