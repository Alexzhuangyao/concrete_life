import { IsOptional, IsNumber, IsString, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryBatchDto {
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
  @Type(() => Number)
  @IsNumber({}, { message: '站点ID必须是数字' })
  siteId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '订单ID必须是数字' })
  orderId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '配方ID必须是数字' })
  recipeId?: number;

  @IsOptional()
  @IsEnum(['pending', 'in_progress', 'completed', 'cancelled'], {
    message: '状态必须是 pending, in_progress, completed 或 cancelled',
  })
  status?: string;

  @IsOptional()
  @IsString({ message: '批次号必须是字符串' })
  batchNumber?: string;

  @IsOptional()
  @IsString({ message: '开始日期必须是字符串' })
  startDate?: string;

  @IsOptional()
  @IsString({ message: '结束日期必须是字符串' })
  endDate?: string;
}
