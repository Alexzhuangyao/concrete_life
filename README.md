# 混凝土搅拌站管理系统

## 🚀 快速启动

### Windows 用户
双击 `start.bat` 文件，或在命令行中运行：
```cmd
start.bat
```

### Linux/Mac 用户
在终端中运行：
```bash
./start.sh
```

### 停止服务

**Windows:**
```cmd
stop.bat
```

**Linux/Mac:**
```bash
./stop.sh
```

## 📋 系统要求

- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker (可选，用于数据库)

## 🌐 访问地址

启动成功后：
- 前端: http://localhost:5173
- 后端: http://localhost:3000
- API文档: http://localhost:3000/api

## 📚 详细文档

查看 [启动指南.md](./启动指南.md) 获取更多信息。

## 🧪 测试

### 后端测试
```bash
cd concrete-plant-api
npm test
```

### 前端测试
```bash
cd concrete-plant-web
npm test
```

## 📊 项目状态

- ✅ 后端测试: 316+ 测试用例通过
- ✅ 前端测试: 161+ 测试用例通过
- ✅ 测试覆盖率: 90%+

## 📁 项目结构

```
concrete_life/
├── start.sh              # Linux/Mac 启动脚本
├── start.bat             # Windows 启动脚本
├── stop.sh               # Linux/Mac 停止脚本
├── stop.bat              # Windows 停止脚本
├── 启动指南.md           # 详细启动指南
├── concrete-plant-api/   # 后端 (NestJS)
├── concrete-plant-web/   # 前端 (React + Vite)
└── logs/                 # 运行日志
```

## 🔧 技术栈

### 后端
- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- Jest

### 前端
- React 19
- TypeScript
- Vite
- Ant Design
- Zustand
- Vitest

## 📝 开发

### 后端开发
```bash
cd concrete-plant-api
npm run start:dev
```

### 前端开发
```bash
cd concrete-plant-web
npm run dev
```

## 🐛 问题排查

如遇到问题，请查看：
1. `logs/backend.log` - 后端日志
2. `logs/frontend.log` - 前端日志
3. [启动指南.md](./启动指南.md) - 常见问题解答

## 📄 许可证

[MIT License](LICENSE)

---

**版本**: 1.0.0  
**最后更新**: 2026-01-28
