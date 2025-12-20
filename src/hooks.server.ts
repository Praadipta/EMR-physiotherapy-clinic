import type { Handle } from '@sveltejs/kit';
import {
	SESSION_COOKIE_NAME,
	getUserFromSession,
	getSession,
	sessionCookieOptions
} from '$lib/server/auth';

// Allowed origins for CSRF protection
const ALLOWED_ORIGINS = [
	'http://localhost:3000',
	'http://localhost:3004',
	'http://localhost:5173',
	'http://localhost:5174',
	'http://localhost:5175',
	'http://127.0.0.1:3000',
	'http://127.0.0.1:3004',
	'http://127.0.0.1:5173',
	'http://127.0.0.1:5174',
	'http://127.0.0.1:5175',
	'https://clinic.iliterate.ai',
	'https://amrizadi.my.id',
	'http://srv796070.hstgr.cloud:3004',
	'http://212.85.27.37',
	'http://212.85.27.37:3004'
];

// Halaman yang tidak memerlukan autentikasi
const publicRoutes = ['/auth/login', '/auth/register'];

export const handle: Handle = async ({ event, resolve }) => {
	// Custom CSRF check for multiple origins
	if (event.request.method === 'POST' || event.request.method === 'PUT' || event.request.method === 'PATCH' || event.request.method === 'DELETE') {
		const origin = event.request.headers.get('origin');
		
		// If origin header exists, validate it
		if (origin && !ALLOWED_ORIGINS.includes(origin)) {
			console.warn(`Blocked request from unauthorized origin: ${origin}`);
			return new Response('Cross-site POST form submissions are forbidden', {
				status: 403
			});
		}
	}
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
