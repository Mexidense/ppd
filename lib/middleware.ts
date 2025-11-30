import { wallet } from './wallet-server';
import { NextApiRequest, NextApiResponse } from 'next';
import { createAuthMiddleware } from '@bsv/auth-express-middleware';
import { createPaymentMiddleware } from '@bsv/payment-express-middleware';
import { Request, Response, NextFunction } from 'express';

// Extended Next.js API Request with auth and payment data
export interface PaymentRequest extends NextApiRequest {
  payment?: {
    satoshisPaid: number;
    derivationPrefix?: string;
    derivationSuffix?: string;
    accepted: boolean;
    tx: any;
  };
  auth?: {
    identityKey: string;
  };
}

// Price calculator for document purchases
export function calculateDocumentPrice(req: any, documentCost?: number): number {
  // If document cost is provided (from API route), use it
  if (documentCost !== undefined) {
    return documentCost;
  }

  // Try to extract amount from payment header if it exists
  const paymentHeader = req.headers['x-bsv-payment'];
  if (paymentHeader && typeof paymentHeader === 'string') {
    try {
      const paymentData = JSON.parse(paymentHeader);
      if (paymentData.amount && typeof paymentData.amount === 'number') {
        return paymentData.amount;
      }
    } catch (e) {
      console.error('Failed to parse payment header:', e);
    }
  }

  // Return 1 sat minimum to trigger the payment flow
  return 1;
}

// Derivation parameters for BRC-29
export const BRC29_PROTOCOL_ID: [number, string] = [2, '3241645161d8'];
export const DERIVATION_PREFIX = 'ppd'; // Pay Per Document

// Convert Express middleware to Next.js API route handler
export function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: (req: Request, res: Response, next: NextFunction) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    // Extend Next.js response with Express-compatible methods
    const extendedRes: any = res;

    // Add Express's res.set() method (alias for setHeader)
    if (!extendedRes.set) {
      extendedRes.set = function(field: string | Record<string, string>, value?: string) {
        if (typeof field === 'string' && value !== undefined) {
          res.setHeader(field, value);
        } else if (typeof field === 'object') {
          Object.entries(field).forEach(([key, val]) => {
            res.setHeader(key, val);
          });
        }
        return extendedRes;
      };
    }

    // Add Express's res.get() method
    if (!extendedRes.get) {
      extendedRes.get = function(field: string) {
        return res.getHeader(field);
      };
    }

    // Ensure res.send works (Next.js uses res.send from http.ServerResponse)
    if (!extendedRes.send) {
      extendedRes.send = function(body: any) {
        return res.end(body);
      };
    }

    fn(req as any, extendedRes, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

// Create auth middleware instance
let authMiddlewareInstance: ((req: Request, res: Response, next: NextFunction) => void) | null = null;

export async function getAuthMiddleware() {
  if (!authMiddlewareInstance) {
    authMiddlewareInstance = createAuthMiddleware({
      wallet: await wallet,
      allowUnauthenticated: true, // Allow unauthenticated - we'll get identity from payment
      logger: console,
      logLevel: 'info'
    });
  }
  return authMiddlewareInstance;
}

// Create payment middleware instance with specific price
export async function getPaymentMiddleware(documentCost?: number) {
  return createPaymentMiddleware({
    wallet: await wallet,
    calculateRequestPrice: (req: any) => calculateDocumentPrice(req, documentCost)
  });
}

