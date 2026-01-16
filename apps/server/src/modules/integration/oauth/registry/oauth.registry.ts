import { Injectable } from '@nestjs/common';
import { AbstractOAuthService } from '@/modules/integration/oauth/services/abstract-oauth.service';

@Injectable()
export class OAuthRegistryService {
  private readonly oauthServices: Map<
    string,
    AbstractOAuthService<unknown, unknown>
  > = new Map();

  /**
   * Register an OAuth service for an integration
   */
  registerService(service: AbstractOAuthService<unknown, unknown>): void {
    this.oauthServices.set(service.name, service);
  }

  /**
   * Get an OAuth service for an integration
   */
  getService(name: string): AbstractOAuthService<unknown, unknown> | undefined {
    return this.oauthServices.get(name);
  }
}
