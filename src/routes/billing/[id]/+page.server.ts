import { redirect, error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { invoices, payments, patients } from '$lib/server/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { logActivity } from '$lib/server/services/audit';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) {
		throw redirect(302, '/auth/login');
	}

	const invoiceId = parseInt(params.id);
	if (isNaN(invoiceId)) {
		throw error(404, 'Invoice tidak ditemukan');
	}

	const [invoice] = await db
		.select({
			id: invoices.id,
			nomorInvoice: invoices.nomorInvoice,
			tanggalTerbit: invoices.tanggalTerbit,
			tanggalJatuhTempo: invoices.tanggalJatuhTempo,
			jumlah: invoices.jumlah,
			deskripsi: invoices.deskripsi,
			status: invoices.status,
			createdAt: invoices.createdAt,
			updatedAt: invoices.updatedAt,
			patient: {
				id: patients.id,
				patientId: patients.patientId,
				namaLengkap: patients.namaLengkap
			}
		})
		.from(invoices)
		.innerJoin(patients, eq(invoices.patientId, patients.id))
		.where(eq(invoices.id, invoiceId))
		.limit(1);

	if (!invoice) {
		throw error(404, 'Invoice tidak ditemukan');
	}

	// Get payments for this invoice
	const paymentList = await db
		.select({
			id: payments.id,
			tanggalPembayaran: payments.tanggalPembayaran,
			jumlah: payments.jumlah,
			metodePembayaran: payments.metodePembayaran,
			catatan: payments.catatan,
			createdAt: payments.createdAt
		})
		.from(payments)
		.where(eq(payments.invoiceId, invoiceId))
		.orderBy(desc(payments.tanggalPembayaran));

	// Calculate total paid
	const totalPaid = paymentList.reduce((sum, p) => sum + p.jumlah, 0);

	return {
		invoice,
		payments: paymentList,
		totalPaid,
		sisa: invoice.jumlah - totalPaid
	};
};

export const actions: Actions = {
	payment: async ({ request, locals, params }) => {
		if (!locals.user) {
			throw redirect(302, '/auth/login');
		}

		const invoiceId = parseInt(params.id);
		const formData = await request.formData();
		const jumlah = formData.get('jumlah')?.toString();
		const metodePembayaran = formData.get('metodePembayaran')?.toString();
		const tanggalPembayaran = formData.get('tanggalPembayaran')?.toString();
		const catatan = formData.get('catatan')?.toString();

		if (!jumlah || !metodePembayaran || !tanggalPembayaran) {
			return fail(400, { error: 'Jumlah, metode pembayaran, dan tanggal wajib diisi' });
		}

		try {
			// Get current invoice
			const [invoice] = await db
				.select({
					jumlah: invoices.jumlah
				})
				.from(invoices)
				.where(eq(invoices.id, invoiceId))
				.limit(1);

			if (!invoice) {
				return fail(404, { error: 'Invoice tidak ditemukan' });
			}

			// Get total paid so far
			const [paidResult] = await db
				.select({
					total: sql<number>`COALESCE(SUM(${payments.jumlah}), 0)`
				})
				.from(payments)
				.where(eq(payments.invoiceId, invoiceId));

			const currentPaid = paidResult?.total || 0;
			const paymentAmount = parseInt(jumlah);
			const newPaidAmount = currentPaid + paymentAmount;
			const remaining = invoice.jumlah - newPaidAmount;

			// Insert payment
			const [newPayment] = await db
				.insert(payments)
				.values({
					invoiceId,
					tanggalPembayaran,
					jumlah: paymentAmount,
					metodePembayaran: metodePembayaran as 'tunai' | 'transfer' | 'debit' | 'kredit' | 'qris',
					catatan: catatan || null,
					diterimaOleh: locals.user.id
				})
				.returning();

			// Update invoice status
			const newStatus = remaining <= 0 ? 'lunas' : 'sebagian';
			await db
				.update(invoices)
				.set({
					status: newStatus,
					updatedAt: new Date().toISOString()
				})
				.where(eq(invoices.id, invoiceId));

			await logActivity(
				locals.user.id,
				'CREATE',
				'payments',
				newPayment.id,
				null,
				{ invoiceId, jumlah: paymentAmount, metodePembayaran }
			);

			return { success: true, message: 'Pembayaran berhasil dicatat' };
		} catch (err) {
			console.error('Error recording payment:', err);
			return fail(500, { error: 'Gagal mencatat pembayaran' });
		}
	}
};
