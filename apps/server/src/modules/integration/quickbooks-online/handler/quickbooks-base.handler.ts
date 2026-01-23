import { IObjectTypeHandler } from '@/modules/integration/sync/interfaces';
import { HttpService } from '@nestjs/axios';
import { SyncContextDto } from '@/modules/integration/sync/dtos';
import { PaginatedResponseDto } from '@/modules/integration/sync/interfaces';
import { firstValueFrom } from 'rxjs';
import { Logger } from '@nestjs/common';

interface QuickBooksQueryResponse<T extends string = string> {
  QueryResponse: Record<T, unknown[]> & {
    maxResults?: number;
    startPosition?: number;
  };
  time: string;
}

export abstract class QuickBooksBaseHandler<T>
  implements IObjectTypeHandler<T>
{

  private readonly logger = new Logger(QuickBooksBaseHandler.name);
  constructor(
    protected readonly httpService: HttpService,
    protected readonly baseUrl: string
  ) {}

  abstract getEntityName(): string;
  abstract saveEntities(companySourceId: string, entities: T[]): Promise<void>;

  async fetchPage(
    context: SyncContextDto,
    startPosition: number,
    pageSize: number,
    filter?: string
  ): Promise<PaginatedResponseDto<T>> {
    this.logger.debug(
      `Fetching page ${startPosition} for ${this.getEntityName()} in company ${context.companySourceId} with filter ${filter}`
    );
    const url = `${this.baseUrl}/v3/company/${context.companySourceId}/query`;
    const entityName = this.getEntityName();

    const clauses = [`SELECT * FROM ${entityName}`];
    if (filter) {
      clauses.push(`WHERE ${filter}`);
    }
    clauses.push(`ORDERBY Metadata.CreateTime ASC`);
    clauses.push(`STARTPOSITION ${startPosition}`);
    clauses.push(`MAXRESULTS ${pageSize}`);
    const query = clauses.join(' ');

    const response = await firstValueFrom(
      this.httpService.get<QuickBooksQueryResponse<typeof entityName>>(url, {
        params: { query },
        headers: {
          Authorization: `Bearer ${context.accessToken}`,
          Accept: 'application/json',
        },
      })
    );

    if (!response) {
      throw new Error(`Failed to fetch ${entityName}`);
    }

    const data = response.data.QueryResponse;
    const entities = data[entityName] || [];
    const maxResults = data.maxResults || 1000;
    const currentStart = data.startPosition || startPosition;

    return {
      items: entities as T[],
      hasMore: entities.length === maxResults,
      nextStartPosition:
        entities.length === maxResults
          ? currentStart + entities.length
          : undefined,
    };
  }

  extractCreatedAt(entity: any): Date {
    return new Date(entity?.Metadata?.CreateTime);
  }

  extractUpdatedAt(entity: any): Date {
    return new Date(entity?.Metadata?.LastUpdatedTime);
  }
}
