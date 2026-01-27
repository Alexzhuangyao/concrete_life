import { IsString, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateGradeDto {
  @IsString()
  @IsNotEmpty({ message: '等级名称不能为空' })
  name: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsNumber()
  @Min(0, { message: '强度必须大于等于0' })
  @IsNotEmpty({ message: '强度不能为空' })
  strength: number;

  @IsNumber()
  @Min(0, { message: '价格必须大于等于0' })
  @IsOptional()
  price?: number;

  @IsString()
  @IsOptional()
  description?: string;
}
