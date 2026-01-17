import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { CompanyService } from '@/modules/company/company.service';
import { CompanyEntity } from '@/database/entities';

@ApiTags('company')
@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get('all')
  @ApiOperation({
    summary: 'Get all companies',
    description: 'Returns a list of all connected companies',
  })
  @ApiResponse({
    status: 200,
    description: 'List of companies',
    type: [CompanyEntity],
  })

  // TODO: Not Ideal to return array without json response.
  async getAllCompanies(): Promise<CompanyEntity[]> {
    return this.companyService.findAll();
  }
}
