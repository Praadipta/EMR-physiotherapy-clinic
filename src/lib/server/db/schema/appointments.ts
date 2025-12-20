import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { users } from './users';
import { patients } from './patients';

// Tabel Appointments - Jadwal Terapi
export const appointments = sqliteTable('appointments', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	patientId: integer('patient_id')
		.references(() => patients.id, { onDelete: 'cascade' })
		.notNull(),
	fisioterapisId: integer('fisioterapis_id')
		.references(() => users.id)
		.notNull(),
	tanggalWaktu: text('tanggal_waktu').notNull(), // ISO datetime string
	durasiMenit: integer('durasi_menit').default(60),
	status: text('status', {
		enum: ['dijadwalkan', 'selesai', 'dibatalkan', 'tidak_hadir']
	}).default('dijadwalkan'),
	catatan: text('catatan'),
	createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
	updatedAt: text('updated_at').$defaultFn(() => new Date().toISOString())
});

export type Appointment = typeof appointments.$inferSelect;
export type NewAppointment = typeof appointments.$inferInsert;
