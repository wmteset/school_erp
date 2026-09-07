import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateActivityDto {
  @ApiPropertyOptional({ example: 'ACT-07' })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ example: 'Astronomy & Astrophysics Club' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'STEM & Tech' })
  @IsNotEmpty()
  @IsString()
  category: string;

  @ApiProperty({ example: 'Marcus Vance' })
  @IsNotEmpty()
  @IsString()
  facultyAdvisor: string;

  @ApiProperty({ example: 'Wednesdays, 4:00 PM - 5:30 PM' })
  @IsNotEmpty()
  @IsString()
  meetingSchedule: string;

  @ApiProperty({ example: 'Observatory Deck Room 402' })
  @IsNotEmpty()
  @IsString()
  room: string;

  @ApiPropertyOptional({ example: 25 })
  @IsOptional()
  @IsNumber()
  capacity?: number;

  @ApiPropertyOptional({ example: 'Deep sky observation, stellar astrophysics, telescope operation.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'indigo' })
  @IsOptional()
  @IsString()
  badgeColor?: string;
}

export class EnrollStudentActivityDto {
  @ApiProperty({ example: 'STU-2026-001' })
  @IsNotEmpty()
  @IsString()
  studentId: string;

  @ApiPropertyOptional({ example: 'Member' })
  @IsOptional()
  @IsString()
  role?: string;
}

export class AddAchievementDto {
  @ApiProperty({ example: '1st Place All-State Science Olympiad' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: '2026-05-20' })
  @IsNotEmpty()
  @IsString()
  date: string;

  @ApiProperty({ example: 'Astronomy Club Team' })
  @IsNotEmpty()
  @IsString()
  recipient: string;

  @ApiPropertyOptional({ example: 'Top score in spectroscopy test.' })
  @IsOptional()
  @IsString()
  notes?: string;
}
