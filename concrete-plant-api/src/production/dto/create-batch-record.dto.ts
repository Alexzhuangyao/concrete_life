import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateBatchRecordDto {
  @IsNotEmpty({ message: '批次ID不能为空' })
  @IsNumber({}, { message: '批次ID必须是数字' })
  batchId: number;

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
