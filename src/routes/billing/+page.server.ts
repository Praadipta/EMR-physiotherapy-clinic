import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { invoices, payments, patients, users } from '$lib/server/db/schema';
import { eq, desc, sql, gte, and } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/auth/login');
	}

	// Get invoices
	const invoiceList = await db
		.select({
			id: invoices.id,
			nomorInvoice: invoices.nomorInvoice,
			tanggalTerbit: invoices.tanggalTerbit,
			jumlah: invoices.jumlah,
			status: invoices.status,
			patient: {
				id: patients.id,
				namaLengkap: patients.namaLengkap
			}
		})
		.from(invoices)
		.innerJoin(patients, eq(invoices.patientId, patients.id))
		.orderBy(desc(invoices.createdAt));

	// Get payments
	const paymentList = await db
		.select({
			id: payments.id,
			tanggalPembayaran: payments.tanggalPembayaran,
			jumlah: payments.jumlah,
			metodePembayaran: payments.metodePembayaran,
			invoice: {
				id: invoices.id,
				nomorInvoice: invoices.nomorInvoice
			},
			patient: {
				id: patients.id,
				namaLengkap: patients.namaLengkap
			}
		})
		.from(payments)
		.innerJoin(invoices, eq(payments.invoiceId, invoices.id))
		.innerJoin(patients, eq(invoices.patientId, patients.id))
		.orderBy(desc(payments.tanggalPembayaran))
		.limit(50);

	// Calculate stats
	const now = new Date();
	const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

	const pendapatanBulanIni = await db
		.select({
			total: sql<number>`COALESCE(SUM(${payments.jumlah}), 0)`
		})
		.from(payments)
		.where(gte(payments.tanggalPembayaran, startOfMonth));

	const belumDibayar = await db
		.select({
			total: sql<number>`COALESCE(SUM(${invoices.jumlah}), 0)`
		})
		.from(invoices)
		.where(
			and(
				sql`${invoices.status} IN ('belum_bayar', 'sebagian')`
			)
		);

	const invoiceAktif = await db
		.select({
			count: sql<number>`COUNT(*)`
		})
		.from(invoices)
		.where(sql`${invoices.status} IN ('belum_bayar', 'sebagian')`);

	const invoiceLunas = await db
		.select({
			count: sql<number>`COUNT(*)`
		})
		.from(invoices)
		.where(eq(invoices.status, 'lunas'));

	return {
		invoices: invoiceList,
		payments: paymentList,
		stats: {
			pendapatanBulanIni: pendapatanBulanIni[0]?.total || 0,
			belumDibayar: belumDibayar[0]?.total || 0,
			invoiceAktif: invoiceAktif[0]?.count || 0,
			invoiceLunas: invoiceLunas[0]?.count || 0
		}
	};
};
