import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { GradesService } from './grades.service';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { QueryGradeDto } from './dto/query-grade.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('grades')
@UseGuards(RolesGuard)
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  /**
   * 创建混凝土等级
   */
  @Post()
  @Roles('admin', 'manager')
  create(
    @Body() createGradeDto: CreateGradeDto,
    @CurrentUser('userId') userId: number,
  ) {
    return this.gradesService.create(createGradeDto, userId);
  }

  /**
   * 查询等级列表
   */
  @Get()
  findAll(@Query() query: QueryGradeDto) {
    return this.gradesService.findAll(query);
  }

  /**
   * 获取等级统计
   */
  @Get('statistics')
  getStatistics() {
    return this.gradesService.getStatistics();
  }

  /**
   * 查询单个等级
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gradesService.findOne(+id);
  }

  /**
   * 更新等级
   */
  @Patch(':id')
  @Roles('admin', 'manager')
  update(
    @Param('id') id: string,
    @Body() updateGradeDto: UpdateGradeDto,
    @CurrentUser('userId') userId: number,
  ) {
    return this.gradesService.update(+id, updateGradeDto, userId);
  }

  /**
   * 删除等级
   */
  @Delete(':id')
  @Roles('admin', 'manager')
  remove(@Param('id') id: string) {
    return this.gradesService.remove(+id);
  }
}
