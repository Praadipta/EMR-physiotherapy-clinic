import { redirect, fail, isRedirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { hasPermission } from '$lib/server/auth/rbac';
import { logActivity } from '$lib/server/services/audit';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/auth/login');
	}

	// Only admin can access staff management
	if (!hasPermission(locals.user.role, 'users:read')) {
		throw redirect(302, '/');
	}

	const staffList = await db
		.select({
			id: users.id,
			username: users.username,
			email: users.email,
			role: users.role,
			namaLengkap: users.namaLengkap,
			noTelepon: users.noTelepon,
			isActive: users.isActive,
			createdAt: users.createdAt
		})
		.from(users)
		.orderBy(users.namaLengkap);

	return {
		staff: staffList,
		currentUserId: locals.user.id
	};
};

export const actions: Actions = {
	toggleStatus: async ({ request, locals }) => {
		if (!locals.user) {
			throw redirect(302, '/auth/login');
		}

		if (!hasPermission(locals.user.role, 'users:write')) {
			return fail(403, { error: 'Anda tidak memiliki akses untuk mengubah status staf' });
		}

		const formData = await request.formData();
		const userId = formData.get('userId')?.toString();

		if (!userId) {
			return fail(400, { error: 'ID staf tidak valid' });
		}

		const userIdNum = parseInt(userId);

		// Prevent self-deactivation
		if (userIdNum === locals.user.id) {
			return fail(400, { error: 'Anda tidak dapat menonaktifkan akun sendiri' });
		}

		try {
			const [existingUser] = await db
				.select()
				.from(users)
				.where(eq(users.id, userIdNum))
				.limit(1);

			if (!existingUser) {
				return fail(404, { error: 'Staf tidak ditemukan' });
			}

			const newStatus = !existingUser.isActive;

			await db
				.update(users)
				.set({
					isActive: newStatus,
					updatedAt: new Date().toISOString()
				})
				.where(eq(users.id, userIdNum));

			await logActivity(
				locals.user.id,
				'UPDATE',
				'users',
				userIdNum,
				{ isActive: existingUser.isActive },
				{ isActive: newStatus }
			);

			return {
				success: true,
				message: newStatus ? 'Staf berhasil diaktifkan' : 'Staf berhasil dinonaktifkan'
			};
		} catch (error) {
			console.error('Error toggling user status:', error);
			return fail(500, { error: 'Gagal mengubah status staf' });
		}
	},

	delete: async ({ request, locals }) => {
		if (!locals.user) {
			throw redirect(302, '/auth/login');
		}

		if (!hasPermission(locals.user.role, 'users:write')) {
			return fail(403, { error: 'Anda tidak memiliki akses untuk menghapus staf' });
		}

		const formData = await request.formData();
		const userId = formData.get('userId')?.toString();

		if (!userId) {
			return fail(400, { error: 'ID staf tidak valid' });
		}

		const userIdNum = parseInt(userId);

		// Prevent self-deletion
		if (userIdNum === locals.user.id) {
			return fail(400, { error: 'Anda tidak dapat menghapus akun sendiri' });
		}

		try {
			const [existingUser] = await db
				.select()
				.from(users)
				.where(eq(users.id, userIdNum))
				.limit(1);

			if (!existingUser) {
				return fail(404, { error: 'Staf tidak ditemukan' });
			}

			await db.delete(users).where(eq(users.id, userIdNum));

			await logActivity(
				locals.user.id,
				'DELETE',
				'users',
				userIdNum,
				{ username: existingUser.username, namaLengkap: existingUser.namaLengkap },
				null
			);

			return {
				success: true,
				message: 'Staf berhasil dihapus'
			};
		} catch (error) {
			console.error('Error deleting user:', error);
			return fail(500, { error: 'Gagal menghapus staf. Pastikan tidak ada data terkait.' });
		}
	}
};
