import { IsNumber, IsNotEmpty, IsOptional, IsEnum, IsDateString, Min } from 'class-validator';

export class CreateTaskDto {
  @IsNumber()
  @IsNotEmpty({ message: '订单ID不能为空' })
  orderId: number;

  @IsNumber()
  @IsOptional()
  vehicleId?: number;

  @IsNumber()
  @IsOptional()
  driverId?: number;

  @IsNumber()
  @Min(0, { message: '配送方量必须大于0' })
  @IsNotEmpty({ message: '配送方量不能为空' })
  deliveryVolume: number;

  @IsOptional()
  deliveryAddress?: string;

  @IsDateString({}, { message: '计划时间格式不正确' })
  @IsOptional()
  scheduledTime?: string;

  @IsEnum(['low', 'normal', 'high', 'urgent'], {
    message: '优先级不正确',
  })
  @IsOptional()
  priority?: string;

  @IsOptional()
  remarks?: string;
}
