import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SettingsService } from './settings.service';
import { AddApiKeyDto, UpdateApiKeyDto } from './dto';

@Controller('settings')
@UseGuards(AuthGuard('jwt'))
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get()
  async getSettings(@Request() req) {
    return {
      success: true,
      data: await this.settingsService.getUserSettings(req.user.userId),
    };
  }

  @Post('api-keys')
  async addApiKey(@Request() req, @Body() addApiKeyDto: AddApiKeyDto) {
    return {
      success: true,
      data: await this.settingsService.addApiKey(req.user.userId, addApiKeyDto),
    };
  }

  @Patch('api-keys/:id')
  async updateApiKey(
    @Request() req,
    @Param('id') keyId: string,
    @Body() updateApiKeyDto: UpdateApiKeyDto,
  ) {
    return {
      success: true,
      data: await this.settingsService.updateApiKey(req.user.userId, keyId, updateApiKeyDto),
    };
  }

  @Delete('api-keys/:id')
  async deleteApiKey(@Request() req, @Param('id') keyId: string) {
    await this.settingsService.deleteApiKey(req.user.userId, keyId);
    return {
      success: true,
      message: 'API key deleted successfully',
    };
  }
}
