import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class GeneratePayrollDto {
  @ApiProperty({ example: 'August' })
  @IsNotEmpty()
  @IsString()
  month: string;

  @ApiProperty({ example: 2026 })
  @IsNotEmpty()
  @IsNumber()
  year: number;
}

export class UpdateStaffPayoutDto {
  @ApiProperty({ example: 'Paid', enum: ['Pending', 'Paid'] })
  @IsNotEmpty()
  @IsString()
  paymentStatus: string;

  @ApiPropertyOptional({ example: 'Bank Transfer' })
  @IsOptional()
  @IsString()
  paymentMethod?: string;
}
