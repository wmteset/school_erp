import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('_system_migration_audit')
export class SystemMigrationAuditEntity {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: '20260907_add_designation_and_support_staff_schema' })
  @Column({ unique: false })
  migrationName: string;

  @ApiProperty({ example: 'staff' })
  @Column({ nullable: true })
  tableName: string;

  @ApiProperty({ example: 'SUCCESS', enum: ['SUCCESS', 'SKIPPED', 'FAILED_SKIPPED', 'WARNING'] })
  @Column({ default: 'SUCCESS' })
  status: string;

  @ApiProperty({ example: 1 })
  @Column({ default: 1 })
  attempts: number;

  @ApiProperty({ example: 45 })
  @Column({ type: 'int', default: 0 })
  executionTimeMs: number;

  @ApiProperty({ example: 'Successfully synchronized 2 columns on staff table.' })
  @Column({ type: 'text', nullable: true })
  details: string;

  @ApiProperty({ example: null })
  @Column({ type: 'text', nullable: true })
  errorDetails: string;

  @CreateDateColumn()
  executedAt: Date;
}
