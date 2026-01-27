import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateTaskStatusDto {
  @IsEnum(['pending', 'assigned', 'in_transit', 'arrived', 'unloading', 'completed', 'cancelled'], {
    message: '任务状态不正确',
  })
  @IsNotEmpty({ message: '状态不能为空' })
  status: string;
}
