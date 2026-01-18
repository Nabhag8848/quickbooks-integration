import { CompanyEntity } from '@/database/entities';
import { Injectable, NotFoundException } from '@nestjs/common';
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

  async getRefreshTokenBySourceId(sourceId: string): Promise<string> {
    const company = await this.companyRepository.findOneOrFail({
      where: {
        sourceId,
      },
      select: {
        refreshToken: true,
      }
    });

    if (!company.refreshToken) {
      throw new NotFoundException(`Refresh token not found for sourceId: ${sourceId}`);
    }

    return company.refreshToken;
  }

  async getAccessTokenBySourceId(sourceId: string): Promise<string | undefined> {
    const company = await this.companyRepository.findOneOrFail({
      where: {
        sourceId,
      },
      select: {
        accessToken: true,
      }
    });

    return company.accessToken;
  }
}
