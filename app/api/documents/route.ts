import { NextRequest, NextResponse } from 'next/server';
import { getAllDocuments } from '@/backend/supabase';

/**
 * GET /api/documents
 * List all documents
 */
export async function GET(request: NextRequest) {
  try {
    const { data, error } = await getAllDocuments();

    if (error) {
      console.error('Error fetching documents:', error);
      return NextResponse.json(
        { error: 'Failed to fetch documents', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      documents: data,
      count: data?.length || 0,
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

