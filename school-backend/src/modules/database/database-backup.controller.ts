import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { SeederService } from './seeder.service';
import { SchoolInfoService } from '../school-info/school-info.service';
import { StudentsService } from '../students/students.service';
import { StaffService } from '../staff/staff.service';
import { AttendanceService } from '../attendance/attendance.service';
import { LeavesService } from '../leaves/leaves.service';
import { PayrollService } from '../payroll/payroll.service';
import { ActivitiesService } from '../activities/activities.service';
import { ClassesService } from '../classes/classes.service';
import { NotificationsService } from '../notifications/notifications.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../auth/roles.enum';

@ApiTags('Database Management, Backup & Reset')
@Controller('database')
@UseGuards(RolesGuard)
export class DatabaseBackupController {
  constructor(
    private readonly seederService: SeederService,
    private readonly schoolInfoService: SchoolInfoService,
    private readonly studentsService: StudentsService,
    private readonly staffService: StaffService,
    private readonly attendanceService: AttendanceService,
    private readonly leavesService: LeavesService,
    private readonly payrollService: PayrollService,
    private readonly activitiesService: ActivitiesService,
    private readonly classesService: ClassesService,
    private readonly notifService: NotificationsService,
  ) {}

  @Get('export')
  @ApiOperation({ summary: 'Export complete database backup payload in JSON format' })
  @ApiResponse({ status: 200, description: 'Full school ERP JSON backup' })
  async exportBackup() {
    const [
      schoolInfo,
      students,
      staff,
      leaves,
      payroll,
      activities,
      classes,
      notifications,
    ] = await Promise.all([
      this.schoolInfoService.getSchoolInfo(),
      this.studentsService.findAll(),
      this.staffService.findAll(),
      this.leavesService.findAll(),
      this.payrollService.findAll(),
      this.activitiesService.findAll(),
      this.classesService.findAll(),
      this.notifService.findAll(),
    ]);

    return {
      exportedAt: new Date().toISOString(),
      schoolInfo,
      students,
      staff,
      leaveRequests: leaves,
      payrollRecords: payroll,
      activities,
      classes,
      notifications,
    };
  }

  @Post('reset')
  @Roles(UserRole.ADMIN)
  @ApiHeader({ name: 'x-user-role', enum: UserRole, description: 'Super Admin only' })
  @ApiOperation({ summary: 'Reset all database entities to empty operational state with Admin user retained' })
  @ApiResponse({ status: 200, description: 'Database reset completed' })
  async resetDatabase() {
    await this.seederService.resetAll();
    return { success: true, message: 'All operational records reset. Admin user retained.' };
  }
}
