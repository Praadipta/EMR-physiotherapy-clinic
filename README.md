# 🏥 Sambung Nyowo - Sistem Informasi Klinik Fisioterapi

<div align="center">

![SvelteKit](https://img.shields.io/badge/SvelteKit-FF3E00?style=for-the-badge&logo=svelte&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

**Aplikasi Web Manajemen Klinik Fisioterapi dengan Standar HIPAA & GDPR**

[Demo](#demo) • [Fitur](#-fitur-utama) • [Instalasi](#-instalasi) • [Dokumentasi](#-dokumentasi)

</div>

---

## 📋 Deskripsi

**Sambung Nyowo** adalah sistem informasi manajemen klinik fisioterapi berbasis web yang dirancang untuk membantu klinik fisioterapi dalam mengelola operasional sehari-hari. Aplikasi ini dibangun dengan fokus pada kepatuhan regulasi kesehatan (HIPAA & GDPR), kemudahan penggunaan, dan efisiensi alur kerja klinis.

### 🎯 Tujuan Aplikasi

- Digitalisasi rekam medis pasien fisioterapi
- Manajemen jadwal dan appointment yang efisien
- Dokumentasi klinis dengan format SOAP standar
- Pengelolaan billing dan pembayaran terintegrasi
- Audit trail untuk kepatuhan regulasi kesehatan

---

## ✨ Fitur Utama

### 👥 Manajemen Pasien
- Registrasi pasien baru dengan persetujuan GDPR
- Pencarian dan filter data pasien
- Riwayat medis lengkap per pasien
- Manajemen kontak darurat

### 📅 Manajemen Appointment
- Penjadwalan sesi terapi
- Kalender interaktif per fisioterapis
- Status appointment (dijadwalkan, selesai, dibatalkan, tidak hadir)
- Notifikasi dan reminder

### 📋 Dokumentasi Klinis
- **Assessment Awal**: Penilaian kondisi pasien pertama kali
- **Catatan Sesi (SOAP)**: Dokumentasi standar setiap sesi terapi
  - **S**ubjective: Keluhan pasien
  - **O**bjective: Temuan klinis objektif
  - **A**ssessment: Penilaian kondisi
  - **P**lan: Rencana tindakan
- Pencatatan skala nyeri (0-10)
- Range of Motion (ROM) notes

### 💊 Rencana Perawatan (Treatment Plans)
- Pembuatan rencana terapi jangka panjang
- Tracking progress sesi terapi
- Status perawatan (direncanakan, berlangsung, selesai, dihentikan)
- Target dan tujuan terapi

### 💰 Billing & Pembayaran
- Pembuatan invoice otomatis
- Multiple metode pembayaran (Tunai, Transfer, Debit, Kredit, QRIS)
- Tracking status pembayaran (belum bayar, sebagian, lunas)
- Laporan keuangan

### 📊 Laporan & Analytics
- Dashboard metrik klinik
- Statistik kunjungan harian/bulanan
- Performa fisioterapis
- Diagnosis tersering
- Pendapatan bulanan

### 🔐 Keamanan & Compliance
- Role-based access control (Admin, Fisioterapis)
- Session management dengan token aman
- Audit log untuk setiap aksi
- Enkripsi password dengan Argon2
- GDPR consent management

---

## 🛠 Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Frontend** | SvelteKit 2.x, Svelte 5 (Runes), TailwindCSS 4 |
| **Backend** | SvelteKit Server (Node.js) |
| **Database** | SQLite dengan better-sqlite3 |
| **ORM** | Drizzle ORM |
| **Authentication** | Custom session-based auth dengan Argon2 |
| **Language** | TypeScript |

---

## 🏗 Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT BROWSER                          │
│                    (Svelte 5 + TailwindCSS)                     │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SVELTEKIT SERVER                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Routes    │  │   Hooks     │  │     Server Load         │  │
│  │  +page.ts   │  │  Auth       │  │     Functions           │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    SERVICES LAYER                           ││
│  │  • Auth Service    • Audit Service    • Business Logic     ││
│  └─────────────────────────────────────────────────────────────┘│
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
│              (./data/healthcare.db)                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📐 Database Schema (ERD)

```
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│      USERS       │       │     PATIENTS     │       │   APPOINTMENTS   │
├──────────────────┤       ├──────────────────┤       ├──────────────────┤
│ id (PK)          │       │ id (PK)          │       │ id (PK)          │
│ username         │       │ patientId        │◄──────│ patientId (FK)   │
│ email            │       │ namaLengkap      │       │ fisioterapisId(FK)│
│ passwordHash     │       │ tanggalLahir     │       │ tanggalWaktu     │
│ role             │◄──┬───│ jenisKelamin     │       │ durasiMenit      │
│ namaLengkap      │   │   │ noTelepon        │       │ status           │
│ isActive         │   │   │ email            │       │ catatan          │
└──────────────────┘   │   │ alamat           │       └──────────────────┘
         │             │   │ persetujuanGDPR  │                │
         │             │   │ createdBy (FK)   │────┘           │
         │             │   └──────────────────┘                │
         │             │            │                          │
         │             │            │                          │
         ▼             │            ▼                          ▼
┌──────────────────┐   │   ┌──────────────────┐       ┌──────────────────┐
│   AUDIT_LOGS     │   │   │   ASSESSMENTS    │       │  SESSION_NOTES   │
├──────────────────┤   │   ├──────────────────┤       ├──────────────────┤
│ id (PK)          │   │   │ id (PK)          │       │ id (PK)          │
│ userId (FK)      │───┘   │ patientId (FK)   │       │ appointmentId(FK)│
│ aksi             │       │ fisioterapisId   │       │ patientId (FK)   │
│ namaTabel        │       │ tanggalAssessment│       │ fisioterapisId   │
│ recordId         │       │ keluhanUtama     │       │ tanggalSesi      │
│ nilaiLama        │       │ kondisiCedera    │       │ subjective (SOAP)│
│ nilaiBaru        │       │ skalaNyeri       │       │ objective (SOAP) │
│ ipAddress        │       │ catatanROM       │       │ assessment (SOAP)│
│ timestamp        │       └──────────────────┘       │ plan (SOAP)      │
└──────────────────┘                                  │ tindakanDilakukan│
                                                      └──────────────────┘
         
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│ TREATMENT_PLANS  │       │     INVOICES     │       │    PAYMENTS      │
├──────────────────┤       ├──────────────────┤       ├──────────────────┤
│ id (PK)          │       │ id (PK)          │       │ id (PK)          │
│ patientId (FK)   │       │ nomorInvoice     │◄──────│ invoiceId (FK)   │
│ fisioterapisId   │       │ patientId (FK)   │       │ jumlah           │
│ diagnosis        │       │ appointmentId(FK)│       │ metodePembayaran │
│ tujuan           │       │ jumlah           │       │ tanggalPembayaran│
│ jumlahSesi       │       │ deskripsi        │       │ diterimaOleh(FK) │
│ jumlahSelesai    │       │ status           │       │ catatan          │
│ status           │       │ tanggalTerbit    │       └──────────────────┘
│ tanggalMulai     │       │ tanggalJatuhTempo│
│ tanggalSelesai   │       └──────────────────┘
└──────────────────┘
```

---

## 🔄 Application Workflow

### Alur Kerja Keseluruhan

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        ALUR KERJA KLINIK                                │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        ▼                           ▼                           ▼
┌───────────────┐          ┌───────────────┐          ┌───────────────┐
│   REGISTRASI  │          │  PENJADWALAN  │          │   BILLING     │
│    PASIEN     │─────────►│  APPOINTMENT  │─────────►│  & PAYMENT    │
└───────────────┘          └───────────────┘          └───────────────┘
        │                           │                           │
        │                           ▼                           │
        │                  ┌───────────────┐                    │
        │                  │   ASSESSMENT  │                    │
        │                  │     AWAL      │                    │
        │                  └───────────────┘                    │
        │                           │                           │
        │                           ▼                           │
        │                  ┌───────────────┐                    │
        │                  │   TREATMENT   │                    │
        │                  │     PLAN      │                    │
        │                  └───────────────┘                    │
        │                           │                           │
        │                           ▼                           │
        │                  ┌───────────────┐                    │
        │                  │ SESI TERAPI   │                    │
        │                  │ (SOAP Notes)  │◄───────────────────┘
        │                  └───────────────┘
        │                           │
        │                           ▼
        │                  ┌───────────────┐
        └─────────────────►│   EVALUASI    │
                           │  & LAPORAN    │
                           └───────────────┘
```

---

## 👤 User Flow Diagrams

### 🧑‍⚕️ Alur Fisioterapis (Staff)

```
                            ┌─────────────┐
                            │    LOGIN    │
                            └──────┬──────┘
                                   │
                                   ▼
                          ┌────────────────┐
                          │   DASHBOARD    │
                          │  (Home Page)   │
                          └────────┬───────┘
                                   │
           ┌───────────────────────┼───────────────────────┐
           │                       │                       │
           ▼                       ▼                       ▼
   ┌───────────────┐      ┌───────────────┐       ┌───────────────┐
   │   PATIENTS    │      │ APPOINTMENTS  │       │   CLINICAL    │
   │   MENU        │      │    MENU       │       │    MENU       │
   └───────┬───────┘      └───────┬───────┘       └───────┬───────┘
           │                      │                       │
    ┌──────┴──────┐        ┌──────┴──────┐        ┌──────┴──────┐
    │             │        │             │        │             │
    ▼             ▼        ▼             ▼        ▼             ▼
┌────────┐  ┌────────┐ ┌────────┐  ┌────────┐ ┌────────┐  ┌────────┐
│ Daftar │  │ Tambah │ │ Lihat  │  │ Buat   │ │Assessment│ │Session │
│ Pasien │  │ Pasien │ │ Jadwal │  │Jadwal  │ │  Awal   │  │ Notes  │
└────┬───┘  └────────┘ └────┬───┘  └────────┘ └────┬───┘  └────┬───┘
     │                      │                      │           │
     ▼                      ▼                      │           │
┌────────┐           ┌────────────┐               │           │
│ Detail │           │   Update   │               │           │
│ Pasien │           │   Status   │               │           │
└────┬───┘           │ (Selesai/  │               │           │
     │               │  Batal)    │               │           │
     │               └────────────┘               │           │
     │                                            │           │
     └────────────────────┬───────────────────────┴───────────┘
                          │
                          ▼
                  ┌───────────────┐
                  │   TREATMENT   │
                  │    PLANS      │
                  └───────┬───────┘
                          │
               ┌──────────┴──────────┐
               │                     │
               ▼                     ▼
        ┌────────────┐        ┌────────────┐
        │  Buat Plan │        │ Update     │
        │   Baru     │        │ Progress   │
        └────────────┘        └────────────┘
```

### 📋 Alur Dokumentasi Klinis (SOAP)

```
┌─────────────────────────────────────────────────────────────────┐
│                    PROSES DOKUMENTASI SOAP                      │
└─────────────────────────────────────────────────────────────────┘

     ┌──────────────────┐
     │ Pasien Datang    │
     │ untuk Sesi       │
     └────────┬─────────┘
              │
              ▼
     ┌──────────────────┐
     │   Buka Record    │
     │     Pasien       │
     └────────┬─────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         SOAP FORMAT                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ S - SUBJECTIVE                                          │   │
│  │ • Keluhan pasien hari ini                               │   │
│  │ • Perkembangan sejak sesi terakhir                      │   │
│  │ • Tingkat nyeri yang dirasakan                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                           │                                     │
│                           ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ O - OBJECTIVE                                           │   │
│  │ • Hasil pemeriksaan fisik                               │   │
│  │ • Pengukuran ROM (Range of Motion)                      │   │
│  │ • Skala nyeri objektif (0-10)                           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                           │                                     │
│                           ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ A - ASSESSMENT                                          │   │
│  │ • Analisis kondisi pasien                               │   │
│  │ • Evaluasi progres terapi                               │   │
│  │ • Identifikasi masalah baru                             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                           │                                     │
│                           ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ P - PLAN                                                │   │
│  │ • Rencana tindakan sesi berikutnya                      │   │
│  │ • Latihan rumah untuk pasien                            │   │
│  │ • Rekomendasi & edukasi                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
              │
              ▼
     ┌──────────────────┐
     │   Simpan Note    │
     │   & Update       │
     │   Treatment Plan │
     └────────┬─────────┘
              │
              ▼
     ┌──────────────────┐
     │  Buat Invoice    │
     │   (Opsional)     │
     └──────────────────┘
```

### 💰 Alur Billing & Pembayaran

```
┌─────────────────────────────────────────────────────────────────┐
│                      PROSES BILLING                             │
└─────────────────────────────────────────────────────────────────┘

     ┌──────────────────┐
     │  Sesi Selesai    │
     └────────┬─────────┘
              │
              ▼
     ┌──────────────────┐
     │   Buat Invoice   │
     │   (INV-YYYY-XXX) │
     └────────┬─────────┘
              │
              ├───────────────────────────────────────┐
              │                                       │
              ▼                                       ▼
     ┌──────────────────┐                   ┌──────────────────┐
     │  Input Detail:   │                   │ Status Invoice:  │
     │  • Jumlah        │                   │  • belum_bayar   │
     │  • Deskripsi     │                   │  • sebagian      │
     │  • Jatuh Tempo   │                   │  • lunas         │
     └────────┬─────────┘                   └──────────────────┘
              │
              ▼
     ┌──────────────────┐
     │  Pasien Bayar    │
     └────────┬─────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     METODE PEMBAYARAN                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│   │  TUNAI  │ │TRANSFER │ │  DEBIT  │ │ KREDIT  │ │  QRIS   │  │
│   └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
              │
              ▼
     ┌──────────────────┐
     │  Catat Payment   │
     │  & Update Status │
     └────────┬─────────┘
              │
              ▼
     ┌──────────────────┐
     │  Generate        │
     │  Receipt         │
     └──────────────────┘
```

---

## 🚀 Instalasi

### Prerequisites

- Node.js 18+ 
- npm atau pnpm

### Langkah Instalasi

```bash
# 1. Clone repository
git clone https://github.com/your-repo/sambung-nyowo.git
cd sambung-nyowo

# 2. Install dependencies
npm install

# 3. Setup database
npm run db:push

# 4. Seed data awal (opsional)
npm run seed

# 5. Jalankan development server
npm run dev
```

### Environment Variables

Buat file `.env` di root project:

```env
# Database
DATABASE_URL=./data/healthcare.db

# Session
SESSION_SECRET=your-super-secret-key-min-32-chars
```

---

## 📁 Struktur Project

```
src/
├── app.css                    # Global styles (TailwindCSS)
├── app.html                   # HTML template
├── hooks.server.ts            # Server hooks (auth middleware)
├── lib/
│   ├── assets/               # Static assets
│   ├── index.ts              # Shared utilities
│   └── server/
│       ├── auth/             # Authentication logic
│       ├── db/
│       │   ├── index.ts      # Database connection
│       │   └── schema/       # Drizzle schema definitions
│       │       ├── appointments.ts
│       │       ├── audit.ts
│       │       ├── billing.ts
│       │       ├── clinical.ts
│       │       ├── patients.ts
│       │       ├── treatments.ts
│       │       └── users.ts
│       └── services/         # Business logic services
│           └── audit.ts      # Audit logging
└── routes/
    ├── +layout.server.ts     # Root layout server
    ├── +layout.svelte        # Root layout component
    ├── +page.server.ts       # Dashboard server
    ├── +page.svelte          # Dashboard UI
    ├── appointments/         # Appointment management
    ├── auth/                 # Login/Logout
    ├── billing/              # Invoice & payments
    ├── clinical/             # Assessments & session notes
    │   ├── assessments/
    │   └── sessions/
    ├── patients/             # Patient management
    ├── reports/              # Analytics & reports
    └── treatments/           # Treatment plans
```

---

## 🔧 Scripts

| Script | Deskripsi |
|--------|-----------|
| `npm run dev` | Jalankan development server |
| `npm run build` | Build untuk production |
| `npm run preview` | Preview production build |
| `npm run check` | TypeScript & Svelte check |
| `npm run db:generate` | Generate database migrations |
| `npm run db:push` | Push schema ke database |
| `npm run db:studio` | Buka Drizzle Studio |
| `npm run seed` | Seed database dengan data awal |

---

## 👥 User Roles

### Admin
- Full access ke semua fitur
- Manajemen user (tambah/edit/hapus staff)
- Akses laporan keuangan lengkap
- Audit log viewer

### Fisioterapis
- Manajemen pasien (CRUD)
- Penjadwalan appointment
- Dokumentasi klinis (Assessment, SOAP)
- Membuat treatment plans
- Membuat invoice & menerima pembayaran

---

## 🔒 Security Features

### Authentication
- Session-based authentication
- Password hashing dengan Argon2
- Secure HTTP-only cookies
- Automatic session expiration

### Authorization
- Role-based access control (RBAC)
- Route protection via hooks
- API endpoint protection

### Audit & Compliance
- Comprehensive audit logging
- IP address tracking
- User action history
- GDPR consent management
- Data retention compliance

---

## 📊 Metrik Dashboard

Dashboard menampilkan metrik real-time:

- 📈 Total pasien & pasien baru bulan ini
- 📅 Sesi terapi bulan ini (selesai/dibatalkan)
- 💰 Pendapatan bulan ini
- 📋 Tagihan belum lunas
- 💊 Terapi aktif
- 📊 Grafik kunjungan harian
- 📈 Grafik pendapatan bulanan
- 🏆 Performa fisioterapis
- 🩺 Diagnosis tersering

---

## 🤝 Contributing

1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buka Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 📞 Contact

**Klinik Fisioterapi Sambung Nyowo**

- 📧 Email: info@sambungnyowo.com
- 📱 Phone: (024) xxx-xxxx
- 📍 Address: Solo, Jawa Tengah, Indonesia

---

<div align="center">

**Made with ❤️ for Klinik Fisioterapi Sambung Nyowo**

*Sistem Informasi Medis - UMS Semester 7*

</div>
