import { IsString, IsOptional } from 'class-validator';

export class CreateFlowDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}
