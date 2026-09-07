import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto, FilterStaffDto } from './dto/update-staff.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../auth/roles.enum';

@ApiTags('Faculty & Staff Management')
@Controller('staff')
@UseGuards(RolesGuard)
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get()
  @ApiOperation({ summary: 'Get all faculty & staff members with filtering and compensation packages' })
  @ApiResponse({ status: 200, description: 'List of staff members' })
  async findAll(@Query() filterDto: FilterStaffDto) {
    return this.staffService.findAll(filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get 360-degree staff dossier by ID' })
  @ApiResponse({ status: 200, description: 'Staff dossier details' })
  async findOne(@Param('id') id: string) {
    return this.staffService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.PRINCIPAL)
  @ApiHeader({ name: 'x-user-role', enum: UserRole, description: 'Role perspective header (admin, principal)' })
  @ApiOperation({ summary: 'Onboard a new faculty or administrative staff member' })
  @ApiResponse({ status: 201, description: 'Staff member onboarded successfully' })
  async create(@Body() createDto: CreateStaffDto) {
    return this.staffService.create(createDto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.PRINCIPAL, UserRole.ACCOUNTANT)
  @ApiHeader({ name: 'x-user-role', enum: UserRole, description: 'Role perspective header (admin, principal, accountant)' })
  @ApiOperation({ summary: 'Update staff member profile, designation, or salary package' })
  @ApiResponse({ status: 200, description: 'Staff profile updated successfully' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateStaffDto) {
    return this.staffService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.PRINCIPAL)
  @ApiHeader({ name: 'x-user-role', enum: UserRole, description: 'Role perspective header (admin, principal)' })
  @ApiOperation({ summary: 'Remove staff member record' })
  @ApiResponse({ status: 200, description: 'Staff record removed' })
  async remove(@Param('id') id: string) {
    return this.staffService.remove(id);
  }
}
