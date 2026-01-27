import { IsNumber, IsNotEmpty, IsDateString, IsOptional } from 'class-validator';

export class AssignTaskDto {
  @IsNumber()
  @IsNotEmpty({ message: '车辆ID不能为空' })
  vehicleId: number;

  @IsNumber()
  @IsNotEmpty({ message: '司机ID不能为空' })
  driverId: number;

  @IsDateString({}, { message: '计划时间格式不正确' })
  @IsOptional()
  scheduledTime?: string;
}
