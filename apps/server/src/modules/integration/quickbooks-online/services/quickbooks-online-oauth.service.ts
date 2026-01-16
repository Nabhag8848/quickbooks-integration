import { AbstractOAuthService } from '@/modules/integration/oauth/services/abstract-oauth.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class QuickbooksOnlineOAuthService extends AbstractOAuthService {
  constructor() {
    super();
  }

  readonly name = 'qbo';

  protected getAuthorizationEndpoint(): string {
    return 'https://app.sandbox.qbo.intuit.com/connect/oauth2';
  }

  getAuthorizationUrl(): string {
    return 'https://app.sandbox.qbo.intuit.com/connect/oauth2';
  }
}
