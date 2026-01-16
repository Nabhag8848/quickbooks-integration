import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { OAuthRegistryService } from '@/modules/integration/oauth/registry/oauth.registry';

@Controller('oauth')
export class OAuthController {
  constructor(private readonly registry: OAuthRegistryService) {}

  @Get('authorize/:integration')
  async authorize(@Param('integration') integration: string) {
    const service = this.registry.getService(integration);

    if (!service) {
      throw new NotFoundException('Integration not found');
    }

    return 'oauth';
  }
}
