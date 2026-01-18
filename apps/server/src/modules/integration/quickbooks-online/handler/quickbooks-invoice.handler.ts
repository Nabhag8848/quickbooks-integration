import { HttpService } from "@nestjs/axios";
import { QuickBooksBaseHandler } from "./quickbooks-base.handler";
import { InvoiceService } from "@/modules/invoice/invoice.service";

export class QuickbooksInvoiceHandler extends QuickBooksBaseHandler<unknown> {
    constructor(
        httpService: HttpService,
        baseUrl: string,
        private readonly invoiceService: InvoiceService,
    ) {
        super(httpService, baseUrl);
    }

    getEntityName(): string {
        return 'Invoice';
    }

    async saveEntities(companySourceId: string, entities: unknown[]): Promise<void> {
        // Type assertion to match QuickBooks API response structure
        const invoices = entities as Array<{
            Id: string;
            MetaData: {
                CreateTime: string;
                LastUpdatedTime: string;
            };
            CustomerRef?: {
                value: string;
                name?: string;
            };
            [key: string]: unknown;
        }>;

        await this.invoiceService.upsertInvoicesBatch(companySourceId, invoices);
    }
}   