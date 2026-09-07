import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class UpdateSchoolInfoDto {
  @ApiPropertyOptional({ example: 'Oakridge International Academy' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Excellence in Education & Character Building' })
  @IsOptional()
  @IsString()
  tagline?: string;

  @ApiPropertyOptional({ example: 'CBSE & IB World School #04291' })
  @IsOptional()
  @IsString()
  headerSubtitle?: string;

  @ApiPropertyOptional({ example: 'CBSE & IB World School #04291' })
  @IsOptional()
  @IsString()
  affiliation?: string;

  @ApiPropertyOptional({ example: 'data:image/png;base64,...' })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiPropertyOptional({ example: 1998 })
  @IsOptional()
  @IsNumber()
  established?: number;

  @ApiPropertyOptional({ example: 'contact@oakridge-academy.edu' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ example: '+1 (555) 234-5678' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: '742 Evergreen Academic Blvd, Education City, CA 90210' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'www.oakridge-academy.edu' })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional({ example: '$' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: '2026-2027' })
  @IsOptional()
  @IsString()
  academicYear?: string;

  @ApiPropertyOptional({ example: 'Dr. Arthur Pendelton, Ph.D.' })
  @IsOptional()
  @IsString()
  principal?: string;

  @ApiPropertyOptional({ example: 'indigo' })
  @IsOptional()
  @IsString()
  themeColor?: string;
}
