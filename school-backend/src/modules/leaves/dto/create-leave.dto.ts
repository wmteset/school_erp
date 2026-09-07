import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateLeaveDto {
  @ApiPropertyOptional({ example: 'LV-2026-085' })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ example: 'STF-103' })
  @IsNotEmpty()
  @IsString()
  staffId: string;

  @ApiProperty({ example: 'Sick Leave' })
  @IsNotEmpty()
  @IsString()
  leaveType: string;

  @ApiProperty({ example: '2026-09-03' })
  @IsNotEmpty()
  @IsString()
  startDate: string;

  @ApiProperty({ example: '2026-09-03' })
  @IsNotEmpty()
  @IsString()
  endDate: string;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  daysCount: number;

  @ApiProperty({ example: 'Dental surgery appointment' })
  @IsNotEmpty()
  @IsString()
  reason: string;

  @ApiPropertyOptional({ example: 'Sarah Jenkins (Study Hall)' })
  @IsOptional()
  @IsString()
  substituteTeacher?: string;
}

export class ReviewLeaveDto {
  @ApiProperty({ example: 'Approved', enum: ['Approved', 'Rejected'] })
  @IsNotEmpty()
  @IsString()
  status: 'Approved' | 'Rejected';

  @ApiPropertyOptional({ example: 'Approved by Administration' })
  @IsOptional()
  @IsString()
  reviewRemarks?: string;

  @ApiPropertyOptional({ example: 'Dr. Arthur Pendelton' })
  @IsOptional()
  @IsString()
  reviewedBy?: string;
}
