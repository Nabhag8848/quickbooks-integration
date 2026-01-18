import {
  Controller,
  Get,
  Param,
  NotFoundException,
  Res,
  Query,
} from '@nestjs/common';
import { OAuthRegistryService } from '@/modules/integration/oauth/registry/oauth.registry';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { CompanyService } from '@/modules/company/company.service';
import { AccessTokenRefreshService } from '@/modules/integration/oauth/services/access-token-refresh.service';
import { SyncRegistryService } from '@/modules/integration/sync/registry/sync.registry';

@Controller('oauth')
export class OAuthController {
  constructor(
    private readonly oauthRegistryService: OAuthRegistryService,
    private readonly syncRegistryService: SyncRegistryService,
    private readonly configService: ConfigService,
    private readonly companyService: CompanyService,
    private readonly accessTokenRefreshService: AccessTokenRefreshService
  ) {}

  @Get('authorize/:integration')
  async authorize(
    @Param('integration') integration: string,
    @Res() res: Response
  ) {
    const oauthService = this.oauthRegistryService.getService(integration);

    if (!oauthService) {
      throw new NotFoundException('Integration not found');
    }

    return res.redirect(oauthService.getAuthorizationUrl());
  }

  @Get('callback/:integration')
  async callback(
    @Param('integration') integration: string,
    @Query() query: Record<string, string>,
    @Res() res: Response
  ) {
    const oauthService = this.oauthRegistryService.getService(integration);

    if (!oauthService) {
      throw new NotFoundException('Integration not found');
    }

    const company = await oauthService.handleCallback(query);
    
    await Promise.all([
      this.companyService.upsertCompany(company), 
      this.accessTokenRefreshService.setOAuthResponseWithExpiry(integration, company),
    ]);

    const syncService = this.syncRegistryService.getService(integration);

    if (!syncService) {
      throw new NotFoundException('Sync service not found');
    }

    await syncService.handleSync(company.sourceId);

    return res.redirect(`${this.configService.get<string>('SERVER_URL')}`);
  }
}
