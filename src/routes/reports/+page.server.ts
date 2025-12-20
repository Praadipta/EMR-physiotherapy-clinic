import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import {
	patients,
	appointments,
	treatmentPlans,
	invoices,
	payments,
	sessionNotes,
	auditLogs,
	users
} from '$lib/server/db/schema';
import { sql, eq, gte, and, desc } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/auth/login');
	}

	const now = new Date();
	const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
	const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

	// Total pasien
	const [totalPasienResult] = await db
		.select({ count: sql<number>`COUNT(*)` })
		.from(patients);

	// Pasien baru bulan ini
	const [pasienBaruResult] = await db
		.select({ count: sql<number>`COUNT(*)` })
		.from(patients)
		.where(gte(patients.createdAt, startOfMonth));

	// Sesi bulan ini
	const [sesiBulanIniResult] = await db
		.select({ count: sql<number>`COUNT(*)` })
		.from(appointments)
		.where(gte(appointments.tanggalWaktu, startOfMonth));

	const [sesiSelesaiResult] = await db
		.select({ count: sql<number>`COUNT(*)` })
		.from(appointments)
		.where(and(gte(appointments.tanggalWaktu, startOfMonth), eq(appointments.status, 'selesai')));

	const [sesiDibatalkanResult] = await db
		.select({ count: sql<number>`COUNT(*)` })
		.from(appointments)
		.where(and(gte(appointments.tanggalWaktu, startOfMonth), eq(appointments.status, 'dibatalkan')));

	// Pendapatan bulan ini
	const [pendapatanResult] = await db
		.select({ total: sql<number>`COALESCE(SUM(${payments.jumlah}), 0)` })
		.from(payments)
		.where(gte(payments.tanggalPembayaran, startOfMonth));

	// Tagihan belum lunas - calculate from invoices.jumlah minus sum of payments
	const [tagihanResult] = await db
		.select({
			total: sql<number>`COALESCE(SUM(${invoices.jumlah}), 0)`
		})
		.from(invoices)
		.where(sql`${invoices.status} IN ('belum_bayar', 'sebagian')`);

	// Terapi aktif (berlangsung)
	const [terapiAktifResult] = await db
		.select({ count: sql<number>`COUNT(*)` })
		.from(treatmentPlans)
		.where(eq(treatmentPlans.status, 'berlangsung'));

	const [terapiSelesaiResult] = await db
		.select({ count: sql<number>`COUNT(*)` })
		.from(treatmentPlans)
		.where(and(eq(treatmentPlans.status, 'selesai'), gte(treatmentPlans.updatedAt, startOfMonth)));

	// Kunjungan harian (7 hari terakhir) - group by date part of tanggalWaktu
	const kunjunganHarian = await db
		.select({
			tanggal: sql<string>`DATE(${appointments.tanggalWaktu})`,
			jumlah: sql<number>`COUNT(*)`
		})
		.from(appointments)
		.where(gte(appointments.tanggalWaktu, sevenDaysAgo))
		.groupBy(sql`DATE(${appointments.tanggalWaktu})`)
		.orderBy(sql`DATE(${appointments.tanggalWaktu})`);

	// Pendapatan bulanan (6 bulan terakhir)
	const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString();

	const pendapatanBulanan = await db
		.select({
			tahun: sql<number>`CAST(strftime('%Y', ${payments.tanggalPembayaran}) AS INTEGER)`,
			bulan: sql<number>`CAST(strftime('%m', ${payments.tanggalPembayaran}) AS INTEGER)`,
			jumlah: sql<number>`SUM(${payments.jumlah})`
		})
		.from(payments)
		.where(gte(payments.tanggalPembayaran, sixMonthsAgo))
		.groupBy(
			sql`strftime('%Y', ${payments.tanggalPembayaran})`,
			sql`strftime('%m', ${payments.tanggalPembayaran})`
		)
		.orderBy(
			sql`strftime('%Y', ${payments.tanggalPembayaran})`,
			sql`strftime('%m', ${payments.tanggalPembayaran})`
		);

	const maxPendapatan = Math.max(...pendapatanBulanan.map((p) => p.jumlah), 1);

	// Performa fisioterapis
	const performaFisioterapis = await db
		.select({
			nama: users.namaLengkap,
			sesi: sql<number>`COUNT(DISTINCT ${sessionNotes.id})`,
			pasien: sql<number>`COUNT(DISTINCT ${sessionNotes.patientId})`
		})
		.from(users)
		.leftJoin(
			sessionNotes,
			and(eq(sessionNotes.fisioterapisId, users.id), gte(sessionNotes.tanggalSesi, startOfMonth))
		)
		.where(eq(users.role, 'fisioterapis'))
		.groupBy(users.id)
		.orderBy(desc(sql`COUNT(DISTINCT ${sessionNotes.id})`));

	// Diagnosis tersering
	const diagnosisTersering = await db
		.select({
			diagnosis: treatmentPlans.diagnosis,
			jumlah: sql<number>`COUNT(*)`
		})
		.from(treatmentPlans)
		.groupBy(treatmentPlans.diagnosis)
		.orderBy(desc(sql`COUNT(*)`))
		.limit(5);

	// Aktivitas terbaru
	const aktivitasTerbaru = await db
		.select({
			id: auditLogs.id,
			action: auditLogs.aksi,
			tableName: auditLogs.namaTabel,
			createdAt: auditLogs.timestamp,
			user: {
				namaLengkap: users.namaLengkap
			}
		})
		.from(auditLogs)
		.leftJoin(users, eq(auditLogs.userId, users.id))
		.orderBy(desc(auditLogs.timestamp))
		.limit(10);

	return {
		metrics: {
			totalPasien: totalPasienResult?.count || 0,
			pasienBaru: pasienBaruResult?.count || 0,
			sesiBulanIni: sesiBulanIniResult?.count || 0,
			sesiSelesai: sesiSelesaiResult?.count || 0,
			sesiDibatalkan: sesiDibatalkanResult?.count || 0,
			pendapatanBulanIni: pendapatanResult?.total || 0,
			tagihanBelumLunas: tagihanResult?.total || 0,
			terapiAktif: terapiAktifResult?.count || 0,
			terapiSelesaiBulanIni: terapiSelesaiResult?.count || 0
		},
		kunjunganHarian,
		pendapatanBulanan,
		maxPendapatan,
		performaFisioterapis,
		diagnosisTersering,
		aktivitasTerbaru
	};
};
