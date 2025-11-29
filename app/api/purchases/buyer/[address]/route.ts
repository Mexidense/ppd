import { NextRequest, NextResponse } from 'next/server';
import { getPurchasesByBuyer } from '@/backend/supabase';

/**
 * GET /api/purchases/buyer/[address]
 * Get all purchases by a specific buyer address
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;

    if (!address) {
      return NextResponse.json(
        { error: 'Buyer address is required' },
        { status: 400 }
      );
    }

    const { data, error } = await getPurchasesByBuyer(address);

    if (error) {
      console.error('Error fetching purchases:', error);
      return NextResponse.json(
        { error: 'Failed to fetch purchases', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      purchases: data,
      count: data?.length || 0,
      buyer: address,
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

