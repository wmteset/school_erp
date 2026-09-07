import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like } from 'typeorm';
import { AttendanceRecordEntity } from './entities/attendance-record.entity';
import { MarkAttendanceDto, BulkAttendanceDto } from './dto/mark-attendance.dto';
import { StudentsService } from '../students/students.service';
import { StaffService } from '../staff/staff.service';

@Injectable()
export class AttendanceService {
  private readonly TODAY = '2026-09-02';

  constructor(
    @InjectRepository(AttendanceRecordEntity)
    private readonly attendanceRepo: Repository<AttendanceRecordEntity>,
    private readonly studentsService: StudentsService,
    private readonly staffService: StaffService,
  ) {}

  async getDailyAttendance(date: string) {
    const records = await this.attendanceRepo.find({ where: { date } });
    
    const studentsMap: Record<string, { status: string; note: string }> = {};
    const staffMap: Record<string, { status: string; note: string }> = {};

    records.forEach(r => {
      if (r.targetType === 'student') {
        studentsMap[r.targetId] = { status: r.status, note: r.note };
      } else {
        staffMap[r.targetId] = { status: r.status, note: r.note };
      }
    });

    return {
      date,
      isToday: date === this.TODAY,
      isPast: date < this.TODAY,
      isFuture: date > this.TODAY,
      students: studentsMap,
      staff: staffMap,
    };
  }

  async mark(dto: MarkAttendanceDto): Promise<AttendanceRecordEntity> {
    // Student attendance cannot be 'E' (Excused)
    if (dto.targetType === 'student' && dto.status === 'E') {
      throw new BadRequestException('Student roll call only permits Present (P), Late (L), or Absent (A).');
    }

    let record = await this.attendanceRepo.findOne({
      where: {
        date: dto.date,
        targetType: dto.targetType,
        targetId: dto.targetId,
      },
    });

    if (record) {
      record.status = dto.status;
      record.note = dto.note !== undefined ? dto.note : record.note;
    } else {
      record = this.attendanceRepo.create({
        date: dto.date,
        targetType: dto.targetType,
        targetId: dto.targetId,
        status: dto.status,
        note: dto.note || '',
      });
    }

    return this.attendanceRepo.save(record);
  }

  async bulkMark(dto: BulkAttendanceDto): Promise<{ success: boolean; count: number }> {
    if (dto.targetType === 'student' && dto.status === 'E') {
      throw new BadRequestException('Student roll call only permits Present (P), Late (L), or Absent (A).');
    }

    for (const targetId of dto.targetIds) {
      await this.mark({
        date: dto.date,
        targetType: dto.targetType,
        targetId,
        status: dto.status,
        note: dto.note || 'Marked in bulk',
      });
    }

    return { success: true, count: dto.targetIds.length };
  }

  async getMonthlyMatrix(year: number, month: number, targetType: 'student' | 'staff') {
    const monthStr = String(month).padStart(2, '0');
    const totalDays = new Date(year, month, 0).getDate();
    const startDate = `${year}-${monthStr}-01`;
    const endDate = `${year}-${monthStr}-${String(totalDays).padStart(2, '0')}`;

    const records = await this.attendanceRepo.find({
      where: {
        targetType,
        date: Between(startDate, endDate),
      },
    });

    const items = targetType === 'student'
      ? await this.studentsService.findAll()
      : await this.staffService.findAll();

    const days = Array.from({ length: totalDays }, (_, i) => {
      const dayNum = i + 1;
      const dayStr = String(dayNum).padStart(2, '0');
      const fullDate = `${year}-${monthStr}-${dayStr}`;
      return {
        dayNum,
        dayStr,
        fullDate,
        isToday: fullDate === this.TODAY,
        isFuture: fullDate > this.TODAY,
      };
    });

    // Build matrix
    const matrix = items.map(item => {
      const itemRecords: Record<string, string> = {};
      let presentDays = 0;
      let pastDaysCount = 0;

      days.forEach(d => {
        if (!d.isFuture) {
          pastDaysCount++;
          const found = records.find(r => r.date === d.fullDate && r.targetId === item.id);
          const st = found ? found.status : 'P';
          itemRecords[d.dayStr] = st;
          if (st === 'P' || st === 'L' || (targetType === 'staff' && st === 'E')) {
            presentDays++;
          }
        } else {
          itemRecords[d.dayStr] = '—';
        }
      });

      const turnoutRate = pastDaysCount > 0 ? Math.round((presentDays / pastDaysCount) * 100) : 100;

      return {
        id: item.id,
        name: `${item.firstName} ${item.lastName}`,
        records: itemRecords,
        turnoutRate,
      };
    });

    return {
      year,
      month,
      days,
      targetType,
      matrix,
    };
  }
}
