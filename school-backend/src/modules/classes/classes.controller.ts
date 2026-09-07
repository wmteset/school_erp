import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../auth/roles.enum';

@ApiTags('Classes, Sections & Schedules')
@Controller('classes')
@UseGuards(RolesGuard)
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all class sections, appointed teachers & timetables' })
  async findAll() {
    return this.classesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get class division details by ID' })
  async findOne(@Param('id') id: string) {
    return this.classesService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.PRINCIPAL)
  @ApiHeader({ name: 'x-user-role', enum: UserRole, description: 'Role perspective header (admin, principal)' })
  @ApiOperation({ summary: 'Add a new grade section division' })
  @ApiResponse({ status: 201, description: 'Class created' })
  async create(@Body() createDto: CreateClassDto) {
    return this.classesService.create(createDto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.PRINCIPAL)
  @ApiHeader({ name: 'x-user-role', enum: UserRole, description: 'Role perspective header (admin, principal)' })
  @ApiOperation({ summary: 'Update class schedule, appointed teacher, or subjects' })
  async update(@Param('id') id: string, @Body() updateDto: Partial<CreateClassDto>) {
    return this.classesService.update(id, updateDto);
  }
}
