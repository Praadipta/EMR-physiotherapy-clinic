import { hash, verify } from '@node-rs/argon2';

// Konfigurasi Argon2 sesuai rekomendasi OWASP
const hashOptions = {
	memoryCost: 19456,
	timeCost: 2,
	parallelism: 1
};

export async function hashPassword(password: string): Promise<string> {
	return await hash(password, hashOptions);
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
	try {
		return await verify(hash, password);
	} catch {
		return false;
	}
}
