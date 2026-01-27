import { IsString, IsEmail, IsOptional, IsEnum, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  @MinLength(6, { message: '密码至少6位' })
  password?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail({}, { message: '邮箱格式不正确' })
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEnum(['admin', 'operator', 'driver', 'quality', 'manager', 'maintenance'], {
    message: '用户类型不正确',
  })
  @IsOptional()
  userType?: string;

  @IsOptional()
  siteId?: number;

  @IsOptional()
  roleId?: number;

  @IsString()
  @IsOptional()
  department?: string;

  @IsString()
  @IsOptional()
  position?: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsEnum(['active', 'inactive'], {
    message: '状态不正确',
  })
  @IsOptional()
  status?: string;
}
