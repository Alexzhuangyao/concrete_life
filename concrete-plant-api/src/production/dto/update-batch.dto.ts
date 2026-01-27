import { IsOptional, IsNumber, IsString, IsEnum, Min } from 'class-validator';

export class UpdateBatchDto {
  @IsOptional()
  @IsNumber({}, { message: '计划产量必须是数字' })
  @Min(0, { message: '计划产量不能为负数' })
  plannedQuantity?: number;

  @IsOptional()
  @IsNumber({}, { message: '实际产量必须是数字' })
  @Min(0, { message: '实际产量不能为负数' })
  actualQuantity?: number;

  @IsOptional()
  @IsEnum(['pending', 'in_progress', 'completed', 'cancelled'], {
    message: '状态必须是 pending, in_progress, completed 或 cancelled',
  })
  status?: string;

  @IsOptional()
  @IsString({ message: '开始时间必须是字符串' })
  startTime?: string;

  @IsOptional()
  @IsString({ message: '结束时间必须是字符串' })
  endTime?: string;

  @IsOptional()
  @IsString({ message: '备注必须是字符串' })
  remarks?: string;
}
