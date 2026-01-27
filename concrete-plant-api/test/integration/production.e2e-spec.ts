import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('Production Integration Tests (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let authToken: string;
  let testBatchId: number;
  let testSiteId: number;
  let testOrderId: number;
  let testRecipeId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    
    prismaService = app.get<PrismaService>(PrismaService);
    
    await app.init();

    // 登录获取token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: 'admin',
        password: 'admin123',
      });
    
    authToken = loginResponse.body.access_token;

    // 创建测试数据
    const site = await prismaService.sites.findFirst();
    testSiteId = site.id;

    const order = await prismaService.orders.findFirst();
    testOrderId = order.id;

    const recipe = await prismaService.recipes.findFirst({
      where: { status: 'published' },
    });
    testRecipeId = recipe.id;
  });

  afterAll(async () => {
    // 清理测试数据
    if (testBatchId) {
      await prismaService.batch_records.deleteMany({
        where: { batch_id: testBatchId },
      });
      await prismaService.production_batches.delete({
        where: { id: testBatchId },
      });
    }
    await app.close();
  });

  describe('/production/batches (POST)', () => {
    it('should create a production batch', () => {
      return request(app.getHttpServer())
        .post('/production/batches')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          siteId: testSiteId,
          orderId: testOrderId,
          recipeId: testRecipeId,
          plannedQuantity: 10.5,
          remarks: 'Test batch',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('batch_number');
          expect(res.body.batch_number).toMatch(/^PC\d{8}\d{4}$/);
          expect(res.body.status).toBe('pending');
          testBatchId = res.body.id;
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .post('/production/batches')
        .send({
          siteId: testSiteId,
          orderId: testOrderId,
          recipeId: testRecipeId,
          plannedQuantity: 10.5,
        })
        .expect(401);
    });

    it('should fail with invalid recipe', () => {
      return request(app.getHttpServer())
        .post('/production/batches')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          siteId: testSiteId,
          orderId: testOrderId,
          recipeId: 99999,
          plannedQuantity: 10.5,
        })
        .expect(404);
    });
  });

  describe('/production/batches (GET)', () => {
    it('should get all batches', () => {
      return request(app.getHttpServer())
        .get('/production/batches')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('total');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should filter by status', () => {
      return request(app.getHttpServer())
        .get('/production/batches?status=pending')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.every(b => b.status === 'pending')).toBe(true);
        });
    });

    it('should support pagination', () => {
      return request(app.getHttpServer())
        .get('/production/batches?page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.page).toBe(1);
          expect(res.body.limit).toBe(5);
          expect(res.body.data.length).toBeLessThanOrEqual(5);
        });
    });
  });

  describe('/production/batches/:id (GET)', () => {
    it('should get batch by id', () => {
      return request(app.getHttpServer())
        .get(`/production/batches/${testBatchId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(testBatchId);
          expect(res.body).toHaveProperty('records');
          expect(Array.isArray(res.body.records)).toBe(true);
        });
    });

    it('should return 404 for non-existent batch', () => {
      return request(app.getHttpServer())
        .get('/production/batches/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('/production/batches/:id/start (POST)', () => {
    it('should start production batch', () => {
      return request(app.getHttpServer())
        .post(`/production/batches/${testBatchId}/start`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201)
        .expect((res) => {
          expect(res.body.status).toBe('in_progress');
          expect(res.body.start_time).toBeDefined();
        });
    });

    it('should fail to start already started batch', () => {
      return request(app.getHttpServer())
        .post(`/production/batches/${testBatchId}/start`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });

  describe('/production/records/:id (PATCH)', () => {
    let testRecordId: number;

    beforeAll(async () => {
      const batch = await prismaService.production_batches.findUnique({
        where: { id: testBatchId },
        include: { records: true },
      });
      testRecordId = batch.records[0]?.id;
    });

    it('should update batch record', () => {
      if (!testRecordId) {
        return;
      }

      return request(app.getHttpServer())
        .patch(`/production/records/${testRecordId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          actualQuantity: 352,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.actual_quantity).toBe(352);
          expect(res.body.deviation).toBeDefined();
        });
    });
  });

  describe('/production/statistics (GET)', () => {
    it('should get production statistics', () => {
      return request(app.getHttpServer())
        .get('/production/statistics')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('totalBatches');
          expect(res.body).toHaveProperty('pendingBatches');
          expect(res.body).toHaveProperty('totalProduction');
        });
    });

    it('should filter statistics by site', () => {
      return request(app.getHttpServer())
        .get(`/production/statistics?siteId=${testSiteId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });
});
