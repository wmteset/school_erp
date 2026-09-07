import { Controller, Get, Post, Body, Param, Headers, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiHeader } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { UserRole } from './roles.enum';

@ApiTags('Authentication & Role Perspectives')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('roles')
  @ApiOperation({ summary: 'Get all user roles, badges, descriptions & module permission matrices' })
  async getRoles() {
    return this.authService.getRoles();
  }

  @Get('roles/:role')
  @ApiOperation({ summary: 'Get specific role permissions matrix' })
  async getRolePermissions(@Param('role') role: UserRole) {
    return this.authService.getRolePermissions(role);
  }

  @Get('users')
  @ApiOperation({ summary: 'Get demo system accounts for quick login' })
  async getUsers() {
    return this.authService.getAllUsers();
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate user with email & password or role quick-login' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'admin@oakridge.edu' },
        password: { type: 'string', example: 'admin123' },
        role: { type: 'string', enum: Object.values(UserRole), example: 'admin' },
      },
    },
  })
  async login(@Body() body: { email?: string; password?: string; role?: UserRole }) {
    return this.authService.login(body);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current authenticated user session & RBAC permissions' })
  @ApiHeader({ name: 'x-user-role', required: false, description: 'Active role perspective header' })
  @ApiHeader({ name: 'authorization', required: false, description: 'Bearer access token' })
  async getMe(
    @Headers('authorization') authHeader?: string,
    @Headers('x-user-role') roleHeader?: string,
  ) {
    return this.authService.getMe(authHeader, roleHeader);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign out and clear server-side session' })
  async logout() {
    return { success: true, message: 'Logged out successfully.' };
  }

  @Post('switch-role')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Switch active user perspective (Admin, Principal, Teacher, Accountant)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        role: { type: 'string', enum: Object.values(UserRole), example: 'principal' },
      },
    },
  })
  async switchPerspective(@Body('role') role: UserRole) {
    return this.authService.switchPerspective(role || UserRole.ADMIN);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Step 1: Request OTP code sent to institutional email' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email'],
      properties: {
        email: { type: 'string', example: 'm.vance@oakridge-academy.edu' },
      },
    },
  })
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Step 2: Verify 6-digit OTP and obtain single-use verification code' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email', 'otp'],
      properties: {
        email: { type: 'string', example: 'm.vance@oakridge-academy.edu' },
        otp: { type: 'string', example: '849201' },
      },
    },
  })
  async verifyOtp(@Body() body: { email: string; otp: string }) {
    return this.authService.verifyOtp(body.email, body.otp);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Step 3: Reset password using verification code and invalidate prior sessions' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email', 'newPassword', 'verificationCode'],
      properties: {
        email: { type: 'string', example: 'm.vance@oakridge-academy.edu' },
        newPassword: { type: 'string', example: 'MyNewSecretPass123' },
        verificationCode: { type: 'string', example: 'vcd_1725280000_abc123' },
      },
    },
  })
  async resetPassword(@Body() body: { email: string; newPassword: string; verificationCode: string }) {
    return this.authService.resetPassword(body.email, body.newPassword, body.verificationCode);
  }
}
