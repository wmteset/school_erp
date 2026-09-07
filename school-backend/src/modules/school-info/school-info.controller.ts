import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { SchoolInfoService } from './school-info.service';
import { UpdateSchoolInfoDto } from './dto/update-school-info.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../auth/roles.enum';

@ApiTags('School Info & Settings')
@Controller('school-info')
@UseGuards(RolesGuard)
export class SchoolInfoController {
  constructor(private readonly schoolInfoService: SchoolInfoService) {}

  @Get()
  @ApiOperation({ summary: 'Get current school profile, logo branding, affiliation, and academic session' })
  @ApiResponse({ status: 200, description: 'Current school configuration details' })
  async getSchoolInfo() {
    return this.schoolInfoService.getSchoolInfo();
  }

  @Patch()
  @Roles(UserRole.ADMIN, UserRole.PRINCIPAL, UserRole.ACCOUNTANT)
  @ApiHeader({ name: 'x-user-role', enum: UserRole, description: 'Role perspective header (admin, principal, accountant)' })
  @ApiOperation({ summary: 'Update institution settings, school logo, affiliation subtitle, currency or session' })
  @ApiResponse({ status: 200, description: 'School configuration updated successfully' })
  async updateSchoolInfo(@Body() updateDto: UpdateSchoolInfoDto) {
    return this.schoolInfoService.updateSchoolInfo(updateDto);
  }
}
