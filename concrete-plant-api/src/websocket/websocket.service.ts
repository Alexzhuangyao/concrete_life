import { Injectable } from '@nestjs/common';
import { EventsGateway } from './events.gateway';

@Injectable()
export class WebSocketService {
  constructor(private eventsGateway: EventsGateway) {}

  /**
   * 发送告警通知
   */
  sendAlarmNotification(alarm: any) {
    this.eventsGateway.sendAlarm(alarm);
  }

  /**
   * 发送告警更新
   */
  sendAlarmUpdate(alarm: any) {
    this.eventsGateway.sendAlarmUpdate(alarm);
  }

  /**
   * 发送用户通知
   */
  sendUserNotification(userId: number, notification: any) {
    this.eventsGateway.sendNotificationToUser(userId, notification);
  }

  /**
   * 发送全局通知
   */
  sendGlobalNotification(notification: any) {
    this.eventsGateway.sendNotificationToAll(notification);
  }

  /**
   * 发送生产数据更新
   */
  sendProductionUpdate(siteId: number, data: any) {
    this.eventsGateway.sendProductionUpdate(siteId, data);
  }

  /**
   * 发送任务更新
   */
  sendTaskUpdate(siteId: number, task: any) {
    this.eventsGateway.sendTaskUpdate(siteId, task);
  }

  /**
   * 发送订单更新
   */
  sendOrderUpdate(siteId: number, order: any) {
    this.eventsGateway.sendOrderUpdate(siteId, order);
  }

  /**
   * 发送车辆更新
   */
  sendVehicleUpdate(siteId: number, vehicle: any) {
    this.eventsGateway.sendVehicleUpdate(siteId, vehicle);
  }

  /**
   * 发送库存更新
   */
  sendInventoryUpdate(siteId: number, inventory: any) {
    this.eventsGateway.sendInventoryUpdate(siteId, inventory);
  }

  /**
   * 发送仪表盘更新
   */
  sendDashboardUpdate(siteId: number, data: any) {
    this.eventsGateway.sendDashboardUpdate(siteId, data);
  }

  /**
   * 广播系统消息
   */
  broadcastSystemMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
    this.eventsGateway.broadcastSystemMessage(message, level);
  }

  /**
   * 获取在线用户数
   */
  getOnlineUsersCount(): number {
    return this.eventsGateway.getOnlineUsersCount();
  }

  /**
   * 获取站点在线用户数
   */
  getSiteOnlineUsersCount(siteId: number): number {
    return this.eventsGateway.getSiteOnlineUsersCount(siteId);
  }
}
