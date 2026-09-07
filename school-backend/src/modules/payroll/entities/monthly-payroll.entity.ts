import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { StaffPayrollRecordEntity } from './staff-payroll-record.entity';

@Entity('monthly_payrolls')
export class MonthlyPayrollEntity {
  @ApiProperty({ example: 'PAY-2026-AUG' })
  @PrimaryColumn()
  id: string;

  @ApiProperty({ example: 'August' })
  @Column()
  month: string;

  @ApiProperty({ example: 2026 })
  @Column()
  year: number;

  @ApiProperty({ example: '2026-08-31' })
  @Column()
  disbursementDate: string;

  @ApiProperty({ example: 'Paid', enum: ['Draft', 'Processing', 'Paid'] })
  @Column({ default: 'Draft' })
  status: string;

  @ApiProperty({ type: () => [StaffPayrollRecordEntity] })
  @OneToMany(() => StaffPayrollRecordEntity, (r) => r.payroll, { cascade: true, eager: true })
  staffRecords: StaffPayrollRecordEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
export { StaffPayrollRecordEntity };
