import { IsOptional, IsString, IsNumber, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryLogDto {
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
  @IsNumber({}, { message: '用户ID必须是数字' })
  userId?: number;

  @IsOptional()
  @IsString({ message: '操作类型必须是字符串' })
  action?: string;

  @IsOptional()
  @IsString({ message: '模块名称必须是字符串' })
  module?: string;

  @IsOptional()
  @IsString({ message: '开始日期必须是字符串' })
  startDate?: string;

  @IsOptional()
  @IsString({ message: '结束日期必须是字符串' })
  endDate?: string;
}
