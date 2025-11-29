import { NextRequest, NextResponse } from 'next/server';
import { createDocument } from '@/backend/supabase';
import { uploadFile } from '@/backend/storage';

/**
 * POST /api/documents/upload
 * Upload a file and create a document record
 * 
 * Expected form data:
 * - title: Title of the document
 * - file: File to upload
 * - cost: Cost of the document (number)
 * - address_owner: (optional) Blockchain address of the document owner
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const file = formData.get('file') as File;
    const cost = parseFloat(formData.get('cost') as string);
    const addressOwner = formData.get('address_owner') as string | null;

    // Validate inputs
    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }

    if (isNaN(cost) || cost < 0) {
      return NextResponse.json(
        { error: 'Valid cost is required (must be >= 0)' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload file to MinIO
    const uploadResult = await uploadFile(
      buffer,
      file.name,
      file.type || 'application/octet-stream'
    );

    // Create document record in database
    const { data, error } = await createDocument(
      title,
      uploadResult.path,
      uploadResult.hash,
      cost,
      addressOwner || undefined
    );

    if (error) {
      console.error('Error creating document:', error);
      return NextResponse.json(
        { error: 'Failed to create document', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      document: data,
      upload: {
        fileName: uploadResult.fileName,
        size: uploadResult.size,
        hash: uploadResult.hash,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal server error', details: message },
      { status: 500 }
    );
  }
}

