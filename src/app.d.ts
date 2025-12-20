// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

import type { User, Session } from '$lib/server/db/schema';

declare global {
	namespace App {
		interface Error {
			message: string;
			code?: string;
		}
		interface Locals {
			user: Omit<User, 'passwordHash'> | null;
			session: Session | null;
		}
		interface PageData {
			user: Omit<User, 'passwordHash'> | null;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
