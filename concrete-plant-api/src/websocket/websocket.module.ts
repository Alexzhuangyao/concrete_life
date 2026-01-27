import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { WebSocketService } from './websocket.service';

@Module({
  providers: [EventsGateway, WebSocketService],
  exports: [EventsGateway, WebSocketService],
})
export class WebSocketModule {}
