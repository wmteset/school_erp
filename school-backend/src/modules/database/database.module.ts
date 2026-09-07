import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';
import { DatabaseBackupController } from './database-backup.controller';
import { SchoolInfoEntity } from '../school-info/entities/school-info.entity';
import { StudentEntity } from '../students/entities/student.entity';
import { StaffEntity } from '../staff/entities/staff.entity';
import { AttendanceRecordEntity } from '../attendance/entities/attendance-record.entity';
import { LeaveRequestEntity } from '../leaves/entities/leave-request.entity';
import { MonthlyPayrollEntity, StaffPayrollRecordEntity } from '../payroll/entities/monthly-payroll.entity';
import { ActivityEntity } from '../activities/entities/activity.entity';
import { ClassEntity } from '../classes/entities/class.entity';
import { NotificationEntity } from '../notifications/entities/notification.entity';
import { UserEntity } from '../auth/entities/user.entity';
import { SchoolInfoModule } from '../school-info/school-info.module';
import { StudentsModule } from '../students/students.module';
import { StaffModule } from '../staff/staff.module';
import { AttendanceModule } from '../attendance/attendance.module';
import { LeavesModule } from '../leaves/leaves.module';
import { PayrollModule } from '../payroll/payroll.module';
import { ActivitiesModule } from '../activities/activities.module';
import { ClassesModule } from '../classes/classes.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      SchoolInfoEntity,
      StudentEntity,
      StaffEntity,
      AttendanceRecordEntity,
      LeaveRequestEntity,
      MonthlyPayrollEntity,
      StaffPayrollRecordEntity,
      ActivityEntity,
      ClassEntity,
      NotificationEntity,
      UserEntity,
    ]),
    SchoolInfoModule,
    StudentsModule,
    StaffModule,
    AttendanceModule,
    LeavesModule,
    PayrollModule,
    ActivitiesModule,
    ClassesModule,
    NotificationsModule,
  ],
  controllers: [DatabaseBackupController],
  providers: [SeederService],
  exports: [SeederService],
})
export class DatabaseModule {}
