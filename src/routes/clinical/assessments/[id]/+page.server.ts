import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { assessments, patients, users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) {
		throw redirect(302, '/auth/login');
	}

	const assessmentId = parseInt(params.id);
	if (isNaN(assessmentId)) {
		throw error(404, 'Assessment tidak ditemukan');
	}

	const [assessment] = await db
		.select({
			id: assessments.id,
			tanggalAssessment: assessments.tanggalAssessment,
			keluhanUtama: assessments.keluhanUtama,
			kondisiCedera: assessments.kondisiCedera,
			bagianTubuhTerdampak: assessments.bagianTubuhTerdampak,
			skalaNyeri: assessments.skalaNyeri,
			catatanROM: assessments.catatanROM,
			catatanTambahan: assessments.catatanTambahan,
			createdAt: assessments.createdAt,
			updatedAt: assessments.updatedAt,
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
		.from(assessments)
		.innerJoin(patients, eq(assessments.patientId, patients.id))
		.innerJoin(users, eq(assessments.fisioterapisId, users.id))
		.where(eq(assessments.id, assessmentId))
		.limit(1);

	if (!assessment) {
		throw error(404, 'Assessment tidak ditemukan');
	}

	return {
		assessment
	};
};
