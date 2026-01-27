import { IsNotEmpty, IsNumber, IsOptional, IsString, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

class BatchRecordItemDto {
  @IsNotEmpty({ message: '材料ID不能为空' })
  @IsNumber({}, { message: '材料ID必须是数字' })
  materialId: number;

  @IsNotEmpty({ message: '计划用量不能为空' })
  @IsNumber({}, { message: '计划用量必须是数字' })
  @Min(0, { message: '计划用量不能为负数' })
  plannedQuantity: number;

  @IsOptional()
  @IsNumber({}, { message: '实际用量必须是数字' })
  @Min(0, { message: '实际用量不能为负数' })
  actualQuantity?: number;

  @IsOptional()
  @IsString({ message: '备注必须是字符串' })
  remarks?: string;
}

export class CreateBatchDto {
  @IsNotEmpty({ message: '站点ID不能为空' })
  @IsNumber({}, { message: '站点ID必须是数字' })
  siteId: number;

  @IsNotEmpty({ message: '订单ID不能为空' })
  @IsNumber({}, { message: '订单ID必须是数字' })
  orderId: number;

  @IsNotEmpty({ message: '配方ID不能为空' })
  @IsNumber({}, { message: '配方ID必须是数字' })
  recipeId: number;

  @IsNotEmpty({ message: '计划产量不能为空' })
  @IsNumber({}, { message: '计划产量必须是数字' })
  @Min(0, { message: '计划产量不能为负数' })
  plannedQuantity: number;

  @IsOptional()
  @IsArray({ message: '配料记录必须是数组' })
  @ValidateNested({ each: true })
  @Type(() => BatchRecordItemDto)
  records?: BatchRecordItemDto[];

  @IsOptional()
  @IsString({ message: '备注必须是字符串' })
  remarks?: string;
}
