import { Controller, Post, UseGuards, Request, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { LlmProvidersService } from './llm-providers.service';

@Controller('llm')
@UseGuards(AuthGuard('jwt'))
export class LlmProvidersController {
  constructor(private llmProvidersService: LlmProvidersService) {}

  @Post('generate-text')
  async generateText(@Request() req) {
    return {
      success: true,
      data: await this.llmProvidersService.generateText(
        req.body.provider,
        req.body.prompt,
        req.body.model
      ),
    };
  }

  @Post('stream-text')
  async streamText(@Request() req, @Res() res: Response) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Cache-Control', 'no-cache');

    try {
      for await (const token of (this.llmProvidersService.streamText as any)(
        req.body.provider,
        req.body.prompt,
        req.body.model,
        req.body.history
      )) {
        res.write(token);
      }
      res.end();
    } catch (err) {
      res.status(500).end('Streaming error');
    }
  }

}
