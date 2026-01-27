import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateConfigDto {
  @IsNotEmpty({ message: '配置键不能为空' })
  @IsString({ message: '配置键必须是字符串' })
  key: string;

  @IsNotEmpty({ message: '配置值不能为空' })
  value: any;

  @IsNotEmpty({ message: '配置分类不能为空' })
  @IsString({ message: '配置分类必须是字符串' })
  category: string;

  @IsOptional()
  @IsString({ message: '描述必须是字符串' })
  description?: string;

  @IsOptional()
  @IsBoolean({ message: 'isPublic必须是布尔值' })
  isPublic?: boolean;
}
