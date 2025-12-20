import { redirect, error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { treatmentPlans, patients, users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { logActivity } from '$lib/server/services/audit';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) {
		throw redirect(302, '/auth/login');
	}

	const planId = parseInt(params.id);
	if (isNaN(planId)) {
		throw error(404, 'Rencana terapi tidak ditemukan');
	}

	const [plan] = await db
		.select({
			id: treatmentPlans.id,
			diagnosis: treatmentPlans.diagnosis,
			tujuan: treatmentPlans.tujuan,
			tanggalMulai: treatmentPlans.tanggalMulai,
			tanggalSelesai: treatmentPlans.tanggalSelesai,
			jumlahSesiDirencanakan: treatmentPlans.jumlahSesiDirencanakan,
			jumlahSesiSelesai: treatmentPlans.jumlahSesiSelesai,
			catatan: treatmentPlans.catatan,
			status: treatmentPlans.status,
			createdAt: treatmentPlans.createdAt,
			updatedAt: treatmentPlans.updatedAt,
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
		.from(treatmentPlans)
		.innerJoin(patients, eq(treatmentPlans.patientId, patients.id))
		.innerJoin(users, eq(treatmentPlans.fisioterapisId, users.id))
		.where(eq(treatmentPlans.id, planId))
		.limit(1);

	if (!plan) {
		throw error(404, 'Rencana terapi tidak ditemukan');
	}

	return {
		plan
	};
};

export const actions: Actions = {
	updateProgress: async ({ request, locals, params }) => {
		if (!locals.user) {
			throw redirect(302, '/auth/login');
		}

		const planId = parseInt(params.id);
		const formData = await request.formData();
		const jumlahSesiSelesai = formData.get('sesiSelesai')?.toString();

		if (!jumlahSesiSelesai) {
			return fail(400, { error: 'Sesi selesai wajib diisi' });
		}

		try {
			const oldData = await db
				.select({ jumlahSesiSelesai: treatmentPlans.jumlahSesiSelesai })
				.from(treatmentPlans)
				.where(eq(treatmentPlans.id, planId))
				.limit(1);

			await db
				.update(treatmentPlans)
				.set({
					jumlahSesiSelesai: parseInt(jumlahSesiSelesai),
					updatedAt: new Date().toISOString()
				})
				.where(eq(treatmentPlans.id, planId));

			await logActivity(
				locals.user.id,
				'UPDATE',
				'treatment_plans',
				planId,
				{ jumlahSesiSelesai: oldData[0]?.jumlahSesiSelesai },
				{ jumlahSesiSelesai: parseInt(jumlahSesiSelesai) }
			);

			return { success: true, message: 'Progres berhasil diperbarui' };
		} catch (err) {
			console.error('Error updating progress:', err);
			return fail(500, { error: 'Gagal memperbarui progres' });
		}
	},

	updateStatus: async ({ request, locals, params }) => {
		if (!locals.user) {
			throw redirect(302, '/auth/login');
		}

		const planId = parseInt(params.id);
		const formData = await request.formData();
		const status = formData.get('status')?.toString();

		if (!status || !['berlangsung', 'selesai', 'direncanakan', 'dihentikan'].includes(status)) {
			return fail(400, { error: 'Status tidak valid' });
		}

		try {
			const oldData = await db
				.select({ status: treatmentPlans.status })
				.from(treatmentPlans)
				.where(eq(treatmentPlans.id, planId))
				.limit(1);

			await db
				.update(treatmentPlans)
				.set({
					status: status as 'berlangsung' | 'selesai' | 'direncanakan' | 'dihentikan',
					updatedAt: new Date().toISOString()
				})
				.where(eq(treatmentPlans.id, planId));

			await logActivity(
				locals.user.id,
				'UPDATE',
				'treatment_plans',
				planId,
				{ status: oldData[0]?.status },
				{ status }
			);

			const statusLabels: Record<string, string> = {
				berlangsung: 'diaktifkan',
				selesai: 'ditandai selesai',
				direncanakan: 'direncanakan',
				dihentikan: 'dihentikan'
			};

			return { success: true, message: `Rencana terapi berhasil ${statusLabels[status]}` };
		} catch (err) {
			console.error('Error updating status:', err);
			return fail(500, { error: 'Gagal memperbarui status' });
		}
	}
};
