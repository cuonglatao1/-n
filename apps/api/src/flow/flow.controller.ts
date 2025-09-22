import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FlowService } from './flow.service';
import { CreateFlowDto, UpdateFlowDto } from './dto';

@Controller('flows')
@UseGuards(AuthGuard('jwt'))
export class FlowController {
  constructor(private flowService: FlowService) {}

  @Get()
  async findAll(@Request() req) {
    return {
      success: true,
      data: await this.flowService.findAll(req.user.userId),
    };
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    return {
      success: true,
      data: await this.flowService.findOne(req.user.userId, id),
    };
  }

  @Post()
  async create(@Request() req, @Body() createFlowDto: CreateFlowDto) {
    return {
      success: true,
      data: await this.flowService.create(req.user.userId, createFlowDto),
    };
  }

  @Patch(':id')
  async update(@Request() req, @Param('id') id: string, @Body() updateFlowDto: UpdateFlowDto) {
    return {
      success: true,
      data: await this.flowService.update(req.user.userId, id, updateFlowDto),
    };
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    await this.flowService.remove(req.user.userId, id);
    return {
      success: true,
      message: 'Flow deleted successfully',
    };
  }
}
