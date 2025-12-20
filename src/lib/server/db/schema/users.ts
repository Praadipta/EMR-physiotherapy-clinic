import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// Tabel Users - untuk Admin dan Fisioterapis
export const users = sqliteTable('users', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	username: text('username').notNull().unique(),
	email: text('email').notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	role: text('role', { enum: ['admin', 'fisioterapis'] }).notNull(),
	namaLengkap: text('nama_lengkap').notNull(),
	noTelepon: text('no_telepon'),
	isActive: integer('is_active', { mode: 'boolean' }).default(true),
	createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
	updatedAt: text('updated_at').$defaultFn(() => new Date().toISOString())
});

// Tabel Sessions - untuk manajemen sesi login
export const sessions = sqliteTable('sessions', {
	id: text('id').primaryKey(),
	userId: integer('user_id')
		.references(() => users.id, { onDelete: 'cascade' })
		.notNull(),
	expiresAt: integer('expires_at').notNull(), // Unix timestamp in milliseconds
	createdAt: text('created_at').$defaultFn(() => new Date().toISOString())
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
