import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { exercises } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
    const exerciseList = await db
        .select()
        .from(exercises)
        .where(eq(exercises.isActive, true))
        .orderBy(exercises.category, exercises.bodyPart, exercises.name);

    // Group by category
    const categories = exerciseList.reduce((acc, exercise) => {
        const cat = exercise.category;
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(exercise);
        return acc;
    }, {} as Record<string, typeof exerciseList>);

    return {
        exercises: exerciseList,
        categories
    };
};
