import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { MaterialsService } from './materials.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { QueryMaterialDto } from './dto/query-material.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('materials')
@UseGuards(RolesGuard)
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  /**
   * 创建材料
   */
  @Post()
  @Roles('admin', 'manager')
  create(
    @Body() createMaterialDto: CreateMaterialDto,
    @CurrentUser('userId') userId: number,
  ) {
    return this.materialsService.create(createMaterialDto, userId);
  }

  /**
   * 查询材料列表
   */
  @Get()
  findAll(@Query() query: QueryMaterialDto) {
    return this.materialsService.findAll(query);
  }

  /**
   * 获取材料统计
   */
  @Get('statistics')
  getStatistics(@Query('siteId') siteId?: string) {
    return this.materialsService.getStatistics(
      siteId ? parseInt(siteId) : undefined,
    );
  }

  /**
   * 获取低库存材料列表
   */
  @Get('low-stock')
  getLowStockMaterials(@Query('siteId') siteId?: string) {
    return this.materialsService.getLowStockMaterials(
      siteId ? parseInt(siteId) : undefined,
    );
  }

  /**
   * 查询单个材料
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.materialsService.findOne(+id);
  }

  /**
   * 更新材料
   */
  @Patch(':id')
  @Roles('admin', 'manager')
  update(
    @Param('id') id: string,
    @Body() updateMaterialDto: UpdateMaterialDto,
    @CurrentUser('userId') userId: number,
  ) {
    return this.materialsService.update(+id, updateMaterialDto, userId);
  }

  /**
   * 删除材料
   */
  @Delete(':id')
  @Roles('admin', 'manager')
  remove(@Param('id') id: string) {
    return this.materialsService.remove(+id);
  }
}
