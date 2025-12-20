import { redirect, fail, isRedirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { patients, invoices } from '$lib/server/db/schema';
import { desc, sql } from 'drizzle-orm';
import { logActivity } from '$lib/server/services/audit';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		throw redirect(302, '/auth/login');
	}

	const patientList = await db
		.select({
			id: patients.id,
			patientId: patients.patientId,
			namaLengkap: patients.namaLengkap
		})
		.from(patients)
		.orderBy(patients.namaLengkap);

	const selectedPatientId = url.searchParams.get('patientId');
	const appointmentId = url.searchParams.get('appointmentId');

	return {
		patients: patientList,
		selectedPatientId: selectedPatientId ? parseInt(selectedPatientId) : null,
		appointmentId: appointmentId ? parseInt(appointmentId) : null
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) {
			throw redirect(302, '/auth/login');
		}

		const formData = await request.formData();
		const patientId = formData.get('patientId')?.toString();
		const appointmentId = formData.get('appointmentId')?.toString();
		const tanggalTerbit = formData.get('tanggalTerbit')?.toString();
		const tanggalJatuhTempo = formData.get('tanggalJatuhTempo')?.toString();
		const jumlah = formData.get('jumlah')?.toString();
		const deskripsi = formData.get('deskripsi')?.toString();

		const data = {
			patientId,
			appointmentId,
			tanggalTerbit,
			tanggalJatuhTempo,
			jumlah,
			deskripsi
		};

		if (!patientId || !tanggalTerbit || !jumlah) {
			return fail(400, {
				error: 'Pasien, tanggal terbit, dan jumlah wajib diisi',
				data
			});
		}

		const jumlahNum = parseInt(jumlah);
		if (isNaN(jumlahNum) || jumlahNum <= 0) {
			return fail(400, {
				error: 'Jumlah harus berupa angka positif',
				data
			});
		}

		try {
			// Generate invoice number
			const year = new Date().getFullYear();
			const month = String(new Date().getMonth() + 1).padStart(2, '0');
			
			const lastInvoice = await db
				.select({ nomorInvoice: invoices.nomorInvoice })
				.from(invoices)
				.where(sql`${invoices.nomorInvoice} LIKE ${'INV-' + year + month + '%'}`)
				.orderBy(desc(invoices.nomorInvoice))
				.limit(1);

			let sequence = 1;
			if (lastInvoice.length > 0) {
				const lastNum = lastInvoice[0].nomorInvoice;
				const lastSeq = parseInt(lastNum.split('-')[2]);
				sequence = lastSeq + 1;
			}

			const nomorInvoice = `INV-${year}${month}-${String(sequence).padStart(4, '0')}`;

			const [newInvoice] = await db
				.insert(invoices)
				.values({
					nomorInvoice,
					patientId: parseInt(patientId),
					appointmentId: appointmentId ? parseInt(appointmentId) : null,
					tanggalTerbit,
					tanggalJatuhTempo: tanggalJatuhTempo || null,
					jumlah: jumlahNum,
					deskripsi: deskripsi || null,
					status: 'belum_bayar'
				})
				.returning();

			await logActivity(
				locals.user.id,
				'CREATE',
				'invoices',
				newInvoice.id,
				null,
				{ nomorInvoice, patientId, jumlah: jumlahNum }
			);

			throw redirect(302, `/billing/${newInvoice.id}`);
		} catch (error) {
			if (isRedirect(error)) throw error;

			console.error('Error creating invoice:', error);
			return fail(500, {
				error: 'Gagal membuat invoice. Silakan coba lagi.',
				data
			});
		}
	}
};
