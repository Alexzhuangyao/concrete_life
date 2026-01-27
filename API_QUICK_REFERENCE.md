# 🔌 API接口快速参考

## 📋 目录

- [认证模块 (11个接口)](#认证模块)
- [订单模块 (7个接口)](#订单模块)
- [任务模块 (8个接口)](#任务模块)
- [车辆模块 (8个接口)](#车辆模块)

**总计**: 34个API接口

---

## 🔐 认证模块

### 基础路径: `/api/auth` 和 `/api/users`

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | `/api/auth/register` | 用户注册 | 公开 |
| POST | `/api/auth/login` | 用户登录 | 公开 |
| GET | `/api/auth/profile` | 获取当前用户信息 | 需登录 |
| PATCH | `/api/auth/change-password` | 修改密码 | 需登录 |
| GET | `/api/auth/validate` | 验证Token | 需登录 |
| POST | `/api/users` | 创建用户 | admin, manager |
| GET | `/api/users` | 查询用户列表 | admin, manager |
| GET | `/api/users/:id` | 查询单个用户 | admin, manager |
| PATCH | `/api/users/:id` | 更新用户 | admin, manager |
| DELETE | `/api/users/:id` | 删除用户 | admin |
| PATCH | `/api/users/:id/toggle-status` | 启用/禁用用户 | admin |

### 用户角色
- `admin` - 系统管理员
- `manager` - 站点管理员
- `operator` - 操作员
- `driver` - 司机
- `quality` - 质检员
- `viewer` - 查看者

---

## 📦 订单模块

### 基础路径: `/api/orders`

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | `/api/orders` | 创建订单 | admin, manager, operator |
| GET | `/api/orders` | 查询订单列表 | 需登录 |
| GET | `/api/orders/statistics` | 获取订单统计 | 需登录 |
| GET | `/api/orders/:id` | 查询单个订单 | 需登录 |
| PATCH | `/api/orders/:id` | 更新订单 | admin, manager, operator |
| PATCH | `/api/orders/:id/status` | 更新订单状态 | admin, manager, operator |
| DELETE | `/api/orders/:id` | 删除订单 | admin, manager |

### 订单状态
- `pending` - 待确认
- `confirmed` - 已确认
- `in_production` - 生产中
- `completed` - 已完成
- `cancelled` - 已取消

### 查询参数示例
```
GET /api/orders?page=1&limit=10&status=confirmed&siteId=1
```

---

## 📋 任务模块

### 基础路径: `/api/tasks`

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | `/api/tasks` | 创建任务 | admin, manager, operator |
| GET | `/api/tasks` | 查询任务列表 | 需登录 |
| GET | `/api/tasks/statistics` | 获取任务统计 | 需登录 |
| GET | `/api/tasks/:id` | 查询单个任务 | 需登录 |
| PATCH | `/api/tasks/:id` | 更新任务 | admin, manager, operator |
| PATCH | `/api/tasks/:id/assign` | 分配任务 | admin, manager, operator |
| PATCH | `/api/tasks/:id/status` | 更新任务状态 | admin, manager, operator, driver |
| DELETE | `/api/tasks/:id` | 删除任务 | admin, manager |

### 任务状态
- `pending` - 待分配
- `assigned` - 已分配
- `in_progress` - 进行中
- `loading` - 装载中
- `transporting` - 运输中
- `completed` - 已完成
- `cancelled` - 已取消

### 优先级
- `urgent` - 紧急
- `high` - 高
- `medium` - 中
- `low` - 低

### 查询参数示例
```
GET /api/tasks?page=1&limit=10&status=assigned&priority=high
```

---

## 🚗 车辆模块

### 基础路径: `/api/vehicles`

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | `/api/vehicles` | 创建车辆 | admin, manager |
| GET | `/api/vehicles` | 查询车辆列表 | 需登录 |
| GET | `/api/vehicles/statistics` | 获取车辆统计 | 需登录 |
| GET | `/api/vehicles/available` | 获取可用车辆 | 需登录 |
| GET | `/api/vehicles/:id` | 查询单个车辆 | 需登录 |
| PATCH | `/api/vehicles/:id` | 更新车辆 | admin, manager |
| PATCH | `/api/vehicles/:id/status` | 更新车辆状态 | admin, manager, operator |
| DELETE | `/api/vehicles/:id` | 删除车辆 | admin, manager |

### 车辆类型
- `mixer_truck` - 搅拌车
- `pump_truck` - 泵车
- `other` - 其他

### 车辆状态
- `available` - 可用
- `in_use` - 使用中
- `maintenance` - 维护中
- `broken` - 故障

### 查询参数示例
```
GET /api/vehicles?page=1&limit=10&status=available&vehicleType=mixer_truck
```

---

## 🔑 认证方式

### JWT Token

所有需要认证的接口都需要在请求头中携带Token：

```http
Authorization: Bearer <your_jwt_token>
```

### 获取Token

```bash
# 登录获取Token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# 响应
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  }
}
```

### 使用Token

```bash
# 使用Token访问受保护的接口
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 📝 请求示例

### 1. 用户注册
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123",
    "name": "测试用户",
    "role": "operator"
  }'
```

### 2. 创建订单
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "siteId": 1,
    "customerId": 1,
    "concreteGrade": "C30",
    "quantity": 100,
    "deliveryAddress": "北京市朝阳区",
    "deliveryTime": "2026-01-27T10:00:00Z",
    "contactPerson": "张三",
    "contactPhone": "13800138000"
  }'
```

### 3. 创建任务
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "orderId": 1,
    "siteId": 1,
    "taskType": "delivery",
    "priority": "high",
    "scheduledTime": "2026-01-27T10:00:00Z",
    "deliveryAddress": "北京市朝阳区",
    "quantity": 10
  }'
```

### 4. 分配任务
```bash
curl -X PATCH http://localhost:3000/api/tasks/1/assign \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "vehicleId": 1,
    "driverId": 2
  }'
```

### 5. 创建车辆
```bash
curl -X POST http://localhost:3000/api/vehicles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "siteId": 1,
    "licensePlate": "京A12345",
    "vehicleType": "mixer_truck",
    "brand": "三一重工",
    "model": "SY5310GJB",
    "capacity": 10,
    "status": "available"
  }'
```

### 6. 查询统计数据
```bash
# 订单统计
curl -X GET "http://localhost:3000/api/orders/statistics?siteId=1" \
  -H "Authorization: Bearer $TOKEN"

# 任务统计
curl -X GET "http://localhost:3000/api/tasks/statistics?siteId=1" \
  -H "Authorization: Bearer $TOKEN"

# 车辆统计
curl -X GET "http://localhost:3000/api/vehicles/statistics?siteId=1" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🔍 查询参数说明

### 通用分页参数
- `page` - 页码（默认1）
- `limit` - 每页数量（默认10）
- `sortBy` - 排序字段（默认created_at）
- `sortOrder` - 排序方向（asc/desc，默认desc）

### 订单查询参数
- `siteId` - 站点ID
- `customerId` - 客户ID
- `status` - 订单状态
- `concreteGrade` - 混凝土等级
- `startDate` - 开始日期
- `endDate` - 结束日期

### 任务查询参数
- `siteId` - 站点ID
- `orderId` - 订单ID
- `status` - 任务状态
- `priority` - 优先级
- `vehicleId` - 车辆ID
- `driverId` - 司机ID
- `taskType` - 任务类型

### 车辆查询参数
- `siteId` - 站点ID
- `licensePlate` - 车牌号（模糊搜索）
- `vehicleType` - 车辆类型
- `status` - 车辆状态
- `responsibleUserId` - 负责人ID

---

## 📊 响应格式

### 成功响应

#### 单个资源
```json
{
  "id": 1,
  "name": "资源名称",
  "status": "active",
  "created_at": "2026-01-26T10:00:00.000Z"
}
```

#### 列表资源（分页）
```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "limit": 10,
  "totalPages": 10
}
```

#### 统计数据
```json
{
  "totalCount": 100,
  "statusCount": {
    "pending": 20,
    "confirmed": 30,
    "completed": 50
  }
}
```

### 错误响应

```json
{
  "statusCode": 400,
  "message": "错误信息",
  "error": "Bad Request"
}
```

### 常见状态码
- `200` - 成功
- `201` - 创建成功
- `400` - 请求参数错误
- `401` - 未授权（未登录或Token无效）
- `403` - 禁止访问（权限不足）
- `404` - 资源不存在
- `409` - 冲突（如重复创建）
- `500` - 服务器错误

---

## 🧪 测试工具

### 使用curl测试
```bash
# 设置Token变量
TOKEN="your_jwt_token_here"

# 测试接口
curl -X GET http://localhost:3000/api/orders \
  -H "Authorization: Bearer $TOKEN"
```

### 使用测试脚本
```bash
# 运行认证模块测试
./test-scripts/test-auth.sh

# 运行订单模块测试
./test-scripts/test-orders.sh

# 运行车辆模块测试
./test-scripts/test-vehicles.sh

# 运行所有模块测试
./test-scripts/test-all-modules.sh
```

### 使用Postman
1. 导入API集合
2. 设置环境变量 `{{baseUrl}}` = `http://localhost:3000/api`
3. 设置环境变量 `{{token}}` = 登录后获取的Token
4. 在请求头中使用 `Authorization: Bearer {{token}}`

---

## 📚 相关文档

- 📄 `AUTH_MODULE_README.md` - 认证模块详细文档
- 📄 `ORDERS_MODULE_README.md` - 订单模块详细文档
- 📄 `TASKS_MODULE_README.md` - 任务模块详细文档
- 📄 `VEHICLES_MODULE_README.md` - 车辆模块详细文档
- 📄 `COMPREHENSIVE_TEST_GUIDE.md` - 综合测试指南

---

## 🔗 快速链接

- [项目首页](README.md)
- [快速开始](QUICK_START.md)
- [第一阶段报告](PHASE_ONE_REPORT.md)
- [模块清单](TODO_MODULES.md)

---

**最后更新**: 2026-01-26  
**API版本**: v1.0.0  
**接口总数**: 34个
