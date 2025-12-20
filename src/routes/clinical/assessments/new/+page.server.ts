import { redirect, fail, isRedirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { patients, assessments } from '$lib/server/db/schema';

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

	return {
		patients: patientList,
		selectedPatientId: selectedPatientId ? parseInt(selectedPatientId) : null
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) {
			throw redirect(302, '/auth/login');
		}

		const formData = await request.formData();
		const patientId = formData.get('patientId')?.toString();
		const tanggalAssessment = formData.get('tanggalAssessment')?.toString();
		const keluhanUtama = formData.get('keluhanUtama')?.toString();
		const kondisiCedera = formData.get('kondisiCedera')?.toString();
		const bagianTubuhTerdampak = formData.get('bagianTubuhTerdampak')?.toString();
		const skalaNyeri = formData.get('skalaNyeri')?.toString();
		const catatanROM = formData.get('catatanROM')?.toString();
		const catatanTambahan = formData.get('catatanTambahan')?.toString();

		const data = {
			patientId,
			tanggalAssessment,
			keluhanUtama,
			kondisiCedera,
			bagianTubuhTerdampak,
			skalaNyeri,
			catatanROM,
			catatanTambahan
		};

		if (!patientId || !tanggalAssessment || !keluhanUtama) {
			return fail(400, {
				error: 'Pasien, tanggal, dan keluhan utama wajib diisi',
				data
			});
		}

		try {
			const [newAssessment] = await db
				.insert(assessments)
				.values({
					patientId: parseInt(patientId),
					fisioterapisId: locals.user.id,
					tanggalAssessment,
					keluhanUtama,
					kondisiCedera: kondisiCedera || null,
					bagianTubuhTerdampak: bagianTubuhTerdampak || null,
					skalaNyeri: skalaNyeri ? parseInt(skalaNyeri) : null,
					catatanROM: catatanROM || null,
					catatanTambahan: catatanTambahan || null
				})
				.returning();

			throw redirect(302, `/clinical/assessments/${newAssessment.id}`);
		} catch (error) {
			if (isRedirect(error)) throw error;

			console.error('Error creating assessment:', error);
			return fail(500, {
				error: 'Gagal menyimpan assessment. Silakan coba lagi.',
				data
			});
		}
	}
};
