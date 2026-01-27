import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { QuerySupplierDto } from './dto/query-supplier.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('suppliers')
@UseGuards(RolesGuard)
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  /**
   * 创建供应商
   */
  @Post()
  @Roles('admin', 'manager')
  create(
    @Body() createSupplierDto: CreateSupplierDto,
    @CurrentUser('userId') userId: number,
  ) {
    return this.suppliersService.create(createSupplierDto, userId);
  }

  /**
   * 查询供应商列表
   */
  @Get()
  findAll(@Query() query: QuerySupplierDto) {
    return this.suppliersService.findAll(query);
  }

  /**
   * 获取供应商统计
   */
  @Get('statistics')
  getStatistics() {
    return this.suppliersService.getStatistics();
  }

  /**
   * 查询单个供应商
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.suppliersService.findOne(+id);
  }

  /**
   * 更新供应商
   */
  @Patch(':id')
  @Roles('admin', 'manager')
  update(
    @Param('id') id: string,
    @Body() updateSupplierDto: UpdateSupplierDto,
    @CurrentUser('userId') userId: number,
  ) {
    return this.suppliersService.update(+id, updateSupplierDto, userId);
  }

  /**
   * 删除供应商
   */
  @Delete(':id')
  @Roles('admin', 'manager')
  remove(@Param('id') id: string) {
    return this.suppliersService.remove(+id);
  }
}
