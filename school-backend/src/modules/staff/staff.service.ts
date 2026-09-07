import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StaffEntity } from './entities/staff.entity';
import { UserEntity } from '../auth/entities/user.entity';
import { UserRole } from '../auth/roles.enum';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto, FilterStaffDto } from './dto/update-staff.dto';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(StaffEntity)
    private readonly staffRepo: Repository<StaffEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  private normalizeStaffRole(roleInput?: string): string {
    if (!roleInput) return UserRole.TEACHER;
    const clean = roleInput.toLowerCase().trim();
    if (clean === 'principal' || clean === UserRole.PRINCIPAL) return UserRole.PRINCIPAL;
    if (clean === 'accountant' || clean === UserRole.ACCOUNTANT) return UserRole.ACCOUNTANT;
    if (clean === 'support_staff' || clean === 'support' || clean === 'support staff' || clean === 'non-teaching') return 'support_staff';
    return UserRole.TEACHER;
  }

  async findAll(filterDto?: FilterStaffDto): Promise<StaffEntity[]> {
    const query = this.staffRepo.createQueryBuilder('staff');

    if (filterDto?.search) {
      const search = `%${filterDto.search.toLowerCase()}%`;
      query.andWhere(
        '(LOWER(staff.firstName) LIKE :search OR LOWER(staff.lastName) LIKE :search OR LOWER(staff.id) LIKE :search OR LOWER(staff.role) LIKE :search OR LOWER(staff.designation) LIKE :search OR LOWER(staff.department) LIKE :search OR LOWER(staff.email) LIKE :search)',
        { search },
      );
    }

    if (filterDto?.department && filterDto.department !== 'All') {
      query.andWhere('staff.department = :department', { department: filterDto.department });
    }

    if (filterDto?.employmentType && filterDto.employmentType !== 'All') {
      query.andWhere('staff.employmentType = :employmentType', { employmentType: filterDto.employmentType });
    }

    query.orderBy('staff.id', 'ASC');
    return query.getMany();
  }

  async findOne(id: string): Promise<StaffEntity> {
    const staff = await this.staffRepo.findOne({ where: { id } });
    if (!staff) {
      throw new NotFoundException(`Staff member with ID '${id}' not found`);
    }
    return staff;
  }

  async create(createDto: CreateStaffDto): Promise<StaffEntity> {
    let staffId = createDto.id;
    if (!staffId) {
      const count = await this.staffRepo.count();
      staffId = `STF-${100 + count + 1}`;
    }

    const staffRole = this.normalizeStaffRole(createDto.role);
    const isSupportStaff = staffRole === 'support_staff';
    
    const designation = createDto.designation?.trim() || 
      (isSupportStaff ? 'Support Staff' : `${staffRole.charAt(0).toUpperCase() + staffRole.slice(1)} - ${createDto.department}`);

    const newStaff = this.staffRepo.create({
      ...createDto,
      id: staffId,
      role: staffRole,
      designation: designation,
      status: createDto.status || 'Active',
      joiningDate: createDto.joiningDate || new Date().toISOString().split('T')[0],
      salary: {
        baseSalary: createDto.salary?.baseSalary || (isSupportStaff ? 2500 : 5000),
        hra: createDto.salary?.hra || (isSupportStaff ? 500 : 1100),
        transportAllowance: createDto.salary?.transportAllowance || (isSupportStaff ? 200 : 350),
        specialAllowance: createDto.salary?.specialAllowance || (isSupportStaff ? 100 : 250),
        pfDeduction: createDto.salary?.pfDeduction || (isSupportStaff ? 150 : 320),
        taxDeduction: createDto.salary?.taxDeduction || (isSupportStaff ? 50 : 420),
        bankName: createDto.salary?.bankName || 'Chase National Bank',
        accountNumber: createDto.salary?.accountNumber || '•••• 1234',
        taxId: createDto.salary?.taxId || 'TAX-US-99000',
      },
      leaveBalance: {
        casualTotal: createDto.leaveBalance?.casualTotal || 12,
        casualUsed: createDto.leaveBalance?.casualUsed || 0,
        sickTotal: createDto.leaveBalance?.sickTotal || 10,
        sickUsed: createDto.leaveBalance?.sickUsed || 0,
        annualTotal: createDto.leaveBalance?.annualTotal || 15,
        annualUsed: createDto.leaveBalance?.annualUsed || 0,
        maternityTotal: createDto.leaveBalance?.maternityTotal || (createDto.gender === 'Female' ? 90 : 15),
        maternityUsed: createDto.leaveBalance?.maternityUsed || 0,
      },
    });

    const savedStaff = await this.staffRepo.save(newStaff);

    // Sync / Create User account for this staff member ONLY IF NOT support_staff
    if (!isSupportStaff) {
      try {
        const staffEmail = savedStaff.email.toLowerCase().trim();
        const initialPassword = createDto.password?.trim() || staffRole || 'password';
        let user = await this.userRepo.findOne({ where: { email: staffEmail } });
        if (!user) {
          user = this.userRepo.create({
            id: `USR-${savedStaff.id}`,
            email: staffEmail,
            password: initialPassword,
            name: `${savedStaff.firstName} ${savedStaff.lastName}`,
            role: staffRole as UserRole,
            title: savedStaff.designation || designation,
            department: savedStaff.department,
            staffId: savedStaff.id,
            avatar: savedStaff.avatar || '',
            isActive: true,
          });
        } else {
          user.name = `${savedStaff.firstName} ${savedStaff.lastName}`;
          user.role = staffRole as UserRole;
          user.title = savedStaff.designation || designation;
          user.department = savedStaff.department;
          user.staffId = savedStaff.id;
          user.avatar = savedStaff.avatar || user.avatar;
          if (createDto.password?.trim()) {
            user.password = createDto.password.trim();
          }
        }
        await this.userRepo.save(user);
      } catch (err) {
        console.warn('Failed to sync user account for staff:', err.message);
      }
    }

    return savedStaff;
  }

  async update(id: string, updateDto: UpdateStaffDto): Promise<StaffEntity> {
    const staff = await this.findOne(id);
    
    if (updateDto.salary) {
      staff.salary = { ...staff.salary, ...updateDto.salary };
      delete updateDto.salary;
    }

    if (updateDto.leaveBalance) {
      staff.leaveBalance = { ...staff.leaveBalance, ...updateDto.leaveBalance };
      delete updateDto.leaveBalance;
    }

    if (updateDto.role) {
      staff.role = this.normalizeStaffRole(updateDto.role);
      delete updateDto.role;
    }

    if (updateDto.designation !== undefined) {
      staff.designation = updateDto.designation;
      delete updateDto.designation;
    }

    Object.assign(staff, updateDto);
    const updatedStaff = await this.staffRepo.save(staff);

    // Sync User Entity
    try {
      const staffEmail = updatedStaff.email.toLowerCase().trim();
      let user = await this.userRepo.findOne({ where: { email: staffEmail } });
      if (!user && updatedStaff.id) {
        user = await this.userRepo.findOne({ where: { staffId: updatedStaff.id } });
      }

      if (updatedStaff.role === 'support_staff') {
        // If assigned as support_staff, remove any login account
        if (user && user.role !== UserRole.ADMIN) {
          await this.userRepo.remove(user);
        }
      } else if (user && user.role !== UserRole.ADMIN) {
        user.name = `${updatedStaff.firstName} ${updatedStaff.lastName}`;
        user.email = staffEmail;
        user.role = updatedStaff.role as UserRole;
        user.title = updatedStaff.designation || updatedStaff.role;
        user.department = updatedStaff.department;
        user.avatar = updatedStaff.avatar || user.avatar;
        await this.userRepo.save(user);
      }
    } catch (err) {
      console.warn('Failed to update user account for staff:', err.message);
    }

    return updatedStaff;
  }

  async remove(id: string): Promise<{ success: boolean; message: string }> {
    const staff = await this.findOne(id);
    await this.staffRepo.remove(staff);

    try {
      const user = await this.userRepo.findOne({ where: { staffId: id } });
      if (user && user.role !== UserRole.ADMIN) {
        await this.userRepo.remove(user);
      }
    } catch (err) {
      console.warn('Failed to cleanup user for removed staff:', err.message);
    }

    return { success: true, message: `Staff member ${staff.firstName} ${staff.lastName} removed successfully` };
  }
}
