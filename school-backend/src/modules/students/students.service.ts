import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { StudentEntity } from './entities/student.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { FilterStudentDto } from './dto/filter-student.dto';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(StudentEntity)
    private readonly studentRepo: Repository<StudentEntity>,
  ) {}

  async findAll(filterDto?: FilterStudentDto): Promise<StudentEntity[]> {
    const query = this.studentRepo.createQueryBuilder('student');

    if (filterDto?.search) {
      const search = `%${filterDto.search.toLowerCase()}%`;
      query.andWhere(
        '(LOWER(student.firstName) LIKE :search OR LOWER(student.lastName) LIKE :search OR LOWER(student.id) LIKE :search OR LOWER(student.rollNumber) LIKE :search OR LOWER(student.guardianName) LIKE :search)',
        { search },
      );
    }

    if (filterDto?.grade && filterDto.grade !== 'All') {
      query.andWhere('student.grade = :grade', { grade: filterDto.grade });
    }

    if (filterDto?.section && filterDto.section !== 'All') {
      query.andWhere('student.section = :section', { section: filterDto.section });
    }

    if (filterDto?.status && filterDto.status !== 'All') {
      query.andWhere('student.status = :status', { status: filterDto.status });
    }

    query.orderBy('student.id', 'ASC');
    return query.getMany();
  }

  async getNextRollNumber(): Promise<{ nextRollNumber: string }> {
    const students = await this.studentRepo.find({ select: ['rollNumber'] });
    if (!students || students.length === 0) {
      return { nextRollNumber: '101' };
    }
    const numericRolls = students
      .map(s => parseInt(s.rollNumber, 10))
      .filter(num => !isNaN(num) && num > 0);
    const maxRoll = numericRolls.length > 0 ? Math.max(...numericRolls) : 100;
    return { nextRollNumber: String(maxRoll + 1) };
  }

  async findOne(id: string): Promise<StudentEntity> {
    const student = await this.studentRepo.findOne({ where: { id } });
    if (!student) {
      throw new NotFoundException(`Student with ID '${id}' not found`);
    }
    return student;
  }

  async create(createDto: CreateStudentDto): Promise<StudentEntity> {
    let studentId = createDto.id;
    if (!studentId) {
      const count = await this.studentRepo.count();
      studentId = `STU-2026-${String(count + 1).padStart(3, '0')}`;
    }

    let rollNumber = createDto.rollNumber;
    if (!rollNumber || !rollNumber.trim()) {
      const nextRollData = await this.getNextRollNumber();
      rollNumber = nextRollData.nextRollNumber;
    }

    const newStudent = this.studentRepo.create({
      ...createDto,
      id: studentId,
      rollNumber,
      status: createDto.status || 'Active',
      admissionDate: createDto.admissionDate || new Date().toISOString().split('T')[0],
      activities: createDto.activities || [],
      awards: createDto.awards || [],
    });

    return this.studentRepo.save(newStudent);
  }

  async update(id: string, updateDto: UpdateStudentDto): Promise<StudentEntity> {
    const student = await this.findOne(id);
    Object.assign(student, updateDto);
    return this.studentRepo.save(student);
  }

  async remove(id: string): Promise<{ success: boolean; message: string }> {
    const student = await this.findOne(id);
    await this.studentRepo.remove(student);
    return { success: true, message: `Student ${student.firstName} ${student.lastName} removed successfully` };
  }
}
