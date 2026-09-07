# 🏫 Oakridge School ERP - Enterprise NestJS Backend

A high-performance, modular NestJS backend for the **School Management ERP System** developed using the **Code-First Database Approach** with **TypeORM** and TypeScript.

---

## 🏗️ Architecture & Technology Stack

- **Framework**: [NestJS](https://nestjs.com/) (Node.js TypeScript framework)
- **Database (Code-First)**: [TypeORM](https://typeorm.io/) with automatic entity schema synchronization (`synchronize: true`)
- **Database Engine**: SQLite (`data/school_erp.sqlite`) for self-contained, zero-configuration local execution (readily swappable with PostgreSQL/MySQL)
- **API Documentation**: [Swagger / OpenAPI 3.0](https://swagger.io/) with live interactive explorer (`/api/docs`)
- **Data Validation & Transformation**: `class-validator` & `class-transformer`
- **Security & RBAC**: Custom `RolesGuard` and `@Roles()` decorator enforcing role-based access control across `admin`, `principal`, `teacher`, and `accountant` perspectives.

---

## 📦 Directory Structure

```
school-backend/
├── data/
│   └── school_erp.sqlite          # Code-First auto-synchronized SQLite database
├── src/
│   ├── common/
│   │   ├── decorators/            # @Roles() metadata decorator
│   │   ├── filters/               # Global HttpException & Error filter
│   │   ├── guards/                # RolesGuard (RBAC)
│   │   └── interceptors/          # Logging & response interceptors
│   ├── config/                    # Environment & database configs
│   ├── modules/
│   │   ├── auth/                  # User perspective switching & permission matrices
│   │   ├── school-info/           # Institution profile, logo branding & academic session
│   │   ├── students/              # Student registry, 360° dossiers & admissions
│   │   ├── staff/                 # Faculty profiles, joining dates & compensation packages
│   │   ├── attendance/            # Daily roll call, status matrix & monthly registers
│   │   ├── leaves/                # Staff leave requests, quotas & approval workflows
│   │   ├── payroll/               # Monthly payroll ledgers, payslips & disbursements
│   │   ├── activities/            # Extracurricular clubs, rosters & trophy timelines
│   │   ├── classes/               # Grade divisions, appointed teachers & timetables
│   │   ├── notifications/         # System alerts & real-time notices
│   │   └── database/              # Auto-seeder & JSON backup/restore engine
│   ├── app.module.ts              # Root NestJS application module
│   └── main.ts                    # Bootstrap with global prefix, CORS & Swagger
├── package.json
└── tsconfig.json
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Build the Application
```bash
npm run build
```

### 3. Run the Server
```bash
# Production mode
npm run start:prod

# Development mode with Hot-Reload
npm run start:dev
```

The server starts at: **`http://localhost:3001/api`**  
Interactive Swagger API Explorer: **`http://localhost:3001/api/docs`**

---

## 🛡️ Role-Based Access Control (RBAC)

Requests can specify the active role using the HTTP header:
```http
x-user-role: admin | principal | teacher | accountant
```

| Role | Label | Permissions & Scope |
|---|---|---|
| **`admin`** | Super Admin | Full ERP master access: students, staff, roll call, payroll generation, disbursements, leave approvals, settings & backups. |
| **`principal`** | School Principal | Executive academic management: student enrollment, staff onboarding, leave approvals, class & activity schedules, reports. |
| **`teacher`** | Teacher / Faculty | Classroom access: student directory, daily roll call, class timetable, club activities, and personal leave applications. |
| **`accountant`** | Finance / Bursar | Financial oversight: monthly payroll drafts, batch salary disbursements, individual payslips, and currency settings. |

---

## 📚 REST API Reference

### 🏛️ Institution & Settings (`/api/school-info`)
- `GET /api/school-info` - Fetch institution profile, logo crest, and academic session.
- `PATCH /api/school-info` - Update school branding, affiliation subtitle, currency, or session *(Admin, Principal, Accountant)*.

### 🎓 Students Directory (`/api/students`)
- `GET /api/students` - Query students with search, grade, section, and status filters.
- `GET /api/students/:id` - Fetch 360° student profile with clubs and awards.
- `POST /api/students` - Enroll a new student *(Admin, Principal)*.
- `PATCH /api/students/:id` - Update student profile or placement *(Admin, Principal)*.
- `DELETE /api/students/:id` - Remove student record *(Admin, Principal)*.

### 👥 Faculty & Staff (`/api/staff`)
- `GET /api/staff` - Query staff directory with department, role, and salary breakdowns.
- `GET /api/staff/:id` - Fetch staff dossier with joining milestone, tenure, and leave quotas.
- `POST /api/staff` - Onboard a faculty or staff member *(Admin, Principal)*.
- `PATCH /api/staff/:id` - Update staff credentials or salary package *(Admin, Principal, Accountant)*.
- `DELETE /api/staff/:id` - Remove staff record *(Admin, Principal)*.

### 📋 Attendance Hub (`/api/attendance`)
- `GET /api/attendance/daily?date=YYYY-MM-DD` - Retrieve daily roll call records.
- `GET /api/attendance/monthly-matrix?year=2026&month=9&targetType=student` - Dynamic monthly register with non-future date validation.
- `POST /api/attendance/mark` - Mark individual attendance (`P`, `L`, `A` for students; `P`, `L`, `A`, `E` for staff) *(Admin, Principal, Teacher)*.
- `POST /api/attendance/bulk-mark` - Bulk mark attendance for selected individuals *(Admin, Principal, Teacher)*.

### 🌴 Staff Leave Management (`/api/leaves`)
- `GET /api/leaves?status=Pending` - List faculty leave applications.
- `POST /api/leaves/apply` - Submit new staff leave application.
- `PATCH /api/leaves/:id/review` - Approve or reject leave request with administrative remarks *(Admin, Principal)*.

### 💵 Salaries & Payroll (`/api/payroll`)
- `GET /api/payroll` - List all monthly payroll ledgers.
- `GET /api/payroll/cycle?month=August&year=2026` - Get ledger for specific billing cycle.
- `GET /api/payroll/:id` - Get payroll ledger with all staff payslips.
- `POST /api/payroll/generate` - Generate payroll draft for past billing cycles *(Admin, Accountant)*.
- `PATCH /api/payroll/:payrollId/staff/:staffId/payout` - Update individual staff disbursement status *(Admin, Accountant)*.
- `POST /api/payroll/:id/disburse-all` - Disburse all salaries in bulk for active cycle *(Admin, Accountant)*.

### 🏆 Clubs & Athletics (`/api/activities`)
- `GET /api/activities` - Query extracurricular clubs and athletic teams.
- `GET /api/activities/:id` - Get club details, student roster, and trophy timeline.
- `POST /api/activities` - Create new club or athletic program *(Admin, Principal, Teacher)*.
- `POST /api/activities/:id/enroll` - Enroll student into activity *(Admin, Principal, Teacher)*.
- `DELETE /api/activities/:id/members/:studentId` - Remove student member *(Admin, Principal, Teacher)*.
- `POST /api/activities/:id/achievements` - Log a championship or honor *(Admin, Principal, Teacher)*.

### 📖 Classes & Timetable (`/api/classes`)
- `GET /api/classes` - List grade sections, appointed class teachers, and rooms.
- `POST /api/classes` - Add new class division *(Admin, Principal)*.
- `PATCH /api/classes/:id` - Update timetable or subjects *(Admin, Principal)*.

### 💾 Backup & Reset (`/api/database`)
- `GET /api/database/export` - Export full database backup as JSON.
- `POST /api/database/reset` - Reset all tables back to factory demo dataset *(Super Admin)*.
