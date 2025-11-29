import type { NextApiResponse } from 'next';
import {
  PaymentRequest,
  runMiddleware,
  getAuthMiddleware,
  getPaymentMiddleware,
} from '../../../../lib/middleware';
import { getDocumentById } from '../../../../backend/supabase/documents';
import { createPurchase } from '../../../../backend/supabase/purchases';

export default async function handler(req: PaymentRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id: documentId } = req.query;

    if (!documentId || typeof documentId !== 'string') {
      return res.status(400).json({ error: 'Invalid document ID' });
    }

    // Get the document to know the price
    const { data: document, error: docError } = await getDocumentById(documentId);
    
    if (docError || !document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Run auth middleware first to establish identity
    const authMiddleware = await getAuthMiddleware();
    await runMiddleware(req, res, authMiddleware);

    // Check if there's a payment header to extract identity from
    const paymentHeaderRaw = req.headers['x-bsv-payment'];
    if (paymentHeaderRaw && typeof paymentHeaderRaw === 'string') {
      try {
        const paymentData = JSON.parse(paymentHeaderRaw);
        
        // Extract the buyer identity from the payment header
        if (paymentData.senderIdentityKey) {
          if (!req.auth) {
            (req as any).auth = {};
          }
          (req as any).auth.identityKey = paymentData.senderIdentityKey;
        }
      } catch (e) {
        console.error('Failed to parse payment header for identity:', e);
      }
    }

    // Run payment middleware to handle the BSV payment
    const paymentMiddleware = await getPaymentMiddleware(document.cost);
    await runMiddleware(req, res, paymentMiddleware);

    // At this point, req.auth.identityKey and req.payment are populated by the middleware
    if (!req.payment?.accepted) {
      return res.status(400).json({ error: 'Payment not accepted' });
    }

    console.log('Payment accepted:', {
      documentId,
      buyer: req.auth?.identityKey?.slice(0, 16) + '...',
      amount: req.payment.satoshisPaid,
      derivationPrefix: req.payment.derivationPrefix,
      derivationSuffix: req.payment.derivationSuffix,
    });

    const actualAmount = req.payment.satoshisPaid;
    const buyerKey = req.auth?.identityKey;

    if (!buyerKey || buyerKey === 'unknown') {
      return res.status(400).json({ error: 'Buyer identity required' });
    }

    if (actualAmount === 0) {
      return res.status(400).json({ error: 'Invalid payment amount' });
    }

    // Generate transaction ID from payment data
    const txId = `bsv_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

    // Create purchase record
    const { purchase, error: purchaseError } = await createPurchase(
      buyerKey,
      documentId,
      txId
    );

    if (purchaseError || !purchase) {
      return res.status(500).json({
        error: purchaseError || 'Failed to create purchase record',
      });
    }

    console.log('Purchase recorded:', {
      purchaseId: purchase.id,
      txId,
      amount: actualAmount,
    });

    return res.status(200).json({
      message: 'Purchase successful',
      purchase,
      transactionId: txId,
      amountPaid: actualAmount,
    });

  } catch (error: any) {
    console.error('Purchase error:', error);

    // Check if this is a 402 Payment Required response already sent by middleware
    if (res.headersSent) {
      return;
    }

    return res.status(400).json({ error: error.message || 'Payment failed' });
  }
}

