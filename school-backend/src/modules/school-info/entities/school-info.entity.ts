import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('school_info')
export class SchoolInfoEntity {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Oakridge International Academy' })
  @Column({ default: 'Oakridge International Academy' })
  name: string;

  @ApiProperty({ example: 'Excellence in Education & Character Building' })
  @Column({ default: 'Excellence in Education & Character Building' })
  tagline: string;

  @ApiProperty({ example: 'CBSE & IB World School #04291' })
  @Column({ default: 'CBSE & IB World School #04291' })
  headerSubtitle: string;

  @ApiProperty({ example: 'CBSE & IB World School #04291' })
  @Column({ default: 'CBSE & IB World School #04291' })
  affiliation: string;

  @ApiProperty({ example: '', nullable: true })
  @Column({ type: 'text', nullable: true, default: '' })
  logo: string;

  @ApiProperty({ example: 1998 })
  @Column({ default: 1998 })
  established: number;

  @ApiProperty({ example: 'contact@oakridge-academy.edu' })
  @Column({ default: 'contact@oakridge-academy.edu' })
  email: string;

  @ApiProperty({ example: '+1 (555) 234-5678' })
  @Column({ default: '+1 (555) 234-5678' })
  phone: string;

  @ApiProperty({ example: '742 Evergreen Academic Blvd, Education City, CA 90210' })
  @Column({ default: '742 Evergreen Academic Blvd, Education City, CA 90210' })
  address: string;

  @ApiProperty({ example: 'www.oakridge-academy.edu' })
  @Column({ default: 'www.oakridge-academy.edu' })
  website: string;

  @ApiProperty({ example: '$' })
  @Column({ default: '$' })
  currency: string;

  @ApiProperty({ example: '2026-2027' })
  @Column({ default: '2026-2027' })
  academicYear: string;

  @ApiProperty({ example: 'Dr. Arthur Pendelton, Ph.D.' })
  @Column({ default: 'Dr. Arthur Pendelton, Ph.D.' })
  principal: string;

  @ApiProperty({ example: 'indigo' })
  @Column({ default: 'indigo' })
  themeColor: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
