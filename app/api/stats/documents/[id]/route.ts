import { NextRequest, NextResponse } from 'next/server';
import { getDocumentStats } from '@/backend/supabase';

/**
 * GET /api/stats/documents/[id]
 * Get statistics for a specific document
 * 
 * Query parameters:
 * - start_date: Optional start date (ISO format: YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)
 * - end_date: Optional end date (ISO format: YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    // Validate date formats if provided
    if (startDate && isNaN(Date.parse(startDate))) {
      return NextResponse.json(
        { error: 'Invalid start_date format. Use ISO format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)' },
        { status: 400 }
      );
    }

    if (endDate && isNaN(Date.parse(endDate))) {
      return NextResponse.json(
        { error: 'Invalid end_date format. Use ISO format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)' },
        { status: 400 }
      );
    }

    // Check if start_date is before end_date
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return NextResponse.json(
        { error: 'start_date must be before or equal to end_date' },
        { status: 400 }
      );
    }

    const { data, error } = await getDocumentStats(
      id,
      startDate || undefined,
      endDate || undefined
    );

    if (error) {
      console.error('Error fetching document stats:', error);
      
      // Handle document not found
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Document not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to fetch statistics', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      document_id: id,
      stats: data,
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

