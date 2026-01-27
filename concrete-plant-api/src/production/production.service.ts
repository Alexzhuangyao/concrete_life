import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBatchDto } from './dto/create-batch.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';
import { QueryBatchDto } from './dto/query-batch.dto';
import { CreateBatchRecordDto } from './dto/create-batch-record.dto';

@Injectable()
export class ProductionService {
  constructor(private prisma: PrismaService) {}

  /**
   * 创建生产批次
   */
  async createBatch(createBatchDto: CreateBatchDto, userId: number) {
    // 检查订单是否存在
    const order = await this.prisma.orders.findUnique({
      where: { id: createBatchDto.orderId },
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    // 检查配方是否存在
    const recipe = await this.prisma.recipes.findUnique({
      where: { id: createBatchDto.recipeId },
      include: {
        details: {
          include: {
            material: true,
          },
        },
      },
    });

    if (!recipe) {
      throw new NotFoundException('配方不存在');
    }

    if (recipe.status !== 'published') {
      throw new BadRequestException('只能使用已发布的配方');
    }

    // 生成批次号
    const batchNumber = await this.generateBatchNumber(createBatchDto.siteId);

    // 使用事务创建批次和配料记录
    const batch = await this.prisma.$transaction(async (prisma) => {
      // 创建生产批次
      const newBatch = await prisma.production_batches.create({
        data: {
          site_id: createBatchDto.siteId,
          order_id: createBatchDto.orderId,
          recipe_id: createBatchDto.recipeId,
          batch_number: batchNumber,
          planned_quantity: createBatchDto.plannedQuantity,
          actual_quantity: 0,
          status: 'pending',
          operator_id: userId,
          remarks: createBatchDto.remarks,
        },
      });

      // 如果提供了配料记录，创建配料记录
      if (createBatchDto.records && createBatchDto.records.length > 0) {
        await prisma.batch_records.createMany({
          data: createBatchDto.records.map(record => ({
            batch_id: newBatch.id,
            material_id: record.materialId,
            planned_quantity: record.plannedQuantity,
            actual_quantity: record.actualQuantity || 0,
            deviation: record.actualQuantity 
              ? ((record.actualQuantity - record.plannedQuantity) / record.plannedQuantity) * 100 
              : 0,
            operator_id: userId,
            remarks: record.remarks,
          })),
        });
      } else {
        // 根据配方自动创建配料记录
        await prisma.batch_records.createMany({
          data: recipe.details.map(detail => ({
            batch_id: newBatch.id,
            material_id: detail.material_id,
            planned_quantity: detail.quantity,
            actual_quantity: 0,
            deviation: 0,
            operator_id: userId,
          })),
        });
      }

      // 返回完整的批次信息
      return prisma.production_batches.findUnique({
        where: { id: newBatch.id },
        include: {
          site: true,
          order: true,
          recipe: true,
          operator: {
            select: {
              id: true,
              username: true,
              name: true,
            },
          },
          records: {
            include: {
              material: true,
              operator: {
                select: {
                  id: true,
                  username: true,
                  name: true,
                },
              },
            },
          },
        },
      });
    });

    return batch;
  }

  /**
   * 生成批次号
   */
  private async generateBatchNumber(siteId: number): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    
    // 查询今天的批次数量
    const count = await this.prisma.production_batches.count({
      where: {
        site_id: siteId,
        created_at: {
          gte: new Date(today.setHours(0, 0, 0, 0)),
          lt: new Date(today.setHours(23, 59, 59, 999)),
        },
      },
    });

    return `PC${dateStr}${String(count + 1).padStart(4, '0')}`;
  }

  /**
   * 查询生产批次列表
   */
  async findAllBatches(query: QueryBatchDto) {
    const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'desc', ...filters } = query;
    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: any = {};

    if (filters.siteId) {
      where.site_id = filters.siteId;
    }

    if (filters.orderId) {
      where.order_id = filters.orderId;
    }

    if (filters.recipeId) {
      where.recipe_id = filters.recipeId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.batchNumber) {
      where.batch_number = { contains: filters.batchNumber };
    }

    if (filters.startDate && filters.endDate) {
      where.created_at = {
        gte: new Date(filters.startDate),
        lte: new Date(filters.endDate),
      };
    }

    // 查询数据
    const [batches, total] = await Promise.all([
      this.prisma.production_batches.findMany({
        where,
        skip,
        take: limit,
        include: {
          site: true,
          order: true,
          recipe: true,
          operator: {
            select: {
              id: true,
              username: true,
              name: true,
            },
          },
          _count: {
            select: {
              records: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      this.prisma.production_batches.count({ where }),
    ]);

    return {
      data: batches,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 查询单个生产批次
   */
  async findOneBatch(id: number) {
    const batch = await this.prisma.production_batches.findUnique({
      where: { id },
      include: {
        site: true,
        order: true,
        recipe: {
          include: {
            grade: true,
            details: {
              include: {
                material: true,
              },
            },
          },
        },
        operator: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
        records: {
          include: {
            material: true,
            operator: {
              select: {
                id: true,
                username: true,
                name: true,
              },
            },
          },
          orderBy: {
            id: 'asc',
          },
        },
      },
    });

    if (!batch) {
      throw new NotFoundException('生产批次不存在');
    }

    return batch;
  }

  /**
   * 更新生产批次
   */
  async updateBatch(id: number, updateBatchDto: UpdateBatchDto, userId: number) {
    const batch = await this.prisma.production_batches.findUnique({
      where: { id },
    });

    if (!batch) {
      throw new NotFoundException('生产批次不存在');
    }

    if (batch.status === 'completed') {
      throw new BadRequestException('已完成的批次不能修改');
    }

    const updatedBatch = await this.prisma.production_batches.update({
      where: { id },
      data: {
        planned_quantity: updateBatchDto.plannedQuantity,
        actual_quantity: updateBatchDto.actualQuantity,
        status: updateBatchDto.status as any,
        start_time: updateBatchDto.startTime ? new Date(updateBatchDto.startTime) : undefined,
        end_time: updateBatchDto.endTime ? new Date(updateBatchDto.endTime) : undefined,
        remarks: updateBatchDto.remarks,
        updated_at: new Date(),
      },
      include: {
        site: true,
        order: true,
        recipe: true,
        records: {
          include: {
            material: true,
          },
        },
      },
    });

    return updatedBatch;
  }

  /**
   * 开始生产
   */
  async startBatch(id: number, userId: number) {
    const batch = await this.prisma.production_batches.findUnique({
      where: { id },
    });

    if (!batch) {
      throw new NotFoundException('生产批次不存在');
    }

    if (batch.status !== 'pending') {
      throw new BadRequestException('只能开始待生产的批次');
    }

    const updatedBatch = await this.prisma.production_batches.update({
      where: { id },
      data: {
        status: 'in_progress',
        start_time: new Date(),
        updated_at: new Date(),
      },
      include: {
        site: true,
        order: true,
        recipe: true,
      },
    });

    return updatedBatch;
  }

  /**
   * 完成生产
   */
  async completeBatch(id: number, actualQuantity: number, userId: number) {
    const batch = await this.prisma.production_batches.findUnique({
      where: { id },
      include: {
        records: true,
      },
    });

    if (!batch) {
      throw new NotFoundException('生产批次不存在');
    }

    if (batch.status !== 'in_progress') {
      throw new BadRequestException('只能完成进行中的批次');
    }

    // 检查是否所有配料记录都已完成
    const incompleteRecords = batch.records.filter(r => r.actual_quantity === 0);
    if (incompleteRecords.length > 0) {
      throw new BadRequestException('还有配料记录未完成');
    }

    const updatedBatch = await this.prisma.production_batches.update({
      where: { id },
      data: {
        status: 'completed',
        actual_quantity: actualQuantity,
        end_time: new Date(),
        updated_at: new Date(),
      },
      include: {
        site: true,
        order: true,
        recipe: true,
        records: {
          include: {
            material: true,
          },
        },
      },
    });

    return updatedBatch;
  }

  /**
   * 创建配料记录
   */
  async createBatchRecord(createBatchRecordDto: CreateBatchRecordDto, userId: number) {
    // 检查批次是否存在
    const batch = await this.prisma.production_batches.findUnique({
      where: { id: createBatchRecordDto.batchId },
    });

    if (!batch) {
      throw new NotFoundException('生产批次不存在');
    }

    if (batch.status === 'completed') {
      throw new BadRequestException('已完成的批次不能添加配料记录');
    }

    // 检查材料是否存在
    const material = await this.prisma.materials.findUnique({
      where: { id: createBatchRecordDto.materialId },
    });

    if (!material) {
      throw new NotFoundException('材料不存在');
    }

    // 计算偏差
    const deviation = createBatchRecordDto.actualQuantity
      ? ((createBatchRecordDto.actualQuantity - createBatchRecordDto.plannedQuantity) / createBatchRecordDto.plannedQuantity) * 100
      : 0;

    // 创建配料记录
    const record = await this.prisma.batch_records.create({
      data: {
        batch_id: createBatchRecordDto.batchId,
        material_id: createBatchRecordDto.materialId,
        planned_quantity: createBatchRecordDto.plannedQuantity,
        actual_quantity: createBatchRecordDto.actualQuantity || 0,
        deviation,
        operator_id: userId,
        remarks: createBatchRecordDto.remarks,
      },
      include: {
        batch: true,
        material: true,
        operator: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
      },
    });

    return record;
  }

  /**
   * 更新配料记录
   */
  async updateBatchRecord(id: number, actualQuantity: number, userId: number) {
    const record = await this.prisma.batch_records.findUnique({
      where: { id },
      include: {
        batch: true,
      },
    });

    if (!record) {
      throw new NotFoundException('配料记录不存在');
    }

    if (record.batch.status === 'completed') {
      throw new BadRequestException('已完成批次的配料记录不能修改');
    }

    // 计算偏差
    const deviation = ((actualQuantity - record.planned_quantity) / record.planned_quantity) * 100;

    const updatedRecord = await this.prisma.batch_records.update({
      where: { id },
      data: {
        actual_quantity: actualQuantity,
        deviation,
        updated_at: new Date(),
      },
      include: {
        material: true,
        operator: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
      },
    });

    return updatedRecord;
  }

  /**
   * 获取生产统计
   */
  async getStatistics(siteId?: number, startDate?: string, endDate?: string) {
    const where: any = {};

    if (siteId) {
      where.site_id = siteId;
    }

    if (startDate && endDate) {
      where.created_at = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const [
      totalBatches,
      pendingBatches,
      inProgressBatches,
      completedBatches,
      totalProduction,
    ] = await Promise.all([
      this.prisma.production_batches.count({ where }),
      this.prisma.production_batches.count({ where: { ...where, status: 'pending' } }),
      this.prisma.production_batches.count({ where: { ...where, status: 'in_progress' } }),
      this.prisma.production_batches.count({ where: { ...where, status: 'completed' } }),
      this.prisma.production_batches.aggregate({
        where: { ...where, status: 'completed' },
        _sum: {
          actual_quantity: true,
        },
      }),
    ]);

    return {
      totalBatches,
      pendingBatches,
      inProgressBatches,
      completedBatches,
      totalProduction: totalProduction._sum.actual_quantity || 0,
    };
  }
}
