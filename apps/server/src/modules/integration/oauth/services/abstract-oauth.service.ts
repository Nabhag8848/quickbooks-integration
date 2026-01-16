import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class AbstractOAuthService<T, R> {
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
  abstract getAuthorizationUrl(): string;

  protected abstract exchangeCodeForToken(code: string): Promise<R>;

  abstract handleCallback(query: T): Promise<void>;
}
