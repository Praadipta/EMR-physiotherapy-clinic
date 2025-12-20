import { redirect, fail, isRedirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { patients, appointments, sessionNotes } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';

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

	// Get recent appointments for linking
	const recentAppointments = await db
		.select({
			id: appointments.id,
			tanggalWaktu: appointments.tanggalWaktu,
			patient: {
				id: patients.id,
				namaLengkap: patients.namaLengkap
			}
		})
		.from(appointments)
		.innerJoin(patients, eq(appointments.patientId, patients.id))
		.orderBy(desc(appointments.tanggalWaktu))
		.limit(50);

	const selectedPatientId = url.searchParams.get('patientId');
	const selectedAppointmentId = url.searchParams.get('appointmentId');

	return {
		patients: patientList,
		appointments: recentAppointments,
		selectedPatientId: selectedPatientId ? parseInt(selectedPatientId) : null,
		selectedAppointmentId: selectedAppointmentId ? parseInt(selectedAppointmentId) : null
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
		const tanggalSesi = formData.get('tanggalSesi')?.toString();
		const subjective = formData.get('subjective')?.toString();
		const objective = formData.get('objective')?.toString();
		const assessment = formData.get('assessment')?.toString();
		const plan = formData.get('plan')?.toString();
		const tindakanDilakukan = formData.get('tindakanDilakukan')?.toString();
		const durasiMenit = formData.get('durasiMenit')?.toString();

		const data = {
			patientId,
			appointmentId,
			tanggalSesi,
			subjective,
			objective,
			assessment,
			plan,
			tindakanDilakukan,
			durasiMenit
		};

		if (!patientId || !tanggalSesi || !subjective || !objective || !assessment || !plan) {
			return fail(400, {
				error: 'Semua field SOAP wajib diisi',
				data
			});
		}

		try {
			const [newSession] = await db
				.insert(sessionNotes)
				.values({
					patientId: parseInt(patientId),
					fisioterapisId: locals.user.id,
					appointmentId: appointmentId ? parseInt(appointmentId) : null,
					tanggalSesi,
					subjective,
					objective,
					assessment,
					plan,
					tindakanDilakukan: tindakanDilakukan || null,
					durasiMenit: durasiMenit ? parseInt(durasiMenit) : 60
				})
				.returning();

			throw redirect(302, `/clinical/sessions/${newSession.id}`);
		} catch (error) {
			if (isRedirect(error)) throw error;

			console.error('Error creating session note:', error);
			return fail(500, {
				error: 'Gagal menyimpan catatan sesi. Silakan coba lagi.',
				data
			});
		}
	}
};
