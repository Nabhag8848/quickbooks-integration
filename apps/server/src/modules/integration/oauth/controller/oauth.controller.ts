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

@Controller('oauth')
export class OAuthController {
  constructor(
    private readonly registry: OAuthRegistryService,
    private readonly configService: ConfigService,
    private readonly companyService: CompanyService,
    private readonly accessTokenRefreshService: AccessTokenRefreshService
  ) {}

  @Get('authorize/:integration')
  async authorize(
    @Param('integration') integration: string,
    @Res() res: Response
  ) {
    const service = this.registry.getService(integration);

    if (!service) {
      throw new NotFoundException('Integration not found');
    }

    return res.redirect(service.getAuthorizationUrl());
  }

  @Get('callback/:integration')
  async callback(
    @Param('integration') integration: string,
    @Query() query: Record<string, string>,
    @Res() res: Response
  ) {
    const service = this.registry.getService(integration);

    if (!service) {
      throw new NotFoundException('Integration not found');
    }

    const company = await service.handleCallback(query);
    
    await Promise.all([
      this.companyService.upsertCompany(company), 
      this.accessTokenRefreshService.setOAuthResponseWithExpiry(integration, company),
    ]);

    return res.redirect(`${this.configService.get<string>('SERVER_URL')}`);
  }
}
