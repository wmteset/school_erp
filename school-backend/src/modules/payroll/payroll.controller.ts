import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { PayrollService } from './payroll.service';
import { GeneratePayrollDto, UpdateStaffPayoutDto } from './dto/generate-payroll.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../auth/roles.enum';

@ApiTags('Staff Salaries & Payroll Management')
@Controller('payroll')
@UseGuards(RolesGuard)
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Get()
  @ApiOperation({ summary: 'Get all monthly payroll ledgers' })
  @ApiResponse({ status: 200, description: 'List of payroll runs' })
  async findAll() {
    return this.payrollService.findAll();
  }

  @Get('cycle')
  @ApiOperation({ summary: 'Get payroll ledger for a specific month and year' })
  @ApiQuery({ name: 'month', example: 'August', required: true })
  @ApiQuery({ name: 'year', example: 2026, required: true })
  async findByMonthAndYear(@Query('month') month: string, @Query('year') year: number) {
    return this.payrollService.findByMonthAndYear(month, Number(year) || 2026);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payroll details and all individual staff payslips by ID' })
  async findOne(@Param('id') id: string) {
    return this.payrollService.findOne(id);
  }

  @Post('generate')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
  @ApiHeader({ name: 'x-user-role', enum: UserRole, description: 'Role perspective header (admin, accountant)' })
  @ApiOperation({ summary: 'Generate monthly payroll draft for past billing cycles' })
  @ApiResponse({ status: 201, description: 'Payroll draft generated' })
  async generate(@Body() dto: GeneratePayrollDto) {
    return this.payrollService.generate(dto);
  }

  @Patch(':payrollId/staff/:staffId/payout')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
  @ApiHeader({ name: 'x-user-role', enum: UserRole, description: 'Role perspective header (admin, accountant)' })
  @ApiOperation({ summary: 'Update individual staff payment disbursement status' })
  async updateStaffPayout(
    @Param('payrollId') payrollId: string,
    @Param('staffId') staffId: string,
    @Body() dto: UpdateStaffPayoutDto,
  ) {
    return this.payrollService.updateStaffPayout(payrollId, staffId, dto);
  }

  @Post(':id/disburse-all')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
  @ApiHeader({ name: 'x-user-role', enum: UserRole, description: 'Role perspective header (admin, accountant)' })
  @ApiOperation({ summary: 'Disburse all salaries in bulk for active billing period' })
  @ApiResponse({ status: 200, description: 'All salaries marked as paid' })
  async disburseAll(@Param('id') id: string) {
    return this.payrollService.disburseAll(id);
  }
}
