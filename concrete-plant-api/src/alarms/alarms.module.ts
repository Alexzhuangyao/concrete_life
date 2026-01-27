import { Module } from '@nestjs/common';
import { AlarmsService } from './alarms.service';
import { AlarmsController } from './alarms.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AlarmsController],
  providers: [AlarmsService],
  exports: [AlarmsService],
})
export class AlarmsModule {}
