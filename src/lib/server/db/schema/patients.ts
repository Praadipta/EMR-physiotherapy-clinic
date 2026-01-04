import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { users } from './users';

// Tabel Patients - Data Pasien dengan field GDPR compliance
export const patients = sqliteTable('patients', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	patientId: text('patient_id').notNull().unique(), // Format: PT-2024-00001
	namaLengkap: text('nama_lengkap').notNull(),
	tanggalLahir: text('tanggal_lahir').notNull(), // ISO date string YYYY-MM-DD
	jenisKelamin: text('jenis_kelamin', { enum: ['laki-laki', 'perempuan'] }).notNull(),
	noTelepon: text('no_telepon'),
	email: text('email'),
	alamat: text('alamat'),
	kontakDarurat: text('kontak_darurat'),
	teleponDarurat: text('telepon_darurat'),

	// Clinical Information
	bloodType: text('blood_type', {
		enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown']
	}).default('unknown'),
	allergies: text('allergies'),                    // JSON array: [{allergen, severity, reaction}]
	medicalHistory: text('medical_history'),         // JSON object: {conditions, surgeries, familyHistory}
	currentMedications: text('current_medications'), // JSON array: [{name, dosage, frequency}]
	emergencyNotes: text('emergency_notes'),         // Important notes for emergency

	// GDPR Compliance
	persetujuanDiberikan: integer('persetujuan_diberikan', { mode: 'boolean' }).default(false),
	tanggalPersetujuan: text('tanggal_persetujuan'),
	// Metadata
	createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
	updatedAt: text('updated_at').$defaultFn(() => new Date().toISOString()),
	createdBy: integer('created_by').references(() => users.id)
});

export type Patient = typeof patients.$inferSelect;
export type NewPatient = typeof patients.$inferInsert;
