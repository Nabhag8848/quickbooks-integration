import { RedisService } from "@/database/redis";
import { Injectable } from "@nestjs/common";
import { OAuthResponseDto } from "@/modules/integration/oauth/dtos";

@Injectable()
export class AccessTokenRefreshService {

 private readonly REFRESH_BUFFER_SECONDS = 300;

  constructor(private readonly redisService: RedisService) {}

  async setOAuthResponseWithExpiry(integrationName: string, response: OAuthResponseDto) {
    const redisClient = this.redisService.getClient();
    const key = `oauth:${integrationName}:${response.sourceId}`;
    // Calculate time until expiration in milliseconds
    const now = Date.now();
    const expiresAt = response.accessTokenExpiresAt.getTime();
    const timeUntilExpiryMs = expiresAt - now;
    
    // Convert to seconds and subtract buffer (5 minutes before actual expiration)
    const timeUntilExpirySeconds = Math.floor(timeUntilExpiryMs / 1000);
    const ttlWithBuffer = timeUntilExpirySeconds - this.REFRESH_BUFFER_SECONDS;
    
    // TODO: later we can use Zod for schema validation instead of JSON.stringify
    await redisClient.setex(key, ttlWithBuffer, JSON.stringify(response));
   }

}