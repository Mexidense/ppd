import type { NextApiResponse } from 'next';
import {
  PaymentRequest,
  runMiddleware,
  getAuthMiddleware,
  getPaymentMiddleware,
} from '../../../../lib/middleware';
import { getDocumentById } from '../../../../backend/supabase/documents';
import { createPurchase } from '../../../../backend/supabase/purchases';
import { Transaction } from '@bsv/sdk';

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
        console.log('Payment header data:', {
          hasSenderIdentityKey: !!paymentData.senderIdentityKey,
          hasDerivationPrefix: !!paymentData.derivationPrefix,
          hasDerivationSuffix: !!paymentData.derivationSuffix,
          keys: Object.keys(paymentData)
        });
        
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

    // Extract derivation parameters from payment header if not set by middleware
    if (paymentHeaderRaw && typeof paymentHeaderRaw === 'string' && !req.payment.derivationPrefix) {
      try {
        const paymentData = JSON.parse(paymentHeaderRaw);
        if (paymentData.derivationPrefix) {
          req.payment.derivationPrefix = paymentData.derivationPrefix;
        }
        if (paymentData.derivationSuffix) {
          req.payment.derivationSuffix = paymentData.derivationSuffix;
        }
      } catch (e) {
        console.error('Failed to parse payment header for derivation:', e);
      }
    }

    console.log('Payment accepted:', {
      documentId,
      buyer: req.auth?.identityKey?.slice(0, 16) + '...',
      amount: req.payment.satoshisPaid,
      derivationPrefix: req.payment.derivationPrefix || 'not provided',
      derivationSuffix: req.payment.derivationSuffix || 'not provided',
    });

    const actualAmount = req.payment.satoshisPaid;
    const buyerKey = req.auth?.identityKey;

    if (!buyerKey || buyerKey === 'unknown') {
      return res.status(400).json({ error: 'Buyer identity required' });
    }

    if (actualAmount === 0) {
      return res.status(400).json({ error: 'Invalid payment amount' });
    }

    // Extract actual transaction ID from BSV transaction
    let txId = `bsv_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    const txAddresses: string[] = [];
    
    // Try to get transaction from payment or from the header
    let transactionData = req.payment.tx;
    
    // If not in payment object, try to get it from the payment header
    if (!transactionData && paymentHeaderRaw && typeof paymentHeaderRaw === 'string') {
      try {
        const paymentData = JSON.parse(paymentHeaderRaw);
        if (paymentData.transaction) {
          transactionData = paymentData.transaction;
          console.log('Using transaction from payment header');
        }
      } catch {
        // Ignore parsing errors
      }
    }
    
    if (transactionData) {
      try {
        // Log transaction format info
        console.log('Transaction data type:', typeof transactionData, 
                    'isBuffer:', Buffer.isBuffer(transactionData),
                    'length:', transactionData.length,
                    'firstBytes:', transactionData.slice ? transactionData.slice(0, 10) : 'N/A');
        
        // Try to parse the transaction - it might be in different formats
        let tx: Transaction | null = null;
        let txData = transactionData;
        
        // If it's a base64 string, decode it first
        if (typeof txData === 'string' && !txData.startsWith('0x') && txData.match(/^[A-Za-z0-9+/=]+$/)) {
          console.log('Detected base64 string, decoding...');
          const decoded = Buffer.from(txData, 'base64');
          txData = Array.from(decoded); // Convert to Array for Transaction parsing
        }
        
        // Try BEEF format first
        try {
          tx = Transaction.fromBEEF(txData);
          console.log('Successfully parsed as BEEF');
        } catch {
          // Not BEEF format, try other methods
        }
        
        // Try binary format (most likely from middleware)
        if (!tx) {
          try {
            const txArray = Buffer.isBuffer(txData) ? Array.from(txData) : 
                           Array.isArray(txData) ? txData : 
                           Array.from(Buffer.from(txData));
            tx = Transaction.fromBinary(txArray);
            console.log('Successfully parsed as binary');
          } catch (e) {
            console.log('Failed to parse as binary:', e instanceof Error ? e.message : e);
          }
        }
        
        // Try hex format
        if (!tx && typeof txData === 'string') {
          try {
            tx = Transaction.fromHex(txData);
            console.log('Successfully parsed as hex');
          } catch {
            // Not hex format
          }
        }
        
        if (tx) {
          txId = tx.id('hex') as string;
          
          // Extract output information from the transaction
          tx.outputs.forEach((output) => {
            try {
              // Log locking script info (includes address hash for P2PKH)
              const scriptHex = output.lockingScript.toHex();
              txAddresses.push(`script:${scriptHex.slice(0, 40)}...`);
            } catch {
              // Skip if we can't parse
            }
          });

          console.log('✓ BSV Transaction Details:', {
            txid: txId,
            outputAddresses: txAddresses,
            numInputs: tx.inputs.length,
            numOutputs: tx.outputs.length,
            totalSatoshis: actualAmount,
            explorerUrl: `https://whatsonchain.com/tx/${txId}`
          });
          
          console.log('✓ Transaction accepted by payment middleware');
          console.log('✓ View on WhatsOnChain:', `https://whatsonchain.com/tx/${txId}`);
          console.log('Note: The payment middleware should handle broadcasting automatically');
          console.log('If the transaction doesn\'t appear on chain, it may need to be broadcast by the sender\'s wallet');
        } else {
          console.log('Could not parse transaction, using generated ID');
        }
      } catch (err) {
        console.error('Failed to parse BSV transaction:', err);
        // Continue with generated txId if parsing fails
      }
    }

    // Create purchase record
    const { data: purchase, error: purchaseError } = await createPurchase(
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
      buyerIdentity: buyerKey,
      addresses: txAddresses,
      blockchainExplorer: `https://whatsonchain.com/tx/${txId}`
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

