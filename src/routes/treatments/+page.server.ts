import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { treatmentPlans, patients } from '$lib/server/db/schema';
import { eq, desc, sql } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/auth/login');
	}

	const plans = await db
		.select({
			id: treatmentPlans.id,
			diagnosis: treatmentPlans.diagnosis,
			tanggalMulai: treatmentPlans.tanggalMulai,
			tanggalSelesai: treatmentPlans.tanggalSelesai,
			jumlahSesiDirencanakan: treatmentPlans.jumlahSesiDirencanakan,
			jumlahSesiSelesai: treatmentPlans.jumlahSesiSelesai,
			status: treatmentPlans.status,
			patient: {
				id: patients.id,
				patientId: patients.patientId,
				namaLengkap: patients.namaLengkap
			}
		})
		.from(treatmentPlans)
		.innerJoin(patients, eq(treatmentPlans.patientId, patients.id))
		.orderBy(desc(treatmentPlans.createdAt));

	// Calculate stats based on schema status values: direncanakan, berlangsung, selesai, dihentikan
	const statsResult = await db
		.select({
			status: treatmentPlans.status,
			count: sql<number>`count(*)`
		})
		.from(treatmentPlans)
		.groupBy(treatmentPlans.status);

	const stats = {
		total: 0,
		berlangsung: 0,
		selesai: 0,
		direncanakan: 0,
		dihentikan: 0
	};

	for (const row of statsResult) {
		stats.total += row.count;
		if (row.status === 'berlangsung') stats.berlangsung = row.count;
		if (row.status === 'selesai') stats.selesai = row.count;
		if (row.status === 'direncanakan') stats.direncanakan = row.count;
		if (row.status === 'dihentikan') stats.dihentikan = row.count;
	}

	return {
		treatmentPlans: plans,
		stats
	};
};
