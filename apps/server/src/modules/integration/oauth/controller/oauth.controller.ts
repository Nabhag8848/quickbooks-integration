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

@Controller('oauth')
export class OAuthController {
  constructor(private readonly registry: OAuthRegistryService) {}

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
    @Query() query: Record<string, string>
  ) {
    const service = this.registry.getService(integration);

    if (!service) {
      throw new NotFoundException('Integration not found');
    }

    return service.handleCallback(query);
  }
}
