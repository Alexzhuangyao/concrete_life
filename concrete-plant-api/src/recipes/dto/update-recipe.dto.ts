import { IsString, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';

export class UpdateRecipeDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsNumber()
  @IsOptional()
  gradeId?: number;

  @IsString()
  @IsOptional()
  version?: string;

  @IsEnum(['draft', 'published', 'archived'], {
    message: '配方状态不正确',
  })
  @IsOptional()
  status?: string;

  @IsNumber()
  @Min(0, { message: '坍落度必须大于等于0' })
  @IsOptional()
  slump?: number;

  @IsNumber()
  @Min(0, { message: '强度必须大于等于0' })
  @IsOptional()
  strength?: number;

  @IsNumber()
  @Min(0, { message: '水灰比必须大于等于0' })
  @IsOptional()
  waterCementRatio?: number;

  @IsNumber()
  @Min(0, { message: '总重量必须大于等于0' })
  @IsOptional()
  totalWeight?: number;

  @IsString()
  @IsOptional()
  remarks?: string;
}
