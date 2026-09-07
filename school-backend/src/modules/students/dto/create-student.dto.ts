import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class CreateStudentDto {
  @ApiPropertyOptional({ example: 'STU-2026-011' })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ example: 'Lucas' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Santoro' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiPropertyOptional({ example: 'Male' })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({ example: '2010-02-18' })
  @IsOptional()
  @IsString()
  dob?: string;

  @ApiPropertyOptional({ example: 'B+' })
  @IsOptional()
  @IsString()
  bloodGroup?: string;

  @ApiProperty({ example: 'Grade 10' })
  @IsNotEmpty()
  @IsString()
  grade: string;

  @ApiPropertyOptional({ example: 'A' })
  @IsOptional()
  @IsString()
  section?: string;

  @ApiProperty({ example: '201' })
  @IsNotEmpty()
  @IsString()
  rollNumber: string;

  @ApiPropertyOptional({ example: '2026-09-02' })
  @IsOptional()
  @IsString()
  admissionDate?: string;

  @ApiPropertyOptional({ example: 'Active' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: 'data:image/jpeg;base64,...' })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({ example: 'Marco Santoro' })
  @IsOptional()
  @IsString()
  guardianName?: string;

  @ApiPropertyOptional({ example: 'Father' })
  @IsOptional()
  @IsString()
  guardianRelation?: string;

  @ApiPropertyOptional({ example: '+1 (555) 762-1100' })
  @IsOptional()
  @IsString()
  guardianPhone?: string;

  @ApiPropertyOptional({ example: 'msantoro@consulting.com' })
  @IsOptional()
  @IsString()
  guardianEmail?: string;

  @ApiPropertyOptional({ example: '340 Pine View Dr, Mountain View' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'Asthma inhaler as needed' })
  @IsOptional()
  @IsString()
  medicalNotes?: string;

  @ApiPropertyOptional({ example: 'Bus Route #2 (Stop: Highland)' })
  @IsOptional()
  @IsString()
  transportRoute?: string;

  @ApiPropertyOptional({ example: ['Basketball Varsity', 'Music Band'] })
  @IsOptional()
  @IsArray()
  activities?: string[];

  @ApiPropertyOptional({ example: ['MVP Inter-School Basketball 2025'] })
  @IsOptional()
  @IsArray()
  awards?: string[];
}
