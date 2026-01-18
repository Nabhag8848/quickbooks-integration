import { SyncContextDto } from "@/modules/integration/sync/dtos";
import { PaginatedResponseDto } from "./paginated-response.interface";

/**
 * Interface for object type handlers
 * Each integration implements this for each object type
 */
export interface IObjectTypeHandler<T = unknown> {
  /**
   * Fetch a page of entities from the API
   */
  fetchPage(
    context: SyncContextDto,
    startPosition: number,
    pageSize: number,
    filter?: string,
  ): Promise<PaginatedResponseDto<T>>;

  /**
   * Save entities to database
   */
  saveEntities(companySourceId: string, entities: T[]): Promise<void>;

  /**
   * Extract created timestamp from entity
   */
  extractCreatedAt(entity: T): Date;

  /**
   * Extract updated timestamp from entity
   */
  extractUpdatedAt(entity: T): Date;
}
