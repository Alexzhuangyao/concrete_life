import { IsString, IsNotEmpty, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';

export class CreateMaterialDto {
  @IsNumber()
  @IsNotEmpty({ message: '站点ID不能为空' })
  siteId: number;

  @IsString()
  @IsNotEmpty({ message: '材料名称不能为空' })
  name: string;

  @IsEnum(['cement', 'sand', 'stone', 'water', 'admixture', 'other'], {
    message: '材料类型不正确',
  })
  @IsNotEmpty({ message: '材料类型不能为空' })
  type: string;

  @IsString()
  @IsNotEmpty({ message: '单位不能为空' })
  unit: string;

  @IsNumber()
  @Min(0, { message: '价格必须大于等于0' })
  @IsOptional()
  price?: number;

  @IsNumber()
  @Min(0, { message: '库存数量必须大于等于0' })
  @IsOptional()
  stockQuantity?: number;

  @IsNumber()
  @Min(0, { message: '最小库存必须大于等于0' })
  @IsOptional()
  minStock?: number;

  @IsNumber()
  @Min(0, { message: '最大库存必须大于等于0' })
  @IsOptional()
  maxStock?: number;

  @IsNumber()
  @IsOptional()
  supplierId?: number;

  @IsString()
  @IsOptional()
  specifications?: string;

  @IsString()
  @IsOptional()
  remarks?: string;
}
