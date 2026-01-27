import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { QueryRecipeDto } from './dto/query-recipe.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('recipes')
@UseGuards(RolesGuard)
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  /**
   * 创建配方
   */
  @Post()
  @Roles('admin', 'manager')
  create(
    @Body() createRecipeDto: CreateRecipeDto,
    @CurrentUser('userId') userId: number,
  ) {
    return this.recipesService.create(createRecipeDto, userId);
  }

  /**
   * 查询配方列表
   */
  @Get()
  findAll(@Query() query: QueryRecipeDto) {
    return this.recipesService.findAll(query);
  }

  /**
   * 获取配方统计
   */
  @Get('statistics')
  getStatistics(@Query('siteId') siteId?: string) {
    return this.recipesService.getStatistics(
      siteId ? parseInt(siteId) : undefined,
    );
  }

  /**
   * 查询单个配方
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.recipesService.findOne(+id);
  }

  /**
   * 更新配方
   */
  @Patch(':id')
  @Roles('admin', 'manager')
  update(
    @Param('id') id: string,
    @Body() updateRecipeDto: UpdateRecipeDto,
    @CurrentUser('userId') userId: number,
  ) {
    return this.recipesService.update(+id, updateRecipeDto, userId);
  }

  /**
   * 发布配方
   */
  @Patch(':id/publish')
  @Roles('admin', 'manager')
  publish(
    @Param('id') id: string,
    @CurrentUser('userId') userId: number,
  ) {
    return this.recipesService.publish(+id, userId);
  }

  /**
   * 归档配方
   */
  @Patch(':id/archive')
  @Roles('admin', 'manager')
  archive(
    @Param('id') id: string,
    @CurrentUser('userId') userId: number,
  ) {
    return this.recipesService.archive(+id, userId);
  }

  /**
   * 复制配方（创建新版本）
   */
  @Post(':id/copy')
  @Roles('admin', 'manager')
  copy(
    @Param('id') id: string,
    @CurrentUser('userId') userId: number,
  ) {
    return this.recipesService.copy(+id, userId);
  }

  /**
   * 删除配方
   */
  @Delete(':id')
  @Roles('admin', 'manager')
  remove(@Param('id') id: string) {
    return this.recipesService.remove(+id);
  }
}
