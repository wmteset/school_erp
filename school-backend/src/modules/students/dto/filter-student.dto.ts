import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class FilterStudentDto {
  @ApiPropertyOptional({ description: 'Search term for name, roll number, or ID' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by grade (e.g. Grade 10)' })
  @IsOptional()
  @IsString()
  grade?: string;

  @ApiPropertyOptional({ description: 'Filter by section (e.g. A, B)' })
  @IsOptional()
  @IsString()
  section?: string;

  @ApiPropertyOptional({ description: 'Filter by enrollment status (e.g. Active, On Leave)' })
  @IsOptional()
  @IsString()
  status?: string;
}
