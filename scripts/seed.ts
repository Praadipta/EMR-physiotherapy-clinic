// Script untuk membuat data awal (seed)
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { hash } from '@node-rs/argon2';
import { users, patients } from '../src/lib/server/db/schema/index.js';

const sqlite = new Database('./data/healthcare.db');
const db = drizzle(sqlite);

async function seed() {
	console.log('🌱 Mulai seeding database...');

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
	}).onConflictDoNothing();

	// Buat user Fisioterapis 1
	await db.insert(users).values({
		username: 'terapis1',
		email: 'terapis1@sambungnyowo.com',
		passwordHash: terapisPassword,
		role: 'fisioterapis',
		namaLengkap: 'Dr. Budi Santoso, S.Ft',
		noTelepon: '081234567891',
		isActive: true
	}).onConflictDoNothing();

	// Buat user Fisioterapis 2
	await db.insert(users).values({
		username: 'terapis2',
		email: 'terapis2@sambungnyowo.com',
		passwordHash: terapisPassword,
		role: 'fisioterapis',
		namaLengkap: 'Dr. Siti Rahayu, S.Ft',
		noTelepon: '081234567892',
		isActive: true
	}).onConflictDoNothing();

	// Buat beberapa pasien contoh
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
		}
	];

	for (const patient of samplePatients) {
		await db.insert(patients).values(patient).onConflictDoNothing();
	}

	console.log('✅ Seeding selesai!');
	console.log('');
	console.log('Akun yang dibuat:');
	console.log('1. Admin: admin / admin123');
	console.log('2. Fisioterapis: terapis1 / terapis123');
	console.log('3. Fisioterapis: terapis2 / terapis123');

	sqlite.close();
}

seed().catch(console.error);
