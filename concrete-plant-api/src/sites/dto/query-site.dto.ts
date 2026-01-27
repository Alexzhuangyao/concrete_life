import { IsOptional, IsString, IsNumber, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QuerySiteDto {
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
  @IsString({ message: '站点代码必须是字符串' })
  code?: string;

  @IsOptional()
  @IsString({ message: '站点名称必须是字符串' })
  name?: string;

  @IsOptional()
  @IsEnum(['production', 'distribution', 'mixed'], {
    message: '站点类型必须是 production, distribution 或 mixed',
  })
  type?: string;

  @IsOptional()
  @IsEnum(['active', 'inactive', 'maintenance'], {
    message: '状态必须是 active, inactive 或 maintenance',
  })
  status?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '负责人ID必须是数字' })
  managerId?: number;
}
