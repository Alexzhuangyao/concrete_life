import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsEnum(['pending', 'confirmed', 'in_production', 'completed', 'cancelled'], {
    message: '订单状态不正确',
  })
  @IsNotEmpty({ message: '状态不能为空' })
  status: string;
}
