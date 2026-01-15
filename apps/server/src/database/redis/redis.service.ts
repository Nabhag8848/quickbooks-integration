import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { createRedisConfig } from './redis.config';

@Injectable()
export class RedisService implements OnModuleDestroy, OnModuleInit {
  private redis: Redis;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    this.createConnection();
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }

  private createConnection() {
    const redisConfig = createRedisConfig(this.configService);
    this.redis = new Redis(redisConfig);
  }

  getClient(): Redis {
    return this.redis;
  }

  async ping(): Promise<string> {
    return this.redis.ping();
  }
}
