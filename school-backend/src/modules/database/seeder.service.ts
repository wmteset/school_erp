import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
import { UserRole } from '../auth/roles.enum';

@Injectable()
export class SeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectRepository(SchoolInfoEntity)
    private readonly schoolInfoRepo: Repository<SchoolInfoEntity>,
    @InjectRepository(StudentEntity)
    private readonly studentRepo: Repository<StudentEntity>,
    @InjectRepository(StaffEntity)
    private readonly staffRepo: Repository<StaffEntity>,
    @InjectRepository(AttendanceRecordEntity)
    private readonly attendanceRepo: Repository<AttendanceRecordEntity>,
    @InjectRepository(LeaveRequestEntity)
    private readonly leaveRepo: Repository<LeaveRequestEntity>,
    @InjectRepository(MonthlyPayrollEntity)
    private readonly payrollRepo: Repository<MonthlyPayrollEntity>,
    @InjectRepository(StaffPayrollRecordEntity)
    private readonly payrollItemRepo: Repository<StaffPayrollRecordEntity>,
    @InjectRepository(ActivityEntity)
    private readonly activityRepo: Repository<ActivityEntity>,
    @InjectRepository(ClassEntity)
    private readonly classRepo: Repository<ClassEntity>,
    @InjectRepository(NotificationEntity)
    private readonly notifRepo: Repository<NotificationEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async onApplicationBootstrap() {
    this.logger.log('Initializing system bootstrap verification...');
    await this.seedAdminUserOnly();
    await this.ensureSchoolInfo();
  }

  /**
   * Strictly seeds ONLY the singleton Master Admin user if not already present.
   * No mock students, staff, classes, leaves, or payroll are seeded.
   */
  async seedAdminUserOnly() {
    const adminExists = await this.userRepo.findOne({
      where: { role: UserRole.ADMIN },
    });

    if (!adminExists) {
      this.logger.log('No administrator found. Provisioning master Super Admin user...');
      const adminUser = this.userRepo.create({
        id: 'USR-ADMIN',
        email: 'admin@oakridge.edu',
        password: 'admin',
        name: 'Dr. Arthur Pendelton',
        role: UserRole.ADMIN,
        title: 'Super Administrator',
        department: 'Administration',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
        isActive: true,
        sessionVersion: 1,
      });
      await this.userRepo.save(adminUser);
      this.logger.log('Master Super Admin provisioned: admin@oakridge.edu');
    } else {
      this.logger.log(`Master Admin verified: ${adminExists.email}`);
    }
  }

  async ensureSchoolInfo() {
    const infoCount = await this.schoolInfoRepo.count();
    if (infoCount === 0) {
      this.logger.log('Initializing institution profile settings...');
      await this.schoolInfoRepo.save({
        id: 1,
        name: 'Oakridge International Academy',
        tagline: 'Excellence in Education & Character Building',
        headerSubtitle: 'CBSE & IB World School #04291',
        affiliation: 'CBSE & IB World School #04291',
        logo: '',
        established: 1998,
        email: 'contact@oakridge-academy.edu',
        phone: '+1 (555) 234-5678',
        address: '742 Evergreen Academic Blvd, Education City, CA 90210',
        website: 'www.oakridge-academy.edu',
        currency: '$',
        academicYear: '2026-2027',
        principal: 'Dr. Arthur Pendelton, Ph.D.',
        themeColor: 'indigo',
      });
    }
  }

  /**
   * Reset database endpoint handler:
   * Clears operational records and retains strictly the singleton Admin user and institution profile.
   */
  async resetAll() {
    this.logger.log('Resetting operational database records...');
    await this.payrollItemRepo.createQueryBuilder().delete().execute();
    await this.payrollRepo.createQueryBuilder().delete().execute();
    await this.attendanceRepo.createQueryBuilder().delete().execute();
    await this.leaveRepo.createQueryBuilder().delete().execute();
    await this.activityRepo.createQueryBuilder().delete().execute();
    await this.classRepo.createQueryBuilder().delete().execute();
    await this.studentRepo.createQueryBuilder().delete().execute();
    await this.notifRepo.createQueryBuilder().delete().execute();

    // Clear staff and non-admin users
    await this.staffRepo.createQueryBuilder().delete().execute();
    await this.userRepo.createQueryBuilder().delete().where('role != :adminRole', { adminRole: UserRole.ADMIN }).execute();

    await this.seedAdminUserOnly();
    await this.ensureSchoolInfo();

    this.logger.log('Database reset complete: empty operational state with admin user retained.');
  }
}
