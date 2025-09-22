import { Controller, Post, Body, UseGuards, Request, Sse, MessageEvent } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { StreamingService } from './streaming.service';
import { StreamRequestDto } from './dto';

@Controller('llm')
@UseGuards(AuthGuard('jwt'))
export class StreamingController {
  constructor(private streamingService: StreamingService) {}

  @Post('stream')
  @Sse()
  async stream(
    @Request() req,
    @Body() streamRequest: StreamRequestDto,
  ): Promise<Observable<MessageEvent>> {
    const streamObservable = await this.streamingService.createStreamObservable(
      req.user.userId,
      streamRequest,
    );

    return streamObservable.pipe(
      map((data) => ({
        data: data.data,
        type: 'message',
      } as MessageEvent)),
    );
  }
}
