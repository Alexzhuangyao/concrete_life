# 用户认证模块文档

## 概述

用户认证模块已完成实现，包含完整的 JWT 认证、用户管理、角色权限控制等功能。

## 技术栈

- **NestJS**: 后端框架
- **JWT**: JSON Web Token 认证
- **Passport**: 认证中间件
- **bcrypt**: 密码加密
- **class-validator**: 数据验证
- **Prisma**: ORM 数据库操作

## 目录结构

```
src/
├── auth/                           # 认证模块
│   ├── decorators/                 # 装饰器
│   │   ├── current-user.decorator.ts   # 获取当前用户
│   │   ├── public.decorator.ts         # 公开接口标记
│   │   └── roles.decorator.ts          # 角色权限标记
│   ├── dto/                        # 数据传输对象
│   │   ├── login.dto.ts               # 登录 DTO
│   │   ├── register.dto.ts            # 注册 DTO
│   │   └── change-password.dto.ts     # 修改密码 DTO
│   ├── guards/                     # 守卫
│   │   ├── jwt-auth.guard.ts          # JWT 认证守卫
│   │   └── roles.guard.ts             # 角色权限守卫
│   ├── strategies/                 # 策略
│   │   └── jwt.strategy.ts            # JWT 策略
│   ├── auth.controller.ts          # 认证控制器
│   ├── auth.service.ts             # 认证服务
│   └── auth.module.ts              # 认证模块
│
├── users/                          # 用户模块
│   ├── dto/                        # 数据传输对象
│   │   ├── create-user.dto.ts         # 创建用户 DTO
│   │   └── update-user.dto.ts         # 更新用户 DTO
│   ├── users.controller.ts         # 用户控制器
│   ├── users.service.ts            # 用户服务
│   └── users.module.ts             # 用户模块
│
└── prisma/                         # Prisma 模块
    ├── prisma.service.ts           # Prisma 服务
    └── prisma.module.ts            # Prisma 模块
```

## 核心功能

### 1. 认证功能 (AuthModule)

#### 1.1 用户登录
- **接口**: `POST /api/auth/login`
- **权限**: 公开
- **功能**: 
  - 验证用户名和密码
  - 检查用户状态
  - 生成 JWT Token
  - 记录登录日志

**请求示例**:
```json
{
  "username": "admin",
  "password": "123456"
}
```

**响应示例**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "name": "管理员",
    "email": "admin@example.com",
    "userType": "admin",
    "siteId": 1,
    "roleId": 1,
    "role": { ... },
    "site": { ... }
  }
}
```

#### 1.2 用户注册
- **接口**: `POST /api/auth/register`
- **权限**: 公开
- **功能**:
  - 验证用户名唯一性
  - 验证站点和角色存在性
  - 加密密码
  - 创建用户
  - 生成 JWT Token

**请求示例**:
```json
{
  "username": "operator01",
  "password": "123456",
  "name": "操作员01",
  "email": "operator01@example.com",
  "phone": "13800138000",
  "userType": "operator",
  "siteId": 1,
  "roleId": 2
}
```

#### 1.3 获取当前用户信息
- **接口**: `GET /api/auth/profile`
- **权限**: 需要登录
- **功能**: 获取当前登录用户的详细信息

#### 1.4 修改密码
- **接口**: `PATCH /api/auth/change-password`
- **权限**: 需要登录
- **功能**:
  - 验证原密码
  - 更新为新密码

**请求示例**:
```json
{
  "oldPassword": "123456",
  "newPassword": "654321"
}
```

#### 1.5 验证 Token
- **接口**: `GET /api/auth/validate`
- **权限**: 需要登录
- **功能**: 验证当前 Token 是否有效

### 2. 用户管理功能 (UsersModule)

#### 2.1 创建用户
- **接口**: `POST /api/users`
- **权限**: admin, manager
- **功能**: 创建新用户

#### 2.2 查询用户列表
- **接口**: `GET /api/users`
- **权限**: 需要登录
- **功能**: 分页查询用户列表，支持筛选

**查询参数**:
- `page`: 页码（默认 1）
- `limit`: 每页数量（默认 10）
- `siteId`: 站点 ID
- `userType`: 用户类型
- `status`: 用户状态

**响应示例**:
```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "limit": 10,
  "totalPages": 10
}
```

#### 2.3 查询单个用户
- **接口**: `GET /api/users/:id`
- **权限**: 需要登录
- **功能**: 获取指定用户的详细信息

#### 2.4 更新用户
- **接口**: `PATCH /api/users/:id`
- **权限**: admin, manager
- **功能**: 更新用户信息

#### 2.5 删除用户
- **接口**: `DELETE /api/users/:id`
- **权限**: admin
- **功能**: 软删除用户（设置为 inactive 状态）

#### 2.6 启用/禁用用户
- **接口**: `PATCH /api/users/:id/toggle-status`
- **权限**: admin, manager
- **功能**: 切换用户的启用/禁用状态

## 安全特性

### 1. 密码安全
- 使用 bcrypt 加密密码（10 轮加盐）
- 密码最小长度 6 位
- 不返回密码哈希值

### 2. JWT 认证
- Token 有效期 24 小时
- 自动验证 Token 有效性
- 验证用户状态（必须为 active）

### 3. 全局守卫
- 默认所有接口需要认证
- 使用 `@Public()` 装饰器标记公开接口
- 使用 `@Roles()` 装饰器控制角色权限

### 4. 数据验证
- 使用 class-validator 验证所有输入
- 自动过滤非白名单字段
- 自动类型转换

## 装饰器使用

### @Public()
标记接口为公开，不需要认证：
```typescript
@Public()
@Post('login')
async login(@Body() loginDto: LoginDto) {
  return this.authService.login(loginDto);
}
```

### @Roles()
限制接口只能由特定角色访问：
```typescript
@Roles('admin', 'manager')
@Post()
create(@Body() createUserDto: CreateUserDto) {
  return this.usersService.create(createUserDto);
}
```

### @CurrentUser()
获取当前登录用户信息：
```typescript
@Get('profile')
async getProfile(@CurrentUser() user: any) {
  return { user };
}

// 获取特定字段
@Get('my-id')
async getMyId(@CurrentUser('userId') userId: number) {
  return { userId };
}
```

## 用户类型

系统支持以下用户类型：
- `admin`: 管理员
- `operator`: 操作员
- `driver`: 司机
- `quality`: 质检员
- `manager`: 经理
- `maintenance`: 维护人员

## 环境变量配置

在 `.env` 文件中配置：

```env
# JWT 配置
JWT_SECRET="your-secret-key-here"
JWT_EXPIRES_IN="24h"

# 数据库配置
DATABASE_URL="mysql://root:password@localhost:3306/concrete_plant"

# CORS 配置
CORS_ORIGIN="*"
```

## 使用示例

### 前端登录流程

```typescript
// 1. 登录
const response = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'admin',
    password: '123456',
  }),
});

const { accessToken, user } = await response.json();

// 2. 保存 Token
localStorage.setItem('accessToken', accessToken);

// 3. 后续请求携带 Token
const usersResponse = await fetch('http://localhost:3000/api/users', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
});

const users = await usersResponse.json();
```

## 测试建议

### 1. 创建测试用户

首先需要在数据库中创建站点和角色：

```sql
-- 创建站点
INSERT INTO sites (name, code, type, status) 
VALUES ('测试站点', 'TEST001', 'mixing', 'active');

-- 创建角色
INSERT INTO roles (name, code, description) 
VALUES ('管理员', 'ADMIN', '系统管理员');
```

### 2. 注册第一个用户

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "123456",
    "name": "管理员",
    "email": "admin@example.com",
    "userType": "admin",
    "siteId": 1,
    "roleId": 1
  }'
```

### 3. 测试登录

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "123456"
  }'
```

### 4. 测试受保护的接口

```bash
# 使用返回的 Token
TOKEN="your-access-token-here"

curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer $TOKEN"
```

## 错误处理

系统会返回标准的 HTTP 状态码和错误信息：

- `400 Bad Request`: 请求参数验证失败
- `401 Unauthorized`: 未认证或认证失败
- `403 Forbidden`: 无权限访问
- `404 Not Found`: 资源不存在
- `409 Conflict`: 资源冲突（如用户名已存在）
- `500 Internal Server Error`: 服务器内部错误

**错误响应示例**:
```json
{
  "statusCode": 401,
  "message": "用户名或密码错误",
  "error": "Unauthorized"
}
```

## 下一步

认证模块已完成，可以继续实现其他业务模块：

1. **订单管理模块** - 混凝土订单的创建、查询、状态管理
2. **任务调度模块** - 生产任务的分配和调度
3. **设备管理模块** - 设备信息、状态监控
4. **物料管理模块** - 物料库存、出入库管理
5. **配方管理模块** - 混凝土配方的管理
6. **生产管理模块** - 生产批次、配料记录

所有这些模块都可以使用认证模块提供的装饰器和守卫来保护接口。
