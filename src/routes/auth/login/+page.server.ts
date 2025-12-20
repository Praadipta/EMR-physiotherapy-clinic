import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import {
	verifyPassword,
	createSession,
	SESSION_COOKIE_NAME,
	sessionCookieOptions
} from '$lib/server/auth';
import { logAudit } from '$lib/server/services/audit';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		throw redirect(303, '/');
	}
};

export const actions: Actions = {
	default: async ({ request, cookies, getClientAddress }) => {
		const formData = await request.formData();
		const username = formData.get('username')?.toString().trim();
		const password = formData.get('password')?.toString();

		if (!username || !password) {
			return fail(400, {
				error: 'Username dan password harus diisi',
				username
			});
		}

		// Cari user berdasarkan username
		const [user] = await db.select().from(users).where(eq(users.username, username));

		if (!user) {
			return fail(400, {
				error: 'Username atau password salah',
				username
			});
		}

		// Verifikasi password
		const validPassword = await verifyPassword(user.passwordHash, password);

		if (!validPassword) {
			return fail(400, {
				error: 'Username atau password salah',
				username
			});
		}

		// Cek apakah user aktif
		if (!user.isActive) {
			return fail(400, {
				error: 'Akun Anda tidak aktif. Hubungi administrator.',
				username
			});
		}

		// Buat session
		const session = await createSession(user.id);

		// Set cookie
		cookies.set(SESSION_COOKIE_NAME, session.id, sessionCookieOptions);

		// Log audit
		await logAudit({
			userId: user.id,
			aksi: 'LOGIN',
			namaTabel: 'sessions',
			recordId: undefined,
			ipAddress: getClientAddress()
		});

		throw redirect(303, '/');
	}
};
