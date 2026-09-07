import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SalaryDto {
  @ApiPropertyOptional({ example: 5500 })
  @IsOptional()
  @IsNumber()
  baseSalary?: number;

  @ApiPropertyOptional({ example: 1200 })
  @IsOptional()
  @IsNumber()
  hra?: number;

  @ApiPropertyOptional({ example: 400 })
  @IsOptional()
  @IsNumber()
  transportAllowance?: number;

  @ApiPropertyOptional({ example: 300 })
  @IsOptional()
  @IsNumber()
  specialAllowance?: number;

  @ApiPropertyOptional({ example: 350 })
  @IsOptional()
  @IsNumber()
  pfDeduction?: number;

  @ApiPropertyOptional({ example: 450 })
  @IsOptional()
  @IsNumber()
  taxDeduction?: number;

  @ApiPropertyOptional({ example: 'Chase National Bank' })
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiPropertyOptional({ example: '•••• 4892' })
  @IsOptional()
  @IsString()
  accountNumber?: string;

  @ApiPropertyOptional({ example: 'TAX-US-99120' })
  @IsOptional()
  @IsString()
  taxId?: string;
}

export class LeaveBalanceDto {
  @ApiPropertyOptional({ example: 12 })
  @IsOptional()
  @IsNumber()
  casualTotal?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  casualUsed?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsNumber()
  sickTotal?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  sickUsed?: number;

  @ApiPropertyOptional({ example: 15 })
  @IsOptional()
  @IsNumber()
  annualTotal?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  annualUsed?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  maternityTotal?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  maternityUsed?: number;
}

export class CreateStaffDto {
  @ApiPropertyOptional({ example: 'STF-109' })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ example: 'Marcus' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Vance' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiPropertyOptional({ example: 'Male' })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiProperty({ example: 'm.vance@oakridge-academy.edu' })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({ example: '+1 (555) 019-2831' })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiPropertyOptional({ example: 'TeacherPass123' })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({ example: 'teacher', description: 'RBAC Role: principal | teacher | accountant' })
  @IsNotEmpty()
  @IsString()
  role: string;

  @ApiPropertyOptional({ example: 'Senior Physics Teacher & HOD' })
  @IsOptional()
  @IsString()
  designation?: string;

  @ApiProperty({ example: 'Science' })
  @IsNotEmpty()
  @IsString()
  department: string;

  @ApiPropertyOptional({ example: 'Advanced Physics' })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty({ example: '2018-06-15' })
  @IsNotEmpty()
  @IsString()
  joiningDate: string;

  @ApiPropertyOptional({ example: 'Full-time' })
  @IsOptional()
  @IsString()
  employmentType?: string;

  @ApiPropertyOptional({ example: 'M.Sc. Physics, B.Ed.' })
  @IsOptional()
  @IsString()
  qualification?: string;

  @ApiPropertyOptional({ example: 12 })
  @IsOptional()
  @IsNumber()
  experienceYears?: number;

  @ApiPropertyOptional({ example: 'data:image/jpeg;base64,...' })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({ example: 'Active' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: '45 Cedar Crest Rd, Suite 3B, Springfield' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'Elena Vance (Wife) - +1 (555) 019-2832' })
  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @ApiPropertyOptional({ type: () => SalaryDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SalaryDto)
  salary?: SalaryDto;

  @ApiPropertyOptional({ type: () => LeaveBalanceDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => LeaveBalanceDto)
  leaveBalance?: LeaveBalanceDto;
}
