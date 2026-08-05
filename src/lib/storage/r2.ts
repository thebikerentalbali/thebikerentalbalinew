/**
 * Cloudflare R2 Media Storage Helper
 * Provides high-speed image upload, deletion, and public URL generation with $0 egress fees.
 */

export interface UploadResult {
  url: string;
  key: string;
  size: number;
  type: string;
}

/**
 * Upload a scooter or vendor image to Cloudflare R2
 */
export async function uploadToR2(
  file: File | Blob,
  folder: 'scooters' | 'vendors' | 'documents' = 'scooters',
  customFileName?: string
): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);
  if (customFileName) {
    formData.append('fileName', customFileName);
  }

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to upload image to Cloudflare R2');
  }

  return await response.json();
}
