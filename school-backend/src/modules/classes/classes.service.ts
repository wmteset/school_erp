import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassEntity } from './entities/class.entity';
import { CreateClassDto } from './dto/create-class.dto';

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(ClassEntity)
    private readonly classRepo: Repository<ClassEntity>,
  ) {}

  async findAll(): Promise<ClassEntity[]> {
    return this.classRepo.find({ order: { grade: 'ASC', section: 'ASC' } });
  }

  async findOne(id: string): Promise<ClassEntity> {
    const cls = await this.classRepo.findOne({ where: { id } });
    if (!cls) {
      throw new NotFoundException(`Class division with ID '${id}' not found`);
    }
    return cls;
  }

  async create(createDto: CreateClassDto): Promise<ClassEntity> {
    let classId = createDto.id;
    if (!classId) {
      classId = `CLS-${createDto.grade.replace(/\s+/g, '')}${createDto.section}`;
    }

    const newClass = this.classRepo.create({
      ...createDto,
      id: classId,
      totalStudents: 0,
    });

    return this.classRepo.save(newClass);
  }

  async update(id: string, updateDto: Partial<CreateClassDto>): Promise<ClassEntity> {
    const cls = await this.findOne(id);
    Object.assign(cls, updateDto);
    return this.classRepo.save(cls);
  }
}
