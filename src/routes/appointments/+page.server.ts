import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { appointments, patients, users } from '$lib/server/db/schema';
import { eq, gte, desc } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
	// Ambil appointments dari 30 hari yang lalu sampai 60 hari ke depan
	const startDate = new Date();
	startDate.setDate(startDate.getDate() - 30);
	const startDateStr = startDate.toISOString();

	const appointmentList = await db
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
		.where(gte(appointments.tanggalWaktu, startDateStr))
		.orderBy(desc(appointments.tanggalWaktu));

	return {
		appointments: appointmentList
	};
};
