import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../shared/services/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: Prisma.UserUncheckedCreateInput) {
    try {
      return await this.prismaService.user.create({ data });
    } catch (e) {
      Logger.error('Error in UserRepository.create', e);
      throw e;
    }
  }

  async findOne(
    where: Prisma.UserWhereInput,
    includeAvatar = false,
    includeDeleted = false,
  ) {
    try {
      return await this.prismaService.user.findFirst({
        where: {
          ...where,
          ...(includeDeleted ? {} : { deletedAt: null }),
        },
        ...(includeAvatar && { include: { avatar: true } }),
      });
    } catch (e) {
      Logger.error('Error in UserRepository.findOne', e);
      throw e;
    }
  }

  async findByEmail(email: string) {
    try {
      return await this.prismaService.user.findFirst({
        where: {
          email,
          deletedAt: null,
        },
      });
    } catch (e) {
      Logger.error('Error in UserRepository.findByEmail', e);
      throw e;
    }
  }

  async findByRefreshToken(refreshToken: string) {
    try {
      return await this.prismaService.user.findFirst({
        where: {
          refreshToken,
          deletedAt: null,
        },
      });
    } catch (e) {
      Logger.error('Error in UserRepository.findByRefreshToken', e);
      throw e;
    }
  }

  async findMany() {
    try {
      return await this.prismaService.user.findMany({
        where: { deletedAt: null },
      });
    } catch (e) {
      Logger.error('Error in UserRepository.findMany', e);
      throw e;
    }
  }

  async update(
    where: Prisma.UserWhereUniqueInput,
    data: Prisma.UserUpdateInput,
  ) {
    try {
      return await this.prismaService.user.update({ where, data });
    } catch (e) {
      Logger.error('Error in UserRepository.update', e);
      throw e;
    }
  }

  async updateById(id: string, data: Prisma.UserUpdateInput) {
    try {
      return await this.prismaService.user.update({
        where: { id },
        data,
      });
    } catch (e) {
      Logger.error('Error in UserRepository.updateById', e);
      throw e;
    }
  }
}
