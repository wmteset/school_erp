import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import type { MonthlyPayrollEntity } from './monthly-payroll.entity';

@Entity('staff_payroll_records')
export class StaffPayrollRecordEntity {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'PAY-2026-AUG' })
  @Column()
  payrollId: string;

  @ApiProperty({ example: 'STF-101' })
  @Column()
  staffId: string;

  @ApiProperty({ example: 'Marcus Vance' })
  @Column()
  staffName: string;

  @ApiProperty({ example: 'Senior Teacher & HOD' })
  @Column()
  role: string;

  @ApiProperty({ example: 'Science' })
  @Column()
  department: string;

  @ApiProperty({ example: 5500 })
  @Column({ type: 'float' })
  baseSalary: number;

  @ApiProperty({ example: 1200 })
  @Column({ type: 'float', default: 0 })
  hra: number;

  @ApiProperty({ example: 400 })
  @Column({ type: 'float', default: 0 })
  transportAllowance: number;

  @ApiProperty({ example: 300 })
  @Column({ type: 'float', default: 0 })
  specialAllowance: number;

  @ApiProperty({ example: 200 })
  @Column({ type: 'float', default: 0 })
  bonus: number;

  @ApiProperty({ example: 7600 })
  @Column({ type: 'float' })
  grossEarnings: number;

  @ApiProperty({ example: 350 })
  @Column({ type: 'float', default: 0 })
  pfDeduction: number;

  @ApiProperty({ example: 450 })
  @Column({ type: 'float', default: 0 })
  taxDeduction: number;

  @ApiProperty({ example: 0 })
  @Column({ type: 'float', default: 0 })
  unpaidLeaveDeduction: number;

  @ApiProperty({ example: 800 })
  @Column({ type: 'float' })
  totalDeductions: number;

  @ApiProperty({ example: 6800 })
  @Column({ type: 'float' })
  netSalary: number;

  @ApiProperty({ example: 'Paid', enum: ['Pending', 'Paid'] })
  @Column({ default: 'Pending' })
  paymentStatus: string;

  @ApiProperty({ example: 'Bank Transfer' })
  @Column({ default: 'Bank Transfer' })
  paymentMethod: string;

  @ApiProperty({ example: 'TXN-ACH-9821034' })
  @Column({ nullable: true })
  transactionRef: string;

  @ApiProperty({ example: '2026-08-31', nullable: true })
  @Column({ nullable: true })
  paidDate: string;

  @ManyToOne('MonthlyPayrollEntity', 'staffRecords', { onDelete: 'CASCADE' })
  payroll: MonthlyPayrollEntity;
}
