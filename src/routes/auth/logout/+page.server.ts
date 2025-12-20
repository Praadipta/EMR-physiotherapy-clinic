import type { Actions } from './$types';
import { redirect } from '@sveltejs/kit';
import { deleteSession, SESSION_COOKIE_NAME } from '$lib/server/auth';
import { logAudit } from '$lib/server/services/audit';

export const actions: Actions = {
	default: async ({ cookies, locals, getClientAddress }) => {
		const sessionId = cookies.get(SESSION_COOKIE_NAME);

		if (sessionId) {
			// Log audit sebelum menghapus session
			if (locals.user) {
				await logAudit({
					userId: locals.user.id,
					aksi: 'LOGOUT',
					namaTabel: 'sessions',
					ipAddress: getClientAddress()
				});
			}

			await deleteSession(sessionId);
		}

		cookies.delete(SESSION_COOKIE_NAME, { path: '/' });

		throw redirect(303, '/auth/login');
	}
};
