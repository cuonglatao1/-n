import { IsString, IsEnum } from 'class-validator';
import { Provider } from '@prisma/client';

export class AddApiKeyDto {
  @IsEnum(Provider)
  provider: Provider;

  @IsString()
  name: string;

  @IsString()
  apiKey: string;
}
