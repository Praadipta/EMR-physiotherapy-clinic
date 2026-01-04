import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { patients } from './patients';
import { users } from './users';
import { appointments } from './appointments';

// Tabel Body Markings - Untuk penandaan lokasi nyeri/cedera pada diagram tubuh
export const bodyMarkings = sqliteTable('body_markings', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    patientId: integer('patient_id')
        .references(() => patients.id, { onDelete: 'cascade' })
        .notNull(),
    appointmentId: integer('appointment_id')
        .references(() => appointments.id, { onDelete: 'set null' }),
    recordedBy: integer('recorded_by')
        .references(() => users.id)
        .notNull(),
    recordedAt: text('recorded_at').notNull(),

    // Marking data as JSON array
    // [{x, y, type, severity, label, notes}]
    markings: text('markings').notNull(), // JSON array of marking points

    // View type
    viewType: text('view_type', {
        enum: ['front', 'back', 'left', 'right']
    }).default('front'),

    // General notes
    notes: text('notes'),

    createdAt: text('created_at').$defaultFn(() => new Date().toISOString())
});

// Tabel Documents - Untuk upload dokumen (X-ray, lab results, dll)
export const documents = sqliteTable('documents', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    patientId: integer('patient_id')
        .references(() => patients.id, { onDelete: 'cascade' })
        .notNull(),
    uploadedBy: integer('uploaded_by')
        .references(() => users.id)
        .notNull(),
    uploadedAt: text('uploaded_at').notNull(),

    // Document info
    fileName: text('file_name').notNull(),
    fileType: text('file_type').notNull(), // image/jpeg, application/pdf, etc
    fileSize: integer('file_size').notNull(), // in bytes
    filePath: text('file_path').notNull(), // relative path in storage

    // Categorization
    category: text('category', {
        enum: ['xray', 'mri', 'ct_scan', 'lab_result', 'referral', 'progress_photo', 'other']
    }).default('other'),

    title: text('title'),
    description: text('description'),

    createdAt: text('created_at').$defaultFn(() => new Date().toISOString())
});

// Tabel Exercise Library - Perpustakaan latihan fisioterapi
export const exercises = sqliteTable('exercises', {
    id: integer('id').primaryKey({ autoIncrement: true }),

    // Exercise info
    name: text('name').notNull(),
    nameEn: text('name_en'), // English name (optional)
    category: text('category', {
        enum: ['stretching', 'strengthening', 'balance', 'endurance', 'mobility', 'posture', 'breathing', 'other']
    }).notNull(),

    // Target area
    bodyPart: text('body_part', {
        enum: ['neck', 'shoulder', 'upper_back', 'lower_back', 'chest', 'arm', 'elbow', 'wrist', 'hand',
            'hip', 'thigh', 'knee', 'ankle', 'foot', 'core', 'full_body']
    }).notNull(),

    // Instructions
    description: text('description').notNull(),
    instructions: text('instructions').notNull(), // Step by step
    precautions: text('precautions'), // Warnings/contraindications

    // Parameters
    defaultSets: integer('default_sets').default(3),
    defaultReps: integer('default_reps').default(10),
    defaultHoldSeconds: integer('default_hold_seconds'),
    defaultDurationMinutes: integer('default_duration_minutes'),

    // Difficulty
    difficulty: text('difficulty', { enum: ['easy', 'medium', 'hard'] }).default('medium'),

    // Media (optional)
    imageUrl: text('image_url'),
    videoUrl: text('video_url'),

    // Status
    isActive: integer('is_active', { mode: 'boolean' }).default(true),

    createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
    updatedAt: text('updated_at').$defaultFn(() => new Date().toISOString())
});

// Tabel Prescribed Exercises - Latihan yang diresepkan untuk pasien
export const prescribedExercises = sqliteTable('prescribed_exercises', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    patientId: integer('patient_id')
        .references(() => patients.id, { onDelete: 'cascade' })
        .notNull(),
    exerciseId: integer('exercise_id')
        .references(() => exercises.id)
        .notNull(),
    prescribedBy: integer('prescribed_by')
        .references(() => users.id)
        .notNull(),
    prescribedAt: text('prescribed_at').notNull(),

    // Custom parameters (override defaults)
    sets: integer('sets'),
    reps: integer('reps'),
    holdSeconds: integer('hold_seconds'),
    durationMinutes: integer('duration_minutes'),
    frequency: text('frequency'), // e.g., "2x sehari", "3x seminggu"

    // Custom notes
    notes: text('notes'),

    // Status
    status: text('status', {
        enum: ['active', 'completed', 'discontinued']
    }).default('active'),

    // Duration of prescription
    startDate: text('start_date'),
    endDate: text('end_date'),

    createdAt: text('created_at').$defaultFn(() => new Date().toISOString())
});

export type BodyMarking = typeof bodyMarkings.$inferSelect;
export type NewBodyMarking = typeof bodyMarkings.$inferInsert;
export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
export type Exercise = typeof exercises.$inferSelect;
export type NewExercise = typeof exercises.$inferInsert;
export type PrescribedExercise = typeof prescribedExercises.$inferSelect;
export type NewPrescribedExercise = typeof prescribedExercises.$inferInsert;
