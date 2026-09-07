# 🏫 Oakridge International Academy - School Management ERP

A full-featured, modern, and intuitive School Management Application built for school administrators, principals, teachers, and finance officers. Manage students, staff, attendance, salaries, joining dates, leaves, and extracurricular activities all in one unified portal.

---

## 🌟 Core Features & Modules

### 1. 👨‍🎓 Student Enrollment & Management
- **Complete Student Directory**: Filterable by Grade (1–12), Section (A–D), and Enrollment Status (Active, On Leave, Alumni).
- **Multi-step Student Enrollment**:
  - Personal Details (Name, Gender, DOB, Blood Group, Avatar).
  - Academic Placement (Grade, Section, Roll No, Admission Date).
  - Parent / Guardian Info (Guardian Name, Relationship, Phone, Email, Address).
  - Health & Logistics (Medical & Dietary Notes, Bus Route / Commute).
- **360° Student Profile Dossier**: Attendance score gauge, enrolled clubs & sports, honors/awards timeline, and parent contact triggers.
- **Printable Student ID Card**: High-resolution official student card with barcode simulation, school crest, and valid academic session.

### 2. 👩‍🏫 Faculty & Staff Management
- **Staff Directory & Profiles**: Filterable by Department (Science, Math, Humanities, Fine Arts, PE, Administration, Finance) and Employment Type.
- **Joining Dates & Tenure Tracker**: Calculates exact tenure (e.g., *8 yrs, 3 mos*) from the official joining date.
- **Onboarding Modal**: Captures personal info, credentials, joining date, experience, and full salary breakdown.
- **Printable Staff ID Badge**: Official school faculty identification badge.

### 3. 📅 Dual Attendance Hub (Students & Staff)
- **Daily Roll Call**:
  - Quick 4-status interactive toggles: `[P] Present`, `[L] Late / Tardy`, `[A] Absent`, `[E] Excused / Leave`.
  - Custom notes/remarks per person (e.g., *Doctor appointment*, *Bus delay*).
  - One-click bulk operations: *Mark All Present*, *Mark All Absent*.
  - Live statistics: turnout rate percentage, on-time count, absent count, excused count.
- **Monthly Register Matrix View**: Visual calendar grid of every school day across the month for high-level pattern analysis.
- **Export to CSV**: Instant download of attendance register data.

### 4. 💰 Staff Salaries & Monthly Payroll
- **Comprehensive Salary Structure**:
  - Itemized Earnings: Base Salary, House Rent Allowance (HRA), Transport Allowance, Special/Subject Allowance, Performance Bonuses.
  - Itemized Statutory Deductions: Provident Fund (PF / Retirement), Income Tax withholding, Unpaid leave deductions.
  - Computed Net Take-Home Pay.
- **Monthly Payroll Generator**: Auto-computes payroll runs for each month with batch disbursement and status tracking (*Draft*, *Processing*, *Paid*).
- **Official Printable Salary Slips (Payslips)**:
  - School branding, employee ID, designation, joining date, bank details.
  - Itemized earnings & deductions tables.
  - Net pay in digits and spelled out in words (*e.g., Six Thousand Eight Hundred Dollars Only*).
  - Official school seal and dual signatures (Accountant & Principal).

### 5. 🏖️ Staff Leave Management & Balances
- **Statutory Quota Balances**: Tracks annual quota, used days, and remaining balances for:
  - Casual Leave (CL)
  - Sick Leave (SL)
  - Annual / Earned Leave (AL)
  - Maternity / Paternity Leave
- **Leave Application & Review Workflow**:
  - Staff submits request with date range, reason, and substitute teacher assignment.
  - Administrator/Principal can **Approve** or **Reject** with custom remarks.
  - Approved leaves automatically deduct from staff quota and sync with attendance registers as *Excused (E)*.

### 6. 🏆 Extracurriculars, Clubs & Athletics
- **Clubs & Teams Hub**: STEM & Robotics, Model UN & Debate, Varsity Soccer, Basketball, Orchestra & Choir, Green Earth Eco Club.
- **Roster & Role Assignment**: Assign students to clubs with designated roles (*President*, *Captain*, *Vice Captain*, *Secretary*, *Member*).
- **Awards & Honors Registry**: Record medals, trophies, and tournament certificates with citations.

### 7. 📊 Executive Dashboard & Analytics
- Live KPI Metric Cards: Total Students, Total Faculty, Today's Student Attendance %, Today's Staff Attendance %, Monthly Payroll Budget, Pending Leaves.
- Actionable widgets: 1-click leave approval, daily absentee follow-up with parent call shortcut, upcoming events.
- Role switcher: Super Admin, Principal, Teacher, Accountant perspectives.
- Global Search (`⌘K` / `Ctrl+K`) across all records.

### 8. ⚙️ Settings, Currency & Data Center
- Institution profile customization (School Name, Tagline, Principal, Affiliation, Currency: `$`, `₹`, `€`, `£`, `AED`).
- Full JSON Data Backup & Restore.
- Factory sample data reset.

---

## 🛠️ Technology Stack
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Persistence**: LocalStorage with auto-sync
- **Export & Print**: Native CSS Print Media stylesheets & CSV generation
