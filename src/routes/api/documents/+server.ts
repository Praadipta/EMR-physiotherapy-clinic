import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { documents } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const UPLOAD_DIR = './static/uploads/documents';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const POST: RequestHandler = async ({ request, locals }) => {
    if (!locals.user) {
        throw error(401, 'Unauthorized');
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const patientId = formData.get('patientId') as string;
    const category = formData.get('category') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    if (!file || !patientId) {
        throw error(400, 'File and patientId are required');
    }

    if (file.size > MAX_FILE_SIZE) {
        throw error(400, 'File size exceeds 10MB limit');
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
        throw error(400, 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP, PDF');
    }

    try {
        // Ensure upload directory exists
        if (!existsSync(UPLOAD_DIR)) {
            await mkdir(UPLOAD_DIR, { recursive: true });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const ext = path.extname(file.name);
        const safeFileName = `${patientId}_${timestamp}${ext}`;
        const filePath = path.join(UPLOAD_DIR, safeFileName);

        // Write file
        const arrayBuffer = await file.arrayBuffer();
        await writeFile(filePath, Buffer.from(arrayBuffer));

        // Save to database
        const [newDoc] = await db.insert(documents).values({
            patientId: parseInt(patientId),
            uploadedBy: locals.user.id,
            uploadedAt: new Date().toISOString(),
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            filePath: `/uploads/documents/${safeFileName}`,
            category: category as any || 'other',
            title: title || file.name,
            description: description || null
        }).returning();

        return json({ success: true, document: newDoc });
    } catch (err) {
        console.error('Error uploading document:', err);
        throw error(500, 'Failed to upload document');
    }
};

export const GET: RequestHandler = async ({ url, locals }) => {
    if (!locals.user) {
        throw error(401, 'Unauthorized');
    }

    const patientId = url.searchParams.get('patientId');

    if (!patientId) {
        throw error(400, 'patientId is required');
    }

    try {
        const docs = await db
            .select()
            .from(documents)
            .where(eq(documents.patientId, parseInt(patientId)))
            .orderBy(desc(documents.uploadedAt));

        return json({ documents: docs });
    } catch (err) {
        console.error('Error fetching documents:', err);
        throw error(500, 'Failed to fetch documents');
    }
};
