import { IsOptional, IsString, IsNumber, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryAlarmDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '页码必须是数字' })
  @Min(1, { message: '页码必须大于0' })
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '每页数量必须是数字' })
  @Min(1, { message: '每页数量必须大于0' })
  limit?: number;

  @IsOptional()
  @IsString({ message: '排序字段必须是字符串' })
  sortBy?: string;

  @IsOptional()
  @IsEnum(['asc', 'desc'], { message: '排序方式必须是 asc 或 desc' })
  sortOrder?: 'asc' | 'desc';

  @IsOptional()
  @IsEnum(['low_stock', 'vehicle_fault', 'equipment_fault', 'task_timeout', 'quality_issue', 'system_error', 'other'], {
    message: '告警类型必须是有效值',
  })
  type?: string;

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
  @IsString({ message: '来源类型必须是字符串' })
  source?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '站点ID必须是数字' })
  siteId?: number;

  @IsOptional()
  @IsString({ message: '开始日期必须是字符串' })
  startDate?: string;

  @IsOptional()
  @IsString({ message: '结束日期必须是字符串' })
  endDate?: string;
}
