import { NextApiRequest, NextApiResponse } from 'next';

/**
 * CORS middleware for Next.js API routes
 * Allows requests from specified origins
 */
export function corsMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  allowedOrigins: string[] = ['*']
) {
  const origin = req.headers.origin;

  // Check if origin is allowed
  if (allowedOrigins.includes('*') || (origin && allowedOrigins.includes(origin))) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-bsv-payment');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }

  return false;
}

/**
 * Helper to add CORS headers to API responses
 * Usage in API route:
 * 
 * import { withCors } from '@/lib/cors';
 * 
 * export default withCors(async function handler(req, res) {
 *   // Your API logic
 * });
 */
export function withCors(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void,
  allowedOrigins?: string[]
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const isPreflight = corsMiddleware(req, res, allowedOrigins);
    
    if (isPreflight) {
      return; // End here for OPTIONS requests
    }

    return handler(req, res);
  };
}

