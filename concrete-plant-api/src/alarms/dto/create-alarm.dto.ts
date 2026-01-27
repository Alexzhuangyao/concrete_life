import { IsNotEmpty, IsString, IsOptional, IsNumber, IsEnum, IsObject } from 'class-validator';

export class CreateAlarmDto {
  @IsNotEmpty({ message: '告警类型不能为空' })
  @IsEnum(['low_stock', 'vehicle_fault', 'equipment_fault', 'task_timeout', 'quality_issue', 'system_error', 'other'], {
    message: '告警类型必须是有效值',
  })
  type: string;

  @IsNotEmpty({ message: '告警级别不能为空' })
  @IsEnum(['critical', 'high', 'medium', 'low'], {
    message: '告警级别必须是 critical, high, medium 或 low',
  })
  level: string;

  @IsNotEmpty({ message: '告警标题不能为空' })
  @IsString({ message: '告警标题必须是字符串' })
  title: string;

  @IsNotEmpty({ message: '告警消息不能为空' })
  @IsString({ message: '告警消息必须是字符串' })
  message: string;

  @IsOptional()
  @IsString({ message: '来源类型必须是字符串' })
  source?: string;

  @IsOptional()
  @IsNumber({}, { message: '来源ID必须是数字' })
  sourceId?: number;

  @IsOptional()
  @IsNumber({}, { message: '站点ID必须是数字' })
  siteId?: number;

  @IsOptional()
  @IsObject({ message: '附加数据必须是对象' })
  data?: any;
}
