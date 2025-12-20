import { db } from '$lib/server/db';
import { auditLogs } from '$lib/server/db/schema';

export type AuditAction = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT';

export interface AuditEntry {
	userId: number | null;
	aksi: AuditAction;
	namaTabel: string;
	recordId?: number | null;
	nilaiLama?: object | string | null;
	nilaiBaru?: object | string | null;
	ipAddress?: string | null;
	userAgent?: string | null;
}

export async function logAudit(entry: AuditEntry): Promise<void> {
	try {
		await db.insert(auditLogs).values({
			userId: entry.userId,
			aksi: entry.aksi,
			namaTabel: entry.namaTabel,
			recordId: entry.recordId ?? null,
			nilaiLama: entry.nilaiLama ? (typeof entry.nilaiLama === 'string' ? entry.nilaiLama : JSON.stringify(entry.nilaiLama)) : null,
			nilaiBaru: entry.nilaiBaru ? (typeof entry.nilaiBaru === 'string' ? entry.nilaiBaru : JSON.stringify(entry.nilaiBaru)) : null,
			ipAddress: entry.ipAddress ?? null,
			userAgent: entry.userAgent ?? null
		});
	} catch (error) {
		console.error('Failed to log audit:', error);
	}
}

export async function logActivity(
	userId: number | null,
	action: AuditAction,
	tableName: string,
	recordId?: number | null,
	oldValue?: object | null,
	newValue?: object | null
): Promise<void> {
	await logAudit({
		userId,
		aksi: action,
		namaTabel: tableName,
		recordId,
		nilaiLama: oldValue,
		nilaiBaru: newValue
	});
}

export async function logPatientAccess(
	userId: number,
	patientId: number,
	aksi: AuditAction,
	ipAddress?: string
): Promise<void> {
	await logAudit({
		userId,
		aksi,
		namaTabel: 'patients',
		recordId: patientId,
		ipAddress
	});
}
