import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdateConfigDto {
  @IsOptional()
  value?: any;

  @IsOptional()
  @IsString({ message: '描述必须是字符串' })
  description?: string;

  @IsOptional()
  @IsBoolean({ message: 'isPublic必须是布尔值' })
  isPublic?: boolean;
}
