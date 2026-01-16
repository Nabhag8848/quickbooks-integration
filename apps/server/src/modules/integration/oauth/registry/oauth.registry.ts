import { Injectable } from '@nestjs/common';
import { AbstractOAuthService } from '@/modules/integration/oauth/services/abstract-oauth.service';

@Injectable()
export class OAuthRegistryService {
  private readonly oauthServices: Map<string, AbstractOAuthService> = new Map();

  /**
   * Register an OAuth service for an integration
   */
  registerService(service: AbstractOAuthService): void {
    this.oauthServices.set(service.name, service);
  }

  /**
   * Get an OAuth service for an integration
   */
  getService(name: string): AbstractOAuthService | undefined {
    return this.oauthServices.get(name);
  }
}
