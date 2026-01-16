import { IsDate, IsString } from 'class-validator';

export class UpsertCompanyDto {
  @IsString()
  sourceId: string;

  @IsString()
  accessToken: string;

  @IsString()
  refreshToken: string;

  @IsDate()
  accessTokenExpiresAt: Date;

  @IsDate()
  refreshTokenExpiresAt: Date;
}
