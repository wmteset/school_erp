import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('leave_requests')
export class LeaveRequestEntity {
  @ApiProperty({ example: 'LV-2026-081' })
  @PrimaryColumn()
  id: string;

  @ApiProperty({ example: 'STF-101' })
  @Column()
  staffId: string;

  @ApiProperty({ example: 'Marcus Vance' })
  @Column()
  staffName: string;

  @ApiProperty({ example: 'Science' })
  @Column()
  department: string;

  @ApiProperty({ example: 'Casual Leave' })
  @Column()
  leaveType: string;

  @ApiProperty({ example: '2026-09-08' })
  @Column()
  startDate: string;

  @ApiProperty({ example: '2026-09-09' })
  @Column()
  endDate: string;

  @ApiProperty({ example: 2 })
  @Column({ default: 1 })
  daysCount: number;

  @ApiProperty({ example: 'Attending National Physics Pedagogy Symposium' })
  @Column({ type: 'text' })
  reason: string;

  @ApiProperty({ example: 'Dr. Arthur Pendelton' })
  @Column({ nullable: true })
  substituteTeacher: string;

  @ApiProperty({ example: 'Pending', enum: ['Pending', 'Approved', 'Rejected'] })
  @Column({ default: 'Pending' })
  status: string;

  @ApiProperty({ example: '2026-09-01' })
  @Column()
  appliedDate: string;

  @ApiProperty({ example: 'Dr. Arthur Pendelton', nullable: true })
  @Column({ nullable: true })
  reviewedBy: string;

  @ApiProperty({ example: 'Approved. Please provide seminar summary.', nullable: true })
  @Column({ type: 'text', nullable: true })
  reviewRemarks: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
