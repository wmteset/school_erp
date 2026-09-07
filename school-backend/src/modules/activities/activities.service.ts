import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityEntity } from './entities/activity.entity';
import { CreateActivityDto, EnrollStudentActivityDto, AddAchievementDto } from './dto/create-activity.dto';
import { StudentsService } from '../students/students.service';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(ActivityEntity)
    private readonly activityRepo: Repository<ActivityEntity>,
    private readonly studentsService: StudentsService,
  ) {}

  async findAll(category?: string): Promise<ActivityEntity[]> {
    if (category && category !== 'All') {
      return this.activityRepo.find({ where: { category } });
    }
    return this.activityRepo.find();
  }

  async findOne(id: string): Promise<ActivityEntity> {
    const act = await this.activityRepo.findOne({ where: { id } });
    if (!act) {
      throw new NotFoundException(`Activity program with ID '${id}' not found`);
    }
    return act;
  }

  async create(createDto: CreateActivityDto): Promise<ActivityEntity> {
    let actId = createDto.id;
    if (!actId) {
      const count = await this.activityRepo.count();
      actId = `ACT-${String(count + 1).padStart(2, '0')}`;
    }

    const newAct = this.activityRepo.create({
      ...createDto,
      id: actId,
      enrolledStudents: [],
      achievements: [],
    });

    return this.activityRepo.save(newAct);
  }

  async enrollStudent(activityId: string, dto: EnrollStudentActivityDto): Promise<ActivityEntity> {
    const act = await this.findOne(activityId);
    const student = await this.studentsService.findOne(dto.studentId);

    const alreadyEnrolled = act.enrolledStudents.some(item => item.studentId === student.id);
    if (!alreadyEnrolled) {
      act.enrolledStudents.push({
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        role: dto.role || 'Member',
      });
      await this.activityRepo.save(act);

      // Update student profile
      const studentActivities = student.activities || [];
      if (!studentActivities.includes(act.name)) {
        studentActivities.push(act.name);
        await this.studentsService.update(student.id, { activities: studentActivities });
      }
    }

    return act;
  }

  async removeStudent(activityId: string, studentId: string): Promise<ActivityEntity> {
    const act = await this.findOne(activityId);
    act.enrolledStudents = act.enrolledStudents.filter(item => item.studentId !== studentId);
    await this.activityRepo.save(act);

    // Update student
    try {
      const student = await this.studentsService.findOne(studentId);
      if (student.activities) {
        student.activities = student.activities.filter(a => a !== act.name);
        await this.studentsService.update(studentId, { activities: student.activities });
      }
    } catch {}

    return act;
  }

  async addAchievement(activityId: string, dto: AddAchievementDto): Promise<ActivityEntity> {
    const act = await this.findOne(activityId);
    act.achievements.unshift(dto);
    return this.activityRepo.save(act);
  }
}
