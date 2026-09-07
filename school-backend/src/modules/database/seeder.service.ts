import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UserRole } from '../auth/roles.enum';

@Injectable()
export class SeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeederService.name);

  constructor(private readonly dataSource: DataSource) {}

  async onApplicationBootstrap() {
    this.logger.log('Verifying system bootstrap & baseline master administration...');
    await this.seedAdminUserOnly();
    await this.ensureSchoolInfo();
  }

  /**
   * Idempotent Seeding: Inserts the Master Admin account using ON CONFLICT ("email") DO NOTHING.
   * If any admin or user already exists, it is untouched and preserved.
   */
  async seedAdminUserOnly() {
    try {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();

      await queryRunner.query(`
        INSERT INTO "users" (
          "id", "email", "password", "name", "role", "title", "department", "staffId", "avatar", "isActive", "sessionVersion"
        ) VALUES (
          'USR-ADMIN',
          'admin@oakridge.edu',
          'admin',
          'Dr. Arthur Pendelton',
          'admin',
          'Super Administrator',
          'Administration',
          'STF-106',
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
          true,
          1
        )
        ON CONFLICT ("email") DO NOTHING;
      `);

      await queryRunner.release();
      this.logger.log('Master Admin verification passed (ON CONFLICT DO NOTHING enforced).');
    } catch (err) {
      this.logger.warn(`Admin seed check encountered: ${err.message}`);
    }
  }

  /**
   * Idempotent Institution Info: Inserts default school profile if id=1 does not exist.
   */
  async ensureSchoolInfo() {
    try {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();

      await queryRunner.query(`
        INSERT INTO "school_info" (
          "id", "name", "tagline", "headerSubtitle", "affiliation", "logo", "established",
          "email", "phone", "address", "website", "currency", "academicYear", "principal", "themeColor"
        ) VALUES (
          1,
          'Oakridge International Academy',
          'Excellence in Education & Character Building',
          'CBSE & IB World School #04291',
          'CBSE & IB World School #04291',
          '',
          1998,
          'contact@oakridge-academy.edu',
          '+1 (555) 234-5678',
          '742 Evergreen Academic Blvd, Education City, CA 90210',
          'www.oakridge-academy.edu',
          '$',
          '2026-2027',
          'Dr. Arthur Pendelton, Ph.D.',
          'indigo'
        )
        ON CONFLICT ("id") DO NOTHING;
      `);

      await queryRunner.release();
      this.logger.log('Institution settings baseline verified.');
    } catch (err) {
      this.logger.warn(`School info check encountered: ${err.message}`);
    }
  }

  /**
   * Safe operational reset (called only if explicitly requested by authorized Super Admin via Settings):
   */
  async resetAll() {
    this.logger.log('Performing authorized administrative database reset...');
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.query(`DELETE FROM "staff_payroll_records"`);
      await queryRunner.query(`DELETE FROM "monthly_payrolls"`);
      await queryRunner.query(`DELETE FROM "attendance_records"`);
      await queryRunner.query(`DELETE FROM "leave_requests"`);
      await queryRunner.query(`DELETE FROM "activities"`);
      await queryRunner.query(`DELETE FROM "classes"`);
      await queryRunner.query(`DELETE FROM "students"`);
      await queryRunner.query(`DELETE FROM "notifications"`);
      await queryRunner.query(`DELETE FROM "staff"`);
      await queryRunner.query(`DELETE FROM "users" WHERE "role" != 'admin'`);

      await queryRunner.commitTransaction();
      await queryRunner.release();

      await this.seedAdminUserOnly();
      await this.ensureSchoolInfo();

      this.logger.log('Operational reset completed safely with admin retained.');
    } catch (err) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      throw err;
    }
  }
}
