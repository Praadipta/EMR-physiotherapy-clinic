import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { patients, appointments, treatmentPlans, invoices, users } from '$lib/server/db/schema';
import { eq, and, gte, lte, desc, count } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
	// Hitung statistik
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const tomorrow = new Date(today);
	tomorrow.setDate(tomorrow.getDate() + 1);
	
	// Format as ISO strings for text comparison
	const todayStr = today.toISOString();
	const tomorrowStr = tomorrow.toISOString();

	// Total pasien
	const [totalPatientsResult] = await db.select({ count: count() }).from(patients);

	// Jadwal hari ini
	const [todayAppointmentsCount] = await db
		.select({ count: count() })
		.from(appointments)
		.where(and(gte(appointments.tanggalWaktu, todayStr), lte(appointments.tanggalWaktu, tomorrowStr)));

	// Perawatan aktif
	const [activeTreatmentsResult] = await db
		.select({ count: count() })
		.from(treatmentPlans)
		.where(eq(treatmentPlans.status, 'berlangsung'));

	// Invoice belum dibayar
	const [unpaidInvoicesResult] = await db
		.select({ count: count() })
		.from(invoices)
		.where(eq(invoices.status, 'belum_bayar'));

	// Detail jadwal hari ini
	const todayAppointmentsList = await db
		.select({
			id: appointments.id,
			tanggalWaktu: appointments.tanggalWaktu,
			status: appointments.status,
			durasiMenit: appointments.durasiMenit,
			patient: {
				id: patients.id,
				namaLengkap: patients.namaLengkap,
				patientId: patients.patientId
			},
			fisioterapis: {
				id: users.id,
				namaLengkap: users.namaLengkap
			}
		})
		.from(appointments)
		.innerJoin(patients, eq(appointments.patientId, patients.id))
		.innerJoin(users, eq(appointments.fisioterapisId, users.id))
		.where(and(gte(appointments.tanggalWaktu, todayStr), lte(appointments.tanggalWaktu, tomorrowStr)))
		.orderBy(appointments.tanggalWaktu)
		.limit(5);

	// Pasien terbaru
	const recentPatientsList = await db
		.select({
			id: patients.id,
			patientId: patients.patientId,
			namaLengkap: patients.namaLengkap,
			jenisKelamin: patients.jenisKelamin,
			createdAt: patients.createdAt
		})
		.from(patients)
		.orderBy(desc(patients.createdAt))
		.limit(5);

	return {
		stats: {
			totalPatients: totalPatientsResult.count,
			todayAppointments: todayAppointmentsCount.count,
			activeTreatments: activeTreatmentsResult.count,
			unpaidInvoices: unpaidInvoicesResult.count
		},
		todayAppointments: todayAppointmentsList,
		recentPatients: recentPatientsList
	};
};
