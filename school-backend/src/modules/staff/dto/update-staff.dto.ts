import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateStaffDto } from './create-staff.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateStaffDto extends PartialType(CreateStaffDto) {}

export class FilterStaffDto {
  @ApiPropertyOptional({ description: 'Search term for name, role, department or ID' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by department (e.g. Science, Mathematics)' })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({ description: 'Filter by employment type (e.g. Full-time, Part-time)' })
  @IsOptional()
  @IsString()
  employmentType?: string;
}
