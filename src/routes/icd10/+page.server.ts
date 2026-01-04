import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { icd10Codes } from '$lib/server/db/schema';
import { asc, desc, eq, sql } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
    // Get all codes
    const codes = await db
        .select()
        .from(icd10Codes)
        .orderBy(desc(icd10Codes.isCommon), asc(icd10Codes.code));

    // Get stats by category
    const categoryStats = await db
        .select({
            category: icd10Codes.category,
            count: sql<number>`count(*)`
        })
        .from(icd10Codes)
        .groupBy(icd10Codes.category)
        .orderBy(desc(sql`count(*)`));

    // Count common codes
    const commonCount = codes.filter(c => c.isCommon).length;

    return {
        codes,
        categoryStats,
        totalCodes: codes.length,
        commonCount
    };
};
