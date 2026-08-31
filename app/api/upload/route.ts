import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/src/lib/auth';
import { saveUpload } from '@/src/lib/uploads';
import { AppError } from '@/src/types';
import { handleApiError } from '@/src/utils/api-error-handler';

export async function POST(request: NextRequest) {
  try {
    // [Reason] Uploads must require the same session cookie as the rest of the API
    await getCurrentUser();

    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = `${uniqueSuffix}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const url = await saveUpload(filename, buffer);

    return NextResponse.json({ url });
  } catch (error) {
    if (error instanceof AppError) return handleApiError(error);
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
