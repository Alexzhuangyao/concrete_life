import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { QueryOrderDto } from './dto/query-order.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  /**
   * 创建订单
   */
  async create(createOrderDto: CreateOrderDto, userId: number) {
    const { items, ...orderData } = createOrderDto;

    // 检查订单编号是否已存在
    const existingOrder = await this.prisma.orders.findFirst({
      where: {
        order_no: createOrderDto.orderNo,
        site_id: createOrderDto.siteId,
      },
    });

    if (existingOrder) {
      throw new ConflictException('订单编号已存在');
    }

    // 检查站点是否存在
    const site = await this.prisma.sites.findUnique({
      where: { id: createOrderDto.siteId },
    });

    if (!site) {
      throw new NotFoundException('站点不存在');
    }

    // 如果有订单明细，验证配方是否存在
    if (items && items.length > 0) {
      const recipeIds = items.map(item => item.recipeId);
      const recipes = await this.prisma.recipes.findMany({
        where: { id: { in: recipeIds } },
      });

      if (recipes.length !== recipeIds.length) {
        throw new BadRequestException('部分配方不存在');
      }
    }

    // 创建订单和订单明细
    const order = await this.prisma.orders.create({
      data: {
        order_no: orderData.orderNo,
        site_id: orderData.siteId,
        customer_name: orderData.customerName,
        customer_phone: orderData.customerPhone,
        project_name: orderData.projectName,
        construction_site: orderData.constructionSite,
        required_delivery_time: new Date(orderData.requiredDeliveryTime),
        total_volume: orderData.totalVolume,
        total_amount: orderData.totalAmount,
        status: (orderData.status as any) || 'pending',
        remarks: orderData.remarks,
        created_by: userId,
        order_items: items && items.length > 0 ? {
          create: items.map(item => ({
            recipe_id: item.recipeId,
            volume: item.volume,
            unit_price: item.unitPrice,
            total_price: item.volume * item.unitPrice,
            remarks: item.remarks,
          })),
        } : undefined,
      },
      include: {
        order_items: {
          include: {
            recipe: {
              include: {
                grade: true,
              },
            },
          },
        },
        site: true,
        creator: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
      },
    });

    return order;
  }

  /**
   * 查询订单列表
   */
  async findAll(query: QueryOrderDto) {
    const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'desc', ...filters } = query;
    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: any = {};

    if (filters.siteId) {
      where.site_id = filters.siteId;
    }

    if (filters.orderNo) {
      where.order_no = { contains: filters.orderNo };
    }

    if (filters.customerName) {
      where.customer_name = { contains: filters.customerName };
    }

    if (filters.projectName) {
      where.project_name = { contains: filters.projectName };
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.startDate || filters.endDate) {
      where.created_at = {};
      if (filters.startDate) {
        where.created_at.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.created_at.lte = new Date(filters.endDate);
      }
    }

    // 查询数据
    const [orders, total] = await Promise.all([
      this.prisma.orders.findMany({
        where,
        skip,
        take: limit,
        include: {
          order_items: {
            include: {
              recipe: {
                include: {
                  grade: true,
                },
              },
            },
          },
          site: true,
          creator: {
            select: {
              id: true,
              username: true,
              name: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      this.prisma.orders.count({ where }),
    ]);

    return {
      data: orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 查询单个订单
   */
  async findOne(id: number) {
    const order = await this.prisma.orders.findUnique({
      where: { id },
      include: {
        order_items: {
          include: {
            recipe: {
              include: {
                grade: true,
                recipe_items: {
                  include: {
                    material: true,
                  },
                },
              },
            },
          },
        },
        site: true,
        creator: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
        tasks: {
          include: {
            vehicle: true,
            driver: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    return order;
  }

  /**
   * 更新订单
   */
  async update(id: number, updateOrderDto: UpdateOrderDto, userId: number) {
    const order = await this.prisma.orders.findUnique({
      where: { id },
      include: { order_items: true },
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    // 检查订单状态是否允许修改
    if (order.status === 'completed' || order.status === 'cancelled') {
      throw new BadRequestException('已完成或已取消的订单不能修改');
    }

    const { items, ...orderData } = updateOrderDto;

    // 如果修改订单编号，检查是否重复
    if (orderData.orderNo && orderData.orderNo !== order.order_no) {
      const existingOrder = await this.prisma.orders.findFirst({
        where: {
          order_no: orderData.orderNo,
          site_id: order.site_id,
          id: { not: id },
        },
      });

      if (existingOrder) {
        throw new ConflictException('订单编号已存在');
      }
    }

    // 更新订单
    const updatedOrder = await this.prisma.orders.update({
      where: { id },
      data: {
        order_no: orderData.orderNo,
        customer_name: orderData.customerName,
        customer_phone: orderData.customerPhone,
        project_name: orderData.projectName,
        construction_site: orderData.constructionSite,
        required_delivery_time: orderData.requiredDeliveryTime ? new Date(orderData.requiredDeliveryTime) : undefined,
        total_volume: orderData.totalVolume,
        total_amount: orderData.totalAmount,
        status: orderData.status as any,
        remarks: orderData.remarks,
        updated_at: new Date(),
      },
      include: {
        order_items: {
          include: {
            recipe: {
              include: {
                grade: true,
              },
            },
          },
        },
        site: true,
        creator: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
      },
    });

    // 如果有订单明细更新
    if (items && items.length > 0) {
      // 删除旧的明细
      await this.prisma.order_items.deleteMany({
        where: { order_id: id },
      });

      // 创建新的明细
      await this.prisma.order_items.createMany({
        data: items.map(item => ({
          order_id: id,
          recipe_id: item.recipeId,
          volume: item.volume,
          unit_price: item.unitPrice,
          total_price: item.volume * item.unitPrice,
          remarks: item.remarks,
        })),
      });
    }

    return this.findOne(id);
  }

  /**
   * 删除订单（软删除）
   */
  async remove(id: number) {
    const order = await this.prisma.orders.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    // 检查订单状态
    if (order.status === 'in_production') {
      throw new BadRequestException('生产中的订单不能删除');
    }

    await this.prisma.orders.update({
      where: { id },
      data: {
        deleted_at: new Date(),
      },
    });

    return { message: '订单已删除' };
  }

  /**
   * 更新订单状态
   */
  async updateStatus(id: number, status: string, userId: number) {
    const order = await this.prisma.orders.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    // 验证状态流转
    const validTransitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['in_production', 'cancelled'],
      in_production: ['completed'],
      completed: [],
      cancelled: [],
    };

    if (!validTransitions[order.status]?.includes(status)) {
      throw new BadRequestException(`订单状态不能从 ${order.status} 变更为 ${status}`);
    }

    const updatedOrder = await this.prisma.orders.update({
      where: { id },
      data: {
        status: status as any,
        updated_at: new Date(),
      },
      include: {
        order_items: {
          include: {
            recipe: {
              include: {
                grade: true,
              },
            },
          },
        },
        site: true,
      },
    });

    return updatedOrder;
  }

  /**
   * 获取订单统计
   */
  async getStatistics(siteId?: number, startDate?: string, endDate?: string) {
    const where: any = {};

    if (siteId) {
      where.site_id = siteId;
    }

    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) {
        where.created_at.gte = new Date(startDate);
      }
      if (endDate) {
        where.created_at.lte = new Date(endDate);
      }
    }

    const [
      totalOrders,
      pendingOrders,
      confirmedOrders,
      inProductionOrders,
      completedOrders,
      cancelledOrders,
      totalVolume,
      totalAmount,
    ] = await Promise.all([
      this.prisma.orders.count({ where }),
      this.prisma.orders.count({ where: { ...where, status: 'pending' } }),
      this.prisma.orders.count({ where: { ...where, status: 'confirmed' } }),
      this.prisma.orders.count({ where: { ...where, status: 'in_production' } }),
      this.prisma.orders.count({ where: { ...where, status: 'completed' } }),
      this.prisma.orders.count({ where: { ...where, status: 'cancelled' } }),
      this.prisma.orders.aggregate({
        where,
        _sum: { total_volume: true },
      }),
      this.prisma.orders.aggregate({
        where,
        _sum: { total_amount: true },
      }),
    ]);

    return {
      totalOrders,
      statusCount: {
        pending: pendingOrders,
        confirmed: confirmedOrders,
        inProduction: inProductionOrders,
        completed: completedOrders,
        cancelled: cancelledOrders,
      },
      totalVolume: totalVolume._sum.total_volume || 0,
      totalAmount: totalAmount._sum.total_amount || 0,
    };
  }
}
