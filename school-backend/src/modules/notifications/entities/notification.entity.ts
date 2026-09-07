import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('notifications')
export class NotificationEntity {
  @ApiProperty({ example: 'NOTIF-1' })
  @PrimaryColumn()
  id: string;

  @ApiProperty({ example: 'leave' })
  @Column()
  type: string;

  @ApiProperty({ example: 'New Leave Application' })
  @Column()
  title: string;

  @ApiProperty({ example: 'David Kim applied for 1-day Sick Leave on Sept 3, 2026.' })
  @Column({ type: 'text' })
  message: string;

  @ApiProperty({ example: '10 mins ago' })
  @Column({ default: 'Just now' })
  time: string;

  @ApiProperty({ example: false })
  @Column({ default: false })
  read: boolean;

  @ApiProperty({ example: 'leaves' })
  @Column({ nullable: true })
  linkTab: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
