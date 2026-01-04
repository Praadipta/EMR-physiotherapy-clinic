import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { icd10Codes } from '$lib/server/db/schema';
import { like, or, eq, desc, asc } from 'drizzle-orm';

export const GET: RequestHandler = async ({ url }) => {
    const search = url.searchParams.get('search') || '';
    const category = url.searchParams.get('category') || '';
    const commonOnly = url.searchParams.get('common') === 'true';
    const limit = parseInt(url.searchParams.get('limit') || '100');

    try {
        let query = db.select().from(icd10Codes);

        // Build conditions
        const conditions: any[] = [];

        if (category && category !== 'all') {
            conditions.push(eq(icd10Codes.category, category));
        }

        if (commonOnly) {
            conditions.push(eq(icd10Codes.isCommon, true));
        }

        if (search) {
            const searchLower = `%${search.toLowerCase()}%`;
            conditions.push(
                or(
                    like(icd10Codes.code, searchLower),
                    like(icd10Codes.description, searchLower),
                    like(icd10Codes.descriptionId, searchLower)
                )
            );
        }

        // Execute query
        let results = await db
            .select()
            .from(icd10Codes)
            .where(conditions.length > 0 ? conditions.reduce((a, b) => a && b) : undefined)
            .orderBy(desc(icd10Codes.isCommon), asc(icd10Codes.code))
            .limit(limit);

        return json({
            success: true,
            codes: results,
            total: results.length
        });
    } catch (err) {
        console.error('Error fetching ICD-10 codes:', err);
        return json({ success: false, error: 'Failed to fetch codes', codes: [] }, { status: 500 });
    }
};
