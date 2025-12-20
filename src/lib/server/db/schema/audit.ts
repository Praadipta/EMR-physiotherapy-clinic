import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { users } from './users';

// Tabel Audit Logs - HIPAA Compliance untuk tracking akses data
export const auditLogs = sqliteTable('audit_logs', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	userId: integer('user_id').references(() => users.id),
	aksi: text('aksi', { enum: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'] }).notNull(),
	namaTabel: text('nama_tabel').notNull(),
	recordId: integer('record_id'),
	nilaiLama: text('nilai_lama'), // JSON string
	nilaiBaru: text('nilai_baru'), // JSON string
	ipAddress: text('ip_address'),
	userAgent: text('user_agent'),
	timestamp: text('timestamp').$defaultFn(() => new Date().toISOString())
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
