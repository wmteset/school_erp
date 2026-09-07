import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../roles.enum';

@Entity('users')
export class UserEntity {
  @ApiProperty({ example: 'USR-ADMIN' })
  @PrimaryColumn()
  id: string;

  @ApiProperty({ example: 'admin@oakridge.edu' })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ example: 'admin123' })
  @Column()
  password: string;

  @ApiProperty({ example: 'Dr. Arthur Pendelton' })
  @Column()
  name: string;

  @ApiProperty({ example: 'admin', enum: Object.values(UserRole) })
  @Column({ type: 'varchar', default: UserRole.ADMIN })
  role: UserRole;

  @ApiProperty({ example: 'Super Administrator' })
  @Column()
  title: string;

  @ApiProperty({ example: 'Administration' })
  @Column({ default: 'General' })
  department: string;

  @ApiProperty({ example: 'STF-106', nullable: true })
  @Column({ nullable: true })
  staffId: string;

  @ApiProperty({ example: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80' })
  @Column({ default: '' })
  avatar: string;

  @ApiProperty({ example: true })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ example: 1, default: 1 })
  @Column({ default: 1 })
  sessionVersion: number;

  @ApiProperty({ example: '2026-09-02T10:00:00.000Z', nullable: true })
  @Column({ nullable: true })
  lastLogin: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
