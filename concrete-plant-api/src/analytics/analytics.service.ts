import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  /**
   * 生产分析
   */
  async getProductionAnalytics(siteId?: number, startDate?: string, endDate?: string) {
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
      completedBatches,
      totalProduction,
      avgBatchSize,
      batchesByDay,
      productionByGrade,
      productionByRecipe,
    ] = await Promise.all([
      // 总批次数
      this.prisma.production_batches.count({ where }),
      
      // 完成批次数
      this.prisma.production_batches.count({
        where: { ...where, status: 'completed' },
      }),
      
      // 总产量
      this.prisma.production_batches.aggregate({
        where: { ...where, status: 'completed' },
        _sum: { actual_quantity: true },
      }),
      
      // 平均批次大小
      this.prisma.production_batches.aggregate({
        where: { ...where, status: 'completed' },
        _avg: { actual_quantity: true },
      }),
      
      // 按天统计
      this.prisma.$queryRaw`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as batch_count,
          SUM(actual_quantity) as production
        FROM production_batches
        WHERE status = 'completed'
        ${siteId ? this.prisma.$queryRaw`AND site_id = ${siteId}` : this.prisma.$queryRaw``}
        ${startDate && endDate ? this.prisma.$queryRaw`AND created_at BETWEEN ${startDate} AND ${endDate}` : this.prisma.$queryRaw``}
        GROUP BY DATE(created_at)
        ORDER BY date DESC
        LIMIT 30
      `,
      
      // 按等级统计
      this.prisma.$queryRaw`
        SELECT 
          g.name as grade_name,
          g.strength_grade,
          COUNT(pb.id) as batch_count,
          SUM(pb.actual_quantity) as total_production
        FROM production_batches pb
        JOIN recipes r ON pb.recipe_id = r.id
        JOIN concrete_grades g ON r.grade_id = g.id
        WHERE pb.status = 'completed'
        ${siteId ? this.prisma.$queryRaw`AND pb.site_id = ${siteId}` : this.prisma.$queryRaw``}
        ${startDate && endDate ? this.prisma.$queryRaw`AND pb.created_at BETWEEN ${startDate} AND ${endDate}` : this.prisma.$queryRaw``}
        GROUP BY g.id, g.name, g.strength_grade
        ORDER BY total_production DESC
      `,
      
      // 按配方统计
      this.prisma.$queryRaw`
        SELECT 
          r.name as recipe_name,
          r.version,
          COUNT(pb.id) as batch_count,
          SUM(pb.actual_quantity) as total_production
        FROM production_batches pb
        JOIN recipes r ON pb.recipe_id = r.id
        WHERE pb.status = 'completed'
        ${siteId ? this.prisma.$queryRaw`AND pb.site_id = ${siteId}` : this.prisma.$queryRaw``}
        ${startDate && endDate ? this.prisma.$queryRaw`AND pb.created_at BETWEEN ${startDate} AND ${endDate}` : this.prisma.$queryRaw``}
        GROUP BY r.id, r.name, r.version
        ORDER BY total_production DESC
        LIMIT 10
      `,
    ]);

    return {
      summary: {
        totalBatches,
        completedBatches,
        totalProduction: totalProduction._sum.actual_quantity || 0,
        avgBatchSize: avgBatchSize._avg.actual_quantity || 0,
        completionRate: totalBatches > 0 ? ((completedBatches / totalBatches) * 100).toFixed(2) : '0.00',
      },
      trends: {
        daily: batchesByDay,
      },
      distribution: {
        byGrade: productionByGrade,
        byRecipe: productionByRecipe,
      },
    };
  }

  /**
   * 效率分析
   */
  async getEfficiencyAnalytics(siteId?: number, startDate?: string, endDate?: string) {
    const where: any = { status: 'completed' };
    
    if (siteId) {
      where.site_id = siteId;
    }
    
    if (startDate && endDate) {
      where.created_at = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    // 计算平均生产时间
    const batches = await this.prisma.production_batches.findMany({
      where,
      select: {
        start_time: true,
        end_time: true,
        planned_quantity: true,
        actual_quantity: true,
      },
    });

    let totalDuration = 0;
    let validBatches = 0;
    let totalDeviation = 0;

    batches.forEach(batch => {
      if (batch.start_time && batch.end_time) {
        const duration = new Date(batch.end_time).getTime() - new Date(batch.start_time).getTime();
        totalDuration += duration;
        validBatches++;
      }
      
      if (batch.planned_quantity > 0) {
        const deviation = Math.abs(batch.actual_quantity - batch.planned_quantity) / batch.planned_quantity;
        totalDeviation += deviation;
      }
    });

    const avgDuration = validBatches > 0 ? totalDuration / validBatches : 0;
    const avgDeviation = batches.length > 0 ? (totalDeviation / batches.length) * 100 : 0;

    // 任务效率分析
    const taskWhere: any = { status: 'completed' };
    if (siteId) {
      taskWhere.site_id = siteId;
    }
    if (startDate && endDate) {
      taskWhere.created_at = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const [totalTasks, avgTaskDuration] = await Promise.all([
      this.prisma.tasks.count({ where: taskWhere }),
      this.prisma.$queryRaw`
        SELECT AVG(TIMESTAMPDIFF(MINUTE, created_at, updated_at)) as avg_duration
        FROM tasks
        WHERE status = 'completed'
        ${siteId ? this.prisma.$queryRaw`AND site_id = ${siteId}` : this.prisma.$queryRaw``}
        ${startDate && endDate ? this.prisma.$queryRaw`AND created_at BETWEEN ${startDate} AND ${endDate}` : this.prisma.$queryRaw``}
      `,
    ]);

    // 车辆利用率
    const vehicleStats = await this.prisma.$queryRaw`
      SELECT 
        v.plate_number,
        COUNT(t.id) as task_count,
        SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_tasks
      FROM vehicles v
      LEFT JOIN tasks t ON v.id = t.vehicle_id
      ${siteId ? this.prisma.$queryRaw`WHERE v.site_id = ${siteId}` : this.prisma.$queryRaw``}
      GROUP BY v.id, v.plate_number
      ORDER BY task_count DESC
      LIMIT 10
    `;

    return {
      production: {
        avgBatchDuration: Math.round(avgDuration / 1000 / 60), // 转换为分钟
        avgDeviation: avgDeviation.toFixed(2),
        totalBatches: batches.length,
      },
      tasks: {
        totalTasks,
        avgDuration: avgTaskDuration[0]?.avg_duration || 0,
      },
      vehicles: vehicleStats,
    };
  }

  /**
   * 质量分析
   */
  async getQualityAnalytics(siteId?: number, startDate?: string, endDate?: string) {
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

    // 配料偏差分析
    const deviationStats = await this.prisma.$queryRaw`
      SELECT 
        m.name as material_name,
        AVG(br.deviation) as avg_deviation,
        MAX(br.deviation) as max_deviation,
        MIN(br.deviation) as min_deviation,
        COUNT(*) as record_count
      FROM batch_records br
      JOIN materials m ON br.material_id = m.id
      JOIN production_batches pb ON br.batch_id = pb.id
      WHERE pb.status = 'completed'
      ${siteId ? this.prisma.$queryRaw`AND pb.site_id = ${siteId}` : this.prisma.$queryRaw``}
      ${startDate && endDate ? this.prisma.$queryRaw`AND pb.created_at BETWEEN ${startDate} AND ${endDate}` : this.prisma.$queryRaw``}
      GROUP BY m.id, m.name
      ORDER BY ABS(avg_deviation) DESC
      LIMIT 10
    `;

    // 质量问题告警统计
    const qualityAlarms = await this.prisma.alarms.count({
      where: {
        ...where,
        type: 'quality_issue',
      },
    });

    return {
      deviation: deviationStats,
      qualityAlarms,
    };
  }

  /**
   * 材料消耗分析
   */
  async getMaterialConsumptionAnalytics(siteId?: number, startDate?: string, endDate?: string) {
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

    const consumption = await this.prisma.$queryRaw`
      SELECT 
        m.name as material_name,
        m.unit,
        SUM(br.actual_quantity) as total_consumption,
        AVG(br.actual_quantity) as avg_consumption,
        COUNT(DISTINCT pb.id) as batch_count
      FROM batch_records br
      JOIN materials m ON br.material_id = m.id
      JOIN production_batches pb ON br.batch_id = pb.id
      WHERE pb.status = 'completed'
      ${siteId ? this.prisma.$queryRaw`AND pb.site_id = ${siteId}` : this.prisma.$queryRaw``}
      ${startDate && endDate ? this.prisma.$queryRaw`AND pb.created_at BETWEEN ${startDate} AND ${endDate}` : this.prisma.$queryRaw``}
      GROUP BY m.id, m.name, m.unit
      ORDER BY total_consumption DESC
    `;

    // 库存周转率
    const inventoryTurnover = await this.prisma.$queryRaw`
      SELECT 
        m.name as material_name,
        m.current_stock,
        m.min_stock,
        COUNT(it.id) as transaction_count,
        SUM(CASE WHEN it.type = 'in' THEN it.quantity ELSE 0 END) as total_in,
        SUM(CASE WHEN it.type = 'out' THEN it.quantity ELSE 0 END) as total_out
      FROM materials m
      LEFT JOIN inventory_transactions it ON m.id = it.material_id
      ${siteId ? this.prisma.$queryRaw`WHERE m.site_id = ${siteId}` : this.prisma.$queryRaw``}
      ${startDate && endDate ? this.prisma.$queryRaw`AND it.created_at BETWEEN ${startDate} AND ${endDate}` : this.prisma.$queryRaw``}
      GROUP BY m.id, m.name, m.current_stock, m.min_stock
      ORDER BY transaction_count DESC
      LIMIT 20
    `;

    return {
      consumption,
      inventoryTurnover,
    };
  }

  /**
   * 订单分析
   */
  async getOrderAnalytics(siteId?: number, startDate?: string, endDate?: string) {
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
      totalOrders,
      completedOrders,
      totalRevenue,
      avgOrderValue,
      ordersByStatus,
      topCustomers,
    ] = await Promise.all([
      this.prisma.orders.count({ where }),
      this.prisma.orders.count({ where: { ...where, status: 'completed' } }),
      this.prisma.orders.aggregate({
        where: { ...where, status: 'completed' },
        _sum: { total_price: true },
      }),
      this.prisma.orders.aggregate({
        where: { ...where, status: 'completed' },
        _avg: { total_price: true },
      }),
      this.prisma.orders.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
      this.prisma.$queryRaw`
        SELECT 
          customer_name,
          COUNT(*) as order_count,
          SUM(total_price) as total_revenue,
          AVG(total_price) as avg_order_value
        FROM orders
        WHERE status = 'completed'
        ${siteId ? this.prisma.$queryRaw`AND site_id = ${siteId}` : this.prisma.$queryRaw``}
        ${startDate && endDate ? this.prisma.$queryRaw`AND created_at BETWEEN ${startDate} AND ${endDate}` : this.prisma.$queryRaw``}
        GROUP BY customer_name
        ORDER BY total_revenue DESC
        LIMIT 10
      `,
    ]);

    return {
      summary: {
        totalOrders,
        completedOrders,
        totalRevenue: totalRevenue._sum.total_price || 0,
        avgOrderValue: avgOrderValue._avg.total_price || 0,
        completionRate: totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(2) : '0.00',
      },
      distribution: ordersByStatus,
      topCustomers,
    };
  }

  /**
   * 综合分析报告
   */
  async getComprehensiveReport(siteId?: number, startDate?: string, endDate?: string) {
    const [
      production,
      efficiency,
      quality,
      material,
      order,
    ] = await Promise.all([
      this.getProductionAnalytics(siteId, startDate, endDate),
      this.getEfficiencyAnalytics(siteId, startDate, endDate),
      this.getQualityAnalytics(siteId, startDate, endDate),
      this.getMaterialConsumptionAnalytics(siteId, startDate, endDate),
      this.getOrderAnalytics(siteId, startDate, endDate),
    ]);

    return {
      production,
      efficiency,
      quality,
      material,
      order,
      generatedAt: new Date().toISOString(),
    };
  }
}
