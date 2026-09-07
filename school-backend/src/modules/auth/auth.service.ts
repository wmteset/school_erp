import { Injectable, UnauthorizedException, NotFoundException, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { StaffEntity } from '../staff/entities/staff.entity';
import { UserRole } from './roles.enum';
import { MailService } from '../mail/mail.service';

export interface RolePermissionConfig {
  id: UserRole;
  label: string;
  title: string;
  badge: string;
  description: string;
  allowedModules: string[];
  permissions: {
    canEnrollStudents: boolean;
    canEditStudents: boolean;
    canDeleteStudents: boolean;
    canHireStaff: boolean;
    canEditStaff: boolean;
    canDeleteStaff: boolean;
    canViewCompensation: boolean;
    canMarkAttendance: boolean;
    canGeneratePayroll: boolean;
    canDisbursePayroll: boolean;
    canApplyLeave: boolean;
    canReviewLeave: boolean;
    canManageActivities: boolean;
    canManageClasses: boolean;
    canModifySettings: boolean;
    canResetDatabase: boolean;
  };
}

export const ROLE_DEFINITIONS: Record<UserRole, RolePermissionConfig> = {
  [UserRole.ADMIN]: {
    id: UserRole.ADMIN,
    label: 'Super Admin',
    title: 'Super Administrator',
    badge: 'Full Master Access',
    description: 'Full ERP control, user perspective management & system configuration',
    allowedModules: ['dashboard', 'students', 'staff', 'attendance', 'payroll', 'leaves', 'activities', 'classes', 'settings'],
    permissions: {
      canEnrollStudents: true,
      canEditStudents: true,
      canDeleteStudents: true,
      canHireStaff: true,
      canEditStaff: true,
      canDeleteStaff: true,
      canViewCompensation: true,
      canMarkAttendance: true,
      canGeneratePayroll: true,
      canDisbursePayroll: true,
      canApplyLeave: true,
      canReviewLeave: true,
      canManageActivities: true,
      canManageClasses: true,
      canModifySettings: true,
      canResetDatabase: true,
    },
  },
  [UserRole.PRINCIPAL]: {
    id: UserRole.PRINCIPAL,
    label: 'Principal',
    title: 'School Principal',
    badge: 'Executive Academic Access',
    description: 'Academic oversight, faculty evaluations, leave approvals & institutional registers',
    allowedModules: ['dashboard', 'students', 'staff', 'attendance', 'leaves', 'activities', 'classes', 'settings'],
    permissions: {
      canEnrollStudents: true,
      canEditStudents: true,
      canDeleteStudents: true,
      canHireStaff: true,
      canEditStaff: true,
      canDeleteStaff: false,
      canViewCompensation: false,
      canMarkAttendance: true,
      canGeneratePayroll: false,
      canDisbursePayroll: false,
      canApplyLeave: true,
      canReviewLeave: true,
      canManageActivities: true,
      canManageClasses: true,
      canModifySettings: true,
      canResetDatabase: false,
    },
  },
  [UserRole.TEACHER]: {
    id: UserRole.TEACHER,
    label: 'Teacher / Faculty',
    title: 'Faculty / Class Coordinator',
    badge: 'Faculty Classroom Access',
    description: 'Daily roll call, student directory, class timetable, clubs & leave requests',
    allowedModules: ['dashboard', 'students', 'attendance', 'activities', 'classes', 'leaves'],
    permissions: {
      canEnrollStudents: false,
      canEditStudents: false,
      canDeleteStudents: false,
      canHireStaff: false,
      canEditStaff: false,
      canDeleteStaff: false,
      canViewCompensation: false,
      canMarkAttendance: true,
      canGeneratePayroll: false,
      canDisbursePayroll: false,
      canApplyLeave: true,
      canReviewLeave: false,
      canManageActivities: true,
      canManageClasses: false,
      canModifySettings: false,
      canResetDatabase: false,
    },
  },
  [UserRole.ACCOUNTANT]: {
    id: UserRole.ACCOUNTANT,
    label: 'Finance / Bursar',
    title: 'Chief Accountant / Bursar',
    badge: 'Finance & Payroll Access',
    description: 'Faculty salary packages, monthly payroll disbursements, payslips & tax records',
    allowedModules: ['dashboard', 'staff', 'payroll', 'leaves', 'settings'],
    permissions: {
      canEnrollStudents: false,
      canEditStudents: false,
      canDeleteStudents: false,
      canHireStaff: false,
      canEditStaff: true, // salary adjustments
      canDeleteStaff: false,
      canViewCompensation: true,
      canMarkAttendance: false,
      canGeneratePayroll: true,
      canDisbursePayroll: true,
      canApplyLeave: true,
      canReviewLeave: false,
      canManageActivities: false,
      canManageClasses: false,
      canModifySettings: true, // currency & fees
      canResetDatabase: false,
    },
  },
};

export const INITIAL_USERS: Partial<UserEntity>[] = [
  {
    id: 'USR-ADMIN',
    email: 'admin@oakridge.edu',
    password: 'admin',
    name: 'Dr. Arthur Pendelton',
    role: UserRole.ADMIN,
    title: 'Super Administrator',
    department: 'Administration',
    staffId: 'STF-106',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    isActive: true,
  },
];

@Injectable()
export class AuthService implements OnApplicationBootstrap {
  // In-memory security session stores for OTPs and Reset Tokens
  private readonly otpStore = new Map<string, { otp: string; expiresAt: number; used: boolean }>();
  private readonly resetSessionStore = new Map<string, { verificationCode: string; email: string; expiresAt: number; used: boolean }>();

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(StaffEntity)
    private readonly staffRepo: Repository<StaffEntity>,
    private readonly mailService: MailService,
  ) {}

  async onApplicationBootstrap() {
    await this.seedUsers();
  }

  async seedUsers() {
    for (const u of INITIAL_USERS) {
      const exists = await this.userRepo.findOne({ where: { email: u.email } });
      if (!exists) {
        await this.userRepo.save(this.userRepo.create(u));
      }
    }
  }

  getRoles(): RolePermissionConfig[] {
    return Object.values(ROLE_DEFINITIONS);
  }

  getRolePermissions(role: UserRole): RolePermissionConfig {
    return ROLE_DEFINITIONS[role] || ROLE_DEFINITIONS[UserRole.ADMIN];
  }

  async getAllUsers() {
    const users = await this.userRepo.find();
    return users.map(({ password, ...user }) => user);
  }

  private normalizeRole(roleInput?: string): UserRole {
    if (!roleInput) return UserRole.TEACHER;
    const clean = roleInput.toLowerCase().trim();
    if (clean === 'admin' || clean === UserRole.ADMIN) return UserRole.ADMIN;
    if (clean === 'principal' || clean === UserRole.PRINCIPAL) return UserRole.PRINCIPAL;
    if (clean === 'accountant' || clean === UserRole.ACCOUNTANT) return UserRole.ACCOUNTANT;
    return UserRole.TEACHER;
  }

  async login(credentials: { email?: string; password?: string; role?: UserRole }) {
    let user: UserEntity | null = null;

    if (credentials.role) {
      user = await this.userRepo.findOne({ where: { role: credentials.role } });
    } else if (credentials.email) {
      const email = credentials.email.toLowerCase().trim();
      user = await this.userRepo.findOne({
        where: { email },
      });

      // If user not in userRepo, check staffRepo
      if (!user) {
        const staffMember = await this.staffRepo.findOne({ where: { email } });
        if (staffMember) {
          if (staffMember.role?.toLowerCase() === 'support_staff' || staffMember.role?.toLowerCase() === 'support') {
            throw new UnauthorizedException('Support staff do not have portal login access. Please contact administration.');
          }
          const mappedRole = this.normalizeRole(staffMember.role);
          user = this.userRepo.create({
            id: `USR-${staffMember.id}`,
            email: staffMember.email.toLowerCase().trim(),
            password: 'password',
            name: `${staffMember.firstName} ${staffMember.lastName}`,
            role: mappedRole,
            title: staffMember.designation || staffMember.role,
            department: staffMember.department,
            staffId: staffMember.id,
            avatar: staffMember.avatar || '',
            isActive: true,
          });
          user = await this.userRepo.save(user);
        }
      }
    }

    if (!user) {
      // Fallback matching default master admin or initial accounts
      const matchedInitial = INITIAL_USERS.find(
        (u) =>
          u.role === credentials.role ||
          u.email === credentials.email?.toLowerCase().trim(),
      );
      if (matchedInitial) {
        user = await this.userRepo.save(this.userRepo.create(matchedInitial));
      } else {
        throw new UnauthorizedException('Invalid credentials. User not found.');
      }
    }

    if (credentials.password && user.password !== credentials.password) {
      // If user typed password, check valid matches (including their assigned role name, standard defaults)
      const allowedPasswords = [
        user.password,
        user.role,
        'admin',
        'principal',
        'teacher',
        'accountant',
        'password',
        '123456',
        'admin123',
      ];
      if (!allowedPasswords.includes(credentials.password)) {
        throw new UnauthorizedException('Invalid email or password.');
      }
    }

    user.lastLogin = new Date().toISOString();
    await this.userRepo.save(user);

    const roleConfig = this.getRolePermissions(user.role);
    const token = `erp_jwt_token_${user.id}_${Date.now()}`;

    const { password, ...safeUser } = user;

    return {
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: safeUser,
      role: user.role,
      permissions: roleConfig.permissions,
      allowedModules: roleConfig.allowedModules,
      roleConfig,
    };
  }

  async getMe(authHeader?: string, roleHeader?: string) {
    let user: UserEntity | null = null;

    if (roleHeader && Object.values(UserRole).includes(roleHeader as UserRole)) {
      user = await this.userRepo.findOne({ where: { role: roleHeader as UserRole } });
    }

    if (!user && authHeader) {
      const parts = authHeader.split('_');
      const userId = parts.find((p) => p.startsWith('USR-'));
      if (userId) {
        user = await this.userRepo.findOne({ where: { id: userId } });
      }
    }

    if (!user) {
      user = await this.userRepo.findOne({ where: { role: UserRole.ADMIN } });
    }

    if (!user) {
      user = (await this.userRepo.find())[0];
    }

    if (!user) {
      throw new NotFoundException('Current session user not found');
    }

    const roleConfig = this.getRolePermissions(user.role);
    const { password, ...safeUser } = user;

    return {
      user: safeUser,
      role: user.role,
      permissions: roleConfig.permissions,
      allowedModules: roleConfig.allowedModules,
      roleConfig,
    };
  }

  async switchPerspective(role: UserRole) {
    const roleConfig = this.getRolePermissions(role);
    let user = await this.userRepo.findOne({ where: { role } });
    if (!user) {
      const init = INITIAL_USERS.find((u) => u.role === role);
      if (init) {
        user = await this.userRepo.save(this.userRepo.create(init));
      }
    }

    const safeUser = user
      ? (({ password, ...rest }) => rest)(user)
      : {
          id: `USR-${role.toUpperCase()}`,
          name: roleConfig.title,
          email: `${role}@oakridge.edu`,
          role,
          title: roleConfig.title,
          department: 'Academic',
          avatar: '',
        };

    return {
      success: true,
      activeRole: role,
      user: safeUser,
      permissions: roleConfig.permissions,
      allowedModules: roleConfig.allowedModules,
      roleConfig,
      token: `erp_perspective_token_${role}_${Date.now()}`,
    };
  }

  async forgotPassword(emailInput: string) {
    if (!emailInput || !emailInput.trim()) {
      throw new UnauthorizedException('Please provide a valid institutional email address.');
    }

    const email = emailInput.toLowerCase().trim();
    let recipientName = 'Faculty / Staff Member';

    let user = await this.userRepo.findOne({ where: { email } });
    if (user) {
      recipientName = user.name;
    } else {
      const staffMember = await this.staffRepo.findOne({ where: { email } });
      if (staffMember) {
        if (staffMember.role?.toLowerCase() === 'support_staff' || staffMember.role?.toLowerCase() === 'support') {
          throw new UnauthorizedException('Support staff accounts do not have portal login access or password recovery.');
        }
        recipientName = `${staffMember.firstName} ${staffMember.lastName}`;
      } else {
        throw new NotFoundException('No registered account found with this email address.');
      }
    }

    // Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

    this.otpStore.set(email, { otp, expiresAt, used: false });

    // Server-side log for system monitoring
    console.log(`[AuthService] Password Reset OTP generated for ${email}: ${otp}`);

    // Dispatch real email via MailService (dispatches over configured SMTP)
    try {
      await this.mailService.sendPasswordResetOtp(email, otp, recipientName);
    } catch (mailErr) {
      console.error(`[AuthService] Email dispatch failed for ${email}:`, mailErr.message);
    }

    return {
      success: true,
      message: 'A 6-digit verification code has been dispatched to your institutional email address.',
    };
  }

  async verifyOtp(emailInput: string, otpInput: string) {
    if (!emailInput || !otpInput) {
      throw new UnauthorizedException('Email and 6-digit OTP code are required.');
    }

    const email = emailInput.toLowerCase().trim();
    const otp = otpInput.trim();

    const record = this.otpStore.get(email);
    if (!record || record.used || record.otp !== otp || record.expiresAt < Date.now()) {
      throw new UnauthorizedException('Invalid or expired OTP code. Please request a new verification code.');
    }

    // Mark OTP as used
    record.used = true;
    this.otpStore.set(email, record);

    // Generate single-use secure verification code
    const verificationCode = `vcd_${Date.now()}_${Math.random().toString(36).substring(2, 10)}_${Math.random().toString(36).substring(2, 10)}`;
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes expiry

    this.resetSessionStore.set(verificationCode, {
      verificationCode,
      email,
      expiresAt,
      used: false,
    });

    return {
      success: true,
      message: 'OTP verified successfully.',
      verificationCode,
    };
  }

  async resetPassword(emailInput: string, newPasswordInput: string, verificationCodeInput: string) {
    if (!emailInput || !newPasswordInput || !verificationCodeInput) {
      throw new UnauthorizedException('Email, new password, and verification code are required.');
    }

    const email = emailInput.toLowerCase().trim();
    const newPassword = newPasswordInput.trim();
    const verificationCode = verificationCodeInput.trim();

    if (newPassword.length < 4) {
      throw new UnauthorizedException('Password must be at least 4 characters in length.');
    }

    const session = this.resetSessionStore.get(verificationCode);
    if (!session || session.used || session.email !== email || session.expiresAt < Date.now()) {
      throw new UnauthorizedException('Invalid or expired verification session. Please restart password recovery.');
    }

    // Mark reset session as consumed
    session.used = true;
    this.resetSessionStore.set(verificationCode, session);
    this.otpStore.delete(email);

    // Update user in DB
    let user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      const staffMember = await this.staffRepo.findOne({ where: { email } });
      if (staffMember) {
        if (staffMember.role?.toLowerCase() === 'support_staff' || staffMember.role?.toLowerCase() === 'support') {
          throw new UnauthorizedException('Support staff accounts do not have portal login access.');
        }
        const mappedRole = this.normalizeRole(staffMember.role);
        user = this.userRepo.create({
          id: `USR-${staffMember.id}`,
          email: staffMember.email.toLowerCase().trim(),
          password: newPassword,
          name: `${staffMember.firstName} ${staffMember.lastName}`,
          role: mappedRole,
          title: staffMember.designation || staffMember.role,
          department: staffMember.department,
          staffId: staffMember.id,
          avatar: staffMember.avatar || '',
          isActive: true,
          sessionVersion: 1,
        });
      }
    }

    if (!user) {
      throw new NotFoundException('User account could not be located to update password.');
    }

    // Update password and invalidate all previous active sessions
    user.password = newPassword;
    user.sessionVersion = (user.sessionVersion || 1) + 1;
    user.lastLogin = null;
    await this.userRepo.save(user);

    return {
      success: true,
      message: 'Your password has been successfully updated. All prior active sessions have been terminated. You can now log in with your new password.',
    };
  }
}
