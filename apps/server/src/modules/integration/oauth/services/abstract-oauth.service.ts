import { Injectable } from '@nestjs/common';
import { OAuthResponseDto } from '@/modules/integration/oauth/dtos';

@Injectable()
export abstract class AbstractOAuthService<T, R> {
  /**
   * Integration name (e.g., 'qbo', 'xero')
   */
  abstract readonly name: string;

  /**
   * Get the authorization endpoint URL
   * This should be implemented by each integration
   * @returns The authorization endpoint URL
   */
  protected abstract getAuthorizationEndpoint(): string | Promise<string>;

  /**
   * Generate the full authorization URL with query parameters
   * This should be implemented by each integration
   * @returns The full authorization URL with query parameters
   */
  abstract getAuthorizationUrl(): string;

  /**
   *
   * @param code - The authorization code received from the OAuth provider
   * @returns The token response from the OAuth provider
   */
  protected abstract exchangeCodeForToken(code: string): Promise<R>;

  /**
   * Handle the callback from the OAuth provider
   * This should be implemented by each integration
   */
  abstract handleCallback(query: T): Promise<OAuthResponseDto>;
}
