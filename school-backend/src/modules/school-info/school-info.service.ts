import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SchoolInfoEntity } from './entities/school-info.entity';
import { UpdateSchoolInfoDto } from './dto/update-school-info.dto';

@Injectable()
export class SchoolInfoService {
  constructor(
    @InjectRepository(SchoolInfoEntity)
    private readonly schoolInfoRepo: Repository<SchoolInfoEntity>,
  ) {}

  async getSchoolInfo(): Promise<SchoolInfoEntity> {
    let info = await this.schoolInfoRepo.findOne({ where: { id: 1 } });
    if (!info) {
      info = this.schoolInfoRepo.create({
        id: 1,
        name: 'Oakridge International Academy',
        tagline: 'Excellence in Education & Character Building',
        headerSubtitle: 'CBSE & IB World School #04291',
        affiliation: 'CBSE & IB World School #04291',
        logo: '',
        established: 1998,
        email: 'contact@oakridge-academy.edu',
        phone: '+1 (555) 234-5678',
        address: '742 Evergreen Academic Blvd, Education City, CA 90210',
        website: 'www.oakridge-academy.edu',
        currency: '$',
        academicYear: '2026-2027',
        principal: 'Dr. Arthur Pendelton, Ph.D.',
        themeColor: 'indigo',
      });
      await this.schoolInfoRepo.save(info);
    }
    return info;
  }

  async updateSchoolInfo(dto: UpdateSchoolInfoDto): Promise<SchoolInfoEntity> {
    const current = await this.getSchoolInfo();
    Object.assign(current, dto);
    return this.schoolInfoRepo.save(current);
  }
}
