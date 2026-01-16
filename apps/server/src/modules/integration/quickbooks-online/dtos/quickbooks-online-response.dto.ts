import { IsNumber, IsString } from 'class-validator';

export class QuickbooksOnlineResponseDto {
  @IsString()
  token_type: string;

  @IsString()
  access_token: string;

  @IsString()
  refresh_token: string;

  @IsNumber()
  x_refresh_token_expires_in: number;

  @IsNumber()
  expires_in: number;
}
