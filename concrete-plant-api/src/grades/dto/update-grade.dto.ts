import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateGradeDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsNumber()
  @Min(0, { message: '强度必须大于等于0' })
  @IsOptional()
  strength?: number;

  @IsNumber()
  @Min(0, { message: '价格必须大于等于0' })
  @IsOptional()
  price?: number;

  @IsString()
  @IsOptional()
  description?: string;
}
