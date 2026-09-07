import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export class ActivityMember {
  studentId: string;
  studentName: string;
  role: string;
}

export class ActivityAchievement {
  title: string;
  date: string;
  recipient: string;
  notes?: string;
}

@Entity('activities')
export class ActivityEntity {
  @ApiProperty({ example: 'ACT-01' })
  @PrimaryColumn()
  id: string;

  @ApiProperty({ example: 'Robotics & AI Guild' })
  @Column()
  name: string;

  @ApiProperty({ example: 'STEM & Tech' })
  @Column()
  category: string;

  @ApiProperty({ example: 'David Kim' })
  @Column()
  facultyAdvisor: string;

  @ApiProperty({ example: 'Tuesdays & Thursdays, 3:30 PM - 5:00 PM' })
  @Column()
  meetingSchedule: string;

  @ApiProperty({ example: 'Robotics Lab (Room 304)' })
  @Column()
  room: string;

  @ApiProperty({ example: 25 })
  @Column({ default: 30 })
  capacity: number;

  @ApiProperty({ example: 'Hands-on engineering, drone programming, VEX robotics...' })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({ example: 'emerald' })
  @Column({ default: 'indigo' })
  badgeColor: string;

  @ApiProperty({ example: [{ studentId: 'STU-2026-001', studentName: 'Aiden Taylor', role: 'Team Lead' }] })
  @Column('simple-json', { default: '[]' })
  enrolledStudents: ActivityMember[];

  @ApiProperty({ example: [{ title: '1st Place Silicon Valley Junior Bot Fight', date: '2026-04-14', recipient: 'Robotics Guild', notes: '' }] })
  @Column('simple-json', { default: '[]' })
  achievements: ActivityAchievement[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
