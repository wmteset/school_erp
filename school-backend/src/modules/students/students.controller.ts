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
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { FilterStudentDto } from './dto/filter-student.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../auth/roles.enum';

@ApiTags('Students Directory & Enrollment')
@Controller('students')
@UseGuards(RolesGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all enrolled students with search & grade filters' })
  @ApiResponse({ status: 200, description: 'List of students' })
  async findAll(@Query() filterDto: FilterStudentDto) {
    return this.studentsService.findAll(filterDto);
  }

  @Get('next-roll-number')
  @ApiOperation({ summary: 'Get next auto-incremented student roll number based on last registered roll number' })
  @ApiResponse({ status: 200, description: 'Next roll number payload' })
  async getNextRollNumber() {
    return this.studentsService.getNextRollNumber();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get 360-degree student profile by ID' })
  @ApiResponse({ status: 200, description: 'Student profile details' })
  async findOne(@Param('id') id: string) {
    return this.studentsService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.PRINCIPAL)
  @ApiHeader({ name: 'x-user-role', enum: UserRole, description: 'Role perspective header (admin, principal)' })
  @ApiOperation({ summary: 'Enroll a new student into the school directory' })
  @ApiResponse({ status: 201, description: 'Student successfully enrolled' })
  async create(@Body() createDto: CreateStudentDto) {
    return this.studentsService.create(createDto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.PRINCIPAL)
  @ApiHeader({ name: 'x-user-role', enum: UserRole, description: 'Role perspective header (admin, principal)' })
  @ApiOperation({ summary: 'Update student profile details, class placement or guardian info' })
  @ApiResponse({ status: 200, description: 'Student profile updated' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateStudentDto) {
    return this.studentsService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.PRINCIPAL)
  @ApiHeader({ name: 'x-user-role', enum: UserRole, description: 'Role perspective header (admin, principal)' })
  @ApiOperation({ summary: 'Delete or withdraw student record' })
  @ApiResponse({ status: 200, description: 'Student record removed' })
  async remove(@Param('id') id: string) {
    return this.studentsService.remove(id);
  }
}
