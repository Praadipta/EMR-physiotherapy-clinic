import type { Actions } from './$types';
import { fail, redirect, isRedirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { patients } from '$lib/server/db/schema';
import { logAudit } from '$lib/server/services/audit';
import { sql } from 'drizzle-orm';

// Generate unique patient ID format: PT-YYYY-NNNNN
async function generatePatientId(): Promise<string> {
	const year = new Date().getFullYear();
	// Use MAX(id) instead of COUNT to avoid race conditions
	const [result] = await db.select({ maxId: sql<number>`COALESCE(MAX(id), 0)` }).from(patients);
	const sequence = (result.maxId || 0) + 1;
	return `PT-${year}-${String(sequence).padStart(5, '0')}`;
}

export const actions: Actions = {
	default: async ({ request, locals, getClientAddress }) => {
		if (!locals.user) {
			return fail(401, { error: 'Anda harus login terlebih dahulu' });
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
			return fail(400, { error: 'Nama lengkap harus diisi', data });
		}

		if (!data.tanggalLahir) {
			return fail(400, { error: 'Tanggal lahir harus diisi', data });
		}

		if (!data.jenisKelamin || !['laki-laki', 'perempuan'].includes(data.jenisKelamin)) {
			return fail(400, { error: 'Jenis kelamin harus dipilih', data });
		}

		const persetujuan = formData.get('persetujuan') === 'on';
		if (!persetujuan) {
			return fail(400, { error: 'Anda harus menyetujui persetujuan pemrosesan data', data });
		}

		try {
			const patientIdGenerated = await generatePatientId();

			const [newPatient] = await db
				.insert(patients)
				.values({
					patientId: patientIdGenerated,
					namaLengkap: data.namaLengkap,
					tanggalLahir: data.tanggalLahir,
					jenisKelamin: data.jenisKelamin,
					noTelepon: data.noTelepon,
					email: data.email,
					alamat: data.alamat,
					kontakDarurat: data.kontakDarurat,
					teleponDarurat: data.teleponDarurat,
					persetujuanDiberikan: true,
					tanggalPersetujuan: new Date().toISOString(),
					createdBy: locals.user.id
				})
				.returning();

			// Log audit
			await logAudit({
				userId: locals.user.id,
				aksi: 'CREATE',
				namaTabel: 'patients',
				recordId: newPatient.id,
				nilaiBaru: { patientId: patientIdGenerated, namaLengkap: data.namaLengkap },
				ipAddress: getClientAddress()
			});

			throw redirect(303, `/patients/${newPatient.id}`);
		} catch (error) {
			if (isRedirect(error)) throw error;
			console.error('Error creating patient:', error);
			return fail(500, { error: 'Gagal menyimpan data pasien', data });
		}
	}
};
