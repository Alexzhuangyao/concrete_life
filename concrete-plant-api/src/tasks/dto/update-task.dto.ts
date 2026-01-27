import { IsNumber, IsOptional, IsEnum, IsDateString, Min } from 'class-validator';

export class UpdateTaskDto {
  @IsNumber()
  @IsOptional()
  vehicleId?: number;

  @IsNumber()
  @IsOptional()
  driverId?: number;

  @IsNumber()
  @Min(0, { message: '配送方量必须大于0' })
  @IsOptional()
  deliveryVolume?: number;

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

  @IsEnum(['pending', 'assigned', 'in_transit', 'arrived', 'unloading', 'completed', 'cancelled'], {
    message: '任务状态不正确',
  })
  @IsOptional()
  status?: string;

  @IsOptional()
  remarks?: string;
}
