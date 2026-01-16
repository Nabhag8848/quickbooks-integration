import { Controller, Get, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import type { Response } from 'express';
import { readFileSync } from 'fs';
import { join } from 'path';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHomePage(@Res() res: Response) {
    // In webpack bundle, __dirname points to dist root
    // Public files are copied to dist/public by webpack
    const htmlPath = join(__dirname, 'public', 'index.html');
    const html = readFileSync(htmlPath, 'utf-8');
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }

  @Get('health')
  @ApiOperation({
    summary: 'Health check',
    description: 'Returns the health status of the API server',
  })
  @ApiResponse({
    status: 200,
    description: 'Server is healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
      },
    },
  })
  getHealthCheck() {
    return this.appService.getHealthCheck();
  }
}
