import type { PageServerLoad, Actions } from './$types';
import { error, fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { patients, appointments, treatmentPlans, users, vitalSigns } from '$lib/server/db/schema';
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

	// Ambil riwayat vital signs
	const vitalSignsHistory = await db
		.select({
			id: vitalSigns.id,
			recordedAt: vitalSigns.recordedAt,
			bloodPressureSystolic: vitalSigns.bloodPressureSystolic,
			bloodPressureDiastolic: vitalSigns.bloodPressureDiastolic,
			heartRate: vitalSigns.heartRate,
			temperature: vitalSigns.temperature,
			respiratoryRate: vitalSigns.respiratoryRate,
			oxygenSaturation: vitalSigns.oxygenSaturation,
			weight: vitalSigns.weight,
			height: vitalSigns.height,
			painLevel: vitalSigns.painLevel,
			notes: vitalSigns.notes,
			recordedBy: {
				id: users.id,
				namaLengkap: users.namaLengkap
			}
		})
		.from(vitalSigns)
		.innerJoin(users, eq(vitalSigns.recordedBy, users.id))
		.where(eq(vitalSigns.patientId, patientId))
		.orderBy(desc(vitalSigns.recordedAt))
		.limit(10);

	// Parse JSON fields from patient
	const allergies = patient.allergies ? JSON.parse(patient.allergies) : [];
	const medicalHistory = patient.medicalHistory ? JSON.parse(patient.medicalHistory) : null;
	const currentMedications = patient.currentMedications ? JSON.parse(patient.currentMedications) : [];

	return {
		patient,
		appointments: appointmentHistory,
		activeTreatments: activeTreatmentsResult.count,
		vitalSigns: vitalSignsHistory,
		latestVitals: vitalSignsHistory[0] || null,
		allergies,
		medicalHistory,
		currentMedications
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
	},

	recordVitals: async ({ params, request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Anda harus login terlebih dahulu' });
		}

		const patientId = parseInt(params.id);
		if (isNaN(patientId)) {
			return fail(400, { error: 'ID pasien tidak valid' });
		}

		const formData = await request.formData();

		try {
			await db.insert(vitalSigns).values({
				patientId,
				recordedBy: locals.user.id,
				recordedAt: new Date().toISOString(),
				bloodPressureSystolic: formData.get('bpSystolic') ? parseInt(formData.get('bpSystolic') as string) : null,
				bloodPressureDiastolic: formData.get('bpDiastolic') ? parseInt(formData.get('bpDiastolic') as string) : null,
				heartRate: formData.get('heartRate') ? parseInt(formData.get('heartRate') as string) : null,
				temperature: formData.get('temperature') ? parseFloat(formData.get('temperature') as string) : null,
				respiratoryRate: formData.get('respiratoryRate') ? parseInt(formData.get('respiratoryRate') as string) : null,
				oxygenSaturation: formData.get('oxygenSaturation') ? parseInt(formData.get('oxygenSaturation') as string) : null,
				weight: formData.get('weight') ? parseFloat(formData.get('weight') as string) : null,
				height: formData.get('height') ? parseFloat(formData.get('height') as string) : null,
				painLevel: formData.get('painLevel') ? parseInt(formData.get('painLevel') as string) : null,
				notes: formData.get('notes')?.toString() || null
			});

			return { vitalsSuccess: true };
		} catch (err) {
			console.error('Error recording vitals:', err);
			return fail(500, { error: 'Gagal menyimpan tanda vital' });
		}
	},

	updateAllergies: async ({ params, request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Anda harus login terlebih dahulu' });
		}

		const patientId = parseInt(params.id);
		if (isNaN(patientId)) {
			return fail(400, { error: 'ID pasien tidak valid' });
		}

		const formData = await request.formData();
		const allergiesJson = formData.get('allergies')?.toString() || '[]';

		try {
			await db.update(patients)
				.set({
					allergies: allergiesJson,
					updatedAt: new Date().toISOString()
				})
				.where(eq(patients.id, patientId));

			return { allergiesSuccess: true };
		} catch (err) {
			console.error('Error updating allergies:', err);
			return fail(500, { error: 'Gagal memperbarui data alergi' });
		}
	},

	updateMedicalHistory: async ({ params, request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Anda harus login terlebih dahulu' });
		}

		const patientId = parseInt(params.id);
		if (isNaN(patientId)) {
			return fail(400, { error: 'ID pasien tidak valid' });
		}

		const formData = await request.formData();

		const medicalHistory = {
			conditions: formData.get('conditions')?.toString() || '',
			surgeries: formData.get('surgeries')?.toString() || '',
			familyHistory: formData.get('familyHistory')?.toString() || ''
		};

		const currentMedications = formData.get('medications')?.toString() || '[]';

		try {
			await db.update(patients)
				.set({
					medicalHistory: JSON.stringify(medicalHistory),
					currentMedications: currentMedications,
					bloodType: formData.get('bloodType')?.toString() as any || 'unknown',
					emergencyNotes: formData.get('emergencyNotes')?.toString() || null,
					updatedAt: new Date().toISOString()
				})
				.where(eq(patients.id, patientId));

			return { medicalHistorySuccess: true };
		} catch (err) {
			console.error('Error updating medical history:', err);
			return fail(500, { error: 'Gagal memperbarui riwayat medis' });
		}
	}
};
