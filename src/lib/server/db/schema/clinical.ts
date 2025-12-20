import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { users } from './users';
import { patients } from './patients';
import { appointments } from './appointments';

// Tabel Assessments - Penilaian Awal Pasien
export const assessments = sqliteTable('assessments', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	patientId: integer('patient_id')
		.references(() => patients.id, { onDelete: 'cascade' })
		.notNull(),
	fisioterapisId: integer('fisioterapis_id')
		.references(() => users.id)
		.notNull(),
	tanggalAssessment: text('tanggal_assessment').notNull(), // YYYY-MM-DD
	keluhanUtama: text('keluhan_utama').notNull(),
	kondisiCedera: text('kondisi_cedera'),
	bagianTubuhTerdampak: text('bagian_tubuh_terdampak'),
	skalaNyeri: integer('skala_nyeri'), // 0-10
	catatanROM: text('catatan_rom'), // Range of Motion
	catatanTambahan: text('catatan_tambahan'),
	createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
	updatedAt: text('updated_at').$defaultFn(() => new Date().toISOString())
});

// Tabel Session Notes - Catatan Sesi Terapi (SOAP format)
export const sessionNotes = sqliteTable('session_notes', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	appointmentId: integer('appointment_id')
		.references(() => appointments.id, { onDelete: 'set null' }),
	patientId: integer('patient_id')
		.references(() => patients.id, { onDelete: 'cascade' })
		.notNull(),
	fisioterapisId: integer('fisioterapis_id')
		.references(() => users.id)
		.notNull(),
	tanggalSesi: text('tanggal_sesi').notNull(), // YYYY-MM-DD
	subjective: text('subjective').notNull(), // SOAP - S
	objective: text('objective').notNull(), // SOAP - O
	assessment: text('assessment').notNull(), // SOAP - A
	plan: text('plan').notNull(), // SOAP - P
	tindakanDilakukan: text('tindakan_dilakukan'),
	durasiMenit: integer('durasi_menit').default(60),
	createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
	updatedAt: text('updated_at').$defaultFn(() => new Date().toISOString())
});

export type Assessment = typeof assessments.$inferSelect;
export type NewAssessment = typeof assessments.$inferInsert;
export type SessionNote = typeof sessionNotes.$inferSelect;
export type NewSessionNote = typeof sessionNotes.$inferInsert;
