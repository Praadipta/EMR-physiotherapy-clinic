# 🏥 Sambung Nyowo EMR - Physiotherapy Clinic System

<div align="center">

![SvelteKit](https://img.shields.io/badge/SvelteKit_2.x-FF3E00?style=for-the-badge&logo=svelte&logoColor=white)
![Svelte 5](https://img.shields.io/badge/Svelte_5_(Runes)-FF3E00?style=for-the-badge&logo=svelte&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS_4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Drizzle](https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black)

### **Full-Featured Electronic Medical Record for Physiotherapy Clinics**

*HIPAA & GDPR Compliant • ICD-10 Diagnosis Codes • SOAP Documentation*

[🚀 Quick Start](#-quick-start) • [✨ Features](#-features) • [📖 Documentation](#-documentation) • [🏗️ Architecture](#-architecture)

</div>

---

## 📋 Overview

**Sambung Nyowo EMR** is a comprehensive, production-ready Electronic Medical Record system specifically designed for physiotherapy clinics. Built with modern web technologies, it provides everything needed for clinical documentation, patient management, and practice operations.

### 🎯 Key Highlights

| Feature | Description |
|---------|-------------|
| 🏥 **Complete EMR** | Patient records, clinical notes, vital signs, assessments |
| 🔢 **ICD-10 Codes** | 89 physiotherapy-specific diagnosis codes with Indonesian translations |
| 📝 **SOAP Documentation** | Standardized clinical note templates |
| 📊 **Assessment Tools** | VAS pain scale, body diagram, goal tracking |
| 💰 **Billing Integration** | Invoice generation and payment tracking |
| 🔐 **Secure & Compliant** | Role-based access, audit trails, encrypted passwords |

---

## ✨ Features

### 👥 Patient Management
- ✅ Complete patient registration with demographics
- ✅ Allergy alerts with severity levels
- ✅ Current medications tracking
- ✅ Medical history (conditions, surgeries, family history)
- ✅ Emergency contacts
- ✅ GDPR consent management

### ❤️ Vital Signs Recording
- ✅ Blood pressure (with status indicators)
- ✅ Heart rate, temperature, respiratory rate
- ✅ SpO2 oxygen saturation
- ✅ Weight, height, BMI calculation
- ✅ Pain level (0-10 scale)
- ✅ Complete vitals history

### 🏥 ICD-10 Diagnosis Codes
- ✅ **89 physiotherapy codes** across 7 categories:
  - **M codes**: Musculoskeletal (46 codes)
  - **S codes**: Injuries (11 codes)
  - **G codes**: Nervous system (14 codes)
  - **I/J/R/Z codes**: Circulatory, respiratory, symptoms
- ✅ Searchable selector with autocomplete
- ✅ Indonesian translations for all codes
- ✅ "Common" markers for frequently used diagnoses

### 📋 Clinical Documentation
- ✅ **SOAP Notes** (Subjective, Objective, Assessment, Plan)
- ✅ 6 pre-built clinical templates
- ✅ Assessment records with ROM notes
- ✅ Session documentation with duration tracking

### 📊 Assessment Tools
- ✅ **VAS Pain Scale** - Interactive 0-10 scale
- ✅ **Body Diagram** - Mark pain/injury locations
- ✅ **Goal Tracking** - Progress monitoring with targets
- ✅ Outcome measures (DASH, ODI, WOMAC, SF-36 placeholders)

### 📂 Document Management
- ✅ File uploads with categorization
- ✅ Categories: Lab results, imaging, consent forms, etc.
- ✅ Secure file storage

### 📅 Appointments
- ✅ Appointment scheduling
- ✅ Status tracking (scheduled, completed, cancelled, no-show)
- ✅ Appointment history per patient

### 🔄 Referral Management
- ✅ Incoming and outgoing referrals
- ✅ Referrer/referee information
- ✅ Status tracking (pending, accepted, completed)

### 🏋️ Exercise Library
- ✅ 15+ physiotherapy exercises
- ✅ Categorized by body region
- ✅ Difficulty levels
- ✅ Instructions and sets/reps

### 💰 Billing
- ✅ Invoice generation
- ✅ Payment tracking
- ✅ Multiple payment methods (Cash, Transfer, Debit, Credit, QRIS)

### 📊 Reports & Analytics
- ✅ Dashboard with key metrics
- ✅ Patient statistics
- ✅ Appointment analytics

### 🔐 Security
- ✅ Role-based access control (Admin, Physio, Staff)
- ✅ Argon2 password hashing
- ✅ Session-based authentication
- ✅ Audit trail for all actions

---

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+**
- **npm** or **pnpm**

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Praadipta/EMR-physiotherapy-clinic.git
cd EMR-physiotherapy-clinic

# 2. Install dependencies
npm install

# 3. Setup database schema
npm run db:push

# 4. Seed initial data (optional but recommended)
npm run seed

# 5. Seed ICD-10 codes
npx tsx scripts/seed-icd10.ts

# 6. Start development server
npm run dev
```

### Access the Application

Open **http://localhost:5173** in your browser.

#### Default Login Credentials
| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | SvelteKit 2.x, Svelte 5 (Runes) |
| **Styling** | TailwindCSS 4 |
| **Backend** | SvelteKit Server (Node.js) |
| **Database** | SQLite with better-sqlite3 |
| **ORM** | Drizzle ORM |
| **Auth** | Custom session-based with Argon2 |
| **Language** | TypeScript |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT BROWSER                          │
│                    (Svelte 5 + TailwindCSS 4)                   │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SVELTEKIT SERVER                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Routes    │  │   Hooks     │  │     Server Actions      │  │
│  │  +page.ts   │  │  Auth Guard │  │     Form Handling       │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DRIZZLE ORM                                │
│            Type-safe Database Queries & Migrations              │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     SQLITE DATABASE                             │
│                  (./data/healthcare.db)                         │
│                                                                 │
│   13 Tables: patients, users, appointments, vitals,            │
│   assessments, session_notes, treatments, billing, referrals,  │
│   templates, exercises, icd10_codes, audit_logs                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
src/
├── lib/
│   ├── components/           # Reusable Svelte components
│   │   ├── BodyDiagram.svelte
│   │   ├── VASPainScale.svelte
│   │   ├── GoalProgress.svelte
│   │   ├── ICD10Selector.svelte
│   │   └── DocumentManager.svelte
│   └── server/
│       ├── auth/             # Authentication logic
│       └── db/
│           ├── index.ts      # Database connection
│           └── schema/       # 13 Drizzle schema files
└── routes/
    ├── patients/             # Patient management
    ├── appointments/         # Scheduling
    ├── clinical/             # Assessments & notes
    ├── treatments/           # Treatment plans
    ├── exercises/            # Exercise library
    ├── icd10/                # ICD-10 code browser
    ├── templates/            # SOAP templates
    ├── referrals/            # Referral management
    ├── billing/              # Invoicing
    ├── reports/              # Analytics
    └── staff/                # Staff management (admin)
```

---

## 🔧 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run check` | TypeScript & Svelte type checking |
| `npm run db:push` | Push schema to database |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run seed` | Seed database with sample data |

---

## 👥 User Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Full access, staff management, audit logs |
| **Fisioterapis** | Patients, appointments, clinical docs, billing |
| **Staff** | Limited access (coming soon) |

---

## 🔒 Security Features

- ✅ **Password Hashing**: Argon2 algorithm
- ✅ **Session Management**: Secure HTTP-only cookies
- ✅ **RBAC**: Role-based access control
- ✅ **Audit Trail**: All actions logged
- ✅ **Route Protection**: Server-side guards
- ✅ **GDPR Consent**: Patient consent management

---

## 📊 EMR Compliance

This system meets core EMR requirements:

| Requirement | Status |
|-------------|--------|
| Patient Demographics | ✅ Complete |
| Clinical Documentation | ✅ SOAP Notes |
| Vital Signs | ✅ Full Recording |
| Diagnosis Coding | ✅ ICD-10 (89 codes) |
| Treatment Plans | ✅ Implemented |
| Appointments | ✅ Scheduling |
| Billing | ✅ Invoicing |
| Security | ✅ RBAC, Audit |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">

**Made with ❤️ for Physiotherapy Clinics**

*Klinik Fisioterapi Sambung Nyowo - Solo, Indonesia*

![GitHub stars](https://img.shields.io/github/stars/Praadipta/EMR-physiotherapy-clinic?style=social)
![GitHub forks](https://img.shields.io/github/forks/Praadipta/EMR-physiotherapy-clinic?style=social)

</div>
