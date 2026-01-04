import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { referrals, patients } from '$lib/server/db/schema';
import { desc } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
    // Get patient list for the form
    const patientList = await db
        .select({ id: patients.id, namaLengkap: patients.namaLengkap, patientId: patients.patientId })
        .from(patients)
        .orderBy(patients.namaLengkap);

    // Try to get referrals with error handling
    let referralList: any[] = [];
    try {
        referralList = await db
            .select()
            .from(referrals)
            .orderBy(desc(referrals.createdAt))
            .limit(50);
    } catch (e) {
        console.log('Referrals query error:', e);
        referralList = [];
    }

    return {
        referrals: referralList,
        patients: patientList
    };
};

export const actions: Actions = {
    create: async ({ request, locals }) => {
        if (!locals.user) {
            return fail(401, { error: 'Unauthorized' });
        }

        const formData = await request.formData();
        const direction = formData.get('direction')?.toString() as 'incoming' | 'outgoing';
        const patientIdVal = parseInt(formData.get('patientId')?.toString() || '0');

        if (!patientIdVal) {
            return fail(400, { error: 'Patient ID required' });
        }

        try {
            await db.insert(referrals).values({
                patientId: patientIdVal,
                createdBy: locals.user.id,
                direction: direction || 'incoming',
                referrerName: formData.get('referrerName')?.toString() || 'Unknown',
                referrerSpecialty: formData.get('referrerSpecialty')?.toString() || null,
                referrerPhone: formData.get('referrerPhone')?.toString() || null,
                referToName: formData.get('referToName')?.toString() || null,
                referToSpecialty: formData.get('referToSpecialty')?.toString() || null,
                diagnosis: formData.get('diagnosis')?.toString() || null,
                reasonForReferral: formData.get('reasonForReferral')?.toString() || 'No reason provided',
                urgency: (formData.get('urgency')?.toString() as 'routine' | 'urgent' | 'emergency') || 'routine',
                status: 'pending',
                referralDate: formData.get('referralDate')?.toString() || new Date().toISOString().split('T')[0]
            });

            return { success: true };
        } catch (err) {
            console.error('Error creating referral:', err);
            return fail(500, { error: 'Failed to create referral' });
        }
    }
};
