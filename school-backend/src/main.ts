import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Global prefix for all REST endpoints
  app.setGlobalPrefix('api');

  // Enable CORS for frontend client
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global validation pipe for incoming request DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Swagger / OpenAPI documentation configuration
  const config = new DocumentBuilder()
    .setTitle('Oakridge School ERP API')
    .setDescription(
      'Enterprise School Management ERP Backend built with NestJS & TypeORM (Code-First Database Approach). Supports Students, Staff & Compensation, Daily Roll Call, Leave Approvals, Monthly Payroll Disbursements, Extracurricular Activities, and Role-Based Access Control (RBAC).',
    )
    .setVersion('1.0.0')
    .addTag('School Info & Settings', 'Institution configuration, logo branding & session')
    .addTag('Students Directory & Enrollment', 'Student registry, admissions & 360-degree profiles')
    .addTag('Faculty & Staff Management', 'Staff directory, joining dates & compensation packages')
    .addTag('School Attendance Hub', 'Daily roll call, status matrix & monthly registers')
    .addTag('Staff Leave Management & Approvals', 'Leave applications, quotas & supervisor review')
    .addTag('Staff Salaries & Payroll Management', 'Payroll ledger generation, payslips & disbursements')
    .addTag('Student Activities, Clubs & Athletics', 'Extracurricular clubs, rosters & trophy timeline')
    .addTag('Classes, Sections & Schedules', 'Grade divisions, class teachers & timetables')
    .addTag('Real-time Alerts & Notifications', 'System notifications & alerts')
    .addTag('Authentication & Role Perspectives', 'RBAC perspectives & role switching')
    .addTag('Database Management, Backup & Reset', 'JSON backup exports & demo data reset')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Oakridge ERP API Documentation',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  const PORT = process.env.PORT || 3001;
  await app.listen(PORT, '0.0.0.0');

  logger.log(`🚀 School ERP Backend successfully running on: http://localhost:${PORT}/api`);
  logger.log(`📚 Interactive Swagger API Docs available at: http://localhost:${PORT}/api/docs`);
}

bootstrap();
