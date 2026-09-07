import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto, EnrollStudentActivityDto, AddAchievementDto } from './dto/create-activity.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../auth/roles.enum';

@ApiTags('Student Activities, Clubs & Athletics')
@Controller('activities')
@UseGuards(RolesGuard)
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all extracurricular clubs, athletics & activities' })
  @ApiQuery({ name: 'category', required: false })
  async findAll(@Query('category') category?: string) {
    return this.activitiesService.findAll(category);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get activity details, roster and achievements' })
  async findOne(@Param('id') id: string) {
    return this.activitiesService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.PRINCIPAL, UserRole.TEACHER)
  @ApiHeader({ name: 'x-user-role', enum: UserRole, description: 'Role perspective header (admin, principal, teacher)' })
  @ApiOperation({ summary: 'Create a new student club or athletics program' })
  @ApiResponse({ status: 201, description: 'Activity created' })
  async create(@Body() createDto: CreateActivityDto) {
    return this.activitiesService.create(createDto);
  }

  @Post(':id/enroll')
  @Roles(UserRole.ADMIN, UserRole.PRINCIPAL, UserRole.TEACHER)
  @ApiHeader({ name: 'x-user-role', enum: UserRole, description: 'Role perspective header (admin, principal, teacher)' })
  @ApiOperation({ summary: 'Enroll a student into the club or sports team' })
  async enrollStudent(@Param('id') id: string, @Body() dto: EnrollStudentActivityDto) {
    return this.activitiesService.enrollStudent(id, dto);
  }

  @Delete(':id/members/:studentId')
  @Roles(UserRole.ADMIN, UserRole.PRINCIPAL, UserRole.TEACHER)
  @ApiHeader({ name: 'x-user-role', enum: UserRole, description: 'Role perspective header (admin, principal, teacher)' })
  @ApiOperation({ summary: 'Remove a student from the activity' })
  async removeStudent(@Param('id') id: string, @Param('studentId') studentId: string) {
    return this.activitiesService.removeStudent(id, studentId);
  }

  @Post(':id/achievements')
  @Roles(UserRole.ADMIN, UserRole.PRINCIPAL, UserRole.TEACHER)
  @ApiHeader({ name: 'x-user-role', enum: UserRole, description: 'Role perspective header (admin, principal, teacher)' })
  @ApiOperation({ summary: 'Log a new honor, championship, or award' })
  async addAchievement(@Param('id') id: string, @Body() dto: AddAchievementDto) {
    return this.activitiesService.addAchievement(id, dto);
  }
}
