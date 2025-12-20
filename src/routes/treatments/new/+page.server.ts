import { redirect, fail, isRedirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { patients, treatmentPlans, assessments } from '$lib/server/db/schema';
import { logActivity } from '$lib/server/services/audit';
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

	// Get recent assessments for linking
	const assessmentList = await db
		.select({
			id: assessments.id,
			tanggalAssessment: assessments.tanggalAssessment,
			patient: {
				id: patients.id,
				namaLengkap: patients.namaLengkap
			}
		})
		.from(assessments)
		.innerJoin(patients, eq(assessments.patientId, patients.id))
		.orderBy(desc(assessments.tanggalAssessment))
		.limit(50);

	const selectedPatientId = url.searchParams.get('patientId');
	const selectedAssessmentId = url.searchParams.get('assessmentId');

	return {
		patients: patientList,
		assessments: assessmentList,
		selectedPatientId: selectedPatientId ? parseInt(selectedPatientId) : null,
		selectedAssessmentId: selectedAssessmentId ? parseInt(selectedAssessmentId) : null
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) {
			throw redirect(302, '/auth/login');
		}

		const formData = await request.formData();
		const patientId = formData.get('patientId')?.toString();
		const diagnosis = formData.get('diagnosis')?.toString();
		const tujuan = formData.get('tujuanTerapi')?.toString();
		const tanggalMulai = formData.get('tanggalMulai')?.toString();
		const tanggalSelesai = formData.get('tanggalSelesai')?.toString();
		const jumlahSesiDirencanakan = formData.get('totalSesi')?.toString();
		const catatan = formData.get('catatan')?.toString();

		const data = {
			patientId,
			diagnosis,
			tujuan,
			tanggalMulai,
			tanggalSelesai,
			jumlahSesiDirencanakan,
			catatan
		};

		if (!patientId || !diagnosis || !tujuan || !tanggalMulai) {
			return fail(400, {
				error: 'Pasien, diagnosis, tujuan terapi, dan tanggal mulai wajib diisi',
				data
			});
		}

		try {
			const [newPlan] = await db
				.insert(treatmentPlans)
				.values({
					patientId: parseInt(patientId),
					fisioterapisId: locals.user.id,
					diagnosis,
					tujuan,
					tanggalMulai,
					tanggalSelesai: tanggalSelesai || null,
					jumlahSesiDirencanakan: jumlahSesiDirencanakan ? parseInt(jumlahSesiDirencanakan) : null,
					jumlahSesiSelesai: 0,
					catatan: catatan || null,
					status: 'direncanakan'
				})
				.returning();

			await logActivity(
				locals.user.id,
				'CREATE',
				'treatment_plans',
				newPlan.id,
				null,
				{ patientId, diagnosis }
			);

			throw redirect(302, `/treatments/${newPlan.id}`);
		} catch (error) {
			if (isRedirect(error)) throw error;

			console.error('Error creating treatment plan:', error);
			return fail(500, {
				error: 'Gagal menyimpan rencana terapi. Silakan coba lagi.',
				data
			});
		}
	}
};
