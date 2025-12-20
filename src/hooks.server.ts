import type { Handle } from '@sveltejs/kit';
import {
	SESSION_COOKIE_NAME,
	getUserFromSession,
	getSession,
	sessionCookieOptions
} from '$lib/server/auth';

// Halaman yang tidak memerlukan autentikasi
const publicRoutes = ['/auth/login', '/auth/register'];

export const handle: Handle = async ({ event, resolve }) => {
	// Inisialisasi locals
	event.locals.user = null;
	event.locals.session = null;

	// Ambil session dari cookie
	const sessionId = event.cookies.get(SESSION_COOKIE_NAME);

	if (sessionId) {
		const session = await getSession(sessionId);
		if (session) {
			const user = await getUserFromSession(sessionId);
			if (user) {
				event.locals.user = user;
				event.locals.session = session;

				// Refresh cookie expiration
				event.cookies.set(SESSION_COOKIE_NAME, sessionId, sessionCookieOptions);
			}
		} else {
			// Session expired atau tidak valid, hapus cookie
			event.cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
		}
	}

	// Cek apakah route memerlukan autentikasi
	const isPublicRoute = publicRoutes.some((route) => event.url.pathname.startsWith(route));

	if (!isPublicRoute && !event.locals.user) {
		// Redirect ke halaman login jika belum login
		return new Response(null, {
			status: 303,
			headers: { location: '/auth/login' }
		});
	}

	// Jika sudah login dan mengakses halaman login, redirect ke dashboard
	if (event.locals.user && event.url.pathname.startsWith('/auth/login')) {
		return new Response(null, {
			status: 303,
			headers: { location: '/' }
		});
	}

	const response = await resolve(event);
	return response;
};
