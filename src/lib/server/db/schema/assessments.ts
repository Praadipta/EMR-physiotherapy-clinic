import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { patients } from './patients';
import { users } from './users';

// Tabel Outcome Measures - Pengukuran hasil terstandar
export const outcomeMeasures = sqliteTable('outcome_measures', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    patientId: integer('patient_id')
        .references(() => patients.id, { onDelete: 'cascade' })
        .notNull(),
    recordedBy: integer('recorded_by')
        .references(() => users.id)
        .notNull(),
    recordedAt: text('recorded_at').notNull(),

    // Measure type
    measureType: text('measure_type', {
        enum: ['vas', 'dash', 'odi', 'nprs', 'sf36', 'womac', 'custom']
    }).notNull(),

    // Score (0-100 normalized for most scales)
    score: real('score').notNull(),
    rawScore: text('raw_score'), // Original score before normalization
    maxScore: real('max_score'), // Maximum possible score

    // Context
    bodyPart: text('body_part'), // Which body part was assessed
    condition: text('condition'), // What condition being assessed

    // Responses (JSON for detailed questionnaire answers)
    responses: text('responses'), // JSON array of answers

    // Interpretation
    interpretation: text('interpretation', {
        enum: ['normal', 'mild', 'moderate', 'severe', 'critical']
    }),

    notes: text('notes'),
    createdAt: text('created_at').$defaultFn(() => new Date().toISOString())
});

// Tabel Patient Goals - Target pasien
export const patientGoals = sqliteTable('patient_goals', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    patientId: integer('patient_id')
        .references(() => patients.id, { onDelete: 'cascade' })
        .notNull(),
    createdBy: integer('created_by')
        .references(() => users.id)
        .notNull(),

    // Goal details
    title: text('title').notNull(),
    description: text('description'),
    category: text('category', {
        enum: ['pain', 'mobility', 'strength', 'function', 'independence', 'return_to_work', 'sport', 'other']
    }).notNull(),

    // Target metrics
    targetType: text('target_type', {
        enum: ['pain_level', 'range_of_motion', 'strength', 'distance', 'duration', 'frequency', 'custom']
    }),
    baselineValue: real('baseline_value'),
    targetValue: real('target_value'),
    currentValue: real('current_value'),
    unit: text('unit'), // e.g., "degrees", "meters", "minutes"

    // Timeline
    targetDate: text('target_date'),
    status: text('status', {
        enum: ['active', 'achieved', 'missed', 'revised', 'cancelled']
    }).default('active'),

    // Progress
    progressPercent: integer('progress_percent').default(0), // 0-100

    // Notes
    notes: text('notes'),

    createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
    updatedAt: text('updated_at').$defaultFn(() => new Date().toISOString()),
    completedAt: text('completed_at')
});

// Tabel Goal Progress Log - Log perkembangan tujuan
export const goalProgressLogs = sqliteTable('goal_progress_logs', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    goalId: integer('goal_id')
        .references(() => patientGoals.id, { onDelete: 'cascade' })
        .notNull(),
    recordedBy: integer('recorded_by')
        .references(() => users.id)
        .notNull(),
    recordedAt: text('recorded_at').notNull(),

    // Progress data
    value: real('value'),
    progressPercent: integer('progress_percent'),

    notes: text('notes'),
    createdAt: text('created_at').$defaultFn(() => new Date().toISOString())
});

export type OutcomeMeasure = typeof outcomeMeasures.$inferSelect;
export type NewOutcomeMeasure = typeof outcomeMeasures.$inferInsert;
export type PatientGoal = typeof patientGoals.$inferSelect;
export type NewPatientGoal = typeof patientGoals.$inferInsert;
export type GoalProgressLog = typeof goalProgressLogs.$inferSelect;
export type NewGoalProgressLog = typeof goalProgressLogs.$inferInsert;
