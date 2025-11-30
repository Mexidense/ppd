import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/backend/supabase/config';

interface CreatorStats {
  totalDocuments: number;
  totalPurchases: number;
  totalRevenue: number;
  averagePrice: number;
  dailyStats: Array<{
    date: string;
    purchases: number;
    revenue: number;
  }>;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { address } = req.query;
    const { days = '7' } = req.query;

    if (!address || typeof address !== 'string') {
      return res.status(400).json({ error: 'Creator address is required' });
    }

    // Get all documents owned by the creator
    const { data: documents, error: docsError } = await supabase
      .from('documents')
      .select('id, cost')
      .eq('address_owner', address);

    if (docsError) {
      console.error('Error fetching documents:', docsError);
      return res.status(500).json({ error: 'Failed to fetch documents' });
    }

    const totalDocuments = documents?.length || 0;
    const docIds = documents?.map(doc => doc.id) || [];

    if (docIds.length === 0) {
      // Creator has no documents
      return res.status(200).json({
        stats: {
          totalDocuments: 0,
          totalPurchases: 0,
          totalRevenue: 0,
          averagePrice: 0,
          dailyStats: [],
        },
      });
    }

    // Get all purchases for these documents
    const { data: purchases, error: purchasesError } = await supabase
      .from('purchases')
      .select(`
        id,
        doc_id,
        created_at,
        documents!inner(cost)
      `)
      .in('doc_id', docIds)
      .order('created_at', { ascending: true });

    if (purchasesError) {
      console.error('Error fetching purchases:', purchasesError);
      return res.status(500).json({ error: 'Failed to fetch purchases' });
    }

    const totalPurchases = purchases?.length || 0;
    const totalRevenue = purchases?.reduce((sum, purchase: any) => {
      return sum + (purchase.documents?.cost || 0);
    }, 0) || 0;

    // Calculate average price (per document, not per purchase)
    const averagePrice = totalDocuments > 0
      ? documents.reduce((sum, doc) => sum + (doc.cost || 0), 0) / totalDocuments
      : 0;

    // Calculate daily stats for the requested number of days
    const numDays = parseInt(days as string) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (numDays - 1));
    startDate.setHours(0, 0, 0, 0);

    // Initialize daily stats map with all days
    const dailyStatsMap = new Map<string, { purchases: number; revenue: number }>();
    for (let i = 0; i < numDays; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      dailyStatsMap.set(dateStr, { purchases: 0, revenue: 0 });
    }

    // Populate with actual data
    purchases?.forEach((purchase: any) => {
      const purchaseDate = new Date(purchase.created_at);
      const dateStr = purchaseDate.toISOString().split('T')[0];
      
      if (dailyStatsMap.has(dateStr)) {
        const existing = dailyStatsMap.get(dateStr)!;
        existing.purchases += 1;
        existing.revenue += purchase.documents?.cost || 0;
      }
    });

    // Convert to array format for charts
    const dailyStats = Array.from(dailyStatsMap.entries())
      .map(([date, stats]) => ({
        date,
        purchases: stats.purchases,
        revenue: stats.revenue,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const stats: CreatorStats = {
      totalDocuments,
      totalPurchases,
      totalRevenue,
      averagePrice: Math.round(averagePrice),
      dailyStats,
    };

    return res.status(200).json({ stats });
  } catch (error) {
    console.error('Error calculating creator stats:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

