import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('classes')
export class ClassEntity {
  @ApiProperty({ example: 'CLS-12A' })
  @PrimaryColumn()
  id: string;

  @ApiProperty({ example: 'Grade 12' })
  @Column()
  grade: string;

  @ApiProperty({ example: 'A' })
  @Column()
  section: string;

  @ApiProperty({ example: 'STF-102' })
  @Column()
  classTeacherId: string;

  @ApiProperty({ example: 'Sarah Jenkins' })
  @Column()
  classTeacherName: string;

  @ApiProperty({ example: 'Room 401 (East Wing)' })
  @Column()
  roomNumber: string;

  @ApiProperty({ example: 25 })
  @Column({ default: 0 })
  totalStudents: number;

  @ApiProperty({ example: ['Calculus BC', 'AP Physics', 'Literature'] })
  @Column('simple-array')
  subjects: string[];

  @ApiProperty({ example: '08:30 AM - 03:15 PM (Mon-Fri)' })
  @Column()
  scheduleSummary: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
