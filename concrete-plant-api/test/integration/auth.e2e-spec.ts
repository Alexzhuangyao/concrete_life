import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('Auth Integration Tests (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let authToken: string;
  let testUserId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    
    prismaService = app.get<PrismaService>(PrismaService);
    
    await app.init();

    // 清理测试数据
    await prismaService.users.deleteMany({
      where: { username: { startsWith: 'test_' } },
    });
  });

  afterAll(async () => {
    // 清理测试数据
    if (testUserId) {
      await prismaService.users.delete({ where: { id: testUserId } });
    }
    await app.close();
  });

  describe('/auth/register (POST)', () => {
    it('should register a new user', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'test_user_' + Date.now(),
          password: 'Test123456',
          name: 'Test User',
          role: 'operator',
          email: 'test@example.com',
          phone: '13800138000',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('username');
          expect(res.body).not.toHaveProperty('password');
          testUserId = res.body.id;
        });
    });

    it('should fail with duplicate username', async () => {
      const username = 'test_duplicate_' + Date.now();
      
      // 第一次注册
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username,
          password: 'Test123456',
          name: 'Test User',
          role: 'operator',
        })
        .expect(201);

      // 第二次注册相同用户名
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username,
          password: 'Test123456',
          name: 'Test User 2',
          role: 'operator',
        })
        .expect(409);
    });

    it('should fail with invalid data', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'te', // 太短
          password: '123', // 太短
        })
        .expect(400);
    });
  });

  describe('/auth/login (POST)', () => {
    beforeAll(async () => {
      // 创建测试用户
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'test_login_user',
          password: 'Test123456',
          name: 'Login Test User',
          role: 'operator',
        });
    });

    it('should login successfully', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'test_login_user',
          password: 'Test123456',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user).not.toHaveProperty('password');
          authToken = res.body.access_token;
        });
    });

    it('should fail with wrong password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'test_login_user',
          password: 'WrongPassword',
        })
        .expect(401);
    });

    it('should fail with non-existent user', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'nonexistent_user',
          password: 'Test123456',
        })
        .expect(401);
    });
  });

  describe('/auth/profile (GET)', () => {
    it('should get user profile with valid token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('username');
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('should fail without token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .expect(401);
    });

    it('should fail with invalid token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);
    });
  });

  describe('/auth/change-password (PATCH)', () => {
    it('should change password successfully', () => {
      return request(app.getHttpServer())
        .patch('/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oldPassword: 'Test123456',
          newPassword: 'NewTest123456',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
        });
    });

    it('should fail with wrong old password', () => {
      return request(app.getHttpServer())
        .patch('/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oldPassword: 'WrongPassword',
          newPassword: 'NewTest123456',
        })
        .expect(401);
    });
  });
});
