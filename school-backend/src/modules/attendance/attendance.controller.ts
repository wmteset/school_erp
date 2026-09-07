import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { MarkAttendanceDto, BulkAttendanceDto } from './dto/mark-attendance.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../auth/roles.enum';

@ApiTags('School Attendance Hub')
@Controller('attendance')
@UseGuards(RolesGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get('daily')
  @ApiOperation({ summary: 'Get daily roll call register for a given date' })
  @ApiQuery({ name: 'date', example: '2026-09-02', required: true })
  async getDailyAttendance(@Query('date') date: string) {
    return this.attendanceService.getDailyAttendance(date || '2026-09-02');
  }

  @Get('monthly-matrix')
  @ApiOperation({ summary: 'Get dynamic monthly attendance register matrix' })
  @ApiQuery({ name: 'year', example: 2026, required: true })
  @ApiQuery({ name: 'month', example: 9, required: true })
  @ApiQuery({ name: 'targetType', enum: ['student', 'staff'], required: true })
  async getMonthlyMatrix(
    @Query('year') year: number,
    @Query('month') month: number,
    @Query('targetType') targetType: 'student' | 'staff',
  ) {
    return this.attendanceService.getMonthlyMatrix(
      Number(year) || 2026,
      Number(month) || 9,
      targetType || 'student',
    );
  }

  @Post('mark')
  @Roles(UserRole.ADMIN, UserRole.PRINCIPAL, UserRole.TEACHER)
  @ApiHeader({ name: 'x-user-role', enum: UserRole, description: 'Role perspective header (admin, principal, teacher)' })
  @ApiOperation({ summary: 'Mark individual student or staff roll call entry' })
  @ApiResponse({ status: 200, description: 'Attendance marked successfully' })
  async mark(@Body() dto: MarkAttendanceDto) {
    return this.attendanceService.mark(dto);
  }

  @Post('bulk-mark')
  @Roles(UserRole.ADMIN, UserRole.PRINCIPAL, UserRole.TEACHER)
  @ApiHeader({ name: 'x-user-role', enum: UserRole, description: 'Role perspective header (admin, principal, teacher)' })
  @ApiOperation({ summary: 'Bulk mark present/absent for multiple individuals' })
  @ApiResponse({ status: 200, description: 'Bulk roll call recorded' })
  async bulkMark(@Body() dto: BulkAttendanceDto) {
    return this.attendanceService.bulkMark(dto);
  }
}
