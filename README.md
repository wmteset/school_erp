# School ERP & Management System

A full-featured School Management System built with a **NestJS + PostgreSQL (TypeORM Code-First)** backend and a **React + Vite + Tailwind CSS** frontend.

---

## 🏗 Architecture & Project Structure

* **`/school-backend`**: NestJS application with TypeORM entities, PostgreSQL database, Swagger UI, authentication, RBAC, leave management, payroll, student & staff dossiers, attendance tracking, and SMTP mail dispatch.
* **`/school-app`**: React application built with Vite, Tailwind CSS, Lucide icons, responsive layout, full RBAC filtering, print engine (salary slips, ID cards), and dark/light UI components.

---

## 🚀 Getting Started

### 1. Prerequisites
* **Node.js**: v18+ or v20+
* **PostgreSQL**: v14+ or v17+
* **npm** or **yarn**

---

### 2. Backend Setup (`/school-backend`)

1. Navigate to the backend directory:
   ```bash
   cd school-backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env`:
   ```env
   PORT=3001
   NODE_ENV=development
   
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=postgres
   DB_DATABASE=school_erp

   # Optional SMTP credentials for OTP / Password recovery
   SMTP_HOST=
   SMTP_PORT=587
   SMTP_USER=
   SMTP_PASS=
   SMTP_SECURE=false
   SMTP_FROM="Oakridge International Academy" <security@oakridge-academy.edu>
   ```
4. Build and start the backend:
   ```bash
   # Development mode with hot-reload
   npm run start:dev

   # Production build
   npm run build
   npm run start:prod
   ```
5. Interactive Swagger API documentation will be available at:
   `http://localhost:3001/api/docs`

---

### 3. Frontend Setup (`/school-app`)

1. Navigate to the frontend directory:
   ```bash
   cd school-app
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser at:
   `http://localhost:5173`

---

## 🔐 Default Super Admin Credentials
* **Email:** `admin@oakridge.edu`
* **Password:** `admin`

---

## ✨ Features
* **Role-Based Access Control (RBAC):** Admin, Principal, Teacher, and Accountant permissions.
* **Student & Faculty Management:** Comprehensive dossiers, image uploaders, printable badges, and ID cards.
* **Daily & Monthly Attendance:** Roll call locking, dynamic calendar matrices, and attendance status enforcement.
* **Salaries & Payroll:** Automated allowances, statutory tax/PF deductions, 1-page printable payslips, and batch disbursement.
* **Leave Management:** Custom leave quotas (Casual, Sick, Annual, Maternity), status workflows, and balance synchronization.
* **Extracurricular & Athletics:** Club enrollments, achievement tracking, and student sports rosters.
* **Branding & Institution Customization:** Live logo updates, school affiliation subtitles, and dynamic academic year selector.
