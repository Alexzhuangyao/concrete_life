import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('orders')
@UseGuards(RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * 创建订单
   */
  @Post()
  @Roles('admin', 'manager', 'operator')
  create(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser('userId') userId: number,
  ) {
    return this.ordersService.create(createOrderDto, userId);
  }

  /**
   * 查询订单列表
   */
  @Get()
  findAll(@Query() query: QueryOrderDto) {
    return this.ordersService.findAll(query);
  }

  /**
   * 获取订单统计
   */
  @Get('statistics')
  getStatistics(
    @Query('siteId') siteId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.ordersService.getStatistics(
      siteId ? parseInt(siteId) : undefined,
      startDate,
      endDate,
    );
  }

  /**
   * 查询单个订单
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(+id);
  }

  /**
   * 更新订单
   */
  @Patch(':id')
  @Roles('admin', 'manager', 'operator')
  update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @CurrentUser('userId') userId: number,
  ) {
    return this.ordersService.update(+id, updateOrderDto, userId);
  }

  /**
   * 更新订单状态
   */
  @Patch(':id/status')
  @Roles('admin', 'manager', 'operator')
  updateStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
    @CurrentUser('userId') userId: number,
  ) {
    return this.ordersService.updateStatus(+id, updateOrderStatusDto.status, userId);
  }

  /**
   * 删除订单
   */
  @Delete(':id')
  @Roles('admin', 'manager')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }
}
