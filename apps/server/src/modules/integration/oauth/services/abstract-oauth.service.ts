import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class AbstractOAuthService {
  /**
   * Integration name (e.g., 'qbo', 'xero')
   */
  abstract readonly name: string;

  /**
   * Get the authorization endpoint URL
   * This should be implemented by each integration
   */
  protected abstract getAuthorizationEndpoint(): string | Promise<string>;

  /**
   * Generate the full authorization URL with query parameters
   * This should be implemented by each integration
   */
  abstract getAuthorizationUrl(): string | Promise<string>;
}
