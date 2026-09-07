import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { LeavesService } from './leaves.service';
import { CreateLeaveDto, ReviewLeaveDto } from './dto/create-leave.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../auth/roles.enum';

@ApiTags('Staff Leave Management & Approvals')
@Controller('leaves')
@UseGuards(RolesGuard)
export class LeavesController {
  constructor(private readonly leavesService: LeavesService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.PRINCIPAL, UserRole.ACCOUNTANT, UserRole.TEACHER)
  @ApiOperation({ summary: 'Get faculty leave requests with status filter' })
  @ApiQuery({ name: 'status', enum: ['All', 'Pending', 'Approved', 'Rejected'], required: false })
  async findAll(@Query('status') status?: string) {
    return this.leavesService.findAll(status);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.PRINCIPAL, UserRole.ACCOUNTANT, UserRole.TEACHER)
  @ApiOperation({ summary: 'Get leave application details by ID' })
  async findOne(@Param('id') id: string) {
    return this.leavesService.findOne(id);
  }

  @Post('apply')
  @ApiOperation({ summary: 'Submit a new leave request (faculty or admin)' })
  @ApiResponse({ status: 201, description: 'Leave request submitted successfully' })
  async apply(@Body() createDto: CreateLeaveDto) {
    return this.leavesService.apply(createDto);
  }

  @Patch(':id/review')
  @Roles(UserRole.ADMIN, UserRole.PRINCIPAL)
  @ApiHeader({ name: 'x-user-role', enum: UserRole, description: 'Role perspective header (admin, principal)' })
  @ApiOperation({ summary: 'Approve or reject staff leave request with review remarks' })
  @ApiResponse({ status: 200, description: 'Leave request evaluated' })
  async review(@Param('id') id: string, @Body() reviewDto: ReviewLeaveDto) {
    return this.leavesService.review(id, reviewDto);
  }
}
