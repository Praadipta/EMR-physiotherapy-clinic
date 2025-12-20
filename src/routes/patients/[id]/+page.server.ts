import type { PageServerLoad, Actions } from './$types';
import { error, fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { patients, appointments, treatmentPlans, users } from '$lib/server/db/schema';
import { eq, desc, count, and } from 'drizzle-orm';
import { logAudit } from '$lib/server/services/audit';

export const load: PageServerLoad = async ({ params, locals }) => {
	const patientId = parseInt(params.id);

	if (isNaN(patientId)) {
		throw error(400, 'ID pasien tidak valid');
	}

	const [patient] = await db.select().from(patients).where(eq(patients.id, patientId));

	if (!patient) {
		throw error(404, 'Pasien tidak ditemukan');
	}

	// Log audit akses data pasien
	if (locals.user) {
		await logAudit({
			userId: locals.user.id,
			aksi: 'READ',
			namaTabel: 'patients',
			recordId: patientId
		});
	}

	// Ambil riwayat appointment
	const appointmentHistory = await db
		.select({
			id: appointments.id,
			tanggalWaktu: appointments.tanggalWaktu,
			status: appointments.status,
			catatan: appointments.catatan,
			durasiMenit: appointments.durasiMenit,
			fisioterapis: {
				id: users.id,
				namaLengkap: users.namaLengkap
			}
		})
		.from(appointments)
		.innerJoin(users, eq(appointments.fisioterapisId, users.id))
		.where(eq(appointments.patientId, patientId))
		.orderBy(desc(appointments.tanggalWaktu))
		.limit(10);

	// Hitung perawatan aktif
	const [activeTreatmentsResult] = await db
		.select({ count: count() })
		.from(treatmentPlans)
		.where(and(eq(treatmentPlans.patientId, patientId), eq(treatmentPlans.status, 'berlangsung')));

	return {
		patient,
		appointments: appointmentHistory,
		activeTreatments: activeTreatmentsResult.count
	};
};

export const actions: Actions = {
	update: async ({ params, request, locals, getClientAddress }) => {
		if (!locals.user) {
			return fail(401, { error: 'Anda harus login terlebih dahulu' });
		}

		const patientId = parseInt(params.id);
		if (isNaN(patientId)) {
			return fail(400, { error: 'ID pasien tidak valid' });
		}

		const formData = await request.formData();

		const data = {
			namaLengkap: formData.get('namaLengkap')?.toString().trim(),
			tanggalLahir: formData.get('tanggalLahir')?.toString(),
			jenisKelamin: formData.get('jenisKelamin')?.toString() as 'laki-laki' | 'perempuan',
			noTelepon: formData.get('noTelepon')?.toString().trim() || null,
			email: formData.get('email')?.toString().trim() || null,
			alamat: formData.get('alamat')?.toString().trim() || null,
			kontakDarurat: formData.get('kontakDarurat')?.toString().trim() || null,
			teleponDarurat: formData.get('teleponDarurat')?.toString().trim() || null
		};

		// Validasi
		if (!data.namaLengkap) {
			return fail(400, { error: 'Nama lengkap harus diisi' });
		}

		if (!data.tanggalLahir) {
			return fail(400, { error: 'Tanggal lahir harus diisi' });
		}

		if (!data.jenisKelamin) {
			return fail(400, { error: 'Jenis kelamin harus dipilih' });
		}

		try {
			// Ambil data lama untuk audit
			const [oldPatient] = await db.select().from(patients).where(eq(patients.id, patientId));

			await db
				.update(patients)
				.set({
					...data,
					updatedAt: new Date().toISOString()
				})
				.where(eq(patients.id, patientId));

			// Log audit
			await logAudit({
				userId: locals.user.id,
				aksi: 'UPDATE',
				namaTabel: 'patients',
				recordId: patientId,
				nilaiLama: oldPatient,
				nilaiBaru: data,
				ipAddress: getClientAddress()
			});

			return { success: true };
		} catch (err) {
			console.error('Error updating patient:', err);
			return fail(500, { error: 'Gagal memperbarui data pasien' });
		}
	}
};
