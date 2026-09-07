import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsIn, IsOptional } from 'class-validator';

export class MarkAttendanceDto {
  @ApiProperty({ example: '2026-09-02' })
  @IsNotEmpty()
  @IsString()
  date: string;

  @ApiProperty({ example: 'student', enum: ['student', 'staff'] })
  @IsNotEmpty()
  @IsIn(['student', 'staff'])
  targetType: string;

  @ApiProperty({ example: 'STU-2026-001' })
  @IsNotEmpty()
  @IsString()
  targetId: string;

  @ApiProperty({ example: 'P', enum: ['P', 'L', 'A', 'E'] })
  @IsNotEmpty()
  @IsIn(['P', 'L', 'A', 'E'])
  status: string;

  @ApiPropertyOptional({ example: 'Traffic delay' })
  @IsOptional()
  @IsString()
  note?: string;
}

export class BulkAttendanceDto {
  @ApiProperty({ example: '2026-09-02' })
  @IsNotEmpty()
  @IsString()
  date: string;

  @ApiProperty({ example: 'student', enum: ['student', 'staff'] })
  @IsNotEmpty()
  @IsIn(['student', 'staff'])
  targetType: string;

  @ApiProperty({ example: ['STU-2026-001', 'STU-2026-002'] })
  @IsNotEmpty()
  targetIds: string[];

  @ApiProperty({ example: 'P', enum: ['P', 'L', 'A', 'E'] })
  @IsNotEmpty()
  @IsIn(['P', 'L', 'A', 'E'])
  status: string;

  @ApiPropertyOptional({ example: 'Marked in batch' })
  @IsOptional()
  @IsString()
  note?: string;
}
