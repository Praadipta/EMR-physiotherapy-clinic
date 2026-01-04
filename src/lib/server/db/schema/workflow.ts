import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { patients } from './patients';
import { users } from './users';

// Tabel Referrals - Rujukan masuk/keluar
export const referrals = sqliteTable('referrals', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    patientId: integer('patient_id')
        .references(() => patients.id, { onDelete: 'cascade' })
        .notNull(),
    createdBy: integer('created_by')
        .references(() => users.id)
        .notNull(),

    // Direction
    direction: text('direction', { enum: ['incoming', 'outgoing'] }).notNull(),

    // Referral details
    referrerName: text('referrer_name').notNull(), // Doctor/clinic name
    referrerSpecialty: text('referrer_specialty'), // e.g., "Orthopedic", "Neurologist"
    referrerPhone: text('referrer_phone'),
    referrerEmail: text('referrer_email'),
    referrerAddress: text('referrer_address'),

    // For outgoing
    referToName: text('refer_to_name'),
    referToSpecialty: text('refer_to_specialty'),
    referToPhone: text('refer_to_phone'),
    referToAddress: text('refer_to_address'),

    // Reason and details
    diagnosis: text('diagnosis'),
    reasonForReferral: text('reason_for_referral').notNull(),
    clinicalSummary: text('clinical_summary'),
    urgency: text('urgency', { enum: ['routine', 'urgent', 'emergency'] }).default('routine'),

    // Status
    status: text('status', {
        enum: ['pending', 'accepted', 'in_progress', 'completed', 'declined', 'cancelled']
    }).default('pending'),

    // Dates
    referralDate: text('referral_date').notNull(),
    appointmentDate: text('appointment_date'),
    completedDate: text('completed_date'),

    // Response
    responseNotes: text('response_notes'),

    createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
    updatedAt: text('updated_at').$defaultFn(() => new Date().toISOString())
});

// Tabel Clinical Templates - Template untuk kondisi umum
export const clinicalTemplates = sqliteTable('clinical_templates', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    createdBy: integer('created_by')
        .references(() => users.id),

    // Template info
    name: text('name').notNull(),
    category: text('category', {
        enum: ['musculoskeletal', 'neurological', 'cardiopulmonary', 'pediatric', 'geriatric', 'sports', 'post_surgical', 'other']
    }).notNull(),
    condition: text('condition').notNull(), // e.g., "Low Back Pain", "Frozen Shoulder"

    // Template content (JSON)
    subjective: text('subjective'), // Pre-filled subjective template
    objective: text('objective'), // Pre-filled objective findings
    assessment: text('assessment'), // Standard assessment points
    plan: text('plan'), // Treatment plan template

    // Common exercises for this condition
    recommendedExercises: text('recommended_exercises'), // JSON array of exercise IDs

    // Expected outcomes
    expectedDuration: text('expected_duration'), // e.g., "4-6 weeks"
    expectedSessions: integer('expected_sessions'),

    // Status
    isActive: integer('is_active', { mode: 'boolean' }).default(true),
    isPublic: integer('is_public', { mode: 'boolean' }).default(true), // Can other therapists use it?

    createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
    updatedAt: text('updated_at').$defaultFn(() => new Date().toISOString())
});

// Tabel Collaboration Notes - Catatan kolaborasi antar terapis
export const collaborationNotes = sqliteTable('collaboration_notes', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    patientId: integer('patient_id')
        .references(() => patients.id, { onDelete: 'cascade' })
        .notNull(),
    authorId: integer('author_id')
        .references(() => users.id)
        .notNull(),

    // Note content
    noteType: text('note_type', {
        enum: ['handover', 'consult', 'update', 'alert', 'question', 'response']
    }).notNull(),
    title: text('title').notNull(),
    content: text('content').notNull(),

    // Priority
    priority: text('priority', { enum: ['low', 'normal', 'high', 'urgent'] }).default('normal'),

    // Visibility
    isPrivate: integer('is_private', { mode: 'boolean' }).default(false),

    // Mentions (JSON array of user IDs)
    mentionedUsers: text('mentioned_users'),

    // Status
    isResolved: integer('is_resolved', { mode: 'boolean' }).default(false),
    resolvedBy: integer('resolved_by').references(() => users.id),
    resolvedAt: text('resolved_at'),

    createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
    updatedAt: text('updated_at').$defaultFn(() => new Date().toISOString())
});

export type Referral = typeof referrals.$inferSelect;
export type NewReferral = typeof referrals.$inferInsert;
export type ClinicalTemplate = typeof clinicalTemplates.$inferSelect;
export type NewClinicalTemplate = typeof clinicalTemplates.$inferInsert;
export type CollaborationNote = typeof collaborationNotes.$inferSelect;
export type NewCollaborationNote = typeof collaborationNotes.$inferInsert;
