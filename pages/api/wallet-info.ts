import type { NextApiRequest, NextApiResponse } from 'next';
import { wallet } from '../../lib/wallet-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const w = await wallet;
    const identityKey = await w.getPublicKey({ identityKey: true });
    
    return res.status(200).json({
      identityKey: identityKey.publicKey
    });
  } catch (error: any) {
    console.error('Error getting wallet info:', error);
    return res.status(500).json({ error: error.message || 'Failed to get wallet info' });
  }
}

