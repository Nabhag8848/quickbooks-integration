import { IsString } from 'class-validator';

export class QuickbooksOnlineCallbackDto {
  @IsString()
  code: string;

  @IsString()
  state: string;

  @IsString()
  realmId: string;
}
