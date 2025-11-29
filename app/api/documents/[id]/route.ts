import { NextRequest, NextResponse } from 'next/server';
import { getDocumentById, deleteDocument } from '@/backend/supabase';
import { deleteFile } from '@/backend/storage';

/**
 * GET /api/documents/[id]
 * Get a specific document by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { data, error } = await getDocumentById(id);

    if (error) {
      console.error('Error fetching document:', error);
      return NextResponse.json(
        { error: 'Failed to fetch document', details: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      document: data,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal server error', details: message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/documents/[id]
 * Delete a document and its associated file
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // First, get the document to know the file path
    const { data: document, error: fetchError } = await getDocumentById(id);

    if (fetchError || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Delete file from MinIO
    try {
      await deleteFile(document.path);
    } catch (storageError) {
      console.error('Error deleting file from storage:', storageError);
      // Continue with database deletion even if file deletion fails
    }

    // Delete document from database
    const { error: deleteError } = await deleteDocument(id);

    if (deleteError) {
      console.error('Error deleting document:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete document', details: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Document deleted successfully',
      documentId: id,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal server error', details: message },
      { status: 500 }
    );
  }
}

