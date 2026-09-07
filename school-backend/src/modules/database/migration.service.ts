import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';
import { SystemMigrationAuditEntity } from './entities/migration.entity';

export interface ColumnDefinition {
  name: string;
  type: string; // e.g., 'character varying', 'integer', 'double precision', 'text', 'boolean', 'jsonb'
  default?: string;
}

export interface TableMigrationSpec {
  tableName: string;
  columns: ColumnDefinition[];
  deprecatedColumns?: string[]; // Columns eligible for safe deletion only if 100% empty
}

@Injectable()
export class MigrationService implements OnApplicationBootstrap {
  private readonly logger = new Logger(MigrationService.name);

  constructor(private readonly dataSource: DataSource) {}

  async onApplicationBootstrap() {
    this.logger.log('Starting automated migration & schema integrity verification...');
    await this.runAllMigrations();
  }

  /**
   * Main entry point: runs on every server start/restart.
   * Inspects current database schema and synchronizes safely.
   */
  async runAllMigrations(): Promise<{ total: number; successful: number; failed: number }> {
    const startTime = Date.now();
    await this.ensureMigrationAuditTable();

    let successful = 0;
    let failed = 0;

    const migrationSpecs: TableMigrationSpec[] = [
      // 0. Notifications Table (Executed FIRST so alerting system is ready immediately)
      {
        tableName: 'notifications',
        columns: [
          { name: 'id', type: 'character varying' },
          { name: 'title', type: 'character varying' },
          { name: 'message', type: 'text' },
          { name: 'category', type: 'character varying', default: "'System'" },
          { name: 'time', type: 'character varying' },
          { name: 'read', type: 'boolean', default: 'false' },
          { name: 'priority', type: 'character varying', default: "'normal'" },
        ],
      },

      // 1. Users Table
      {
        tableName: 'users',
        columns: [
          { name: 'id', type: 'character varying' },
          { name: 'email', type: 'character varying' },
          { name: 'password', type: 'character varying' },
          { name: 'name', type: 'character varying' },
          { name: 'role', type: 'character varying', default: "'teacher'" },
          { name: 'title', type: 'character varying' },
          { name: 'department', type: 'character varying' },
          { name: 'staffId', type: 'character varying' },
          { name: 'avatar', type: 'text' },
          { name: 'isActive', type: 'boolean', default: 'true' },
          { name: 'sessionVersion', type: 'integer', default: '1' },
          { name: 'lastLogin', type: 'character varying' },
        ],
      },

      // 2. Staff Table (including Support Staff & Designation fields)
      {
        tableName: 'staff',
        columns: [
          { name: 'id', type: 'character varying' },
          { name: 'firstName', type: 'character varying' },
          { name: 'lastName', type: 'character varying' },
          { name: 'gender', type: 'character varying', default: "'Male'" },
          { name: 'email', type: 'character varying' },
          { name: 'phone', type: 'character varying' },
          { name: 'role', type: 'character varying', default: "'teacher'" },
          { name: 'designation', type: 'character varying', default: "''" },
          { name: 'department', type: 'character varying' },
          { name: 'subject', type: 'character varying' },
          { name: 'joiningDate', type: 'character varying' },
          { name: 'employmentType', type: 'character varying', default: "'Full-time'" },
          { name: 'qualification', type: 'character varying' },
          { name: 'experienceYears', type: 'integer', default: '0' },
          { name: 'avatar', type: 'text' },
          { name: 'status', type: 'character varying', default: "'Active'" },
          { name: 'address', type: 'text' },
          { name: 'emergencyContact', type: 'text' },
          { name: 'salaryBaseSalary', type: 'double precision', default: '5000' },
          { name: 'salaryHra', type: 'double precision', default: '1100' },
          { name: 'salaryTransportAllowance', type: 'double precision', default: '350' },
          { name: 'salarySpecialAllowance', type: 'double precision', default: '250' },
          { name: 'salaryPfDeduction', type: 'double precision', default: '320' },
          { name: 'salaryTaxDeduction', type: 'double precision', default: '420' },
          { name: 'salaryBankName', type: 'character varying', default: "'Chase National Bank'" },
          { name: 'salaryAccountNumber', type: 'character varying', default: "'•••• 1234'" },
          { name: 'salaryTaxId', type: 'character varying', default: "'TAX-US-99000'" },
          { name: 'leaveBalanceCasualTotal', type: 'integer', default: '12' },
          { name: 'leaveBalanceCasualUsed', type: 'integer', default: '0' },
          { name: 'leaveBalanceSickTotal', type: 'integer', default: '10' },
          { name: 'leaveBalanceSickUsed', type: 'integer', default: '0' },
          { name: 'leaveBalanceAnnualTotal', type: 'integer', default: '15' },
          { name: 'leaveBalanceAnnualUsed', type: 'integer', default: '0' },
          { name: 'leaveBalanceMaternityTotal', type: 'integer', default: '0' },
          { name: 'leaveBalanceMaternityUsed', type: 'integer', default: '0' },
        ],
      },

      // 3. Students Table
      {
        tableName: 'students',
        columns: [
          { name: 'id', type: 'character varying' },
          { name: 'firstName', type: 'character varying' },
          { name: 'lastName', type: 'character varying' },
          { name: 'gender', type: 'character varying', default: "'Male'" },
          { name: 'grade', type: 'character varying' },
          { name: 'section', type: 'character varying' },
          { name: 'rollNumber', type: 'character varying', default: "'01'" },
          { name: 'dateOfBirth', type: 'character varying' },
          { name: 'admissionDate', type: 'character varying' },
          { name: 'bloodGroup', type: 'character varying', default: "'O+'" },
          { name: 'status', type: 'character varying', default: "'Active'" },
          { name: 'avatar', type: 'text' },
          { name: 'parentName', type: 'character varying' },
          { name: 'parentPhone', type: 'character varying' },
          { name: 'parentEmail', type: 'character varying' },
          { name: 'address', type: 'text' },
          { name: 'emergencyContact', type: 'text' },
          { name: 'medicalNotes', type: 'text' },
          { name: 'activities', type: 'jsonb', default: "'[]'::jsonb" },
          { name: 'awards', type: 'jsonb', default: "'[]'::jsonb" },
        ],
      },

      // 4. Attendance Records Table
      {
        tableName: 'attendance_records',
        columns: [
          { name: 'id', type: 'integer' },
          { name: 'date', type: 'character varying' },
          { name: 'targetType', type: 'character varying' },
          { name: 'targetId', type: 'character varying' },
          { name: 'status', type: 'character varying' },
          { name: 'checkIn', type: 'character varying' },
          { name: 'checkOut', type: 'character varying' },
          { name: 'note', type: 'character varying' },
        ],
      },

      // 5. Leave Requests Table
      {
        tableName: 'leave_requests',
        columns: [
          { name: 'id', type: 'character varying' },
          { name: 'staffId', type: 'character varying' },
          { name: 'staffName', type: 'character varying' },
          { name: 'department', type: 'character varying' },
          { name: 'leaveType', type: 'character varying' },
          { name: 'startDate', type: 'character varying' },
          { name: 'endDate', type: 'character varying' },
          { name: 'daysCount', type: 'integer', default: '1' },
          { name: 'reason', type: 'text' },
          { name: 'substituteTeacher', type: 'character varying' },
          { name: 'status', type: 'character varying', default: "'Pending'" },
          { name: 'appliedDate', type: 'character varying' },
          { name: 'reviewedBy', type: 'character varying' },
          { name: 'reviewRemarks', type: 'text' },
        ],
      },

      // 6. School Info Table
      {
        tableName: 'school_info',
        columns: [
          { name: 'id', type: 'integer' },
          { name: 'name', type: 'character varying' },
          { name: 'tagline', type: 'character varying' },
          { name: 'headerSubtitle', type: 'character varying', default: "'CBSE & IB World School #04291'" },
          { name: 'affiliation', type: 'character varying', default: "'CBSE & IB World School #04291'" },
          { name: 'logo', type: 'text' },
          { name: 'established', type: 'integer', default: '1998' },
          { name: 'email', type: 'character varying' },
          { name: 'phone', type: 'character varying' },
          { name: 'address', type: 'text' },
          { name: 'website', type: 'character varying' },
          { name: 'currency', type: 'character varying', default: "'$'" },
          { name: 'academicYear', type: 'character varying', default: "'2026-2027'" },
          { name: 'principal', type: 'character varying' },
          { name: 'themeColor', type: 'character varying', default: "'indigo'" },
        ],
      },

      // 7. Monthly Payrolls & Staff Payroll Records
      {
        tableName: 'monthly_payrolls',
        columns: [
          { name: 'id', type: 'character varying' },
          { name: 'month', type: 'character varying' },
          { name: 'year', type: 'integer' },
          { name: 'disbursementDate', type: 'character varying' },
          { name: 'status', type: 'character varying', default: "'Draft'" },
          { name: 'totalGross', type: 'double precision', default: '0' },
          { name: 'totalDeductions', type: 'double precision', default: '0' },
          { name: 'totalNet', type: 'double precision', default: '0' },
        ],
      },
      {
        tableName: 'staff_payroll_records',
        columns: [
          { name: 'id', type: 'integer' },
          { name: 'payrollId', type: 'character varying' },
          { name: 'staffId', type: 'character varying' },
          { name: 'staffName', type: 'character varying' },
          { name: 'role', type: 'character varying' },
          { name: 'department', type: 'character varying' },
          { name: 'baseSalary', type: 'double precision', default: '0' },
          { name: 'hra', type: 'double precision', default: '0' },
          { name: 'transportAllowance', type: 'double precision', default: '0' },
          { name: 'specialAllowance', type: 'double precision', default: '0' },
          { name: 'bonus', type: 'double precision', default: '0' },
          { name: 'grossEarnings', type: 'double precision', default: '0' },
          { name: 'pfDeduction', type: 'double precision', default: '0' },
          { name: 'taxDeduction', type: 'double precision', default: '0' },
          { name: 'unpaidLeaveDeduction', type: 'double precision', default: '0' },
          { name: 'totalDeductions', type: 'double precision', default: '0' },
          { name: 'netSalary', type: 'double precision', default: '0' },
          { name: 'paymentStatus', type: 'character varying', default: "'Pending'" },
          { name: 'paymentMethod', type: 'character varying', default: "'Bank Transfer'" },
          { name: 'transactionRef', type: 'character varying' },
          { name: 'paidDate', type: 'character varying' },
        ],
      },

      // 8. Activities & Classes Tables
      {
        tableName: 'activities',
        columns: [
          { name: 'id', type: 'character varying' },
          { name: 'name', type: 'character varying' },
          { name: 'category', type: 'character varying' },
          { name: 'mentorTeacher', type: 'character varying' },
          { name: 'mentorRole', type: 'character varying' },
          { name: 'description', type: 'text' },
          { name: 'meetingSchedule', type: 'character varying' },
          { name: 'roomLocation', type: 'character varying' },
          { name: 'badgeColor', type: 'character varying', default: "'indigo'" },
          { name: 'enrolledStudents', type: 'jsonb', default: "'[]'::jsonb" },
          { name: 'achievements', type: 'jsonb', default: "'[]'::jsonb" },
        ],
      },
      {
        tableName: 'classes',
        columns: [
          { name: 'id', type: 'character varying' },
          { name: 'grade', type: 'character varying' },
          { name: 'section', type: 'character varying' },
          { name: 'roomNumber', type: 'character varying' },
          { name: 'classTeacher', type: 'character varying' },
          { name: 'studentCount', type: 'integer', default: '0' },
          { name: 'capacity', type: 'integer', default: '35' },
          { name: 'schedule', type: 'jsonb', default: "'[]'::jsonb" },
        ],
      },
    ];

    for (const spec of migrationSpecs) {
      const stepSuccess = await this.executeTableMigrationWithRetry(spec);
      if (stepSuccess) {
        successful++;
      } else {
        failed++;
      }
    }

    const elapsed = Date.now() - startTime;
    this.logger.log(`Migration integrity verification complete in ${elapsed}ms (${successful} passed, ${failed} skipped).`);

    return { total: migrationSpecs.length, successful, failed };
  }

  /**
   * Executes migration for a table with 3-Hit Retry Mechanism and Transactional Rollback.
   * Ensures all newly added columns are NULLABLE so existing data is never corrupted.
   */
  private async executeTableMigrationWithRetry(spec: TableMigrationSpec): Promise<boolean> {
    const migrationName = `sync_table_${spec.tableName}_schema`;
    const maxAttempts = 3;
    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt < maxAttempts) {
      attempt++;
      const stepStartTime = Date.now();
      const queryRunner = this.dataSource.createQueryRunner();

      try {
        await queryRunner.connect();
        await queryRunner.startTransaction();

        // 1. Check if table exists in PostgreSQL
        const tableExists = await this.checkIfTableExists(queryRunner, spec.tableName);
        if (!tableExists) {
          await queryRunner.commitTransaction();
          await queryRunner.release();
          return true;
        }

        // 2. Fetch existing columns from information_schema
        const existingColumns = await this.getExistingColumns(queryRunner, spec.tableName);

        // 3. Auto-Add missing columns as NULLABLE
        for (const col of spec.columns) {
          if (!existingColumns.includes(col.name)) {
            let addSql = `ALTER TABLE "${spec.tableName}" ADD COLUMN IF NOT EXISTS "${col.name}" ${col.type}`;
            if (col.default !== undefined) {
              addSql += ` DEFAULT ${col.default}`;
            }
            // Always NULLABLE for safe migration over existing rows
            await queryRunner.query(addSql);
            this.logger.log(`[Migration] Auto-added nullable column '${col.name}' to table '${spec.tableName}'`);
          }
        }

        // 4. Safe Column Deletion Check (Zero-Data-Loss Rule)
        if (spec.deprecatedColumns && spec.deprecatedColumns.length > 0) {
          for (const depCol of spec.deprecatedColumns) {
            if (existingColumns.includes(depCol)) {
              const countResult = await queryRunner.query(
                `SELECT COUNT(*) as active_count FROM "${spec.tableName}" WHERE "${depCol}" IS NOT NULL AND CAST("${depCol}" AS TEXT) != '' AND CAST("${depCol}" AS TEXT) != '0'`,
              );
              const activeCount = parseInt(countResult[0]?.active_count || '0', 10);

              if (activeCount > 0) {
                this.logger.warn(
                  `[Migration Safety] Retaining column '${depCol}' on table '${spec.tableName}' because it contains ${activeCount} active record(s). Zero data loss guarantee enforced.`,
                );
              } else {
                await queryRunner.query(`ALTER TABLE "${spec.tableName}" DROP COLUMN IF EXISTS "${depCol}"`);
                this.logger.log(`[Migration] Safely dropped unused empty column '${depCol}' from table '${spec.tableName}'.`);
              }
            }
          }
        }

        await queryRunner.commitTransaction();
        await queryRunner.release();

        const duration = Date.now() - stepStartTime;
        await this.logAuditRecord(migrationName, spec.tableName, 'SUCCESS', attempt, duration, `Synchronized columns for ${spec.tableName}`);
        return true;
      } catch (err) {
        try {
          await queryRunner.rollbackTransaction();
        } catch {
          // ignore rollback error
        } finally {
          await queryRunner.release();
        }

        lastError = err;
        this.logger.warn(`Migration attempt ${attempt}/${maxAttempts} for table '${spec.tableName}' failed: ${err.message}`);

        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, attempt * 1500));
        }
      }
    }

    // If reached here, all 3 attempts failed!
    const errorMsg = `Migration for table '${spec.tableName}' failed after ${maxAttempts} attempts: ${lastError?.message || 'Unknown database error'}. This migration step has been safely skipped.`;
    this.logger.error(`[Migration Critical] ${errorMsg}`);

    // Record audit failure
    await this.logAuditRecord(migrationName, spec.tableName, 'FAILED_SKIPPED', maxAttempts, 0, null, errorMsg);

    // Create In-App Notification for Administrators
    await this.createSystemNotification(
      `Database Migration Skipped: ${spec.tableName}`,
      `A migration related to table '${spec.tableName}' encountered an issue and was skipped after ${maxAttempts} attempts: ${lastError?.message}`,
      'high',
    );

    return false;
  }

  private async ensureMigrationAuditTable() {
    try {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS "_system_migration_audit" (
          "id" SERIAL PRIMARY KEY,
          "migrationName" character varying NOT NULL,
          "tableName" character varying,
          "status" character varying DEFAULT 'SUCCESS',
          "attempts" integer DEFAULT 1,
          "executionTimeMs" integer DEFAULT 0,
          "details" text,
          "errorDetails" text,
          "executedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      await queryRunner.release();
    } catch (err) {
      this.logger.warn(`Could not verify _system_migration_audit table: ${err.message}`);
    }
  }

  private async checkIfTableExists(queryRunner: QueryRunner, tableName: string): Promise<boolean> {
    const res = await queryRunner.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      );`,
      [tableName],
    );
    return res[0]?.exists === true;
  }

  private async getExistingColumns(queryRunner: QueryRunner, tableName: string): Promise<string[]> {
    const res = await queryRunner.query(
      `SELECT column_name 
       FROM information_schema.columns 
       WHERE table_schema = 'public' 
       AND table_name = $1;`,
      [tableName],
    );
    return res.map((r: any) => r.column_name);
  }

  private async logAuditRecord(
    migrationName: string,
    tableName: string,
    status: string,
    attempts: number,
    executionTimeMs: number,
    details?: string,
    errorDetails?: string,
  ) {
    try {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.query(
        `INSERT INTO "_system_migration_audit" ("migrationName", "tableName", "status", "attempts", "executionTimeMs", "details", "errorDetails")
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [migrationName, tableName, status, attempts, executionTimeMs, details || null, errorDetails || null],
      );
      await queryRunner.release();
    } catch (err) {
      this.logger.warn(`Failed to write migration audit record: ${err.message}`);
    }
  }

  private async createSystemNotification(title: string, message: string, priority: string = 'high') {
    try {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      const notifId = `NOTIF-MIG-${Date.now()}`;
      const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      // Check existing columns in notifications table to build a safe dynamic insert
      const cols = await this.getExistingColumns(queryRunner, 'notifications');
      
      let colList = ['"id"', '"title"', '"message"'];
      let valList = ['$1', '$2', '$3'];
      let params: any[] = [notifId, title, message];

      if (cols.includes('category')) {
        colList.push('"category"');
        valList.push(`$${params.length + 1}`);
        params.push('System Alert');
      }
      if (cols.includes('time')) {
        colList.push('"time"');
        valList.push(`$${params.length + 1}`);
        params.push(timeStr);
      }
      if (cols.includes('read')) {
        colList.push('"read"');
        valList.push('false');
      }
      if (cols.includes('priority')) {
        colList.push('"priority"');
        valList.push(`$${params.length + 1}`);
        params.push(priority);
      }

      await queryRunner.query(
        `INSERT INTO "notifications" (${colList.join(', ')})
         VALUES (${valList.join(', ')})
         ON CONFLICT ("id") DO NOTHING;`,
        params,
      );
      await queryRunner.release();
    } catch (err) {
      this.logger.warn(`Could not dispatch system notification: ${err.message}`);
    }
  }

  async getAuditHistory(): Promise<SystemMigrationAuditEntity[]> {
    try {
      const auditRepo = this.dataSource.getRepository(SystemMigrationAuditEntity);
      return await auditRepo.find({ order: { executedAt: 'DESC' }, take: 100 });
    } catch {
      return [];
    }
  }
}
