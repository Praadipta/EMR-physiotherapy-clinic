import { redirect, fail, isRedirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { hasPermission } from '$lib/server/auth/rbac';
import { logActivity } from '$lib/server/services/audit';
import { hash } from '@node-rs/argon2';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/auth/login');
	}

	if (!hasPermission(locals.user.role, 'users:write')) {
		throw redirect(302, '/');
	}

	return {};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) {
			throw redirect(302, '/auth/login');
		}

		if (!hasPermission(locals.user.role, 'users:write')) {
			return fail(403, { error: 'Anda tidak memiliki akses untuk menambah staf' });
		}

		const formData = await request.formData();
		const username = formData.get('username')?.toString()?.trim();
		const email = formData.get('email')?.toString()?.trim();
		const password = formData.get('password')?.toString();
		const confirmPassword = formData.get('confirmPassword')?.toString();
		const role = formData.get('role')?.toString();
		const namaLengkap = formData.get('namaLengkap')?.toString()?.trim();
		const noTelepon = formData.get('noTelepon')?.toString()?.trim();

		// Validation
		if (!username || !email || !password || !role || !namaLengkap) {
			return fail(400, {
				error: 'Username, email, password, role, dan nama lengkap wajib diisi',
				username,
				email,
				role,
				namaLengkap,
				noTelepon
			});
		}

		if (username.length < 3) {
			return fail(400, {
				error: 'Username minimal 3 karakter',
				username,
				email,
				role,
				namaLengkap,
				noTelepon
			});
		}

		if (!/^[a-zA-Z0-9_]+$/.test(username)) {
			return fail(400, {
				error: 'Username hanya boleh mengandung huruf, angka, dan underscore',
				username,
				email,
				role,
				namaLengkap,
				noTelepon
			});
		}

		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			return fail(400, {
				error: 'Format email tidak valid',
				username,
				email,
				role,
				namaLengkap,
				noTelepon
			});
		}

		if (password.length < 6) {
			return fail(400, {
				error: 'Password minimal 6 karakter',
				username,
				email,
				role,
				namaLengkap,
				noTelepon
			});
		}

		if (password !== confirmPassword) {
			return fail(400, {
				error: 'Konfirmasi password tidak cocok',
				username,
				email,
				role,
				namaLengkap,
				noTelepon
			});
		}

		if (role !== 'admin' && role !== 'fisioterapis') {
			return fail(400, {
				error: 'Role tidak valid',
				username,
				email,
				role,
				namaLengkap,
				noTelepon
			});
		}

		try {
			// Check if username or email already exists
			const existing = await db
				.select({ id: users.id, username: users.username, email: users.email })
				.from(users);

			if (existing.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
				return fail(400, {
					error: 'Username sudah digunakan',
					username,
					email,
					role,
					namaLengkap,
					noTelepon
				});
			}

			if (existing.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
				return fail(400, {
					error: 'Email sudah digunakan',
					username,
					email,
					role,
					namaLengkap,
					noTelepon
				});
			}

			// Hash password
			const passwordHash = await hash(password, {
				memoryCost: 19456,
				timeCost: 2,
				outputLen: 32,
				parallelism: 1
			});

			// Create user
			const [newUser] = await db
				.insert(users)
				.values({
					username,
					email,
					passwordHash,
					role: role as 'admin' | 'fisioterapis',
					namaLengkap,
					noTelepon: noTelepon || null,
					isActive: true
				})
				.returning();

			await logActivity(
				locals.user.id,
				'CREATE',
				'users',
				newUser.id,
				null,
				{ username, email, role, namaLengkap }
			);

			throw redirect(302, '/staff');
		} catch (error) {
			if (isRedirect(error)) throw error;

			console.error('Error creating user:', error);
			return fail(500, {
				error: 'Gagal membuat akun staf. Silakan coba lagi.',
				username,
				email,
				role,
				namaLengkap,
				noTelepon
			});
		}
	}
};
