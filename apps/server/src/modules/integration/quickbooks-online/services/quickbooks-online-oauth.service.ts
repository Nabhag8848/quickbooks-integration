import { AbstractOAuthService } from '@/modules/integration/oauth/services/abstract-oauth.service';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class QuickbooksOnlineOAuthService
  extends AbstractOAuthService
  implements OnModuleInit
{
  constructor(private readonly configService: ConfigService) {
    super();
  }

  readonly name = 'qbo';
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private authorizationEndpoint: string;

  async onModuleInit() {
    const clientId = this.configService.get<string>('QBO_CLIENT_ID');
    const clientSecret = this.configService.get<string>('QBO_CLIENT_SECRET');
    const serverUrl = this.configService.get<string>('SERVER_URL');
    const redirectPath = this.configService.get<string>(
      'QBO_REDIRECT_URI_PATH'
    );
    const redirectUri = `${serverUrl}/${redirectPath}`;
    const authorizationEndpoint = this.configService.get<string>(
      'QBO_AUTHORIZATION_ENDPOINT'
    );

    if (
      !clientId ||
      !clientSecret ||
      !serverUrl ||
      !redirectUri ||
      !authorizationEndpoint
    ) {
      throw new Error(
        [
          'Missing QuickBooks Online OAuth configuration.',
          `QBO_CLIENT_ID: ${clientId}`,
          `QBO_CLIENT_SECRET: ${clientSecret ? '[set]' : '[missing]'}`,
          `SERVER_URL: ${serverUrl}`,
          `QBO_REDIRECT_URI_PATH: ${redirectPath}`,
          `QBO_AUTHORIZATION_ENDPOINT: ${authorizationEndpoint}`,
        ].join('\n')
      );
    }

    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUri = redirectUri;
    this.authorizationEndpoint = authorizationEndpoint;
  }

  protected getAuthorizationEndpoint(): string {
    return this.authorizationEndpoint;
  }

  getAuthorizationUrl(): string {
    const baseUrl = this.getAuthorizationEndpoint();
    const queryParams = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'com.intuit.quickbooks.accounting',
      state: 'state', // TODO: add a random state for security
    });
    return `${baseUrl}?${queryParams.toString()}`;
  }
}
