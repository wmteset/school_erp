import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MonthlyPayrollEntity, StaffPayrollRecordEntity } from './entities/monthly-payroll.entity';
import { GeneratePayrollDto, UpdateStaffPayoutDto } from './dto/generate-payroll.dto';
import { StaffService } from '../staff/staff.service';

@Injectable()
export class PayrollService {
  private readonly CURRENT_ACTIVE_MONTH = 'September';
  private readonly CURRENT_ACTIVE_YEAR = 2026;

  constructor(
    @InjectRepository(MonthlyPayrollEntity)
    private readonly payrollRepo: Repository<MonthlyPayrollEntity>,
    @InjectRepository(StaffPayrollRecordEntity)
    private readonly itemRepo: Repository<StaffPayrollRecordEntity>,
    private readonly staffService: StaffService,
  ) {}

  async findAll(): Promise<MonthlyPayrollEntity[]> {
    return this.payrollRepo.find({ order: { year: 'DESC', createdAt: 'DESC' } });
  }

  async findByMonthAndYear(month: string, year: number): Promise<MonthlyPayrollEntity | null> {
    return this.payrollRepo.findOne({ where: { month, year } });
  }

  async findOne(id: string): Promise<MonthlyPayrollEntity> {
    const payroll = await this.payrollRepo.findOne({ where: { id } });
    if (!payroll) {
      throw new NotFoundException(`Payroll record with ID '${id}' not found`);
    }
    return payroll;
  }

  async generate(dto: GeneratePayrollDto): Promise<MonthlyPayrollEntity> {
    const monthNumMap: Record<string, number> = {
      'January': 1, 'February': 2, 'March': 3, 'April': 4,
      'May': 5, 'June': 6, 'July': 7, 'August': 8,
      'September': 9, 'October': 10, 'November': 11, 'December': 12
    };

    const targetMonthNum = monthNumMap[dto.month] || 9;
    const currentMonthNum = monthNumMap[this.CURRENT_ACTIVE_MONTH] || 9;

    const isPast = dto.year < this.CURRENT_ACTIVE_YEAR || (dto.year === this.CURRENT_ACTIVE_YEAR && targetMonthNum < currentMonthNum);

    // Business Rule: Generate payroll is only for past months if not already generated
    if (!isPast) {
      throw new BadRequestException(
        `Payroll generation is locked for ${dto.month} ${dto.year}. Generation is only permitted for completed past billing cycles.`
      );
    }

    const existing = await this.findByMonthAndYear(dto.month, dto.year);
    if (existing) {
      throw new BadRequestException(`Payroll for ${dto.month} ${dto.year} has already been generated (ID: ${existing.id}).`);
    }

    const staffList = await this.staffService.findAll();
    const payrollId = `PAY-${dto.year}-${dto.month.substring(0, 3).toUpperCase()}`;

    const staffRecords: StaffPayrollRecordEntity[] = staffList.map(st => {
      const base = st.salary?.baseSalary || 4500;
      const hra = st.salary?.hra || 1000;
      const trans = st.salary?.transportAllowance || 350;
      const spec = st.salary?.specialAllowance || 250;
      const bonus = 0;
      const gross = base + hra + trans + spec + bonus;

      const pf = st.salary?.pfDeduction || 300;
      const tax = st.salary?.taxDeduction || 400;
      const unpaid = 0;
      const totalDed = pf + tax + unpaid;
      const net = gross - totalDed;

      const item = this.itemRepo.create({
        payrollId,
        staffId: st.id,
        staffName: `${st.firstName} ${st.lastName}`,
        role: st.role,
        department: st.department,
        baseSalary: base,
        hra,
        transportAllowance: trans,
        specialAllowance: spec,
        bonus,
        grossEarnings: gross,
        pfDeduction: pf,
        taxDeduction: tax,
        unpaidLeaveDeduction: unpaid,
        totalDeductions: totalDed,
        netSalary: net,
        paymentStatus: 'Pending',
        paymentMethod: 'Bank Transfer',
        transactionRef: `TXN-ACH-${Math.floor(1000000 + Math.random() * 9000000)}`,
        paidDate: null,
      });

      return item;
    });

    const newPayroll = this.payrollRepo.create({
      id: payrollId,
      month: dto.month,
      year: dto.year,
      disbursementDate: `${dto.year}-${String(targetMonthNum).padStart(2, '0')}-28`,
      status: 'Draft',
      staffRecords,
    });

    return this.payrollRepo.save(newPayroll);
  }

  async updateStaffPayout(payrollId: string, staffId: string, dto: UpdateStaffPayoutDto) {
    const item = await this.itemRepo.findOne({ where: { payrollId, staffId } });
    if (!item) {
      throw new NotFoundException(`Staff record '${staffId}' in payroll '${payrollId}' not found`);
    }

    item.paymentStatus = dto.paymentStatus;
    if (dto.paymentMethod) item.paymentMethod = dto.paymentMethod;
    if (dto.paymentStatus === 'Paid') {
      item.paidDate = new Date().toISOString().split('T')[0];
    } else {
      item.paidDate = null;
    }

    await this.itemRepo.save(item);

    // Update parent status
    const allItems = await this.itemRepo.find({ where: { payrollId } });
    const allPaid = allItems.every(i => i.paymentStatus === 'Paid');
    const anyPaid = allItems.some(i => i.paymentStatus === 'Paid');

    const parent = await this.findOne(payrollId);
    parent.status = allPaid ? 'Paid' : anyPaid ? 'Processing' : 'Draft';
    await this.payrollRepo.save(parent);

    return item;
  }

  async disburseAll(payrollId: string): Promise<MonthlyPayrollEntity> {
    const payroll = await this.findOne(payrollId);
    const todayStr = new Date().toISOString().split('T')[0];

    // Business rule: disburse all applies to active billing run
    for (const item of payroll.staffRecords) {
      item.paymentStatus = 'Paid';
      item.paidDate = todayStr;
      await this.itemRepo.save(item);
    }

    payroll.status = 'Paid';
    payroll.disbursementDate = todayStr;
    return this.payrollRepo.save(payroll);
  }
}
