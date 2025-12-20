import { redirect, fail, isRedirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { hasPermission } from '$lib/server/auth/rbac';
import { logActivity } from '$lib/server/services/audit';
import { hash } from '@node-rs/argon2';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) {
		throw redirect(302, '/auth/login');
	}

	if (!hasPermission(locals.user.role, 'users:read')) {
		throw redirect(302, '/');
	}

	const staffId = parseInt(params.id);

	const [staff] = await db
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
		.where(eq(users.id, staffId))
		.limit(1);

	if (!staff) {
		throw redirect(302, '/staff');
	}

	return {
		staff,
		isCurrentUser: locals.user.id === staff.id
	};
};

export const actions: Actions = {
	update: async ({ request, locals, params }) => {
		if (!locals.user) {
			throw redirect(302, '/auth/login');
		}

		if (!hasPermission(locals.user.role, 'users:write')) {
			return fail(403, { error: 'Anda tidak memiliki akses untuk mengubah data staf' });
		}

		const staffId = parseInt(params.id);
		const formData = await request.formData();
		const email = formData.get('email')?.toString()?.trim();
		const role = formData.get('role')?.toString();
		const namaLengkap = formData.get('namaLengkap')?.toString()?.trim();
		const noTelepon = formData.get('noTelepon')?.toString()?.trim();

		// Validation
		if (!email || !role || !namaLengkap) {
			return fail(400, {
				error: 'Email, role, dan nama lengkap wajib diisi'
			});
		}

		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			return fail(400, {
				error: 'Format email tidak valid'
			});
		}

		if (role !== 'admin' && role !== 'fisioterapis') {
			return fail(400, {
				error: 'Role tidak valid'
			});
		}

		// Prevent changing own role
		if (staffId === locals.user.id && role !== locals.user.role) {
			return fail(400, {
				error: 'Anda tidak dapat mengubah role Anda sendiri'
			});
		}

		try {
			// Get existing user
			const [existingUser] = await db
				.select()
				.from(users)
				.where(eq(users.id, staffId))
				.limit(1);

			if (!existingUser) {
				return fail(404, { error: 'Staf tidak ditemukan' });
			}

			// Check if email already used by another user
			const allUsers = await db
				.select({ id: users.id, email: users.email })
				.from(users);

			if (allUsers.some((u) => u.id !== staffId && u.email.toLowerCase() === email.toLowerCase())) {
				return fail(400, { error: 'Email sudah digunakan oleh staf lain' });
			}

			// Update user
			await db
				.update(users)
				.set({
					email,
					role: role as 'admin' | 'fisioterapis',
					namaLengkap,
					noTelepon: noTelepon || null,
					updatedAt: new Date().toISOString()
				})
				.where(eq(users.id, staffId));

			await logActivity(
				locals.user.id,
				'UPDATE',
				'users',
				staffId,
				{
					email: existingUser.email,
					role: existingUser.role,
					namaLengkap: existingUser.namaLengkap
				},
				{ email, role, namaLengkap }
			);

			return {
				success: true,
				message: 'Data staf berhasil diperbarui'
			};
		} catch (error) {
			console.error('Error updating user:', error);
			return fail(500, {
				error: 'Gagal memperbarui data staf. Silakan coba lagi.'
			});
		}
	},

	changePassword: async ({ request, locals, params }) => {
		if (!locals.user) {
			throw redirect(302, '/auth/login');
		}

		if (!hasPermission(locals.user.role, 'users:write')) {
			return fail(403, { error: 'Anda tidak memiliki akses untuk mengubah password' });
		}

		const staffId = parseInt(params.id);
		const formData = await request.formData();
		const newPassword = formData.get('newPassword')?.toString();
		const confirmPassword = formData.get('confirmPassword')?.toString();

		if (!newPassword || newPassword.length < 6) {
			return fail(400, {
				error: 'Password baru minimal 6 karakter'
			});
		}

		if (newPassword !== confirmPassword) {
			return fail(400, {
				error: 'Konfirmasi password tidak cocok'
			});
		}

		try {
			const [existingUser] = await db
				.select({ id: users.id })
				.from(users)
				.where(eq(users.id, staffId))
				.limit(1);

			if (!existingUser) {
				return fail(404, { error: 'Staf tidak ditemukan' });
			}

			const passwordHash = await hash(newPassword, {
				memoryCost: 19456,
				timeCost: 2,
				outputLen: 32,
				parallelism: 1
			});

			await db
				.update(users)
				.set({
					passwordHash,
					updatedAt: new Date().toISOString()
				})
				.where(eq(users.id, staffId));

			await logActivity(
				locals.user.id,
				'UPDATE',
				'users',
				staffId,
				{ field: 'password' },
				{ field: 'password', changed: true }
			);

			return {
				success: true,
				message: 'Password berhasil diubah'
			};
		} catch (error) {
			console.error('Error changing password:', error);
			return fail(500, {
				error: 'Gagal mengubah password. Silakan coba lagi.'
			});
		}
	}
};
