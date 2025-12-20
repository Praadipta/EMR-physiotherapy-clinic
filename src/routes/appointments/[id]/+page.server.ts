import type { PageServerLoad, Actions } from './$types';
import { error, fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { appointments, patients, users, sessionNotes } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { logAudit } from '$lib/server/services/audit';

export const load: PageServerLoad = async ({ params }) => {
	const appointmentId = parseInt(params.id);

	if (isNaN(appointmentId)) {
		throw error(400, 'ID appointment tidak valid');
	}

	const [appointment] = await db
		.select({
			id: appointments.id,
			tanggalWaktu: appointments.tanggalWaktu,
			durasiMenit: appointments.durasiMenit,
			status: appointments.status,
			catatan: appointments.catatan,
			patient: {
				id: patients.id,
				patientId: patients.patientId,
				namaLengkap: patients.namaLengkap
			},
			fisioterapis: {
				id: users.id,
				namaLengkap: users.namaLengkap
			}
		})
		.from(appointments)
		.innerJoin(patients, eq(appointments.patientId, patients.id))
		.innerJoin(users, eq(appointments.fisioterapisId, users.id))
		.where(eq(appointments.id, appointmentId));

	if (!appointment) {
		throw error(404, 'Appointment tidak ditemukan');
	}

	// Cek apakah ada session note
	const [sessionNote] = await db
		.select()
		.from(sessionNotes)
		.where(eq(sessionNotes.appointmentId, appointmentId));

	return {
		appointment,
		sessionNote
	};
};

export const actions: Actions = {
	updateStatus: async ({ params, request, locals, getClientAddress }) => {
		if (!locals.user) {
			return fail(401, { error: 'Anda harus login terlebih dahulu' });
		}

		const appointmentId = parseInt(params.id);
		if (isNaN(appointmentId)) {
			return fail(400, { error: 'ID appointment tidak valid' });
		}

		const formData = await request.formData();
		const status = formData.get('status')?.toString() as
			| 'dijadwalkan'
			| 'selesai'
			| 'dibatalkan'
			| 'tidak_hadir';

		if (!status || !['dijadwalkan', 'selesai', 'dibatalkan', 'tidak_hadir'].includes(status)) {
			return fail(400, { error: 'Status tidak valid' });
		}

		try {
			// Ambil data lama
			const [oldAppointment] = await db
				.select()
				.from(appointments)
				.where(eq(appointments.id, appointmentId));

			await db
				.update(appointments)
				.set({
					status,
					updatedAt: new Date().toISOString()
				})
				.where(eq(appointments.id, appointmentId));

			// Log audit
			await logAudit({
				userId: locals.user.id,
				aksi: 'UPDATE',
				namaTabel: 'appointments',
				recordId: appointmentId,
				nilaiLama: { status: oldAppointment.status },
				nilaiBaru: { status },
				ipAddress: getClientAddress()
			});

			const statusLabels: Record<string, string> = {
				dijadwalkan: 'Dijadwalkan',
				selesai: 'Selesai',
				dibatalkan: 'Dibatalkan',
				tidak_hadir: 'Tidak Hadir'
			};

			return { success: true, message: `Status berhasil diubah menjadi "${statusLabels[status]}"` };
		} catch (err) {
			console.error('Error updating appointment status:', err);
			return fail(500, { error: 'Gagal memperbarui status' });
		}
	}
};
