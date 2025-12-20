import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { assessments, sessionNotes, patients, users } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
	// Ambil daftar assessments
	const assessmentList = await db
		.select({
			id: assessments.id,
			tanggalAssessment: assessments.tanggalAssessment,
			keluhanUtama: assessments.keluhanUtama,
			skalaNyeri: assessments.skalaNyeri,
			patient: {
				id: patients.id,
				namaLengkap: patients.namaLengkap
			},
			fisioterapis: {
				id: users.id,
				namaLengkap: users.namaLengkap
			}
		})
		.from(assessments)
		.innerJoin(patients, eq(assessments.patientId, patients.id))
		.innerJoin(users, eq(assessments.fisioterapisId, users.id))
		.orderBy(desc(assessments.tanggalAssessment))
		.limit(50);

	// Ambil daftar session notes dengan SOAP format
	const sessionNoteList = await db
		.select({
			id: sessionNotes.id,
			tanggalSesi: sessionNotes.tanggalSesi,
			subjective: sessionNotes.subjective,
			tindakanDilakukan: sessionNotes.tindakanDilakukan,
			createdAt: sessionNotes.createdAt,
			patient: {
				id: patients.id,
				namaLengkap: patients.namaLengkap
			},
			fisioterapis: {
				id: users.id,
				namaLengkap: users.namaLengkap
			}
		})
		.from(sessionNotes)
		.innerJoin(patients, eq(sessionNotes.patientId, patients.id))
		.innerJoin(users, eq(sessionNotes.fisioterapisId, users.id))
		.orderBy(desc(sessionNotes.createdAt))
		.limit(50);

	return {
		assessments: assessmentList,
		sessionNotes: sessionNoteList
	};
};
