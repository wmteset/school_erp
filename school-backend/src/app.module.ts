import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { SchoolInfoModule } from './modules/school-info/school-info.module';
import { StudentsModule } from './modules/students/students.module';
import { StaffModule } from './modules/staff/staff.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { LeavesModule } from './modules/leaves/leaves.module';
import { PayrollModule } from './modules/payroll/payroll.module';
import { ActivitiesModule } from './modules/activities/activities.module';
import { ClassesModule } from './modules/classes/classes.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AuthModule } from './modules/auth/auth.module';
import { DatabaseModule } from './modules/database/database.module';
import { MailModule } from './modules/mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'school_erp',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: true, // Code-First Schema auto-synchronization
      logging: ['error', 'warn'],
    }),
    MailModule,
    AuthModule,
    SchoolInfoModule,
    StudentsModule,
    StaffModule,
    AttendanceModule,
    LeavesModule,
    PayrollModule,
    ActivitiesModule,
    ClassesModule,
    NotificationsModule,
    DatabaseModule,
  ],
})
export class AppModule {}
