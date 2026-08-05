import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'scooters';
    const customFileName = formData.get('fileName') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const timestamp = Date.now();
    const cleanFileName = (customFileName || file.name).replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `${folder}/${timestamp}-${cleanFileName}`;
    const arrayBuffer = await file.arrayBuffer();

    // Access Cloudflare R2 binding from runtime environment if available
    const env = (process as any).env;
    const r2Bucket = env?.MEDIA_BUCKET || (globalThis as any)?.MEDIA_BUCKET;

    if (r2Bucket && typeof r2Bucket.put === 'function') {
      await r2Bucket.put(key, arrayBuffer, {
        httpMetadata: {
          contentType: file.type || 'image/jpeg',
          cacheControl: 'public, max-age=31536000, immutable',
        },
      });

      const publicUrl = `https://media.thebikerentalbali.com/${key}`;
      return NextResponse.json({
        success: true,
        url: publicUrl,
        key,
        size: file.size,
        type: file.type,
      });
    }

    // Fallback: If R2 is not connected yet, return local base64/placeholder response
    return NextResponse.json({
      success: true,
      url: URL.createObjectURL(file),
      key,
      size: file.size,
      type: file.type,
      note: 'R2 bucket pending activation',
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process file upload' },
      { status: 500 }
    );
  }
}
