import { IsString, IsNotEmpty, IsEnum, IsOptional, IsEmail } from 'class-validator';

export class CreateSupplierDto {
  @IsString()
  @IsNotEmpty({ message: '供应商名称不能为空' })
  name: string;

  @IsString()
  @IsOptional()
  contactPerson?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail({}, { message: '邮箱格式不正确' })
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsEnum(['cement', 'sand', 'stone', 'admixture', 'comprehensive', 'other'], {
    message: '供应商类型不正确',
  })
  @IsOptional()
  type?: string;

  @IsEnum(['A', 'B', 'C', 'D'], {
    message: '信用等级不正确',
  })
  @IsOptional()
  creditRating?: string;

  @IsString()
  @IsOptional()
  remarks?: string;
}
