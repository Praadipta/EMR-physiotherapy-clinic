import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// Tabel ICD-10 Codes - Kode diagnosis internasional
export const icd10Codes = sqliteTable('icd10_codes', {
    id: integer('id').primaryKey({ autoIncrement: true }),

    // ICD-10 Code (e.g., M54.5, G56.0)
    code: text('code').notNull().unique(),

    // Full description
    description: text('description').notNull(),

    // Indonesian description
    descriptionId: text('description_id'),

    // Category (first letter: M=Musculoskeletal, S=Injury, G=Nervous, etc.)
    category: text('category', {
        enum: ['M', 'S', 'G', 'I', 'J', 'R', 'Z', 'OTHER']
    }).notNull(),

    // Subcategory for grouping
    subcategory: text('subcategory'),

    // Common in physiotherapy practice
    isCommon: integer('is_common', { mode: 'boolean' }).default(false),

    // Active status
    isActive: integer('is_active', { mode: 'boolean' }).default(true),

    createdAt: text('created_at').$defaultFn(() => new Date().toISOString())
});

export type ICD10Code = typeof icd10Codes.$inferSelect;
export type NewICD10Code = typeof icd10Codes.$inferInsert;
