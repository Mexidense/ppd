import { minioClient, BUCKET_NAME } from './minio-config';
import { createHash } from 'crypto';
import { v4 as uuidv4 } from 'uuid';

export interface UploadResult {
  path: string;
  hash: string;
  fileName: string;
  size: number;
}

/**
 * Calculate SHA-256 hash of a buffer
 */
export function calculateHash(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex');
}

/**
 * Upload a file to MinIO
 */
export async function uploadFile(
  fileBuffer: Buffer,
  originalFileName: string,
  contentType: string = 'application/octet-stream'
): Promise<UploadResult> {
  try {
    // Generate unique file name
    const fileExtension = originalFileName.split('.').pop();
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    const objectPath = `uploads/${uniqueFileName}`;

    // Calculate file hash
    const hash = calculateHash(fileBuffer);

    // Upload to MinIO
    await minioClient.putObject(
      BUCKET_NAME,
      objectPath,
      fileBuffer,
      fileBuffer.length,
      {
        'Content-Type': contentType,
        'x-amz-meta-original-name': originalFileName,
        'x-amz-meta-hash': hash,
      }
    );

    return {
      path: objectPath,
      hash,
      fileName: uniqueFileName,
      size: fileBuffer.length,
    };
  } catch (error) {
    console.error('Error uploading file to MinIO:', error);
    throw new Error('Failed to upload file to storage');
  }
}

/**
 * Get file from MinIO
 */
export async function getFile(path: string): Promise<Buffer> {
  try {
    const dataStream = await minioClient.getObject(BUCKET_NAME, path);
    const chunks: Buffer[] = [];

    return new Promise((resolve, reject) => {
      dataStream.on('data', (chunk) => chunks.push(chunk));
      dataStream.on('end', () => resolve(Buffer.concat(chunks)));
      dataStream.on('error', reject);
    });
  } catch (error) {
    console.error('Error getting file from MinIO:', error);
    throw new Error('Failed to retrieve file from storage');
  }
}

/**
 * Delete file from MinIO
 */
export async function deleteFile(path: string): Promise<void> {
  try {
    await minioClient.removeObject(BUCKET_NAME, path);
  } catch (error) {
    console.error('Error deleting file from MinIO:', error);
    throw new Error('Failed to delete file from storage');
  }
}

/**
 * Get presigned URL for file (for download)
 */
export async function getPresignedUrl(
  path: string,
  expirySeconds: number = 3600
): Promise<string> {
  try {
    return await minioClient.presignedGetObject(BUCKET_NAME, path, expirySeconds);
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw new Error('Failed to generate download URL');
  }
}

/**
 * Get file URL (for public access)
 */
export function getFileUrl(path: string): string {
  const protocol = process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http';
  const endpoint = process.env.MINIO_ENDPOINT || 'localhost';
  const port = process.env.MINIO_PORT || '9000';
  return `${protocol}://${endpoint}:${port}/${BUCKET_NAME}/${path}`;
}

