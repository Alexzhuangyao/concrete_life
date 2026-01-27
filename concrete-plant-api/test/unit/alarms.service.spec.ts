import { Test, TestingModule } from '@nestjs/testing';
import { AlarmsService } from '../../src/alarms/alarms.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('AlarmsService', () => {
  let service: AlarmsService;
  let prismaService: PrismaService;

  const mockAlarm = {
    id: 1,
    type: 'low_stock',
    level: 'high',
    title: '材料库存不足',
    message: '水泥库存不足',
    source: 'material',
    source_id: 1,
    site_id: 1,
    status: 'pending',
    triggered_at: new Date(),
    acknowledged_by: null,
    acknowledged_at: null,
    resolved_by: null,
    resolved_at: null,
    data: null,
    remarks: null,
    solution: null,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockPrismaService = {
    alarms: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    materials: {
      findMany: jest.fn(),
      fields: {
        min_stock: 'min_stock',
      },
    },
    vehicles: {
      findMany: jest.fn(),
    },
    tasks: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlarmsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AlarmsService>(AlarmsService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create alarm successfully', async () => {
      const createAlarmDto = {
        type: 'low_stock',
        level: 'high',
        title: '材料库存不足',
        message: '水泥库存不足',
        source: 'material',
        sourceId: 1,
        siteId: 1,
      };

      mockPrismaService.alarms.create.mockResolvedValue(mockAlarm);

      const result = await service.create(createAlarmDto);

      expect(result).toEqual(mockAlarm);
      expect(mockPrismaService.alarms.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated alarms', async () => {
      const query = { page: 1, limit: 10 };
      const mockAlarms = [mockAlarm];

      mockPrismaService.alarms.findMany.mockResolvedValue(mockAlarms);
      mockPrismaService.alarms.count.mockResolvedValue(1);

      const result = await service.findAll(query);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(result.data).toEqual(mockAlarms);
    });

    it('should filter by level', async () => {
      const query = { page: 1, limit: 10, level: 'high' };

      mockPrismaService.alarms.findMany.mockResolvedValue([mockAlarm]);
      mockPrismaService.alarms.count.mockResolvedValue(1);

      await service.findAll(query);

      expect(mockPrismaService.alarms.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ level: 'high' }),
        }),
      );
    });
  });

  describe('acknowledge', () => {
    it('should acknowledge alarm successfully', async () => {
      mockPrismaService.alarms.findUnique.mockResolvedValue(mockAlarm);
      mockPrismaService.alarms.update.mockResolvedValue({
        ...mockAlarm,
        status: 'acknowledged',
        acknowledged_by: 1,
        acknowledged_at: new Date(),
      });

      const result = await service.acknowledge(1, 1, '已确认');

      expect(result.status).toBe('acknowledged');
      expect(result.acknowledged_by).toBe(1);
      expect(result.acknowledged_at).toBeDefined();
    });

    it('should throw BadRequestException when alarm is not pending', async () => {
      const acknowledgedAlarm = { ...mockAlarm, status: 'acknowledged' };
      mockPrismaService.alarms.findUnique.mockResolvedValue(acknowledgedAlarm);

      await expect(service.acknowledge(1, 1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('resolve', () => {
    it('should resolve alarm successfully', async () => {
      mockPrismaService.alarms.findUnique.mockResolvedValue(mockAlarm);
      mockPrismaService.alarms.update.mockResolvedValue({
        ...mockAlarm,
        status: 'resolved',
        resolved_by: 1,
        resolved_at: new Date(),
      });

      const result = await service.resolve(1, 1, '问题已解决');

      expect(result.status).toBe('resolved');
      expect(result.resolved_by).toBe(1);
      expect(result.resolved_at).toBeDefined();
    });

    it('should throw BadRequestException when alarm is already resolved', async () => {
      const resolvedAlarm = { ...mockAlarm, status: 'resolved' };
      mockPrismaService.alarms.findUnique.mockResolvedValue(resolvedAlarm);

      await expect(service.resolve(1, 1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getStatistics', () => {
    it('should return alarm statistics', async () => {
      mockPrismaService.alarms.count
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(10)  // pending
        .mockResolvedValueOnce(20)  // acknowledged
        .mockResolvedValueOnce(60)  // resolved
        .mockResolvedValueOnce(10)  // ignored
        .mockResolvedValueOnce(5)   // critical
        .mockResolvedValueOnce(15)  // high
        .mockResolvedValueOnce(50)  // medium
        .mockResolvedValueOnce(30); // low

      mockPrismaService.alarms.groupBy.mockResolvedValue([
        { type: 'low_stock', _count: 30 },
        { type: 'vehicle_fault', _count: 20 },
      ]);

      const result = await service.getStatistics();

      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('byStatus');
      expect(result).toHaveProperty('byLevel');
      expect(result).toHaveProperty('byType');
      expect(result.total).toBe(100);
    });
  });

  describe('checkAndCreateAlarms', () => {
    it('should create alarms for low stock materials', async () => {
      const lowStockMaterial = {
        id: 1,
        name: '水泥',
        current_stock: 500,
        min_stock: 1000,
        unit: 'kg',
        site_id: 1,
        site: { id: 1, name: 'Test Site' },
      };

      mockPrismaService.materials.findMany.mockResolvedValue([lowStockMaterial]);
      mockPrismaService.alarms.findFirst.mockResolvedValue(null);
      mockPrismaService.alarms.create.mockResolvedValue(mockAlarm);
      mockPrismaService.vehicles.findMany.mockResolvedValue([]);
      mockPrismaService.tasks.findMany.mockResolvedValue([]);

      const result = await service.checkAndCreateAlarms();

      expect(result.count).toBeGreaterThan(0);
      expect(mockPrismaService.alarms.create).toHaveBeenCalled();
    });

    it('should not create duplicate alarms', async () => {
      const lowStockMaterial = {
        id: 1,
        name: '水泥',
        current_stock: 500,
        min_stock: 1000,
        unit: 'kg',
        site_id: 1,
        site: { id: 1, name: 'Test Site' },
      };

      mockPrismaService.materials.findMany.mockResolvedValue([lowStockMaterial]);
      mockPrismaService.alarms.findFirst.mockResolvedValue(mockAlarm); // 已存在告警
      mockPrismaService.vehicles.findMany.mockResolvedValue([]);
      mockPrismaService.tasks.findMany.mockResolvedValue([]);

      const result = await service.checkAndCreateAlarms();

      expect(result.count).toBe(0);
      expect(mockPrismaService.alarms.create).not.toHaveBeenCalled();
    });
  });

  describe('batchAcknowledge', () => {
    it('should acknowledge multiple alarms', async () => {
      mockPrismaService.alarms.updateMany.mockResolvedValue({ count: 3 });

      const result = await service.batchAcknowledge([1, 2, 3], 1, '批量确认');

      expect(result.count).toBe(3);
      expect(mockPrismaService.alarms.updateMany).toHaveBeenCalled();
    });
  });
});
