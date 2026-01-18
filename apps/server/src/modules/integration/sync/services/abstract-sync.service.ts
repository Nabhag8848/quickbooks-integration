import { Injectable } from "@nestjs/common";
import { SyncObjectType } from "@/utils";
import { IObjectTypeHandler } from "@/modules/integration/sync/interfaces";

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
  getObjectTypeHandler(objectType: SyncObjectType): IObjectTypeHandler | null {
    const handler = this.objectTypeHandlers.get(objectType);
    if (!handler) {
      throw new Error(`Object type handler for ${objectType} not found`);
    }
    return handler;
  }
}