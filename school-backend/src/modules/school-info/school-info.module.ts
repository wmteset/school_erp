import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchoolInfoEntity } from './entities/school-info.entity';
import { SchoolInfoService } from './school-info.service';
import { SchoolInfoController } from './school-info.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SchoolInfoEntity])],
  controllers: [SchoolInfoController],
  providers: [SchoolInfoService],
  exports: [SchoolInfoService],
})
export class SchoolInfoModule {}
