import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaveRequestEntity } from './entities/leave-request.entity';
import { LeavesService } from './leaves.service';
import { LeavesController } from './leaves.controller';
import { StaffModule } from '../staff/staff.module';
import { AttendanceModule } from '../attendance/attendance.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LeaveRequestEntity]),
    StaffModule,
    AttendanceModule,
  ],
  controllers: [LeavesController],
  providers: [LeavesService],
  exports: [LeavesService],
})
export class LeavesModule {}
