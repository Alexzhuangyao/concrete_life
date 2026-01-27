import { IsString, IsNumber, IsEnum, IsOptional, IsDateString, Min, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateOrderItemDto {
  @IsNumber()
  @IsOptional()
  id?: number;

  @IsNumber()
  @IsOptional()
  recipeId?: number;

  @IsNumber()
  @Min(0, { message: '方量必须大于0' })
  @IsOptional()
  volume?: number;

  @IsNumber()
  @Min(0, { message: '单价必须大于等于0' })
  @IsOptional()
  unitPrice?: number;

  @IsString()
  @IsOptional()
  remarks?: string;
}

export class UpdateOrderDto {
  @IsString()
  @IsOptional()
  orderNo?: string;

  @IsNumber()
  @IsOptional()
  siteId?: number;

  @IsString()
  @IsOptional()
  customerName?: string;

  @IsString()
  @IsOptional()
  customerPhone?: string;

  @IsString()
  @IsOptional()
  projectName?: string;

  @IsString()
  @IsOptional()
  constructionSite?: string;

  @IsDateString({}, { message: '要求交货时间格式不正确' })
  @IsOptional()
  requiredDeliveryTime?: string;

  @IsNumber()
  @Min(0, { message: '总方量必须大于0' })
  @IsOptional()
  totalVolume?: number;

  @IsNumber()
  @Min(0, { message: '总金额必须大于等于0' })
  @IsOptional()
  totalAmount?: number;

  @IsEnum(['pending', 'confirmed', 'in_production', 'completed', 'cancelled'], {
    message: '订单状态不正确',
  })
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  remarks?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateOrderItemDto)
  @IsOptional()
  items?: UpdateOrderItemDto[];
}
