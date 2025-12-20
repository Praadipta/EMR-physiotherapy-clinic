#!/bin/sh
set -e

echo "🔄 Checking database initialization..."

# Check if database exists and has tables
if [ ! -f /app/data/healthcare.db ]; then
    echo "📦 Database not found. Initializing..."
    cd /app && node -e "
const Database = require('better-sqlite3');
const { hash } = require('@node-rs/argon2');

async function init() {
    const db = new Database('/app/data/healthcare.db');
    
    // Create tables
    db.exec(\`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL CHECK (role IN ('admin', 'fisioterapis')),
            nama_lengkap TEXT NOT NULL,
            no_telepon TEXT,
            is_active INTEGER DEFAULT 1,
            created_at TEXT,
            updated_at TEXT
        );

        CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            expires_at INTEGER NOT NULL,
            created_at TEXT
        );

        CREATE TABLE IF NOT EXISTS patients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id TEXT NOT NULL UNIQUE,
            nama_lengkap TEXT NOT NULL,
            tanggal_lahir TEXT,
            jenis_kelamin TEXT CHECK (jenis_kelamin IN ('L', 'P')),
            alamat TEXT,
            no_telepon TEXT,
            email TEXT,
            no_bpjs TEXT,
            golongan_darah TEXT CHECK (golongan_darah IN ('A', 'B', 'AB', 'O')),
            alergi TEXT,
            riwayat_penyakit TEXT,
            kontak_darurat_nama TEXT,
            kontak_darurat_telepon TEXT,
            kontak_darurat_hubungan TEXT,
            created_at TEXT,
            updated_at TEXT
        );

        CREATE TABLE IF NOT EXISTS appointments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
            therapist_id INTEGER REFERENCES users(id),
            tanggal TEXT NOT NULL,
            waktu_mulai TEXT NOT NULL,
            waktu_selesai TEXT,
            jenis_layanan TEXT,
            status TEXT DEFAULT 'dijadwalkan' CHECK (status IN ('dijadwalkan', 'selesai', 'dibatalkan', 'tidak_hadir')),
            catatan TEXT,
            created_at TEXT,
            updated_at TEXT
        );

        CREATE TABLE IF NOT EXISTS clinical_assessments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
            therapist_id INTEGER REFERENCES users(id),
            tanggal_assessment TEXT NOT NULL,
            keluhan_utama TEXT,
            riwayat_penyakit_sekarang TEXT,
            riwayat_penyakit_dahulu TEXT,
            pemeriksaan_fisik TEXT,
            diagnosis TEXT,
            rencana_terapi TEXT,
            created_at TEXT,
            updated_at TEXT
        );

        CREATE TABLE IF NOT EXISTS therapy_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
            therapist_id INTEGER REFERENCES users(id),
            assessment_id INTEGER REFERENCES clinical_assessments(id),
            appointment_id INTEGER REFERENCES appointments(id),
            tanggal_sesi TEXT NOT NULL,
            subjective TEXT,
            objective TEXT,
            assessment TEXT,
            plan TEXT,
            tindakan TEXT,
            hasil TEXT,
            catatan TEXT,
            created_at TEXT,
            updated_at TEXT
        );

        CREATE TABLE IF NOT EXISTS treatment_plans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
            therapist_id INTEGER REFERENCES users(id),
            assessment_id INTEGER REFERENCES clinical_assessments(id),
            nama_program TEXT NOT NULL,
            tujuan TEXT,
            deskripsi TEXT,
            frekuensi TEXT,
            durasi_minggu INTEGER,
            tanggal_mulai TEXT,
            tanggal_selesai TEXT,
            status TEXT DEFAULT 'aktif' CHECK (status IN ('aktif', 'selesai', 'dibatalkan')),
            jumlah_sesi_direncanakan INTEGER DEFAULT 0,
            jumlah_sesi_selesai INTEGER DEFAULT 0,
            catatan TEXT,
            created_at TEXT,
            updated_at TEXT
        );

        CREATE TABLE IF NOT EXISTS invoices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nomor_invoice TEXT NOT NULL UNIQUE,
            patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
            appointment_id INTEGER REFERENCES appointments(id),
            jumlah INTEGER NOT NULL,
            deskripsi TEXT,
            status TEXT DEFAULT 'belum_bayar' CHECK (status IN ('belum_bayar', 'sebagian', 'lunas')),
            tanggal_terbit TEXT NOT NULL,
            tanggal_jatuh_tempo TEXT,
            created_at TEXT,
            updated_at TEXT
        );

        CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
            jumlah INTEGER NOT NULL,
            metode_pembayaran TEXT CHECK (metode_pembayaran IN ('tunai', 'transfer', 'debit', 'kredit', 'qris')),
            tanggal_pembayaran TEXT NOT NULL,
            diterima_oleh INTEGER REFERENCES users(id),
            catatan TEXT,
            created_at TEXT
        );

        CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER REFERENCES users(id),
            action TEXT NOT NULL,
            table_name TEXT NOT NULL,
            record_id INTEGER,
            old_values TEXT,
            new_values TEXT,
            ip_address TEXT,
            user_agent TEXT,
            created_at TEXT
        );
    \`);

    console.log('✓ Tables created');

    // Create default admin user
    const adminPassword = await hash('admin123', {
        memoryCost: 19456,
        timeCost: 2,
        outputLen: 32,
        parallelism: 1
    });

    const terapisPassword = await hash('terapis123', {
        memoryCost: 19456,
        timeCost: 2,
        outputLen: 32,
        parallelism: 1
    });

    const now = new Date().toISOString();

    // Insert users
    db.prepare(\`
        INSERT OR IGNORE INTO users (username, email, password_hash, role, nama_lengkap, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    \`).run('admin', 'admin@sambungnyowo.com', adminPassword, 'admin', 'Administrator', 1, now, now);

    db.prepare(\`
        INSERT OR IGNORE INTO users (username, email, password_hash, role, nama_lengkap, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    \`).run('terapis1', 'terapis1@sambungnyowo.com', terapisPassword, 'fisioterapis', 'Dr. Budi Santoso', 1, now, now);

    db.prepare(\`
        INSERT OR IGNORE INTO users (username, email, password_hash, role, nama_lengkap, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    \`).run('terapis2', 'terapis2@sambungnyowo.com', terapisPassword, 'fisioterapis', 'Dr. Siti Rahayu', 1, now, now);

    console.log('✓ Default users created');

    // Insert sample patients
    db.prepare(\`
        INSERT OR IGNORE INTO patients (patient_id, nama_lengkap, tanggal_lahir, jenis_kelamin, alamat, no_telepon, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    \`).run('P-2025-0001', 'Ahmad Wijaya', '1985-03-15', 'L', 'Jl. Merdeka No. 123, Surakarta', '081234567890', now, now);

    db.prepare(\`
        INSERT OR IGNORE INTO patients (patient_id, nama_lengkap, tanggal_lahir, jenis_kelamin, alamat, no_telepon, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    \`).run('P-2025-0002', 'Siti Nurhaliza', '1990-07-22', 'P', 'Jl. Pahlawan No. 45, Surakarta', '082345678901', now, now);

    db.prepare(\`
        INSERT OR IGNORE INTO patients (patient_id, nama_lengkap, tanggal_lahir, jenis_kelamin, alamat, no_telepon, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    \`).run('P-2025-0003', 'Bambang Sutrisno', '1975-11-08', 'L', 'Jl. Diponegoro No. 78, Surakarta', '083456789012', now, now);

    console.log('✓ Sample patients created');

    db.close();
    console.log('✅ Database initialized successfully!');
}

init().catch(console.error);
"
else
    echo "✓ Database exists"
fi

echo "🚀 Starting application..."
exec node build
