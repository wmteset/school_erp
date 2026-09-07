import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export class SalaryDetails {
  @ApiProperty({ example: 5500 })
  @Column({ type: 'float', default: 5000 })
  baseSalary: number;

  @ApiProperty({ example: 1200 })
  @Column({ type: 'float', default: 1100 })
  hra: number;

  @ApiProperty({ example: 400 })
  @Column({ type: 'float', default: 350 })
  transportAllowance: number;

  @ApiProperty({ example: 300 })
  @Column({ type: 'float', default: 250 })
  specialAllowance: number;

  @ApiProperty({ example: 350 })
  @Column({ type: 'float', default: 320 })
  pfDeduction: number;

  @ApiProperty({ example: 450 })
  @Column({ type: 'float', default: 420 })
  taxDeduction: number;

  @ApiProperty({ example: 'Chase National Bank' })
  @Column({ default: 'Chase National Bank' })
  bankName: string;

  @ApiProperty({ example: '•••• 4892' })
  @Column({ default: '•••• 1234' })
  accountNumber: string;

  @ApiProperty({ example: 'TAX-US-99120' })
  @Column({ default: 'TAX-US-99000' })
  taxId: string;
}

export class LeaveBalanceDetails {
  @ApiProperty({ example: 12 })
  @Column({ default: 12 })
  casualTotal: number;

  @ApiProperty({ example: 2 })
  @Column({ default: 0 })
  casualUsed: number;

  @ApiProperty({ example: 10 })
  @Column({ default: 10 })
  sickTotal: number;

  @ApiProperty({ example: 1 })
  @Column({ default: 0 })
  sickUsed: number;

  @ApiProperty({ example: 15 })
  @Column({ default: 15 })
  annualTotal: number;

  @ApiProperty({ example: 4 })
  @Column({ default: 0 })
  annualUsed: number;

  @ApiProperty({ example: 0 })
  @Column({ default: 0 })
  maternityTotal: number;

  @ApiProperty({ example: 0 })
  @Column({ default: 0 })
  maternityUsed: number;
}

@Entity('staff')
export class StaffEntity {
  @ApiProperty({ example: 'STF-101' })
  @PrimaryColumn()
  id: string;

  @ApiProperty({ example: 'Marcus' })
  @Column()
  firstName: string;

  @ApiProperty({ example: 'Vance' })
  @Column()
  lastName: string;

  @ApiProperty({ example: 'Male' })
  @Column({ default: 'Male' })
  gender: string;

  @ApiProperty({ example: 'm.vance@oakridge-academy.edu' })
  @Column()
  email: string;

  @ApiProperty({ example: '+1 (555) 019-2831' })
  @Column()
  phone: string;

  @ApiProperty({ example: 'teacher', description: 'RBAC Role: principal | teacher | accountant' })
  @Column({ default: 'teacher' })
  role: string;

  @ApiProperty({ example: 'Senior Teacher & HOD' })
  @Column({ default: '' })
  designation: string;

  @ApiProperty({ example: 'Science' })
  @Column()
  department: string;

  @ApiProperty({ example: 'Advanced Physics' })
  @Column({ nullable: true })
  subject: string;

  @ApiProperty({ example: '2018-06-15' })
  @Column()
  joiningDate: string;

  @ApiProperty({ example: 'Full-time' })
  @Column({ default: 'Full-time' })
  employmentType: string;

  @ApiProperty({ example: 'M.Sc. Physics, B.Ed.' })
  @Column({ nullable: true })
  qualification: string;

  @ApiProperty({ example: 12 })
  @Column({ default: 0 })
  experienceYears: number;

  @ApiProperty({ example: 'https://images.unsplash.com/...' })
  @Column({ type: 'text', nullable: true })
  avatar: string;

  @ApiProperty({ example: 'Active' })
  @Column({ default: 'Active' })
  status: string;

  @ApiProperty({ example: '45 Cedar Crest Rd, Suite 3B, Springfield' })
  @Column({ type: 'text', nullable: true })
  address: string;

  @ApiProperty({ example: 'Elena Vance (Wife) - +1 (555) 019-2832' })
  @Column({ type: 'text', nullable: true })
  emergencyContact: string;

  @Column(() => SalaryDetails)
  salary: SalaryDetails;

  @Column(() => LeaveBalanceDetails)
  leaveBalance: LeaveBalanceDetails;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
