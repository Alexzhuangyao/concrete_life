import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryRecordDto } from './dto/create-inventory-record.dto';
import { QueryInventoryRecordDto } from './dto/query-inventory-record.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('inventory')
@UseGuards(RolesGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  /**
   * 创建库存记录（入库/出库）
   */
  @Post('records')
  @Roles('admin', 'manager', 'operator')
  createRecord(
    @Body() createInventoryRecordDto: CreateInventoryRecordDto,
    @CurrentUser('userId') userId: number,
  ) {
    return this.inventoryService.createRecord(createInventoryRecordDto, userId);
  }

  /**
   * 查询库存记录列表
   */
  @Get('records')
  findAll(@Query() query: QueryInventoryRecordDto) {
    return this.inventoryService.findAll(query);
  }

  /**
   * 获取库存统计
   */
  @Get('statistics')
  getStatistics(
    @Query('materialId') materialId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.inventoryService.getStatistics(
      materialId ? parseInt(materialId) : undefined,
      startDate,
      endDate,
    );
  }

  /**
   * 查询单个库存记录
   */
  @Get('records/:id')
  findOne(@Param('id') id: string) {
    return this.inventoryService.findOne(+id);
  }
}
