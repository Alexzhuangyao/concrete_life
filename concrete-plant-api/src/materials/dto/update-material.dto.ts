import { IsString, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';

export class UpdateMaterialDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(['cement', 'sand', 'stone', 'water', 'admixture', 'other'], {
    message: '材料类型不正确',
  })
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsNumber()
  @Min(0, { message: '价格必须大于等于0' })
  @IsOptional()
  price?: number;

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
