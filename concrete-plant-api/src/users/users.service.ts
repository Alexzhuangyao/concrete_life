import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * 创建用户
   */
  async create(createUserDto: CreateUserDto) {
    const { username, password, name, email, phone, userType, siteId, roleId, department, position } = createUserDto;

    // 检查用户名是否已存在
    const existingUser = await this.prisma.users.findUnique({
      where: { username },
    });

    if (existingUser) {
      throw new ConflictException('用户名已存在');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = await this.prisma.users.create({
      data: {
        username,
        password_hash: hashedPassword,
        name,
        email,
        phone,
        user_type: userType as any,
        site_id: siteId,
        role_id: roleId,
        department,
        position,
        status: 'active',
      },
      include: {
        role: true,
        site: true,
      },
    });

    // 不返回密码哈希
    const { password_hash, ...result } = user;
    return result;
  }

  /**
   * 查询所有用户
   */
  async findAll(page: number = 1, limit: number = 10, siteId?: number, userType?: string, status?: string) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (siteId) where.site_id = siteId;
    if (userType) where.user_type = userType;
    if (status) where.status = status;

    const [users, total] = await Promise.all([
      this.prisma.users.findMany({
        where,
        skip,
        take: limit,
        include: {
          role: true,
          site: true,
        },
        orderBy: {
          created_at: 'desc',
        },
      }),
      this.prisma.users.count({ where }),
    ]);

    // 不返回密码哈希
    const usersWithoutPassword = users.map(({ password_hash, ...user }) => user);

    return {
      data: usersWithoutPassword,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 查询单个用户
   */
  async findOne(id: number) {
    const user = await this.prisma.users.findUnique({
      where: { id },
      include: {
        role: true,
        site: true,
      },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 不返回密码哈希
    const { password_hash, ...result } = user;
    return result;
  }

  /**
   * 更新用户
   */
  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.users.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 如果要更新用户名，检查是否已存在
    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existingUser = await this.prisma.users.findUnique({
        where: { username: updateUserDto.username },
      });

      if (existingUser) {
        throw new ConflictException('用户名已存在');
      }
    }

    // 如果要更新密码，加密密码
    let passwordHash: string | undefined;
    if (updateUserDto.password) {
      passwordHash = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = await this.prisma.users.update({
      where: { id },
      data: {
        username: updateUserDto.username,
        password_hash: passwordHash,
        name: updateUserDto.name,
        email: updateUserDto.email,
        phone: updateUserDto.phone,
        user_type: updateUserDto.userType as any,
        site_id: updateUserDto.siteId,
        role_id: updateUserDto.roleId,
        department: updateUserDto.department,
        position: updateUserDto.position,
        avatar: updateUserDto.avatar,
        status: updateUserDto.status as any,
      },
      include: {
        role: true,
        site: true,
      },
    });

    // 不返回密码哈希
    const { password_hash, ...result } = updatedUser;
    return result;
  }

  /**
   * 删除用户（软删除）
   */
  async remove(id: number) {
    const user = await this.prisma.users.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    await this.prisma.users.update({
      where: { id },
      data: {
        status: 'inactive',
        deleted_at: new Date(),
      },
    });

    return { message: '用户已删除' };
  }

  /**
   * 启用/禁用用户
   */
  async toggleStatus(id: number) {
    const user = await this.prisma.users.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const newStatus = user.status === 'active' ? 'inactive' : 'active';

    await this.prisma.users.update({
      where: { id },
      data: { status: newStatus },
    });

    return { message: `用户已${newStatus === 'active' ? '启用' : '禁用'}` };
  }
}
