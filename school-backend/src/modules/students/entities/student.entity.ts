import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('students')
export class StudentEntity {
  @ApiProperty({ example: 'STU-2026-001' })
  @PrimaryColumn()
  id: string;

  @ApiProperty({ example: 'Aiden' })
  @Column()
  firstName: string;

  @ApiProperty({ example: 'Taylor' })
  @Column()
  lastName: string;

  @ApiProperty({ example: 'Male' })
  @Column({ default: 'Male' })
  gender: string;

  @ApiProperty({ example: '2009-04-12' })
  @Column({ nullable: true })
  dob: string;

  @ApiProperty({ example: 'O+' })
  @Column({ default: 'O+' })
  bloodGroup: string;

  @ApiProperty({ example: 'Grade 11' })
  @Column()
  grade: string;

  @ApiProperty({ example: 'A' })
  @Column({ default: 'A' })
  section: string;

  @ApiProperty({ example: '101' })
  @Column()
  rollNumber: string;

  @ApiProperty({ example: '2021-08-15' })
  @Column({ default: '2026-09-02' })
  admissionDate: string;

  @ApiProperty({ example: 'Active' })
  @Column({ default: 'Active' })
  status: string;

  @ApiProperty({ example: 'https://images.unsplash.com/...' })
  @Column({ type: 'text', nullable: true })
  avatar: string;

  @ApiProperty({ example: 'Richard Taylor' })
  @Column({ nullable: true })
  guardianName: string;

  @ApiProperty({ example: 'Father' })
  @Column({ default: 'Father' })
  guardianRelation: string;

  @ApiProperty({ example: '+1 (555) 891-2301' })
  @Column({ nullable: true })
  guardianPhone: string;

  @ApiProperty({ example: 'r.taylor@gmail.com' })
  @Column({ nullable: true })
  guardianEmail: string;

  @ApiProperty({ example: '124 Birch Lane, Sunnyvale' })
  @Column({ type: 'text', nullable: true })
  address: string;

  @ApiProperty({ example: 'Mild peanut allergy (Epipen carried)' })
  @Column({ type: 'text', nullable: true })
  medicalNotes: string;

  @ApiProperty({ example: 'Bus Route #4 (Stop: North Gate)' })
  @Column({ nullable: true })
  transportRoute: string;

  @ApiProperty({ example: ['Robotics Club', 'Soccer Team'] })
  @Column('simple-array', { nullable: true })
  activities: string[];

  @ApiProperty({ example: ['1st Place Regional Science Fair 2025'] })
  @Column('simple-array', { nullable: true })
  awards: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
