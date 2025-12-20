import type { PageServerLoad, Actions } from './$types';
import { fail, redirect, isRedirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { appointments, patients, users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { logAudit } from '$lib/server/services/audit';

export const load: PageServerLoad = async ({ url }) => {
	// Ambil daftar pasien
	const patientList = await db
		.select({
			id: patients.id,
			patientId: patients.patientId,
			namaLengkap: patients.namaLengkap
		})
		.from(patients)
		.orderBy(patients.namaLengkap);

	// Ambil daftar fisioterapis
	const therapistList = await db
		.select({
			id: users.id,
			namaLengkap: users.namaLengkap
		})
		.from(users)
		.where(eq(users.role, 'fisioterapis'))
		.orderBy(users.namaLengkap);

	// Cek apakah ada patientId dari query string
	const selectedPatientId = url.searchParams.get('patientId');

	return {
		patients: patientList,
		therapists: therapistList,
		selectedPatientId: selectedPatientId ? parseInt(selectedPatientId) : null
	};
};

export const actions: Actions = {
	default: async ({ request, locals, getClientAddress }) => {
		if (!locals.user) {
			return fail(401, { error: 'Anda harus login terlebih dahulu' });
		}

		const formData = await request.formData();

		const data = {
			patientId: formData.get('patientId')?.toString(),
			fisioterapisId: formData.get('fisioterapisId')?.toString(),
			tanggal: formData.get('tanggal')?.toString(),
			waktu: formData.get('waktu')?.toString(),
			durasiMenit: formData.get('durasiMenit')?.toString() || '60',
			catatan: formData.get('catatan')?.toString().trim() || null
		};

		// Validasi
		if (!data.patientId) {
			return fail(400, { error: 'Pasien harus dipilih', data });
		}

		if (!data.fisioterapisId) {
			return fail(400, { error: 'Fisioterapis harus dipilih', data });
		}

		if (!data.tanggal) {
			return fail(400, { error: 'Tanggal harus diisi', data });
		}

		if (!data.waktu) {
			return fail(400, { error: 'Waktu harus diisi', data });
		}

		try {
			// Gabungkan tanggal dan waktu menjadi ISO string
			const tanggalWaktu = new Date(`${data.tanggal}T${data.waktu}`).toISOString();

			const [newAppointment] = await db
				.insert(appointments)
				.values({
					patientId: parseInt(data.patientId),
					fisioterapisId: parseInt(data.fisioterapisId),
					tanggalWaktu,
					durasiMenit: parseInt(data.durasiMenit),
					status: 'dijadwalkan',
					catatan: data.catatan
				})
				.returning();

			// Log audit
			await logAudit({
				userId: locals.user.id,
				aksi: 'CREATE',
				namaTabel: 'appointments',
				recordId: newAppointment.id,
				nilaiBaru: { patientId: data.patientId, tanggalWaktu },
				ipAddress: getClientAddress()
			});

			throw redirect(303, `/appointments/${newAppointment.id}`);
		} catch (error) {
			if (isRedirect(error)) throw error;
			console.error('Error creating appointment:', error);
			return fail(500, { error: 'Gagal membuat jadwal', data });
		}
	}
};
