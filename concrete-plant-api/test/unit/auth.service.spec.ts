import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../src/auth/auth.service';
import { UsersService } from '../../src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUser = {
    id: 1,
    username: 'testuser',
    password: '$2b$10$hashedpassword',
    name: 'Test User',
    role: 'operator',
    email: 'test@example.com',
    phone: '13800138000',
    status: 'active',
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockUsersService = {
    findByUsername: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);

    // 清除所有mock
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user without password when credentials are valid', async () => {
      mockUsersService.findByUsername.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));

      const result = await service.validateUser('testuser', 'password123');

      expect(result).toBeDefined();
      expect(result.password).toBeUndefined();
      expect(result.username).toBe('testuser');
      expect(mockUsersService.findByUsername).toHaveBeenCalledWith('testuser');
    });

    it('should return null when user not found', async () => {
      mockUsersService.findByUsername.mockResolvedValue(null);

      const result = await service.validateUser('nonexistent', 'password123');

      expect(result).toBeNull();
    });

    it('should return null when password is incorrect', async () => {
      mockUsersService.findByUsername.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

      const result = await service.validateUser('testuser', 'wrongpassword');

      expect(result).toBeNull();
    });

    it('should return null when user is inactive', async () => {
      const inactiveUser = { ...mockUser, status: 'inactive' };
      mockUsersService.findByUsername.mockResolvedValue(inactiveUser);

      const result = await service.validateUser('testuser', 'password123');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access token when credentials are valid', async () => {
      const loginDto = { username: 'testuser', password: 'password123' };
      const expectedToken = 'jwt.token.here';

      mockUsersService.findByUsername.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));
      mockJwtService.sign.mockReturnValue(expectedToken);

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('access_token');
      expect(result.access_token).toBe(expectedToken);
      expect(result.user).toBeDefined();
      expect(result.user.password).toBeUndefined();
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      const loginDto = { username: 'testuser', password: 'wrongpassword' };

      mockUsersService.findByUsername.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      const loginDto = { username: 'nonexistent', password: 'password123' };

      mockUsersService.findByUsername.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should create new user successfully', async () => {
      const registerDto = {
        username: 'newuser',
        password: 'password123',
        name: 'New User',
        role: 'operator',
        email: 'new@example.com',
        phone: '13900139000',
      };

      mockUsersService.findByUsername.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue({ ...mockUser, ...registerDto });

      const result = await service.register(registerDto);

      expect(result).toBeDefined();
      expect(result.username).toBe(registerDto.username);
      expect(mockUsersService.create).toHaveBeenCalled();
    });

    it('should throw ConflictException when username already exists', async () => {
      const registerDto = {
        username: 'testuser',
        password: 'password123',
        name: 'Test User',
        role: 'operator',
      };

      mockUsersService.findByUsername.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const userId = 1;
      const oldPassword = 'oldpassword';
      const newPassword = 'newpassword';

      mockUsersService.findByUsername.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('$2b$10$newhash'));

      const result = await service.changePassword(userId, oldPassword, newPassword);

      expect(result).toHaveProperty('message');
      expect(result.message).toContain('成功');
    });

    it('should throw UnauthorizedException when old password is incorrect', async () => {
      const userId = 1;
      const oldPassword = 'wrongpassword';
      const newPassword = 'newpassword';

      mockUsersService.findByUsername.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

      await expect(
        service.changePassword(userId, oldPassword, newPassword),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
