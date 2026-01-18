import { IObjectTypeHandler } from "@/modules/integration/sync/interfaces";
import { HttpService } from "@nestjs/axios";
import { SyncContextDto } from "@/modules/integration/sync/dtos";
import { PaginatedResponseDto } from "@/modules/integration/sync/interfaces";
import { firstValueFrom } from "rxjs";

interface QuickBooksQueryResponse<T extends string = string> {
    QueryResponse: Record<T, unknown[]> & {
      maxResults?: number;
      startPosition?: number;
    };
    time: string;
}

export abstract class QuickBooksBaseHandler<T> implements IObjectTypeHandler<T> {
    constructor(
      protected readonly httpService: HttpService,
      protected readonly baseUrl: string,
    ) {}
  
    abstract getEntityName(): string;
    abstract saveEntities(
      companySourceId: string,
      entities: T[]
    ): Promise<void>;
  
    async fetchPage(
      context: SyncContextDto,
      startPosition: number,
      pageSize: number,
      filter?: string,
    ): Promise<PaginatedResponseDto<T>> {
        const url = `${this.baseUrl}/v3/company/${context.companySourceId}/query`;
        const entityName = this.getEntityName();
    
        const query = `SELECT * FROM ${entityName}${filter ? ` WHERE ${filter} ` : ' '}ORDERBY Metadata.CreateTime ASC STARTPOSITION ${startPosition} MAXRESULTS ${pageSize}`;
    
        const response = await firstValueFrom(this.httpService
          .get<QuickBooksQueryResponse<typeof entityName>>(url, {
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

        console.log({
          context,
          startPosition,
          pageSize,
          filter,
          entities,
          maxResults,
          currentStart,
        })
    
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
      return new Date(
        entity?.Metadata?.CreateTime
      );
    }
  
    extractUpdatedAt(entity: any): Date {
      return new Date(
        entity?.Metadata?.LastUpdatedTime
      );
    }
  }