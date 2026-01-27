import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LogsService } from '../logs/logs.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private logsService: LogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, ip, headers } = request;
    const userAgent = headers['user-agent'] || '';

    // 只记录修改操作（POST, PUT, PATCH, DELETE）
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle();
    }

    // 排除登录等不需要记录的接口
    if (url.includes('/auth/login') || url.includes('/auth/register')) {
      return next.handle();
    }

    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: async (data) => {
          const responseTime = Date.now() - now;
          
          if (user && user.userId) {
            try {
              // 解析操作信息
              const { action, module, description } = this.parseRequest(method, url, request.body);
              
              await this.logsService.create(
                user.userId,
                action,
                module,
                description,
                {
                  method,
                  url,
                  body: request.body,
                  responseTime,
                },
                ip,
                userAgent,
              );
            } catch (error) {
              console.error('Failed to create log:', error);
            }
          }
        },
        error: async (error) => {
          if (user && user.userId) {
            try {
              const { action, module, description } = this.parseRequest(method, url, request.body);
              
              await this.logsService.create(
                user.userId,
                action,
                module,
                `${description} - 失败: ${error.message}`,
                {
                  method,
                  url,
                  body: request.body,
                  error: error.message,
                },
                ip,
                userAgent,
              );
            } catch (logError) {
              console.error('Failed to create error log:', logError);
            }
          }
        },
      }),
    );
  }

  private parseRequest(method: string, url: string, body: any): { action: string; module: string; description: string } {
    // 解析URL获取模块和操作
    const parts = url.split('/').filter(p => p && p !== 'api');
    const module = parts[0] || 'unknown';
    
    let action = '';
    let description = '';

    // 根据HTTP方法确定操作类型
    switch (method) {
      case 'POST':
        action = 'create';
        description = `创建${this.getModuleName(module)}`;
        break;
      case 'PUT':
      case 'PATCH':
        action = 'update';
        description = `更新${this.getModuleName(module)}`;
        break;
      case 'DELETE':
        action = 'delete';
        description = `删除${this.getModuleName(module)}`;
        break;
    }

    // 特殊操作处理
    if (url.includes('/status')) {
      action = 'update_status';
      description = `更新${this.getModuleName(module)}状态`;
    } else if (url.includes('/assign')) {
      action = 'assign';
      description = `分配${this.getModuleName(module)}`;
    } else if (url.includes('/acknowledge')) {
      action = 'acknowledge';
      description = `确认${this.getModuleName(module)}`;
    } else if (url.includes('/resolve')) {
      action = 'resolve';
      description = `解决${this.getModuleName(module)}`;
    }

    return { action, module, description };
  }

  private getModuleName(module: string): string {
    const moduleNames: { [key: string]: string } = {
      users: '用户',
      orders: '订单',
      tasks: '任务',
      vehicles: '车辆',
      materials: '材料',
      suppliers: '供应商',
      inventory: '库存',
      recipes: '配方',
      grades: '等级',
      production: '生产批次',
      sites: '站点',
      alarms: '告警',
      dashboard: '仪表盘',
    };

    return moduleNames[module] || module;
  }
}
