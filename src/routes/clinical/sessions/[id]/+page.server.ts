import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { sessionNotes, patients, users, appointments } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) {
		throw redirect(302, '/auth/login');
	}

	const sessionId = parseInt(params.id);
	if (isNaN(sessionId)) {
		throw error(404, 'Catatan sesi tidak ditemukan');
	}

	const [session] = await db
		.select({
			id: sessionNotes.id,
			tanggalSesi: sessionNotes.tanggalSesi,
			subjective: sessionNotes.subjective,
			objective: sessionNotes.objective,
			assessment: sessionNotes.assessment,
			plan: sessionNotes.plan,
			tindakanDilakukan: sessionNotes.tindakanDilakukan,
			durasiMenit: sessionNotes.durasiMenit,
			createdAt: sessionNotes.createdAt,
			updatedAt: sessionNotes.updatedAt,
			appointmentId: sessionNotes.appointmentId,
			patient: {
				id: patients.id,
				patientId: patients.patientId,
				namaLengkap: patients.namaLengkap
			},
			fisioterapis: {
				id: users.id,
				namaLengkap: users.namaLengkap,
				email: users.email
			}
		})
		.from(sessionNotes)
		.innerJoin(patients, eq(sessionNotes.patientId, patients.id))
		.innerJoin(users, eq(sessionNotes.fisioterapisId, users.id))
		.where(eq(sessionNotes.id, sessionId))
		.limit(1);

	if (!session) {
		throw error(404, 'Catatan sesi tidak ditemukan');
	}

	// Get linked appointment if exists
	let appointment = null;
	if (session.appointmentId) {
		const [apt] = await db
			.select({
				id: appointments.id,
				tanggalWaktu: appointments.tanggalWaktu
			})
			.from(appointments)
			.where(eq(appointments.id, session.appointmentId))
			.limit(1);
		appointment = apt;
	}

	return {
		session: {
			...session,
			appointment
		}
	};
};
