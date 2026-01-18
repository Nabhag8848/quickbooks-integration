import { Injectable } from "@nestjs/common";
import { SyncObjectType } from "@/utils";
import { IObjectTypeHandler } from "@/modules/integration/sync/interfaces";
import { SyncConfigDto } from "../dtos/sync-config.dto";

@Injectable()
export abstract class AbstractSyncService {
  /**
   * The name of the integration (eg: qbo, sage, xero, etc.)
   */
  abstract readonly name: string;

  /**
   * 
   * @param companySourceId - The company source ID
   * @returns A promise that resolves
   */
  abstract handleSync(companySourceId: string): Promise<void>;

  /**
   * Start the incremental sync for the given company source ID and object type
   * @param companySourceId - The company source ID
   * @param objectType - The object type
   * @returns A promise that resolves
   */
  abstract startIncrementalSync(companySourceId: string, objectType: SyncObjectType): Promise<void>;

  /**
   * The object type handlers for the integration
   */
  protected abstract objectTypeHandlers: Map<
    SyncObjectType,
    IObjectTypeHandler
  >;

  /**
   * Get the object type handler for the given object type
   * @param objectType - The object type
   * @returns The object type handler
   */
  getObjectTypeHandler(objectType: SyncObjectType): IObjectTypeHandler {
    const handler = this.objectTypeHandlers.get(objectType);
    if (!handler) {
      throw new Error(`Object type handler for ${objectType} not found`);
    }
    return handler;
  }

  /**
   * Get the sync config for the integration
   * @returns The sync config
   */
  abstract getSyncConfig(): SyncConfigDto;
  
}