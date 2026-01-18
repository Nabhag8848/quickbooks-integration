import { HttpService } from "@nestjs/axios";
import { QuickBooksBaseHandler } from "./quickbooks-base.handler";

export class QuickbooksInvoiceHandler extends QuickBooksBaseHandler<unknown> {
    constructor(
        httpService: HttpService,
        baseUrl: string,
    ) {
        super(httpService, baseUrl);
    }

    getEntityName(): string {
        return 'Invoice';
    }

    saveEntities(companySourceId: string, entities: unknown[]): Promise<void> {
        return Promise.resolve();
    }
}   