// Script untuk reset database ke kondisi awal (hapus semua data + seed ulang)
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { hash } from '@node-rs/argon2';
import { sql } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';

// Import all schema tables
import {
	users,
	sessions,
	patients,
	appointments,
	assessments,
	sessionNotes,
	treatmentPlans,
	invoices,
	payments,
	auditLogs
} from '../src/lib/server/db/schema/index.js';

const DB_PATH = './data/healthcare.db';

async function reset() {
	console.log('🔄 Memulai reset database...\n');

	// Ensure data directory exists
	const dataDir = path.dirname(DB_PATH);
	if (!fs.existsSync(dataDir)) {
		fs.mkdirSync(dataDir, { recursive: true });
	}

	// Try to delete the file first, if not possible, truncate tables
	let freshDatabase = false;
	
	if (fs.existsSync(DB_PATH)) {
		try {
			console.log('🗑️  Mencoba menghapus database lama...');
			fs.unlinkSync(DB_PATH);
			// Also remove WAL and SHM files if they exist
			if (fs.existsSync(DB_PATH + '-wal')) fs.unlinkSync(DB_PATH + '-wal');
			if (fs.existsSync(DB_PATH + '-shm')) fs.unlinkSync(DB_PATH + '-shm');
			freshDatabase = true;
			console.log('✓  Database lama dihapus.\n');
		} catch (err) {
			console.log('⚠️  Database sedang digunakan, akan melakukan truncate tables...\n');
			freshDatabase = false;
		}
	} else {
		freshDatabase = true;
	}

	// Create database connection
	const sqlite = new Database(DB_PATH);
	const db = drizzle(sqlite);

	if (!freshDatabase) {
		// Truncate all tables in reverse order (to respect foreign keys)
		console.log('🧹 Menghapus semua data dari tabel...');
		sqlite.exec(`
			PRAGMA foreign_keys = OFF;
			DELETE FROM audit_logs;
			DELETE FROM payments;
			DELETE FROM invoices;
			DELETE FROM session_notes;
			DELETE FROM treatment_plans;
			DELETE FROM assessments;
			DELETE FROM appointments;
			DELETE FROM sessions;
			DELETE FROM patients;
			DELETE FROM users;
			DELETE FROM sqlite_sequence;
			PRAGMA foreign_keys = ON;
		`);
		console.log('✓  Semua data dihapus.\n');
	} else {
		console.log('📦 Membuat struktur tabel...');
	}

	// Create tables using raw SQL (same as schema) - only if fresh
	if (freshDatabase) {
		sqlite.exec(`
		-- Users table
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

		-- Sessions table
		CREATE TABLE IF NOT EXISTS sessions (
			id TEXT PRIMARY KEY,
			user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			expires_at INTEGER NOT NULL,
			created_at TEXT
		);

		-- Patients table
		CREATE TABLE IF NOT EXISTS patients (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			patient_id TEXT NOT NULL UNIQUE,
			nama_lengkap TEXT NOT NULL,
			tanggal_lahir TEXT NOT NULL,
			jenis_kelamin TEXT NOT NULL CHECK (jenis_kelamin IN ('laki-laki', 'perempuan')),
			no_telepon TEXT,
			email TEXT,
			alamat TEXT,
			kontak_darurat TEXT,
			telepon_darurat TEXT,
			persetujuan_diberikan INTEGER DEFAULT 0,
			tanggal_persetujuan TEXT,
			created_at TEXT,
			updated_at TEXT,
			created_by INTEGER REFERENCES users(id)
		);

		-- Appointments table
		CREATE TABLE IF NOT EXISTS appointments (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
			fisioterapis_id INTEGER NOT NULL REFERENCES users(id),
			tanggal_waktu TEXT NOT NULL,
			durasi_menit INTEGER DEFAULT 60,
			status TEXT DEFAULT 'dijadwalkan' CHECK (status IN ('dijadwalkan', 'selesai', 'dibatalkan', 'tidak_hadir')),
			catatan TEXT,
			created_at TEXT,
			updated_at TEXT
		);

		-- Assessments table
		CREATE TABLE IF NOT EXISTS assessments (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
			fisioterapis_id INTEGER NOT NULL REFERENCES users(id),
			tanggal_assessment TEXT NOT NULL,
			keluhan_utama TEXT NOT NULL,
			kondisi_cedera TEXT,
			bagian_tubuh_terdampak TEXT,
			skala_nyeri INTEGER,
			catatan_rom TEXT,
			catatan_tambahan TEXT,
			created_at TEXT,
			updated_at TEXT
		);

		-- Session Notes table
		CREATE TABLE IF NOT EXISTS session_notes (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			appointment_id INTEGER REFERENCES appointments(id) ON DELETE SET NULL,
			patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
			fisioterapis_id INTEGER NOT NULL REFERENCES users(id),
			tanggal_sesi TEXT NOT NULL,
			subjective TEXT NOT NULL,
			objective TEXT NOT NULL,
			assessment TEXT NOT NULL,
			plan TEXT NOT NULL,
			tindakan_dilakukan TEXT,
			durasi_menit INTEGER DEFAULT 60,
			created_at TEXT,
			updated_at TEXT
		);

		-- Treatment Plans table
		CREATE TABLE IF NOT EXISTS treatment_plans (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
			fisioterapis_id INTEGER NOT NULL REFERENCES users(id),
			diagnosis TEXT,
			tujuan TEXT,
			jumlah_sesi_direncanakan INTEGER,
			jumlah_sesi_selesai INTEGER DEFAULT 0,
			status TEXT DEFAULT 'direncanakan' CHECK (status IN ('direncanakan', 'berlangsung', 'selesai', 'dihentikan')),
			tanggal_mulai TEXT,
			tanggal_selesai TEXT,
			catatan TEXT,
			created_at TEXT,
			updated_at TEXT
		);

		-- Invoices table
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

		-- Payments table
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

		-- Audit Logs table
		CREATE TABLE IF NOT EXISTS audit_logs (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER REFERENCES users(id),
			aksi TEXT NOT NULL CHECK (aksi IN ('CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT')),
			nama_tabel TEXT NOT NULL,
			record_id INTEGER,
			nilai_lama TEXT,
			nilai_baru TEXT,
			ip_address TEXT,
			user_agent TEXT,
			timestamp TEXT
		);
	`);
	}

	console.log('🌱 Menyisipkan data awal (seed)...\n');

	const now = new Date().toISOString();

	// Hash password
	const adminPassword = await hash('admin123', {
		memoryCost: 19456,
		timeCost: 2,
		parallelism: 1
	});

	const terapisPassword = await hash('terapis123', {
		memoryCost: 19456,
		timeCost: 2,
		parallelism: 1
	});

	// Buat user Admin
	await db.insert(users).values({
		username: 'admin',
		email: 'admin@sambungnyowo.com',
		passwordHash: adminPassword,
		role: 'admin',
		namaLengkap: 'Administrator',
		noTelepon: '081234567890',
		isActive: true
	});

	// Buat user Fisioterapis 1
	await db.insert(users).values({
		username: 'terapis1',
		email: 'terapis1@sambungnyowo.com',
		passwordHash: terapisPassword,
		role: 'fisioterapis',
		namaLengkap: 'Dr. Budi Santoso, S.Ft',
		noTelepon: '081234567891',
		isActive: true
	});

	// Buat user Fisioterapis 2
	await db.insert(users).values({
		username: 'terapis2',
		email: 'terapis2@sambungnyowo.com',
		passwordHash: terapisPassword,
		role: 'fisioterapis',
		namaLengkap: 'Dr. Siti Rahayu, S.Ft',
		noTelepon: '081234567892',
		isActive: true
	});

	// Buat beberapa pasien contoh (10 pasien)
	const samplePatients = [
		{
			patientId: 'PT-2024-00001',
			namaLengkap: 'Ahmad Wijaya',
			tanggalLahir: '1985-05-15',
			jenisKelamin: 'laki-laki' as const,
			noTelepon: '081111111111',
			email: 'ahmad@email.com',
			alamat: 'Jl. Merdeka No. 123, Solo',
			kontakDarurat: 'Siti Wijaya',
			teleponDarurat: '081111111112',
			persetujuanDiberikan: true,
			tanggalPersetujuan: now
		},
		{
			patientId: 'PT-2024-00002',
			namaLengkap: 'Dewi Lestari',
			tanggalLahir: '1990-08-20',
			jenisKelamin: 'perempuan' as const,
			noTelepon: '082222222222',
			email: 'dewi@email.com',
			alamat: 'Jl. Pahlawan No. 45, Solo',
			kontakDarurat: 'Budi Lestari',
			teleponDarurat: '082222222223',
			persetujuanDiberikan: true,
			tanggalPersetujuan: now
		},
		{
			patientId: 'PT-2024-00003',
			namaLengkap: 'Bambang Susanto',
			tanggalLahir: '1975-12-10',
			jenisKelamin: 'laki-laki' as const,
			noTelepon: '083333333333',
			alamat: 'Jl. Sudirman No. 78, Sukoharjo',
			persetujuanDiberikan: true,
			tanggalPersetujuan: now
		},
		{
			patientId: 'PT-2024-00004',
			namaLengkap: 'Sari Rahmawati',
			tanggalLahir: '1988-03-25',
			jenisKelamin: 'perempuan' as const,
			noTelepon: '084444444444',
			email: 'sari.rahma@email.com',
			alamat: 'Jl. Gatot Subroto No. 56, Kartasura',
			kontakDarurat: 'Agus Rahmawati',
			teleponDarurat: '084444444445',
			persetujuanDiberikan: true,
			tanggalPersetujuan: now
		},
		{
			patientId: 'PT-2024-00005',
			namaLengkap: 'Hendra Kurniawan',
			tanggalLahir: '1970-11-08',
			jenisKelamin: 'laki-laki' as const,
			noTelepon: '085555555555',
			alamat: 'Jl. Ahmad Yani No. 90, Solo',
			persetujuanDiberikan: true,
			tanggalPersetujuan: now
		},
		{
			patientId: 'PT-2024-00006',
			namaLengkap: 'Rina Kusuma',
			tanggalLahir: '1995-07-12',
			jenisKelamin: 'perempuan' as const,
			noTelepon: '086666666666',
			email: 'rina.kusuma@email.com',
			alamat: 'Jl. Slamet Riyadi No. 200, Solo',
			kontakDarurat: 'Dian Kusuma',
			teleponDarurat: '086666666667',
			persetujuanDiberikan: true,
			tanggalPersetujuan: now
		},
		{
			patientId: 'PT-2024-00007',
			namaLengkap: 'Eko Prasetyo',
			tanggalLahir: '1982-09-30',
			jenisKelamin: 'laki-laki' as const,
			noTelepon: '087777777777',
			alamat: 'Jl. Veteran No. 15, Boyolali',
			persetujuanDiberikan: true,
			tanggalPersetujuan: now
		},
		{
			patientId: 'PT-2024-00008',
			namaLengkap: 'Maya Saptiani',
			tanggalLahir: '1992-02-14',
			jenisKelamin: 'perempuan' as const,
			noTelepon: '088888888888',
			email: 'maya.s@email.com',
			alamat: 'Jl. Diponegoro No. 33, Klaten',
			kontakDarurat: 'Yusuf Saptiani',
			teleponDarurat: '088888888889',
			persetujuanDiberikan: true,
			tanggalPersetujuan: now
		},
		{
			patientId: 'PT-2024-00009',
			namaLengkap: 'Rudi Hartono',
			tanggalLahir: '1968-06-22',
			jenisKelamin: 'laki-laki' as const,
			noTelepon: '089999999999',
			alamat: 'Jl. Pemuda No. 88, Sukoharjo',
			persetujuanDiberikan: true,
			tanggalPersetujuan: now
		},
		{
			patientId: 'PT-2024-00010',
			namaLengkap: 'Linda Permatasari',
			tanggalLahir: '1998-12-05',
			jenisKelamin: 'perempuan' as const,
			noTelepon: '081010101010',
			email: 'linda.permata@email.com',
			alamat: 'Jl. Mangkubumi No. 12, Solo',
			kontakDarurat: 'Bima Permata',
			teleponDarurat: '081010101011',
			persetujuanDiberikan: true,
			tanggalPersetujuan: now
		}
	];

	for (const patient of samplePatients) {
		await db.insert(patients).values(patient);
	}

	// Helper function untuk generate tanggal
	const getDateTimeStr = (daysFromNow: number, hour: number = 9, minute: number = 0) => {
		const date = new Date();
		date.setDate(date.getDate() + daysFromNow);
		date.setHours(hour, minute, 0, 0);
		return date.toISOString();
	};

	const getDateOnly = (daysFromNow: number) => {
		const date = new Date();
		date.setDate(date.getDate() + daysFromNow);
		return date.toISOString().split('T')[0];
	};

	// Import appointments, assessments, sessionNotes, treatmentPlans, invoices, payments
	const { appointments } = await import('../src/lib/server/db/schema/appointments');
	const { assessments, sessionNotes } = await import('../src/lib/server/db/schema/clinical');
	const { treatmentPlans } = await import('../src/lib/server/db/schema/treatments');
	const { invoices, payments } = await import('../src/lib/server/db/schema/billing');

	// Seed Appointments (mix of past and future)
	const appointmentData = [
		// Past appointments (completed)
		{ patientId: 1, fisioterapisId: 2, tanggalWaktu: getDateTimeStr(-28, 9), durasiMenit: 60, status: 'selesai' as const, catatan: 'Sesi pertama, assessment awal' },
		{ patientId: 1, fisioterapisId: 2, tanggalWaktu: getDateTimeStr(-21, 9), durasiMenit: 60, status: 'selesai' as const, catatan: 'Sesi kedua, latihan ROM' },
		{ patientId: 1, fisioterapisId: 2, tanggalWaktu: getDateTimeStr(-14, 9), durasiMenit: 60, status: 'selesai' as const, catatan: 'Sesi ketiga, progress baik' },
		{ patientId: 1, fisioterapisId: 2, tanggalWaktu: getDateTimeStr(-7, 9), durasiMenit: 60, status: 'selesai' as const, catatan: 'Sesi keempat' },
		{ patientId: 2, fisioterapisId: 3, tanggalWaktu: getDateTimeStr(-25, 10), durasiMenit: 45, status: 'selesai' as const, catatan: 'Assessment awal post-stroke' },
		{ patientId: 2, fisioterapisId: 3, tanggalWaktu: getDateTimeStr(-18, 10), durasiMenit: 45, status: 'selesai' as const, catatan: 'Latihan keseimbangan' },
		{ patientId: 2, fisioterapisId: 3, tanggalWaktu: getDateTimeStr(-11, 10), durasiMenit: 45, status: 'selesai' as const, catatan: 'Progress baik' },
		{ patientId: 3, fisioterapisId: 2, tanggalWaktu: getDateTimeStr(-20, 14), durasiMenit: 60, status: 'selesai' as const, catatan: 'Terapi nyeri punggung bawah' },
		{ patientId: 3, fisioterapisId: 2, tanggalWaktu: getDateTimeStr(-13, 14), durasiMenit: 60, status: 'selesai' as const, catatan: 'Latihan core strengthening' },
		{ patientId: 4, fisioterapisId: 3, tanggalWaktu: getDateTimeStr(-22, 11), durasiMenit: 60, status: 'selesai' as const, catatan: 'Assessment cedera lutut' },
		{ patientId: 4, fisioterapisId: 3, tanggalWaktu: getDateTimeStr(-15, 11), durasiMenit: 60, status: 'selesai' as const, catatan: 'Latihan penguatan quadriceps' },
		{ patientId: 4, fisioterapisId: 3, tanggalWaktu: getDateTimeStr(-8, 11), durasiMenit: 60, status: 'selesai' as const, catatan: 'Progress signifikan' },
		{ patientId: 5, fisioterapisId: 2, tanggalWaktu: getDateTimeStr(-19, 15), durasiMenit: 45, status: 'selesai' as const, catatan: 'Terapi frozen shoulder' },
		{ patientId: 5, fisioterapisId: 2, tanggalWaktu: getDateTimeStr(-12, 15), durasiMenit: 45, status: 'selesai' as const, catatan: 'Mobilisasi sendi bahu' },
		{ patientId: 6, fisioterapisId: 3, tanggalWaktu: getDateTimeStr(-17, 9), durasiMenit: 60, status: 'selesai' as const, catatan: 'Assessment nyeri leher' },
		{ patientId: 6, fisioterapisId: 3, tanggalWaktu: getDateTimeStr(-10, 9), durasiMenit: 60, status: 'selesai' as const, catatan: 'Terapi manual dan stretching' },
		{ patientId: 7, fisioterapisId: 2, tanggalWaktu: getDateTimeStr(-16, 16), durasiMenit: 60, status: 'dibatalkan' as const, catatan: 'Pasien berhalangan' },
		{ patientId: 7, fisioterapisId: 2, tanggalWaktu: getDateTimeStr(-9, 16), durasiMenit: 60, status: 'selesai' as const, catatan: 'Reschedule - terapi ankle sprain' },
		{ patientId: 8, fisioterapisId: 3, tanggalWaktu: getDateTimeStr(-14, 13), durasiMenit: 45, status: 'selesai' as const, catatan: 'Assessment carpal tunnel syndrome' },
		{ patientId: 9, fisioterapisId: 2, tanggalWaktu: getDateTimeStr(-23, 10), durasiMenit: 60, status: 'selesai' as const, catatan: 'Terapi osteoarthritis lutut' },
		{ patientId: 9, fisioterapisId: 2, tanggalWaktu: getDateTimeStr(-16, 10), durasiMenit: 60, status: 'tidak_hadir' as const, catatan: 'Pasien tidak hadir tanpa konfirmasi' },
		{ patientId: 9, fisioterapisId: 2, tanggalWaktu: getDateTimeStr(-9, 10), durasiMenit: 60, status: 'selesai' as const, catatan: 'Lanjutan terapi OA' },
		{ patientId: 10, fisioterapisId: 3, tanggalWaktu: getDateTimeStr(-11, 14), durasiMenit: 45, status: 'selesai' as const, catatan: 'Assessment sports injury' },
		// Upcoming appointments
		{ patientId: 1, fisioterapisId: 2, tanggalWaktu: getDateTimeStr(1, 9), durasiMenit: 60, status: 'dijadwalkan' as const, catatan: 'Sesi kelima - evaluasi progress' },
		{ patientId: 2, fisioterapisId: 3, tanggalWaktu: getDateTimeStr(2, 10), durasiMenit: 45, status: 'dijadwalkan' as const, catatan: 'Lanjutan terapi stroke' },
		{ patientId: 3, fisioterapisId: 2, tanggalWaktu: getDateTimeStr(1, 14), durasiMenit: 60, status: 'dijadwalkan' as const, catatan: 'Evaluasi LBP' },
		{ patientId: 4, fisioterapisId: 3, tanggalWaktu: getDateTimeStr(3, 11), durasiMenit: 60, status: 'dijadwalkan' as const, catatan: 'Sesi keempat lutut' },
		{ patientId: 5, fisioterapisId: 2, tanggalWaktu: getDateTimeStr(2, 15), durasiMenit: 45, status: 'dijadwalkan' as const, catatan: 'Lanjutan frozen shoulder' },
		{ patientId: 6, fisioterapisId: 3, tanggalWaktu: getDateTimeStr(4, 9), durasiMenit: 60, status: 'dijadwalkan' as const, catatan: 'Sesi ketiga nyeri leher' },
		{ patientId: 8, fisioterapisId: 3, tanggalWaktu: getDateTimeStr(5, 13), durasiMenit: 45, status: 'dijadwalkan' as const, catatan: 'Lanjutan CTS' },
		{ patientId: 10, fisioterapisId: 3, tanggalWaktu: getDateTimeStr(3, 14), durasiMenit: 45, status: 'dijadwalkan' as const, catatan: 'Sesi kedua sports injury' }
	];

	for (const apt of appointmentData) {
		await db.insert(appointments).values(apt);
	}

	// Seed Assessments
	const assessmentData = [
		{
			patientId: 1,
			fisioterapisId: 2,
			tanggalAssessment: getDateOnly(-28),
			keluhanUtama: 'Nyeri punggung bawah setelah mengangkat beban berat 2 minggu yang lalu',
			kondisiCedera: 'Strain otot lumbar akut',
			bagianTubuhTerdampak: 'Lower back (L4-L5)',
			skalaNyeri: 7,
			catatanROM: 'Fleksi lumbar terbatas 50%, ekstensi terbatas 30%, lateral fleksi terbatas bilateral',
			catatanTambahan: 'Pasien bekerja sebagai pekerja gudang, sering mengangkat beban berat'
		},
		{
			patientId: 2,
			fisioterapisId: 3,
			tanggalAssessment: getDateOnly(-25),
			keluhanUtama: 'Kelemahan sisi kanan tubuh pasca stroke 1 bulan yang lalu',
			kondisiCedera: 'Post-stroke hemiparesis',
			bagianTubuhTerdampak: 'Ekstremitas atas dan bawah kanan',
			skalaNyeri: 3,
			catatanROM: 'ROM aktif terbatas pada sisi kanan, kekuatan otot 3/5',
			catatanTambahan: 'Pasien memerlukan bantuan untuk ADL, menggunakan tongkat untuk berjalan'
		},
		{
			patientId: 3,
			fisioterapisId: 2,
			tanggalAssessment: getDateOnly(-20),
			keluhanUtama: 'Nyeri punggung bawah kronik sudah 6 bulan',
			kondisiCedera: 'Chronic low back pain',
			bagianTubuhTerdampak: 'Lumbar spine',
			skalaNyeri: 5,
			catatanROM: 'ROM lumbar sedikit terbatas, core stability lemah',
			catatanTambahan: 'Riwayat pekerjaan kantoran dengan postur duduk yang buruk'
		},
		{
			patientId: 4,
			fisioterapisId: 3,
			tanggalAssessment: getDateOnly(-22),
			keluhanUtama: 'Nyeri lutut kanan setelah bermain futsal',
			kondisiCedera: 'Ligament strain grade II (MCL)',
			bagianTubuhTerdampak: 'Lutut kanan - medial',
			skalaNyeri: 6,
			catatanROM: 'Fleksi lutut terbatas 100 derajat, nyeri pada valgus stress test',
			catatanTambahan: 'Pasien atlet amatir, ingin kembali bermain futsal'
		},
		{
			patientId: 5,
			fisioterapisId: 2,
			tanggalAssessment: getDateOnly(-19),
			keluhanUtama: 'Tidak bisa mengangkat tangan kiri ke atas sudah 3 bulan',
			kondisiCedera: 'Frozen shoulder (adhesive capsulitis)',
			bagianTubuhTerdampak: 'Sendi bahu kiri',
			skalaNyeri: 6,
			catatanROM: 'Abduksi 60 derajat, fleksi 90 derajat, rotasi eksternal sangat terbatas',
			catatanTambahan: 'Pasien diabetes, riwayat frozen shoulder kontralateral 2 tahun lalu'
		},
		{
			patientId: 6,
			fisioterapisId: 3,
			tanggalAssessment: getDateOnly(-17),
			keluhanUtama: 'Nyeri leher dan pundak, sering pusing',
			kondisiCedera: 'Cervical spondylosis dengan tension headache',
			bagianTubuhTerdampak: 'Cervical spine (C5-C7), upper trapezius bilateral',
			skalaNyeri: 5,
			catatanROM: 'Rotasi cervical terbatas bilateral, trigger points pada upper trapezius',
			catatanTambahan: 'Pasien bekerja di depan komputer 8+ jam sehari'
		},
		{
			patientId: 7,
			fisioterapisId: 2,
			tanggalAssessment: getDateOnly(-9),
			keluhanUtama: 'Keseleo pergelangan kaki kiri saat bermain basket',
			kondisiCedera: 'Ankle sprain grade I',
			bagianTubuhTerdampak: 'Pergelangan kaki kiri - lateral',
			skalaNyeri: 4,
			catatanROM: 'Dorsofleksi dan inversi terbatas, swelling minimal',
			catatanTambahan: 'Cedera terjadi 1 minggu yang lalu, sudah RICE di rumah'
		},
		{
			patientId: 8,
			fisioterapisId: 3,
			tanggalAssessment: getDateOnly(-14),
			keluhanUtama: 'Kesemutan dan nyeri pada tangan kanan terutama malam hari',
			kondisiCedera: 'Carpal Tunnel Syndrome',
			bagianTubuhTerdampak: 'Pergelangan tangan kanan, jari 1-3',
			skalaNyeri: 4,
			catatanROM: 'ROM normal, Phalen test positif, Tinel sign positif',
			catatanTambahan: 'Pasien banyak mengetik untuk pekerjaan, gejala sudah 2 bulan'
		},
		{
			patientId: 9,
			fisioterapisId: 2,
			tanggalAssessment: getDateOnly(-23),
			keluhanUtama: 'Nyeri lutut bilateral terutama saat naik tangga',
			kondisiCedera: 'Bilateral knee osteoarthritis grade II',
			bagianTubuhTerdampak: 'Lutut bilateral',
			skalaNyeri: 5,
			catatanROM: 'Fleksi lutut 120 derajat bilateral, krepitus terdengar',
			catatanTambahan: 'Pasien berusia 56 tahun, BMI 28, riwayat kerja berdiri lama'
		},
		{
			patientId: 10,
			fisioterapisId: 3,
			tanggalAssessment: getDateOnly(-11),
			keluhanUtama: 'Nyeri hamstring kanan setelah sprint',
			kondisiCedera: 'Hamstring strain grade I',
			bagianTubuhTerdampak: 'Hamstring kanan - biceps femoris',
			skalaNyeri: 5,
			catatanROM: 'SLR terbatas 60 derajat, nyeri pada kontraksi resistif',
			catatanTambahan: 'Mahasiswa atlet voli, cedera terjadi saat pemanasan kurang'
		}
	];

	for (const assessment of assessmentData) {
		await db.insert(assessments).values(assessment);
	}

	// Seed Session Notes (SOAP)
	const sessionNotesData = [
		{
			appointmentId: 1,
			patientId: 1,
			fisioterapisId: 2,
			tanggalSesi: getDateOnly(-28),
			subjective: 'Pasien mengeluh nyeri punggung bawah 7/10, nyeri meningkat saat membungkuk dan duduk lama',
			objective: 'ROM lumbar: fleksi 50%, ekstensi 30%. Palpasi: tenderness pada L4-L5. SLR negatif bilateral.',
			assessment: 'Acute lumbar strain dengan muscle spasm. Prognosis baik dengan terapi konservatif.',
			plan: 'TENS 20 menit, ultrasound, manual therapy, edukasi postur, latihan stretching di rumah',
			tindakanDilakukan: 'TENS pada area lumbar, ultrasound 1 MHz 1.5 W/cm2, soft tissue mobilization',
			durasiMenit: 60
		},
		{
			appointmentId: 2,
			patientId: 1,
			fisioterapisId: 2,
			tanggalSesi: getDateOnly(-21),
			subjective: 'Nyeri berkurang menjadi 5/10. Sudah bisa duduk lebih lama. Latihan di rumah dilakukan rutin.',
			objective: 'ROM lumbar membaik: fleksi 70%, ekstensi 50%. Muscle spasm berkurang.',
			assessment: 'Perbaikan signifikan. Pasien respons baik terhadap terapi.',
			plan: 'Lanjutkan manual therapy, mulai latihan core stabilization, progresif stretching',
			tindakanDilakukan: 'Manual therapy, core activation exercises, McKenzie extension exercises',
			durasiMenit: 60
		},
		{
			appointmentId: 3,
			patientId: 1,
			fisioterapisId: 2,
			tanggalSesi: getDateOnly(-14),
			subjective: 'Nyeri berkurang 3/10. Sudah bisa beraktivitas normal ringan. Masih menghindari mengangkat berat.',
			objective: 'ROM lumbar hampir normal. Core stability meningkat. Postur membaik.',
			assessment: 'Progress sangat baik. Siap untuk fase penguatan.',
			plan: 'Intensifikasi core strengthening, persiapan return to work',
			tindakanDilakukan: 'Progressive core exercises, functional training, work simulation',
			durasiMenit: 60
		},
		{
			appointmentId: 5,
			patientId: 2,
			fisioterapisId: 3,
			tanggalSesi: getDateOnly(-25),
			subjective: 'Pasien post-stroke 1 bulan, kesulitan menggerakkan sisi kanan, butuh bantuan untuk aktivitas sehari-hari',
			objective: 'Kekuatan otot sisi kanan: upper 3/5, lower 3/5. Keseimbangan duduk baik, berdiri dengan bantuan.',
			assessment: 'Post-stroke hemiparesis kanan, fase subakut. Potensi pemulihan baik.',
			plan: 'Neuro-rehab exercises, gait training, ADL training, home exercise program',
			tindakanDilakukan: 'PNF patterns upper dan lower limb, weight shifting exercises, assisted gait',
			durasiMenit: 45
		},
		{
			appointmentId: 6,
			patientId: 2,
			fisioterapisId: 3,
			tanggalSesi: getDateOnly(-18),
			subjective: 'Merasa lebih kuat, sudah bisa berjalan dengan tongkat di rumah. Masih kesulitan menggenggam.',
			objective: 'Kekuatan meningkat: upper 3+/5, lower 4-/5. Gait dengan tongkat stabil.',
			assessment: 'Progress baik. Perlu fokus pada fine motor control tangan.',
			plan: 'Intensifikasi upper limb exercises, fine motor training, gait independence',
			tindakanDilakukan: 'Hand dexterity exercises, functional reaching, gait training without device',
			durasiMenit: 45
		},
		{
			appointmentId: 8,
			patientId: 3,
			fisioterapisId: 2,
			tanggalSesi: getDateOnly(-20),
			subjective: 'Nyeri punggung kronik 5/10, memburuk saat duduk lama di kantor, membaik saat berbaring',
			objective: 'Postur: forward head posture, rounded shoulders, anterior pelvic tilt. Core stability lemah.',
			assessment: 'Chronic mechanical low back pain dengan postural dysfunction.',
			plan: 'Postural correction, core stabilization, ergonomic education, stretching program',
			tindakanDilakukan: 'Postural assessment, core activation training, ergonomic counseling',
			durasiMenit: 60
		},
		{
			appointmentId: 10,
			patientId: 4,
			fisioterapisId: 3,
			tanggalSesi: getDateOnly(-22),
			subjective: 'Nyeri lutut kanan 6/10 setelah cedera futsal 1 minggu lalu. Bengkak sudah berkurang.',
			objective: 'Swelling minimal, ROM fleksi 100 derajat, valgus stress test positif grade II.',
			assessment: 'MCL sprain grade II. Perlu proteksi dan strengthening bertahap.',
			plan: 'Protected ROM exercises, quadriceps strengthening, bracing',
			tindakanDilakukan: 'Ice, e-stim, gentle ROM, quad sets, SLR exercises',
			durasiMenit: 60
		},
		{
			appointmentId: 11,
			patientId: 4,
			fisioterapisId: 3,
			tanggalSesi: getDateOnly(-15),
			subjective: 'Nyeri berkurang 4/10. Sudah bisa jalan normal tanpa pincang. Belum berani lari.',
			objective: 'ROM fleksi meningkat 120 derajat, stabilitas membaik, quadriceps strength 4/5.',
			assessment: 'Progress baik. Siap untuk fase strengthening lanjutan.',
			plan: 'Progressive strengthening, proprioceptive training, sport-specific preparation',
			tindakanDilakukan: 'Closed chain exercises, balance board, mini squats',
			durasiMenit: 60
		},
		{
			appointmentId: 13,
			patientId: 5,
			fisioterapisId: 2,
			tanggalSesi: getDateOnly(-19),
			subjective: 'Tidak bisa mengangkat tangan kiri ke atas, nyeri 6/10, tidur terganggu karena nyeri',
			objective: 'ROM: abduksi 60°, fleksi 90°, rotasi eksternal 10°. Capsular pattern positif.',
			assessment: 'Frozen shoulder fase freezing. Perlu mobilisasi agresif tapi bertahap.',
			plan: 'Joint mobilization, stretching, pendulum exercises, home program',
			tindakanDilakukan: 'Maitland mobilization grade II-III, capsular stretching, heat therapy',
			durasiMenit: 45
		},
		{
			appointmentId: 15,
			patientId: 6,
			fisioterapisId: 3,
			tanggalSesi: getDateOnly(-17),
			subjective: 'Nyeri leher 5/10, sering pusing saat menoleh, tegang di pundak, sakit kepala 3x seminggu',
			objective: 'ROM cervical: rotasi terbatas 50% bilateral, trigger points upper trapezius dan levator scapulae.',
			assessment: 'Cervicogenic headache dengan myofascial pain syndrome.',
			plan: 'Manual therapy cervical, trigger point release, postural correction, ergonomic advice',
			tindakanDilakukan: 'Cervical mobilization, dry needling trigger points, postural taping',
			durasiMenit: 60
		},
		{
			appointmentId: 18,
			patientId: 7,
			fisioterapisId: 2,
			tanggalSesi: getDateOnly(-9),
			subjective: 'Keseleo ankle 1 minggu lalu, nyeri 4/10, bengkak sudah berkurang dengan RICE',
			objective: 'Swelling minimal, ROM dorsofleksi 10°, ankle drawer test negatif.',
			assessment: 'Ankle sprain grade I, fase subakut. Prognosis sangat baik.',
			plan: 'ROM exercises, proprioceptive training, progressive weight bearing',
			tindakanDilakukan: 'Ankle ROM exercises, towel stretches, single leg stance, theraband exercises',
			durasiMenit: 60
		},
		{
			appointmentId: 19,
			patientId: 8,
			fisioterapisId: 3,
			tanggalSesi: getDateOnly(-14),
			subjective: 'Kesemutan tangan kanan terutama malam hari, nyeri 4/10, sulit menggenggam lama',
			objective: 'Phalen test positif 20 detik, Tinel sign positif, grip strength reduced.',
			assessment: 'Carpal tunnel syndrome moderate. Perlu dekompresi dan edukasi ergonomis.',
			plan: 'Nerve gliding, splinting malam hari, ergonomic modification, strengthening',
			tindakanDilakukan: 'Median nerve gliding exercises, wrist stretching, splint fitting',
			durasiMenit: 45
		},
		{
			appointmentId: 20,
			patientId: 9,
			fisioterapisId: 2,
			tanggalSesi: getDateOnly(-23),
			subjective: 'Nyeri lutut bilateral 5/10, terutama naik tangga dan berdiri dari duduk',
			objective: 'ROM fleksi 120° bilateral, krepitus +, quadriceps weakness bilateral.',
			assessment: 'Bilateral knee OA grade II. Perlu strengthening dan weight management.',
			plan: 'Quadriceps strengthening, aquatic therapy, weight loss counseling, knee protection',
			tindakanDilakukan: 'Isometric quad exercises, stationary cycling, ultrasound, ice',
			durasiMenit: 60
		},
		{
			appointmentId: 23,
			patientId: 10,
			fisioterapisId: 3,
			tanggalSesi: getDateOnly(-11),
			subjective: 'Nyeri hamstring kanan 5/10 setelah sprint saat latihan voli, sulit menendang',
			objective: 'SLR 60°, nyeri pada kontraksi resistif, tenderness pada biceps femoris.',
			assessment: 'Hamstring strain grade I. Recovery cepat dengan rehab yang tepat.',
			plan: 'RICE phase, gentle stretching, progressive strengthening, return to sport protocol',
			tindakanDilakukan: 'Ice, gentle hamstring stretches, isometric exercises, education',
			durasiMenit: 45
		}
	];

	for (const note of sessionNotesData) {
		await db.insert(sessionNotes).values(note);
	}

	// Seed Treatment Plans
	const treatmentPlansData = [
		{
			patientId: 1,
			fisioterapisId: 2,
			diagnosis: 'Acute Lumbar Strain',
			tujuan: 'Mengurangi nyeri, meningkatkan ROM, return to work',
			jumlahSesiDirencanakan: 8,
			jumlahSesiSelesai: 4,
			status: 'berlangsung' as const,
			tanggalMulai: getDateOnly(-28),
			catatan: 'Pasien bekerja sebagai pekerja gudang, target kembali bekerja dalam 6 minggu'
		},
		{
			patientId: 2,
			fisioterapisId: 3,
			diagnosis: 'Post-stroke Hemiparesis Kanan',
			tujuan: 'Meningkatkan kekuatan dan kemandirian ADL',
			jumlahSesiDirencanakan: 24,
			jumlahSesiSelesai: 3,
			status: 'berlangsung' as const,
			tanggalMulai: getDateOnly(-25),
			catatan: 'Program jangka panjang, evaluasi setiap bulan'
		},
		{
			patientId: 3,
			fisioterapisId: 2,
			diagnosis: 'Chronic Mechanical Low Back Pain',
			tujuan: 'Pain management, postural correction, core strengthening',
			jumlahSesiDirencanakan: 12,
			jumlahSesiSelesai: 2,
			status: 'berlangsung' as const,
			tanggalMulai: getDateOnly(-20),
			catatan: 'Perlu modifikasi ergonomis di tempat kerja'
		},
		{
			patientId: 4,
			fisioterapisId: 3,
			diagnosis: 'MCL Sprain Grade II',
			tujuan: 'Full recovery dan return to sport',
			jumlahSesiDirencanakan: 10,
			jumlahSesiSelesai: 3,
			status: 'berlangsung' as const,
			tanggalMulai: getDateOnly(-22),
			catatan: 'Target kembali bermain futsal dalam 8 minggu'
		},
		{
			patientId: 5,
			fisioterapisId: 2,
			diagnosis: 'Adhesive Capsulitis (Frozen Shoulder)',
			tujuan: 'Meningkatkan ROM dan mengurangi nyeri',
			jumlahSesiDirencanakan: 16,
			jumlahSesiSelesai: 2,
			status: 'berlangsung' as const,
			tanggalMulai: getDateOnly(-19),
			catatan: 'Kondisi memerlukan waktu 12-18 bulan untuk fully recover'
		},
		{
			patientId: 6,
			fisioterapisId: 3,
			diagnosis: 'Cervicogenic Headache & Myofascial Pain',
			tujuan: 'Mengurangi frekuensi sakit kepala dan nyeri leher',
			jumlahSesiDirencanakan: 8,
			jumlahSesiSelesai: 2,
			status: 'berlangsung' as const,
			tanggalMulai: getDateOnly(-17),
			catatan: 'Ergonomic assessment di tempat kerja sudah dilakukan'
		},
		{
			patientId: 7,
			fisioterapisId: 2,
			diagnosis: 'Lateral Ankle Sprain Grade I',
			tujuan: 'Full recovery dan prevention re-injury',
			jumlahSesiDirencanakan: 4,
			jumlahSesiSelesai: 1,
			status: 'berlangsung' as const,
			tanggalMulai: getDateOnly(-9),
			catatan: 'Recovery cepat, fokus pada proprioceptive training'
		},
		{
			patientId: 8,
			fisioterapisId: 3,
			diagnosis: 'Carpal Tunnel Syndrome',
			tujuan: 'Mengurangi gejala dan mencegah progresivitas',
			jumlahSesiDirencanakan: 6,
			jumlahSesiSelesai: 1,
			status: 'berlangsung' as const,
			tanggalMulai: getDateOnly(-14),
			catatan: 'Jika tidak membaik dalam 6 minggu, rujuk ke ortopedi'
		},
		{
			patientId: 9,
			fisioterapisId: 2,
			diagnosis: 'Bilateral Knee Osteoarthritis',
			tujuan: 'Pain management dan maintain function',
			jumlahSesiDirencanakan: 12,
			jumlahSesiSelesai: 2,
			status: 'berlangsung' as const,
			tanggalMulai: getDateOnly(-23),
			catatan: 'Pasien juga dirujuk ke ahli gizi untuk program weight loss'
		},
		{
			patientId: 10,
			fisioterapisId: 3,
			diagnosis: 'Hamstring Strain Grade I',
			tujuan: 'Full recovery dan return to sport',
			jumlahSesiDirencanakan: 6,
			jumlahSesiSelesai: 1,
			status: 'berlangsung' as const,
			tanggalMulai: getDateOnly(-11),
			catatan: 'Target kembali latihan voli dalam 3-4 minggu'
		}
	];

	for (const plan of treatmentPlansData) {
		await db.insert(treatmentPlans).values(plan);
	}

	// Seed Invoices
	const invoicesData = [
		{
			nomorInvoice: 'INV-202411-0001',
			patientId: 1,
			jumlah: 450000,
			deskripsi: 'Paket terapi 4 sesi - nyeri punggung bawah',
			status: 'lunas' as const,
			tanggalTerbit: getDateOnly(-28),
			tanggalJatuhTempo: getDateOnly(-14)
		},
		{
			nomorInvoice: 'INV-202411-0002',
			patientId: 2,
			jumlah: 350000,
			deskripsi: 'Paket terapi 3 sesi - rehabilitasi stroke',
			status: 'lunas' as const,
			tanggalTerbit: getDateOnly(-25),
			tanggalJatuhTempo: getDateOnly(-11)
		},
		{
			nomorInvoice: 'INV-202411-0003',
			patientId: 3,
			jumlah: 250000,
			deskripsi: 'Terapi 2 sesi - nyeri punggung kronik',
			status: 'sebagian' as const,
			tanggalTerbit: getDateOnly(-20),
			tanggalJatuhTempo: getDateOnly(-6)
		},
		{
			nomorInvoice: 'INV-202411-0004',
			patientId: 4,
			jumlah: 400000,
			deskripsi: 'Paket terapi cedera lutut 3 sesi',
			status: 'lunas' as const,
			tanggalTerbit: getDateOnly(-22),
			tanggalJatuhTempo: getDateOnly(-8)
		},
		{
			nomorInvoice: 'INV-202411-0005',
			patientId: 5,
			jumlah: 250000,
			deskripsi: 'Terapi frozen shoulder 2 sesi',
			status: 'belum_bayar' as const,
			tanggalTerbit: getDateOnly(-19),
			tanggalJatuhTempo: getDateOnly(-5)
		},
		{
			nomorInvoice: 'INV-202411-0006',
			patientId: 6,
			jumlah: 275000,
			deskripsi: 'Terapi nyeri leher 2 sesi + dry needling',
			status: 'lunas' as const,
			tanggalTerbit: getDateOnly(-17),
			tanggalJatuhTempo: getDateOnly(-3)
		},
		{
			nomorInvoice: 'INV-202411-0007',
			patientId: 7,
			jumlah: 150000,
			deskripsi: 'Terapi ankle sprain 1 sesi',
			status: 'lunas' as const,
			tanggalTerbit: getDateOnly(-9),
			tanggalJatuhTempo: getDateOnly(5)
		},
		{
			nomorInvoice: 'INV-202411-0008',
			patientId: 8,
			jumlah: 175000,
			deskripsi: 'Assessment dan terapi CTS 1 sesi',
			status: 'belum_bayar' as const,
			tanggalTerbit: getDateOnly(-14),
			tanggalJatuhTempo: getDateOnly(0)
		},
		{
			nomorInvoice: 'INV-202411-0009',
			patientId: 9,
			jumlah: 300000,
			deskripsi: 'Terapi OA lutut 2 sesi',
			status: 'lunas' as const,
			tanggalTerbit: getDateOnly(-23),
			tanggalJatuhTempo: getDateOnly(-9)
		},
		{
			nomorInvoice: 'INV-202411-0010',
			patientId: 10,
			jumlah: 150000,
			deskripsi: 'Assessment dan terapi hamstring 1 sesi',
			status: 'sebagian' as const,
			tanggalTerbit: getDateOnly(-11),
			tanggalJatuhTempo: getDateOnly(3)
		}
	];

	for (const invoice of invoicesData) {
		await db.insert(invoices).values(invoice);
	}

	// Seed Payments
	const paymentsData = [
		{ invoiceId: 1, jumlah: 450000, metodePembayaran: 'transfer' as const, tanggalPembayaran: getDateOnly(-26), diterimaOleh: 1, catatan: 'Transfer BCA' },
		{ invoiceId: 2, jumlah: 350000, metodePembayaran: 'tunai' as const, tanggalPembayaran: getDateOnly(-23), diterimaOleh: 1, catatan: null },
		{ invoiceId: 3, jumlah: 150000, metodePembayaran: 'qris' as const, tanggalPembayaran: getDateOnly(-18), diterimaOleh: 1, catatan: 'DP 150rb, sisa 100rb' },
		{ invoiceId: 4, jumlah: 400000, metodePembayaran: 'debit' as const, tanggalPembayaran: getDateOnly(-20), diterimaOleh: 1, catatan: 'Kartu Mandiri' },
		{ invoiceId: 6, jumlah: 275000, metodePembayaran: 'transfer' as const, tanggalPembayaran: getDateOnly(-15), diterimaOleh: 1, catatan: 'Transfer BRI' },
		{ invoiceId: 7, jumlah: 150000, metodePembayaran: 'tunai' as const, tanggalPembayaran: getDateOnly(-9), diterimaOleh: 1, catatan: null },
		{ invoiceId: 9, jumlah: 300000, metodePembayaran: 'kredit' as const, tanggalPembayaran: getDateOnly(-21), diterimaOleh: 1, catatan: 'Visa' },
		{ invoiceId: 10, jumlah: 100000, metodePembayaran: 'tunai' as const, tanggalPembayaran: getDateOnly(-10), diterimaOleh: 1, catatan: 'DP, sisa 50rb' }
	];

	for (const payment of paymentsData) {
		await db.insert(payments).values(payment);
	}

	console.log('✅ Reset database selesai!\n');
	console.log('═══════════════════════════════════════════');
	console.log('  📋 Akun Default yang Tersedia:');
	console.log('═══════════════════════════════════════════');
	console.log('  🔐 Admin:');
	console.log('     Username: admin');
	console.log('     Password: admin123');
	console.log('');
	console.log('  👨‍⚕️ Fisioterapis 1:');
	console.log('     Username: terapis1');
	console.log('     Password: terapis123');
	console.log('');
	console.log('  👩‍⚕️ Fisioterapis 2:');
	console.log('     Username: terapis2');
	console.log('     Password: terapis123');
	console.log('═══════════════════════════════════════════');
	console.log('  📊 Data Seed:');
	console.log('     - 10 pasien');
	console.log('     - 32 janji temu (24 selesai, 8 mendatang)');
	console.log('     - 10 assessment klinis');
	console.log('     - 14 catatan sesi (SOAP)');
	console.log('     - 10 rencana perawatan');
	console.log('     - 10 invoice');
	console.log('     - 8 pembayaran');
	console.log('═══════════════════════════════════════════\n');

	sqlite.close();
}

reset().catch(console.error);
