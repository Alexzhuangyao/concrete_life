import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('users')
@UseGuards(RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * 创建用户
   */
  @Post()
  @Roles('admin', 'manager')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  /**
   * 查询所有用户
   */
  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('siteId') siteId?: string,
    @Query('userType') userType?: string,
    @Query('status') status?: string,
  ) {
    return this.usersService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      siteId ? parseInt(siteId) : undefined,
      userType,
      status,
    );
  }

  /**
   * 查询单个用户
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  /**
   * 更新用户
   */
  @Patch(':id')
  @Roles('admin', 'manager')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  /**
   * 删除用户
   */
  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  /**
   * 启用/禁用用户
   */
  @Patch(':id/toggle-status')
  @Roles('admin', 'manager')
  toggleStatus(@Param('id') id: string) {
    return this.usersService.toggleStatus(+id);
  }
}
