# 实时通信模块（WebSocket）文档

## 模块概述

实时通信模块基于WebSocket技术，为混凝土搅拌站管理系统提供实时数据推送能力。该模块支持告警通知、生产数据更新、任务状态变更等实时信息的双向通信。

## 功能特性

### 1. 连接管理
- ✅ WebSocket连接建立
- ✅ 客户端认证（基于JWT）
- ✅ 连接状态管理
- ✅ 自动断线重连
- ✅ 心跳检测

### 2. 频道订阅
- ✅ 订阅站点数据
- ✅ 订阅告警通知
- ✅ 订阅系统通知
- ✅ 取消订阅

### 3. 实时推送
- ✅ 告警实时通知
- ✅ 生产数据更新
- ✅ 任务状态更新
- ✅ 订单状态更新
- ✅ 车辆状态更新
- ✅ 库存变动通知
- ✅ 仪表盘数据更新

### 4. 消息通知
- ✅ 用户私信通知
- ✅ 全局广播通知
- ✅ 系统消息推送

### 5. 在线统计
- ✅ 在线用户数统计
- ✅ 站点在线用户统计

## 技术架构

### WebSocket服务端

使用 Socket.IO 实现WebSocket服务：

```typescript
@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/ws',
})
export class EventsGateway {
  @WebSocketServer()
  server: Server;
}
```

### 连接地址

```
ws://localhost:3000/ws
```

## 客户端连接

### 1. 建立连接

```typescript
import { io } from 'socket.io-client';

const socket = io('ws://localhost:3000/ws', {
  auth: {
    token: 'your-jwt-token'
  }
});

socket.on('connected', (data) => {
  console.log('连接成功:', data);
});
```

### 2. 订阅站点数据

```typescript
// 订阅站点1的数据
socket.emit('subscribe:site', { siteId: 1 });

socket.on('subscribed', (data) => {
  console.log('订阅成功:', data);
});
```

### 3. 订阅告警

```typescript
socket.emit('subscribe:alarms');

socket.on('alarm:new', (alarm) => {
  console.log('新告警:', alarm);
  // 显示告警通知
});

socket.on('alarm:update', (alarm) => {
  console.log('告警更新:', alarm);
  // 更新告警状态
});
```

### 4. 订阅通知

```typescript
socket.emit('subscribe:notifications');

socket.on('notification:new', (notification) => {
  console.log('新通知:', notification);
  // 显示通知
});
```

### 5. 心跳检测

```typescript
// 发送心跳
setInterval(() => {
  socket.emit('ping');
}, 30000);

socket.on('pong', (data) => {
  console.log('心跳响应:', data);
});
```

## 服务端事件

### 客户端订阅事件

| 事件名 | 说明 | 参数 |
|--------|------|------|
| `subscribe:site` | 订阅站点数据 | `{ siteId: number }` |
| `unsubscribe:site` | 取消订阅站点 | `{ siteId: number }` |
| `subscribe:alarms` | 订阅告警 | 无 |
| `subscribe:notifications` | 订阅通知 | 无 |
| `ping` | 心跳检测 | 无 |

### 服务端推送事件

| 事件名 | 说明 | 数据结构 |
|--------|------|----------|
| `connected` | 连接成功 | `{ message, clientId }` |
| `subscribed` | 订阅成功 | `{ siteId/channel, message }` |
| `unsubscribed` | 取消订阅成功 | `{ siteId, message }` |
| `pong` | 心跳响应 | `{ timestamp }` |
| `alarm:new` | 新告警 | 告警对象 |
| `alarm:update` | 告警更新 | 告警对象 |
| `notification:new` | 新通知 | 通知对象 |
| `production:update` | 生产数据更新 | 生产数据 |
| `task:update` | 任务更新 | 任务对象 |
| `order:update` | 订单更新 | 订单对象 |
| `vehicle:update` | 车辆更新 | 车辆对象 |
| `inventory:update` | 库存更新 | 库存数据 |
| `dashboard:update` | 仪表盘更新 | 仪表盘数据 |
| `system:message` | 系统消息 | `{ message, level, timestamp }` |

## 服务端API

### WebSocketService

```typescript
// 注入服务
constructor(private websocketService: WebSocketService) {}

// 发送告警通知
this.websocketService.sendAlarmNotification(alarm);

// 发送告警更新
this.websocketService.sendAlarmUpdate(alarm);

// 发送用户通知
this.websocketService.sendUserNotification(userId, notification);

// 发送全局通知
this.websocketService.sendGlobalNotification(notification);

// 发送生产数据更新
this.websocketService.sendProductionUpdate(siteId, data);

// 发送任务更新
this.websocketService.sendTaskUpdate(siteId, task);

// 发送订单更新
this.websocketService.sendOrderUpdate(siteId, order);

// 发送车辆更新
this.websocketService.sendVehicleUpdate(siteId, vehicle);

// 发送库存更新
this.websocketService.sendInventoryUpdate(siteId, inventory);

// 发送仪表盘更新
this.websocketService.sendDashboardUpdate(siteId, data);

// 广播系统消息
this.websocketService.broadcastSystemMessage(message, level);

// 获取在线用户数
const count = this.websocketService.getOnlineUsersCount();

// 获取站点在线用户数
const siteCount = this.websocketService.getSiteOnlineUsersCount(siteId);
```

## 使用场景

### 1. 告警实时通知

**服务端**：
```typescript
// 在告警服务中创建告警后推送
async create(createAlarmDto: CreateAlarmDto) {
  const alarm = await this.prisma.alarms.create({ ... });
  
  // 推送告警通知
  this.websocketService.sendAlarmNotification(alarm);
  
  return alarm;
}
```

**客户端**：
```typescript
socket.on('alarm:new', (alarm) => {
  // 显示告警通知
  notification.show({
    title: alarm.title,
    message: alarm.message,
    type: alarm.level,
  });
  
  // 播放提示音
  if (alarm.level === 'critical' || alarm.level === 'high') {
    playAlertSound();
  }
});
```

### 2. 生产数据实时更新

**服务端**：
```typescript
// 生产批次状态更新后推送
async startBatch(id: number) {
  const batch = await this.prisma.production_batches.update({ ... });
  
  // 推送生产数据更新
  this.websocketService.sendProductionUpdate(batch.site_id, {
    type: 'batch_started',
    batch,
  });
  
  return batch;
}
```

**客户端**：
```typescript
socket.on('production:update', (data) => {
  if (data.type === 'batch_started') {
    // 更新生产监控界面
    updateProductionMonitor(data.batch);
  }
});
```

### 3. 任务状态实时跟踪

**服务端**：
```typescript
// 任务状态更新后推送
async updateStatus(id: number, status: string) {
  const task = await this.prisma.tasks.update({ ... });
  
  // 推送任务更新
  this.websocketService.sendTaskUpdate(task.site_id, task);
  
  return task;
}
```

**客户端**：
```typescript
socket.on('task:update', (task) => {
  // 更新任务列表
  updateTaskInList(task);
  
  // 更新地图上的车辆位置
  if (task.vehicle) {
    updateVehicleOnMap(task.vehicle);
  }
});
```

### 4. 库存变动通知

**服务端**：
```typescript
// 库存变动后推送
async stockIn(data: StockInDto) {
  const result = await this.prisma.$transaction([ ... ]);
  
  // 推送库存更新
  this.websocketService.sendInventoryUpdate(data.siteId, {
    type: 'stock_in',
    material: result.material,
    quantity: data.quantity,
  });
  
  return result;
}
```

**客户端**：
```typescript
socket.on('inventory:update', (data) => {
  // 更新库存显示
  updateInventoryDisplay(data.material);
  
  // 如果是低库存材料，移除预警
  if (data.type === 'stock_in') {
    removeStockAlert(data.material.id);
  }
});
```

### 5. 仪表盘实时刷新

**服务端**：
```typescript
// 定时推送仪表盘数据
@Cron(CronExpression.EVERY_MINUTE)
async updateDashboard() {
  const sites = await this.prisma.sites.findMany();
  
  for (const site of sites) {
    const data = await this.dashboardService.getOverview(site.id);
    this.websocketService.sendDashboardUpdate(site.id, data);
  }
}
```

**客户端**：
```typescript
socket.on('dashboard:update', (data) => {
  // 更新仪表盘数据
  updateDashboardData(data);
  
  // 更新图表
  updateCharts(data);
});
```

### 6. 系统消息广播

**服务端**：
```typescript
// 系统维护通知
this.websocketService.broadcastSystemMessage(
  '系统将于今晚22:00进行维护，预计持续1小时',
  'warning'
);

// 紧急通知
this.websocketService.broadcastSystemMessage(
  '检测到异常情况，请立即检查设备状态',
  'error'
);
```

**客户端**：
```typescript
socket.on('system:message', (data) => {
  // 显示系统消息
  showSystemMessage(data.message, data.level);
  
  // 记录到本地
  logSystemMessage(data);
});
```

## 前端集成示例

### React集成

```typescript
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export function useWebSocket(token: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const newSocket = io('ws://localhost:3000/ws', {
      auth: { token }
    });

    newSocket.on('connected', () => {
      setConnected(true);
      console.log('WebSocket连接成功');
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
      console.log('WebSocket断开连接');
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [token]);

  return { socket, connected };
}

// 使用示例
function Dashboard() {
  const { socket, connected } = useWebSocket(token);

  useEffect(() => {
    if (!socket || !connected) return;

    // 订阅站点数据
    socket.emit('subscribe:site', { siteId: 1 });

    // 监听告警
    socket.on('alarm:new', (alarm) => {
      notification.warning({
        message: alarm.title,
        description: alarm.message,
      });
    });

    // 监听生产更新
    socket.on('production:update', (data) => {
      // 更新状态
    });

    return () => {
      socket.off('alarm:new');
      socket.off('production:update');
    };
  }, [socket, connected]);

  return <div>...</div>;
}
```

### Vue集成

```typescript
import { ref, onMounted, onUnmounted } from 'vue';
import { io } from 'socket.io-client';

export function useWebSocket(token: string) {
  const socket = ref(null);
  const connected = ref(false);

  onMounted(() => {
    socket.value = io('ws://localhost:3000/ws', {
      auth: { token }
    });

    socket.value.on('connected', () => {
      connected.value = true;
    });

    socket.value.on('disconnect', () => {
      connected.value = false;
    });
  });

  onUnmounted(() => {
    if (socket.value) {
      socket.value.close();
    }
  });

  return { socket, connected };
}
```

## 性能优化

### 1. 连接池管理
- 限制单个用户的最大连接数
- 自动清理无效连接
- 连接复用

### 2. 消息压缩
- 使用Socket.IO的内置压缩
- 大数据分片传输

### 3. 频道隔离
- 按站点隔离数据推送
- 按用户权限过滤消息
- 减少不必要的广播

### 4. 心跳优化
- 客户端30秒心跳
- 服务端60秒超时检测
- 自动重连机制

## 安全考虑

### 1. 认证
- 连接时验证JWT token
- Token过期自动断开
- 支持Token刷新

### 2. 授权
- 基于用户角色的消息过滤
- 站点数据隔离
- 敏感操作权限验证

### 3. 防护
- 连接频率限制
- 消息大小限制
- XSS防护

## 监控指标

### 建议监控的指标
- 在线连接数
- 消息推送量
- 消息延迟
- 连接错误率
- 断线重连次数

## 扩展功能建议

### 未来可能的扩展
1. 消息持久化（离线消息）
2. 消息确认机制
3. 消息优先级
4. 房间管理（多人协作）
5. 文件传输
6. 视频通话
7. 屏幕共享
8. 地理位置实时跟踪

## 故障排查

### 常见问题

**1. 连接失败**
- 检查token是否有效
- 检查CORS配置
- 检查防火墙设置

**2. 消息收不到**
- 检查是否已订阅相应频道
- 检查用户权限
- 检查网络连接

**3. 频繁断线**
- 检查心跳配置
- 检查网络稳定性
- 检查服务器负载

## 总结

实时通信模块为系统提供了：
- ✅ 可靠的WebSocket连接管理
- ✅ 灵活的频道订阅机制
- ✅ 全面的实时数据推送
- ✅ 完善的消息通知功能
- ✅ 良好的性能和安全性

该模块是实现系统实时监控和协作的重要基础设施。
