import { NextRequest, NextResponse } from 'next/server';
import { createPurchase, getAllPurchases } from '@/backend/supabase';
import { getDocumentById } from '@/backend/supabase';

/**
 * POST /api/purchases
 * Create a new purchase record
 * 
 * Expected JSON body:
 * {
 *   "address_buyer": "0x...",
 *   "doc_id": "uuid",
 *   "transaction_id": "0x..."
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address_buyer, doc_id, transaction_id } = body;

    // Validate inputs
    if (!address_buyer || !doc_id || !transaction_id) {
      return NextResponse.json(
        { error: 'address_buyer, doc_id, and transaction_id are required' },
        { status: 400 }
      );
    }

    // Verify document exists
    const { data: document, error: docError } = await getDocumentById(doc_id);
    if (docError || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Create purchase record
    const { data, error } = await createPurchase(
      address_buyer,
      doc_id,
      transaction_id
    );

    if (error) {
      console.error('Error creating purchase:', error);
      
      // Handle duplicate transaction_id
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Purchase with this transaction_id already exists' },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to create purchase', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      purchase: data,
      document: {
        id: document.id,
        cost: document.cost,
        path: document.path,
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

/**
 * GET /api/purchases
 * Get all purchases (admin endpoint)
 */
export async function GET(request: NextRequest) {
  try {
    const { data, error } = await getAllPurchases();

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

