import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { clinicalTemplates } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
    const templates = await db
        .select()
        .from(clinicalTemplates)
        .where(eq(clinicalTemplates.isActive, true))
        .orderBy(clinicalTemplates.category, clinicalTemplates.name);

    // Group by category
    const categories = templates.reduce((acc, template) => {
        const cat = template.category;
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(template);
        return acc;
    }, {} as Record<string, typeof templates>);

    return {
        templates,
        categories
    };
};
