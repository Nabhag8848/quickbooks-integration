import { Injectable } from "@nestjs/common";

@Injectable()
export abstract class AbstractSyncService {
  /**
   * The name of the integration (eg: qbo, sage, xero, etc.)
   */
  abstract readonly name: string;

  abstract handleSync(companySourceId: string): Promise<void>;
}