import { supabase } from './config';

export interface TotalStats {
  total_purchases: number;
  total_revenue: number;
  start_date?: string;
  end_date?: string;
}

export interface DailyStats {
  date: string;
  purchases_count: number;
  revenue: number;
}

/**
 * Get total aggregated statistics
 * @param startDate Optional start date for filtering (ISO format)
 * @param endDate Optional end date for filtering (ISO format)
 */
export async function getTotalStats(
  startDate?: string,
  endDate?: string
): Promise<{ data: TotalStats | null; error: any }> {
  try {
    // Build query
    let query = supabase
      .from('purchases')
      .select(`
        created_at,
        documents!inner(cost)
      `);

    // Apply date filters if provided
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data: purchases, error } = await query;

    if (error) {
      return { data: null, error };
    }

    // Calculate total purchases and revenue
    const totalPurchases = purchases?.length || 0;
    const totalRevenue = purchases?.reduce((sum, purchase: any) => {
      return sum + (purchase.documents?.cost || 0);
    }, 0) || 0;

    const stats: TotalStats = {
      total_purchases: totalPurchases,
      total_revenue: parseFloat(totalRevenue.toFixed(2)),
    };

    if (startDate) stats.start_date = startDate;
    if (endDate) stats.end_date = endDate;

    return { data: stats, error: null };
  } catch (error) {
    console.error('Error calculating total stats:', error);
    return { data: null, error };
  }
}

/**
 * Get daily aggregated statistics
 * @param startDate Optional start date for filtering (ISO format)
 * @param endDate Optional end date for filtering (ISO format)
 */
export async function getDailyStats(
  startDate?: string,
  endDate?: string
): Promise<{ data: DailyStats[] | null; error: any }> {
  try {
    // Build query
    let query = supabase
      .from('purchases')
      .select(`
        created_at,
        documents!inner(cost)
      `)
      .order('created_at', { ascending: true });

    // Apply date filters if provided
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data: purchases, error } = await query;

    if (error) {
      return { data: null, error };
    }

    // Group by date and calculate stats
    const dailyStatsMap = new Map<string, { count: number; revenue: number }>();

    purchases?.forEach((purchase: any) => {
      // Extract date part (YYYY-MM-DD) from timestamp
      const date = new Date(purchase.created_at).toISOString().split('T')[0];
      const cost = purchase.documents?.cost || 0;

      if (dailyStatsMap.has(date)) {
        const existing = dailyStatsMap.get(date)!;
        existing.count += 1;
        existing.revenue += cost;
      } else {
        dailyStatsMap.set(date, { count: 1, revenue: cost });
      }
    });

    // Convert map to array
    const dailyStats: DailyStats[] = Array.from(dailyStatsMap.entries())
      .map(([date, stats]) => ({
        date,
        purchases_count: stats.count,
        revenue: parseFloat(stats.revenue.toFixed(2)),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return { data: dailyStats, error: null };
  } catch (error) {
    console.error('Error calculating daily stats:', error);
    return { data: null, error };
  }
}

/**
 * Get statistics for a specific document
 * @param docId Document ID
 * @param startDate Optional start date for filtering
 * @param endDate Optional end date for filtering
 */
export async function getDocumentStats(
  docId: string,
  startDate?: string,
  endDate?: string
): Promise<{
  data: { purchases_count: number; total_revenue: number } | null;
  error: any;
}> {
  try {
    // First get the document to know its cost
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('cost')
      .eq('id', docId)
      .single();

    if (docError) {
      return { data: null, error: docError };
    }

    // Build query for purchases
    let query = supabase
      .from('purchases')
      .select('created_at', { count: 'exact', head: true })
      .eq('doc_id', docId);

    // Apply date filters if provided
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { count, error: countError } = await query;

    if (countError) {
      return { data: null, error: countError };
    }

    const purchasesCount = count || 0;
    const totalRevenue = purchasesCount * (document?.cost || 0);

    return {
      data: {
        purchases_count: purchasesCount,
        total_revenue: parseFloat(totalRevenue.toFixed(2)),
      },
      error: null,
    };
  } catch (error) {
    console.error('Error calculating document stats:', error);
    return { data: null, error };
  }
}

