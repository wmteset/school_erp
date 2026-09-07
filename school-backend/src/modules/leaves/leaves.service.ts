import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaveRequestEntity } from './entities/leave-request.entity';
import { CreateLeaveDto, ReviewLeaveDto } from './dto/create-leave.dto';
import { StaffService } from '../staff/staff.service';
import { AttendanceService } from '../attendance/attendance.service';

@Injectable()
export class LeavesService {
  constructor(
    @InjectRepository(LeaveRequestEntity)
    private readonly leaveRepo: Repository<LeaveRequestEntity>,
    private readonly staffService: StaffService,
    private readonly attendanceService: AttendanceService,
  ) {}

  async findAll(status?: string): Promise<LeaveRequestEntity[]> {
    if (status && status !== 'All') {
      return this.leaveRepo.find({ where: { status }, order: { createdAt: 'DESC' } });
    }
    return this.leaveRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<LeaveRequestEntity> {
    const leave = await this.leaveRepo.findOne({ where: { id } });
    if (!leave) {
      throw new NotFoundException(`Leave request with ID '${id}' not found`);
    }
    return leave;
  }

  async apply(createDto: CreateLeaveDto): Promise<LeaveRequestEntity> {
    const staff = await this.staffService.findOne(createDto.staffId);
    
    let leaveId = createDto.id;
    if (!leaveId) {
      const count = await this.leaveRepo.count();
      leaveId = `LV-2026-${String(count + 85).padStart(3, '0')}`;
    }

    const newLeave = this.leaveRepo.create({
      ...createDto,
      id: leaveId,
      staffName: `${staff.firstName} ${staff.lastName}`,
      department: staff.department,
      status: 'Pending',
      appliedDate: new Date().toISOString().split('T')[0],
      reviewedBy: null,
      reviewRemarks: null,
    });

    return this.leaveRepo.save(newLeave);
  }

  async review(id: string, reviewDto: ReviewLeaveDto): Promise<LeaveRequestEntity> {
    const leave = await this.findOne(id);
    if (leave.status !== 'Pending') {
      throw new BadRequestException(`Leave request '${id}' has already been evaluated as '${leave.status}'`);
    }

    leave.status = reviewDto.status;
    leave.reviewedBy = reviewDto.reviewedBy || 'Dr. Arthur Pendelton';
    leave.reviewRemarks = reviewDto.reviewRemarks || (reviewDto.status === 'Approved' ? 'Approved by Administration' : 'Declined as per policy');

    const updated = await this.leaveRepo.save(leave);

    // If approved, update staff's leave quota balance and sync attendance as 'E'
    if (reviewDto.status === 'Approved') {
      const staff = await this.staffService.findOne(leave.staffId);
      const balances = { ...staff.leaveBalance };

      if (leave.leaveType.includes('Casual')) {
        balances.casualUsed = (balances.casualUsed || 0) + leave.daysCount;
      } else if (leave.leaveType.includes('Sick')) {
        balances.sickUsed = (balances.sickUsed || 0) + leave.daysCount;
      } else if (leave.leaveType.includes('Annual')) {
        balances.annualUsed = (balances.annualUsed || 0) + leave.daysCount;
      }

      await this.staffService.update(leave.staffId, { leaveBalance: balances });

      // Sync attendance
      await this.attendanceService.mark({
        date: leave.startDate,
        targetType: 'staff',
        targetId: leave.staffId,
        status: 'E',
        note: `Approved ${leave.leaveType}: "${leave.reason}"`,
      });
    }

    return updated;
  }
}
