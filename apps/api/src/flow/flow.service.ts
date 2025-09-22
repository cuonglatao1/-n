import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFlowDto, UpdateFlowDto } from './dto';

@Injectable()
export class FlowService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.flow.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(userId: string, flowId: string) {
    const flow = await this.prisma.flow.findUnique({
      where: { id: flowId },
    });

    if (!flow) {
      throw new NotFoundException('Flow not found');
    }

    if (flow.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return flow;
  }

  async create(userId: string, createFlowDto: CreateFlowDto) {
    return this.prisma.flow.create({
      data: {
        ...createFlowDto,
        userId,
        nodes: [],
        edges: [],
      },
    });
  }

  async update(userId: string, flowId: string, updateFlowDto: UpdateFlowDto) {
    // Check if flow exists and belongs to user
    await this.findOne(userId, flowId);

    return this.prisma.flow.update({
      where: { id: flowId },
      data: updateFlowDto,
    });
  }

  async remove(userId: string, flowId: string) {
    // Check if flow exists and belongs to user
    await this.findOne(userId, flowId);

    return this.prisma.flow.delete({
      where: { id: flowId },
    });
  }
}
