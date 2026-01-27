import { IsString, IsNotEmpty, IsEmail, IsOptional, IsEnum, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: '用户名不能为空' })
  username: string;

  @IsString()
  @IsNotEmpty({ message: '密码不能为空' })
  @MinLength(6, { message: '密码至少6位' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: '姓名不能为空' })
  name: string;

  @IsEmail({}, { message: '邮箱格式不正确' })
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEnum(['admin', 'operator', 'driver', 'quality', 'manager', 'maintenance'], {
    message: '用户类型不正确',
  })
  @IsNotEmpty({ message: '用户类型不能为空' })
  userType: string;

  @IsNotEmpty({ message: '站点ID不能为空' })
  siteId: number;

  @IsOptional()
  roleId?: number;
}
