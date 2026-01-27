import { Controller, Post, Body, UseGuards, Get, Patch } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 用户登录
   */
  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * 用户注册
   */
  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * 获取当前用户信息
   */
  @Get('profile')
  async getProfile(@CurrentUser() user: any) {
    return {
      user,
    };
  }

  /**
   * 修改密码
   */
  @Patch('change-password')
  async changePassword(
    @CurrentUser('userId') userId: number,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(
      userId,
      changePasswordDto.oldPassword,
      changePasswordDto.newPassword,
    );
  }

  /**
   * 验证 Token
   */
  @Get('validate')
  async validateToken(@CurrentUser() user: any) {
    return {
      valid: true,
      user,
    };
  }
}
