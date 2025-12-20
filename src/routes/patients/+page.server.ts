import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { patients } from '$lib/server/db/schema';
import { desc } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
	const patientList = await db
		.select({
			id: patients.id,
			patientId: patients.patientId,
			namaLengkap: patients.namaLengkap,
			tanggalLahir: patients.tanggalLahir,
			jenisKelamin: patients.jenisKelamin,
			noTelepon: patients.noTelepon,
			email: patients.email,
			createdAt: patients.createdAt
		})
		.from(patients)
		.orderBy(desc(patients.createdAt));

	return {
		patients: patientList
	};
};
