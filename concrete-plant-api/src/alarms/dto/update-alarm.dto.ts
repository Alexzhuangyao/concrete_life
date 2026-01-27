import { IsOptional, IsString, IsEnum, IsObject } from 'class-validator';

export class UpdateAlarmDto {
  @IsOptional()
  @IsString({ message: '告警标题必须是字符串' })
  title?: string;

  @IsOptional()
  @IsString({ message: '告警消息必须是字符串' })
  message?: string;

  @IsOptional()
  @IsEnum(['critical', 'high', 'medium', 'low'], {
    message: '告警级别必须是 critical, high, medium 或 low',
  })
  level?: string;

  @IsOptional()
  @IsEnum(['pending', 'acknowledged', 'resolved', 'ignored'], {
    message: '状态必须是 pending, acknowledged, resolved 或 ignored',
  })
  status?: string;

  @IsOptional()
  @IsObject({ message: '附加数据必须是对象' })
  data?: any;
}
