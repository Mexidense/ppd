import type { NextApiRequest, NextApiResponse } from 'next';
import { getPurchasesByBuyer } from '../../../../backend/supabase/purchases';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { address } = req.query;

    if (!address || typeof address !== 'string') {
      return res.status(400).json({ error: 'Invalid address' });
    }

    const { data: purchases, error } = await getPurchasesByBuyer(address);

    if (error) {
      console.error('Error fetching purchases:', error);
      return res.status(500).json({ error: 'Failed to fetch purchases', details: error });
    }

    return res.status(200).json({ purchases: purchases || [] });
  } catch (error: any) {
    console.error('Error in purchases API:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

