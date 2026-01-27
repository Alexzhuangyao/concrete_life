import { IsNumber, IsNotEmpty, IsEnum, IsOptional, Min } from 'class-validator';

export class CreateInventoryRecordDto {
  @IsNumber()
  @IsNotEmpty({ message: '材料ID不能为空' })
  materialId: number;

  @IsEnum(['in', 'out'], {
    message: '记录类型不正确',
  })
  @IsNotEmpty({ message: '记录类型不能为空' })
  type: string;

  @IsNumber()
  @Min(0, { message: '数量必须大于0' })
  @IsNotEmpty({ message: '数量不能为空' })
  quantity: number;

  @IsNumber()
  @Min(0, { message: '单价必须大于等于0' })
  @IsOptional()
  unitPrice?: number;

  @IsOptional()
  remarks?: string;
}
