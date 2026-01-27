import { IsNumber, IsString, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryGradeDto {
  @IsNumber()
  @Min(1, { message: '页码必须大于0' })
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @IsNumber()
  @Min(1, { message: '每页数量必须大于0' })
  @Type(() => Number)
  @IsOptional()
  limit?: number = 10;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  sortBy?: string = 'strength';

  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'asc';
}
