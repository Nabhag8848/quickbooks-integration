import { CompanyEntity } from '@/database/entities';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpsertCompanyDto } from './dtos';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(CompanyEntity)
    private readonly companyRepository: Repository<CompanyEntity>
  ) {}

  async upsertCompany(company: UpsertCompanyDto): Promise<void> {
    await this.companyRepository.upsert(company, {
      conflictPaths: ['sourceId'],
      skipUpdateIfNoValuesChanged: true,
    });
  }

  async findAll(): Promise<CompanyEntity[]> {
    return this.companyRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }
}
