import { HttpService } from "@nestjs/axios";
import { QuickBooksBaseHandler } from "./quickbooks-base.handler";
import { CustomerService } from "@/modules/customer/customer.service";

export class QuickbooksCustomerHandler extends QuickBooksBaseHandler<unknown> {
    constructor(
        httpService: HttpService,
        baseUrl: string,
        private readonly customerService: CustomerService,
    ) {
        super(httpService, baseUrl);
    }

    getEntityName(): string {
        return 'Customer';
    }

    async saveEntities(companySourceId: string, entities: unknown[]): Promise<void> {
        // Type assertion to match QuickBooks API response structure
        const customers = entities as Array<{
            Id: string;
            MetaData: {
                CreateTime: string;
                LastUpdatedTime: string;
            };
            [key: string]: unknown;
        }>;

        await this.customerService.upsertCustomersBatch(companySourceId, customers);
    }
}   