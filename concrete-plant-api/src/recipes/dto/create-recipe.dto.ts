import { IsString, IsNotEmpty, IsNumber, IsEnum, IsOptional, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

class RecipeDetailDto {
  @IsNumber()
  @IsNotEmpty({ message: '材料ID不能为空' })
  materialId: number;

  @IsNumber()
  @Min(0, { message: '数量必须大于0' })
  @IsNotEmpty({ message: '数量不能为空' })
  quantity: number;

  @IsNumber()
  @Min(0, { message: '误差容忍度必须大于等于0' })
  @IsOptional()
  tolerance?: number;

  @IsString()
  @IsOptional()
  remarks?: string;
}

export class CreateRecipeDto {
  @IsNumber()
  @IsNotEmpty({ message: '站点ID不能为空' })
  siteId: number;

  @IsString()
  @IsNotEmpty({ message: '配方名称不能为空' })
  name: string;

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

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecipeDetailDto)
  @IsOptional()
  details?: RecipeDetailDto[];

  @IsString()
  @IsOptional()
  remarks?: string;
}
