import { IsString, IsOptional, IsNumber, IsArray, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class LLMOptionsDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2)
  temperature?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxTokens?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  topP?: number;

  @IsOptional()
  @IsNumber()
  @Min(-2)
  @Max(2)
  frequencyPenalty?: number;

  @IsOptional()
  @IsNumber()
  @Min(-2)
  @Max(2)
  presencePenalty?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  stop?: string[];
}

export class StreamRequestDto {
  @IsString()
  nodeId: string;

  @IsString()
  prompt: string;

  @IsString()
  model: string;

  @IsOptional()
  @Type(() => LLMOptionsDto)
  options?: LLMOptionsDto;
}
