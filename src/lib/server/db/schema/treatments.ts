import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { users } from './users';
import { patients } from './patients';

// Tabel Treatment Plans - Rencana Perawatan
export const treatmentPlans = sqliteTable('treatment_plans', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	patientId: integer('patient_id')
		.references(() => patients.id, { onDelete: 'cascade' })
		.notNull(),
	fisioterapisId: integer('fisioterapis_id')
		.references(() => users.id)
		.notNull(),
	diagnosis: text('diagnosis'),
	tujuan: text('tujuan'), // Goals dalam JSON format
	jumlahSesiDirencanakan: integer('jumlah_sesi_direncanakan'),
	jumlahSesiSelesai: integer('jumlah_sesi_selesai').default(0),
	status: text('status', {
		enum: ['direncanakan', 'berlangsung', 'selesai', 'dihentikan']
	}).default('direncanakan'),
	tanggalMulai: text('tanggal_mulai'),
	tanggalSelesai: text('tanggal_selesai'),
	catatan: text('catatan'),
	createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
	updatedAt: text('updated_at').$defaultFn(() => new Date().toISOString())
});

export type TreatmentPlan = typeof treatmentPlans.$inferSelect;
export type NewTreatmentPlan = typeof treatmentPlans.$inferInsert;
