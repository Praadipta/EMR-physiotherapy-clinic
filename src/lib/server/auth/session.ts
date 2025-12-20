import { db } from '$lib/server/db';
import { sessions, users, type User, type Session } from '$lib/server/db/schema';
import { eq, and, gt, lt } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

const SESSION_DURATION_MS = 8 * 60 * 60 * 1000; // 8 jam

export async function createSession(userId: number): Promise<Session> {
	const sessionId = uuidv4();
	const expiresAt = Date.now() + SESSION_DURATION_MS;

	const [session] = await db
		.insert(sessions)
		.values({
			id: sessionId,
			userId,
			expiresAt
		})
		.returning();

	return session;
}

export async function getSession(sessionId: string): Promise<Session | null> {
	const [session] = await db
		.select()
		.from(sessions)
		.where(and(eq(sessions.id, sessionId), gt(sessions.expiresAt, Date.now())));

	return session || null;
}

export async function deleteSession(sessionId: string): Promise<void> {
	await db.delete(sessions).where(eq(sessions.id, sessionId));
}

export async function deleteUserSessions(userId: number): Promise<void> {
	await db.delete(sessions).where(eq(sessions.userId, userId));
}

export async function getUserFromSession(
	sessionId: string
): Promise<Omit<User, 'passwordHash'> | null> {
	const session = await getSession(sessionId);
	if (!session) return null;

	const [user] = await db
		.select({
			id: users.id,
			username: users.username,
			email: users.email,
			role: users.role,
			namaLengkap: users.namaLengkap,
			noTelepon: users.noTelepon,
			isActive: users.isActive,
			createdAt: users.createdAt,
			updatedAt: users.updatedAt
		})
		.from(users)
		.where(and(eq(users.id, session.userId), eq(users.isActive, true)));

	return user || null;
}

export async function cleanExpiredSessions(): Promise<void> {
	await db.delete(sessions).where(lt(sessions.expiresAt, Date.now()));
}

export const SESSION_COOKIE_NAME = 'session';

export const sessionCookieOptions = {
	path: '/',
	httpOnly: true,
	secure: process.env.NODE_ENV === 'production',
	sameSite: 'strict' as const,
	maxAge: SESSION_DURATION_MS / 1000
};
