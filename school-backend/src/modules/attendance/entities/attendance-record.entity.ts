import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Unique, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('attendance_records')
@Unique(['date', 'targetType', 'targetId'])
export class AttendanceRecordEntity {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: '2026-09-02' })
  @Index()
  @Column()
  date: string;

  @ApiProperty({ example: 'student', enum: ['student', 'staff'] })
  @Column()
  targetType: string;

  @ApiProperty({ example: 'STU-2026-001' })
  @Index()
  @Column()
  targetId: string;

  @ApiProperty({ example: 'P', enum: ['P', 'L', 'A', 'E'] })
  @Column({ default: 'P' })
  status: string;

  @ApiProperty({ example: 'On time in class', nullable: true })
  @Column({ type: 'text', nullable: true, default: '' })
  note: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
