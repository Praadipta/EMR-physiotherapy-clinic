import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { patients } from './patients';
import { users } from './users';

// Tabel Vital Signs - Tracking tanda-tanda vital pasien
export const vitalSigns = sqliteTable('vital_signs', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	patientId: integer('patient_id')
		.references(() => patients.id, { onDelete: 'cascade' })
		.notNull(),
	recordedBy: integer('recorded_by')
		.references(() => users.id)
		.notNull(),
	recordedAt: text('recorded_at').notNull(), // ISO datetime
	
	// Vital Signs
	bloodPressureSystolic: integer('bp_systolic'),     // mmHg (tekanan sistolik)
	bloodPressureDiastolic: integer('bp_diastolic'),   // mmHg (tekanan diastolik)
	heartRate: integer('heart_rate'),                   // bpm (detak jantung)
	temperature: real('temperature'),                   // Celsius (suhu tubuh)
	respiratoryRate: integer('respiratory_rate'),       // breaths/min (laju napas)
	oxygenSaturation: integer('oxygen_saturation'),     // SpO2 % (saturasi oksigen)
	weight: real('weight'),                             // kg (berat badan)
	height: real('height'),                             // cm (tinggi badan)
	painLevel: integer('pain_level'),                   // 0-10 VAS (skala nyeri)
	
	// Notes
	notes: text('notes'),
	
	// Metadata
	createdAt: text('created_at').$defaultFn(() => new Date().toISOString())
});

export type VitalSign = typeof vitalSigns.$inferSelect;
export type NewVitalSign = typeof vitalSigns.$inferInsert;
