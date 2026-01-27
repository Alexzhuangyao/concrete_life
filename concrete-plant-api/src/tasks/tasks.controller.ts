import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTaskDto } from './dto/query-task.dto';
import { AssignTaskDto } from './dto/assign-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('tasks')
@UseGuards(RolesGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  /**
   * 创建任务
   */
  @Post()
  @Roles('admin', 'manager', 'operator')
  create(
    @Body() createTaskDto: CreateTaskDto,
    @CurrentUser('userId') userId: number,
  ) {
    return this.tasksService.create(createTaskDto, userId);
  }

  /**
   * 查询任务列表
   */
  @Get()
  findAll(@Query() query: QueryTaskDto) {
    return this.tasksService.findAll(query);
  }

  /**
   * 获取任务统计
   */
  @Get('statistics')
  getStatistics(
    @Query('siteId') siteId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.tasksService.getStatistics(
      siteId ? parseInt(siteId) : undefined,
      startDate,
      endDate,
    );
  }

  /**
   * 查询单个任务
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(+id);
  }

  /**
   * 更新任务
   */
  @Patch(':id')
  @Roles('admin', 'manager', 'operator')
  update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @CurrentUser('userId') userId: number,
  ) {
    return this.tasksService.update(+id, updateTaskDto, userId);
  }

  /**
   * 分配任务（分配车辆和司机）
   */
  @Post(':id/assign')
  @Roles('admin', 'manager', 'operator')
  assign(
    @Param('id') id: string,
    @Body() assignTaskDto: AssignTaskDto,
    @CurrentUser('userId') userId: number,
  ) {
    return this.tasksService.assign(+id, assignTaskDto, userId);
  }

  /**
   * 更新任务状态
   */
  @Patch(':id/status')
  @Roles('admin', 'manager', 'operator', 'driver')
  updateStatus(
    @Param('id') id: string,
    @Body() updateTaskStatusDto: UpdateTaskStatusDto,
    @CurrentUser('userId') userId: number,
  ) {
    return this.tasksService.updateStatus(+id, updateTaskStatusDto.status, userId);
  }

  /**
   * 删除任务
   */
  @Delete(':id')
  @Roles('admin', 'manager')
  remove(@Param('id') id: string) {
    return this.tasksService.remove(+id);
  }
}
