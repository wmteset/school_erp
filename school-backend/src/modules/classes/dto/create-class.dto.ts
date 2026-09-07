import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsArray, IsOptional } from 'class-validator';

export class CreateClassDto {
  @ApiPropertyOptional({ example: 'CLS-11B' })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ example: 'Grade 11' })
  @IsNotEmpty()
  @IsString()
  grade: string;

  @ApiProperty({ example: 'B' })
  @IsNotEmpty()
  @IsString()
  section: string;

  @ApiProperty({ example: 'STF-103' })
  @IsNotEmpty()
  @IsString()
  classTeacherId: string;

  @ApiProperty({ example: 'David Kim' })
  @IsNotEmpty()
  @IsString()
  classTeacherName: string;

  @ApiProperty({ example: 'Room 306 (North Wing)' })
  @IsNotEmpty()
  @IsString()
  roomNumber: string;

  @ApiProperty({ example: ['Computer Science', 'Pre-Calculus', 'World History'] })
  @IsNotEmpty()
  @IsArray()
  subjects: string[];

  @ApiProperty({ example: '08:30 AM - 03:15 PM (Mon-Fri)' })
  @IsNotEmpty()
  @IsString()
  scheduleSummary: string;
}
