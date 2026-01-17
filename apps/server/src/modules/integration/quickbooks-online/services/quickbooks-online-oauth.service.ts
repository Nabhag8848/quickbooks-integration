import { AbstractOAuthService } from '@/modules/integration/oauth/services/abstract-oauth.service';
import {
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  QuickbooksOnlineCallbackDto,
  QuickbooksOnlineResponseDto,
} from '@/modules/integration/quickbooks-online/dtos';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { OAuthResponseDto } from '@/modules/integration/oauth/dtos';
import { calculateExpirationDate } from '@/utils';
import { RedisService } from '@/database/redis';
import { CompanyService } from '@/modules/company/company.service';
import { AccessTokenRefreshService } from '@/modules/integration/oauth/services/access-token-refresh.service';
@Injectable()
export class QuickbooksOnlineOAuthService
  extends AbstractOAuthService<
    QuickbooksOnlineCallbackDto,
    QuickbooksOnlineResponseDto
  >
  implements OnModuleInit
{
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly redisService: RedisService, 
    private readonly companyService: CompanyService,
    private readonly accessTokenRefreshService: AccessTokenRefreshService
  ) {
    super();
  }

  readonly name = 'qbo';
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private authorizationEndpoint: string;
  private tokenEndpoint: string;

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
    const tokenEndpoint = this.configService.get<string>(
      'QBO_AUTHORIZATION_TOKEN_ENDPOINT'
    );

    if (
      !clientId ||
      !clientSecret ||
      !serverUrl ||
      !redirectUri ||
      !authorizationEndpoint ||
      !tokenEndpoint
    ) {
      throw new Error(
        [
          'Missing QuickBooks Online OAuth configuration.',
          `QBO_CLIENT_ID: ${clientId}`,
          `QBO_CLIENT_SECRET: ${clientSecret ? '[set]' : '[missing]'}`,
          `SERVER_URL: ${serverUrl}`,
          `QBO_REDIRECT_URI_PATH: ${redirectPath}`,
          `QBO_AUTHORIZATION_ENDPOINT: ${authorizationEndpoint}`,
          `QBO_AUTHORIZATION_TOKEN_ENDPOINT: ${tokenEndpoint}`,
        ].join('\n')
      );
    }

    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUri = redirectUri;
    this.authorizationEndpoint = authorizationEndpoint;
    this.tokenEndpoint = tokenEndpoint;

    await this.listenForTokenExpiry();
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

  protected async exchangeCodeForToken(
    code: string
  ): Promise<QuickbooksOnlineResponseDto> {
    const credentials = Buffer.from(
      `${this.clientId}:${this.clientSecret}`
    ).toString('base64');

    const Authorization = `Basic ${credentials}`;

    // Create URL-encoded form data
    const formData = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: this.redirectUri,
    });

    try {
      const response = await firstValueFrom(
        this.httpService.post<QuickbooksOnlineResponseDto>(
          this.tokenEndpoint,
          formData.toString(),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              Accept: 'application/json',
              Authorization,
            },
          }
        )
      );

      return response.data;
    } catch (error) {
      console.error('QuickBooks OAuth token exchange error:', error);
      throw new InternalServerErrorException(
        `QuickBooks Online token exchange failed`
      );
    }
  }

  async handleCallback(
    query: QuickbooksOnlineCallbackDto
  ): Promise<OAuthResponseDto> {
    const { code } = query;
    const response = await this.exchangeCodeForToken(code);

    return {
      sourceId: query.realmId,
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
      accessTokenExpiresAt: calculateExpirationDate(response.expires_in),
      refreshTokenExpiresAt: calculateExpirationDate(
        response.x_refresh_token_expires_in
      ),
    };
  }

  async listenForTokenExpiry(): Promise<void> {
    const subscriber = this.redisService.getSubscriber();

    await subscriber.psubscribe(`__keyspace@0__:oauth:${this.name}:*`);

    subscriber.on('pmessage', async (_pattern, channel) => {  
      const parts = channel.split(':');
      const sourceId = parts[parts.length - 1];

      const refreshToken = await this.companyService.getRefreshTokenBySourceId(sourceId);
      const response = await this.refreshAccessToken(refreshToken);
      const company = {
        sourceId,
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        accessTokenExpiresAt: calculateExpirationDate(response.expires_in),
        refreshTokenExpiresAt: calculateExpirationDate(response.x_refresh_token_expires_in),
      }
      await Promise.all([
        this.companyService.upsertCompany(company),
        this.accessTokenRefreshService.setOAuthResponseWithExpiry(this.name, company),
      ]);
    });
  }

  async refreshAccessToken(refreshToken: string): Promise<QuickbooksOnlineResponseDto> {
    const credentials = Buffer.from(
      `${this.clientId}:${this.clientSecret}`
    ).toString('base64');

    const Authorization = `Basic ${credentials}`;

    const formData = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });

    try {
      const response = await firstValueFrom(
        this.httpService.post<QuickbooksOnlineResponseDto>(
          this.tokenEndpoint,
          formData.toString(),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              Accept: 'application/json',
              Authorization,
            },
          }
        )
      );

      return response.data;
    } catch (error) {
      console.error('QuickBooks OAuth token refresh error:', error);
      throw new InternalServerErrorException(
        `QuickBooks Online token refresh failed`
      );
    }
  }
}
