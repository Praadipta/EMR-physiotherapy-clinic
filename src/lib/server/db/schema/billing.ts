import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { users } from './users';
import { patients } from './patients';
import { appointments } from './appointments';

// Tabel Invoices - Faktur/Tagihan
export const invoices = sqliteTable('invoices', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	nomorInvoice: text('nomor_invoice').notNull().unique(), // Format: INV-2024-00001
	patientId: integer('patient_id')
		.references(() => patients.id, { onDelete: 'cascade' })
		.notNull(),
	appointmentId: integer('appointment_id').references(() => appointments.id),
	jumlah: integer('jumlah').notNull(), // Dalam rupiah
	deskripsi: text('deskripsi'),
	status: text('status', { enum: ['belum_bayar', 'sebagian', 'lunas'] }).default('belum_bayar'),
	tanggalTerbit: text('tanggal_terbit').notNull(),
	tanggalJatuhTempo: text('tanggal_jatuh_tempo'),
	createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
	updatedAt: text('updated_at').$defaultFn(() => new Date().toISOString())
});

// Tabel Payments - Pembayaran
export const payments = sqliteTable('payments', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	invoiceId: integer('invoice_id')
		.references(() => invoices.id, { onDelete: 'cascade' })
		.notNull(),
	jumlah: integer('jumlah').notNull(),
	metodePembayaran: text('metode_pembayaran', {
		enum: ['tunai', 'transfer', 'debit', 'kredit', 'qris']
	}),
	tanggalPembayaran: text('tanggal_pembayaran').notNull(),
	diterimaOleh: integer('diterima_oleh').references(() => users.id),
	catatan: text('catatan'),
	createdAt: text('created_at').$defaultFn(() => new Date().toISOString())
});

export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
