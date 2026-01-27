import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WsJwtGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient();
    const token = client.handshake.auth.token || client.handshake.query.token;

    if (!token) {
      throw new WsException('未授权：缺少token');
    }

    try {
      // TODO: 验证JWT token
      // const decoded = this.jwtService.verify(token);
      // client.user = decoded;
      return true;
    } catch (error) {
      throw new WsException('未授权：token无效');
    }
  }
}
