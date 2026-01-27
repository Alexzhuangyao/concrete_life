# 测试文档

## 测试概述

本项目包含完整的测试套件，包括单元测试、集成测试和端到端测试，确保系统的稳定性和可靠性。

## 测试结构

```
test/
├── unit/                      # 单元测试
│   ├── auth.service.spec.ts
│   ├── orders.service.spec.ts
│   ├── materials.service.spec.ts
│   ├── alarms.service.spec.ts
│   └── ...
├── integration/               # 集成测试
│   ├── auth.e2e-spec.ts
│   ├── production.e2e-spec.ts
│   └── ...
├── e2e/                       # 端到端测试
│   └── ...
└── setup.ts                   # 测试环境设置
```

## 测试类型

### 1. 单元测试（Unit Tests）

测试单个服务或组件的功能，使用Mock隔离依赖。

**覆盖范围**：
- AuthService - 用户认证服务
- OrdersService - 订单管理服务
- MaterialsService - 物料管理服务
- AlarmsService - 告警管理服务
- 其他核心服务

**特点**：
- 使用Jest进行测试
- Mock所有外部依赖
- 快速执行
- 高代码覆盖率

### 2. 集成测试（Integration Tests）

测试多个模块之间的交互，使用真实的数据库连接。

**覆盖范围**：
- 用户认证流程（注册、登录、权限）
- 生产管理流程（批次创建、状态更新）
- 订单管理流程
- 告警处理流程

**特点**：
- 测试真实的API端点
- 使用测试数据库
- 验证完整的业务流程
- 包含数据验证

### 3. 端到端测试（E2E Tests）

测试完整的用户场景，从前端到后端。

**覆盖范围**：
- 完整的业务流程
- 用户交互场景
- 系统集成测试

## 运行测试

### 安装依赖

```bash
npm install
```

### 运行所有测试

```bash
npm test
```

### 运行单元测试

```bash
npm run test:unit
```

### 运行集成测试

```bash
npm run test:integration
```

### 运行E2E测试

```bash
npm run test:e2e
```

### 生成测试覆盖率报告

```bash
npm run test:cov
```

### 监听模式（开发时使用）

```bash
npm run test:watch
```

## 测试配置

### Jest配置（jest.config.json）

```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testRegex": ".*\\.spec\\.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  },
  "collectCoverageFrom": [
    "src/**/*.(t|j)s",
    "!src/**/*.module.ts",
    "!src/**/*.dto.ts",
    "!src/main.ts"
  ],
  "coverageDirectory": "./coverage",
  "testEnvironment": "node"
}
```

## 测试数据管理

### 测试数据库

使用独立的测试数据库，避免影响开发和生产数据。

**配置**：
```env
DATABASE_URL="postgresql://user:password@localhost:5432/concrete_plant_test"
```

### 数据清理

每个测试套件都包含：
- `beforeAll`: 创建测试数据
- `afterAll`: 清理测试数据
- `beforeEach`: 重置Mock
- `afterEach`: 清理临时数据

## 测试示例

### 单元测试示例

```typescript
describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should validate user successfully', async () => {
    const result = await service.validateUser('testuser', 'password');
    expect(result).toBeDefined();
    expect(result.password).toBeUndefined();
  });
});
```

### 集成测试示例

```typescript
describe('Auth Integration Tests', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should login successfully', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'admin', password: 'admin123' })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('access_token');
        authToken = res.body.access_token;
      });
  });
});
```

## 测试覆盖率目标

| 模块 | 目标覆盖率 | 当前状态 |
|------|-----------|---------|
| 用户认证 | 90% | ✅ 已达标 |
| 订单管理 | 85% | ✅ 已达标 |
| 生产管理 | 85% | ✅ 已达标 |
| 物料管理 | 85% | ✅ 已达标 |
| 告警管理 | 85% | ✅ 已达标 |
| 其他模块 | 80% | 🔄 进行中 |

**总体目标**: 85%以上的代码覆盖率

## 测试最佳实践

### 1. 测试命名

使用描述性的测试名称：
```typescript
it('should create order successfully')
it('should fail with invalid data')
it('should throw NotFoundException when user not found')
```

### 2. AAA模式

遵循 Arrange-Act-Assert 模式：
```typescript
it('should calculate total price correctly', () => {
  // Arrange
  const items = [{ volume: 10, unitPrice: 500 }];
  
  // Act
  const total = calculateTotal(items);
  
  // Assert
  expect(total).toBe(5000);
});
```

### 3. Mock使用

只Mock必要的依赖：
```typescript
const mockPrismaService = {
  users: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};
```

### 4. 测试隔离

每个测试应该独立运行：
```typescript
beforeEach(() => {
  jest.clearAllMocks();
});
```

### 5. 异步测试

正确处理异步操作：
```typescript
it('should create user', async () => {
  const result = await service.create(dto);
  expect(result).toBeDefined();
});
```

## 持续集成

### GitHub Actions配置

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - run: npm install
      - run: npm run test:cov
      
      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

## 故障排查

### 常见问题

**1. 测试超时**
```typescript
jest.setTimeout(30000); // 增加超时时间
```

**2. 数据库连接失败**
- 检查测试数据库配置
- 确保数据库服务运行中

**3. Mock不生效**
```typescript
jest.clearAllMocks(); // 清除所有Mock
```

**4. 异步测试失败**
```typescript
// 使用 async/await
await expect(promise).rejects.toThrow();
```

## 测试报告

### 生成HTML报告

```bash
npm run test:cov
```

报告位置：`coverage/lcov-report/index.html`

### 查看覆盖率

```bash
npm run test:cov
```

输出示例：
```
----------------------|---------|----------|---------|---------|
File                  | % Stmts | % Branch | % Funcs | % Lines |
----------------------|---------|----------|---------|---------|
All files             |   87.5  |   82.3   |   90.1  |   88.2  |
 auth                 |   92.1  |   88.5   |   95.0  |   93.0  |
 orders               |   85.3  |   80.1   |   87.5  |   86.0  |
 production           |   88.7  |   84.2   |   91.3  |   89.5  |
----------------------|---------|----------|---------|---------|
```

## 贡献指南

### 添加新测试

1. 在相应目录创建测试文件
2. 遵循现有的测试模式
3. 确保测试通过
4. 更新测试文档

### 测试审查清单

- [ ] 测试名称清晰描述
- [ ] 包含正常和异常情况
- [ ] Mock使用合理
- [ ] 测试独立运行
- [ ] 代码覆盖率达标
- [ ] 文档已更新

## 总结

完整的测试套件确保了系统的：
- ✅ 功能正确性
- ✅ 代码质量
- ✅ 业务逻辑准确性
- ✅ 系统稳定性
- ✅ 可维护性

通过持续的测试和改进，我们能够快速发现和修复问题，保证系统的高质量交付。
