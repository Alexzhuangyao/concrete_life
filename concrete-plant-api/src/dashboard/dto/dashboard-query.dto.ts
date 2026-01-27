import { IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class DashboardQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '站点ID必须是数字' })
  siteId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '天数必须是数字' })
  @Min(1, { message: '天数必须大于0' })
  days?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '年份必须是数字' })
  year?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '月份必须是数字' })
  @Min(1, { message: '月份必须在1-12之间' })
  month?: number;
}
