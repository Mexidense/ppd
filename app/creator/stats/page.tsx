"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@/components/wallet-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, ShoppingCart, FileText, Loader2 } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

interface DailyStats {
  date: string;
  purchases: number;
  revenue: number;
}

interface DocumentPerformance {
  doc_id: string;
  title: string;
  cost: number;
  purchases: number;
  revenue: number;
}

export default function CreatorStatsPage() {
  const { identityKey, address, isConnected } = useWallet();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Stats data
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [totalPurchases, setTotalPurchases] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [averagePrice, setAveragePrice] = useState(0);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [topDocuments, setTopDocuments] = useState<DocumentPerformance[]>([]);

  useEffect(() => {
    async function fetchStats() {
      if (!isConnected || (!identityKey && !address)) {
        setLoading(false);
        return;
      }

      try {
        const walletAddress = identityKey || address || "";
        
        // Fetch creator stats from API
        const statsResponse = await fetch(`/api/stats/creator/${walletAddress}?days=7`);
        if (!statsResponse.ok) {
          throw new Error("Failed to fetch creator stats");
        }
        
        const { stats } = await statsResponse.json();
        
        // Set the stats
        setTotalDocuments(stats.totalDocuments);
        setTotalPurchases(stats.totalPurchases);
        setTotalRevenue(stats.totalRevenue);
        setAveragePrice(stats.averagePrice);
        
        // Format daily stats for charts
        const dailyData: DailyStats[] = stats.dailyStats.map((dayStat: any) => ({
          date: new Date(dayStat.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          purchases: dayStat.purchases,
          revenue: dayStat.revenue
        }));
        
        setDailyStats(dailyData);
        setTopDocuments(stats.topDocuments || []);
        
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [isConnected, identityKey, address]);

  if (!isConnected) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl text-muted-foreground">Wallet not connected</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Please connect your wallet to view your analytics
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="mt-4 text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-destructive">Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Analytics Dashboard</h2>
          <p className="mt-1 text-muted-foreground">
            Track your content performance and revenue
          </p>
        </div>

        {/* Overview Counters */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Overview</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Total Documents */}
            <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Documents
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalDocuments}</div>
                <p className="text-xs text-muted-foreground">
                  Documents published
                </p>
              </CardContent>
            </Card>

            {/* Total Purchases */}
            <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Purchases
                </CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalPurchases}</div>
                <p className="text-xs text-muted-foreground">
                  Across all documents
                </p>
              </CardContent>
            </Card>

            {/* Total Revenue */}
            <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {totalRevenue.toLocaleString()} sats
                </div>
                <p className="text-xs text-muted-foreground">
                  ≈ {(totalRevenue / 100000000).toFixed(6)} BSV
                </p>
              </CardContent>
            </Card>

            {/* Average Document Price */}
            <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg. Document Price
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {averagePrice.toLocaleString()} sats
                </div>
                <p className="text-xs text-muted-foreground">
                  Average across all documents
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Insights Section */}
        {dailyStats.length > 0 && dailyStats.some(d => d.purchases > 0 || d.revenue > 0) && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Quick Insights</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Best Day */}
              {(() => {
                const bestDay = dailyStats.reduce((max, day) => 
                  day.revenue > max.revenue ? day : max
                , dailyStats[0]);
                
                return (
                  <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">BEST DAY</p>
                    <p className="text-2xl font-bold text-green-800 dark:text-green-300">{bestDay.date}</p>
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                      {bestDay.revenue.toLocaleString()} sats • {bestDay.purchases} purchase{bestDay.purchases !== 1 ? 's' : ''}
                    </p>
                  </div>
                );
              })()}

              {/* Total This Week */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">THIS WEEK</p>
                <p className="text-2xl font-bold text-blue-800 dark:text-blue-300">
                  {dailyStats.reduce((sum, day) => sum + day.purchases, 0)} purchases
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                  {dailyStats.reduce((sum, day) => sum + day.revenue, 0).toLocaleString()} sats earned
                </p>
              </div>

              {/* Average Per Day */}
              {(() => {
                const daysWithPurchases = dailyStats.filter(d => d.purchases > 0).length;
                const avgPurchases = daysWithPurchases > 0 
                  ? (dailyStats.reduce((sum, day) => sum + day.purchases, 0) / daysWithPurchases).toFixed(1)
                  : '0';
                const avgRevenue = daysWithPurchases > 0
                  ? Math.round(dailyStats.reduce((sum, day) => sum + day.revenue, 0) / daysWithPurchases)
                  : 0;

                return (
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                    <p className="text-xs font-semibold text-purple-700 dark:text-purple-400 mb-1">DAILY AVERAGE</p>
                    <p className="text-2xl font-bold text-purple-800 dark:text-purple-300">{avgPurchases} purchases</p>
                    <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                      {avgRevenue.toLocaleString()} sats per day
                    </p>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Top Documents Performance */}
        {topDocuments.length > 0 && topDocuments.some(d => d.purchases > 0) && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Document Performance</h3>
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-base">Top Performing Documents</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Your best-selling documents by revenue
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topDocuments
                    .filter(doc => doc.purchases > 0)
                    .map((doc, index) => (
                      <div
                        key={doc.doc_id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex-shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold truncate" title={doc.title}>
                              {doc.title}
                            </h4>
                            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <ShoppingCart className="h-3 w-3" aria-hidden="true" />
                                {doc.purchases} sale{doc.purchases !== 1 ? 's' : ''}
                              </span>
                              <span className="text-muted-foreground/50">•</span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" aria-hidden="true" />
                                {doc.cost.toLocaleString()} sats each
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-4">
                          <div className="text-lg font-bold text-green-600 dark:text-green-400">
                            {doc.revenue.toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            sats earned
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
                {topDocuments.filter(d => d.purchases > 0).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No sales data yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Purchases Chart */}
          <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Daily Purchases</CardTitle>
              <p className="text-sm text-muted-foreground">
                Number of purchases over the last 7 days
              </p>
            </CardHeader>
            <CardContent>
              {dailyStats.length === 0 || dailyStats.every(d => d.purchases === 0) ? (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="text-center">
                    <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-2" aria-hidden="true" />
                    <p className="text-sm text-muted-foreground">No purchases yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Share your documents to start getting sales
                    </p>
                  </div>
                </div>
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyStats} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        stroke="hsl(var(--border))"
                        opacity={0.3}
                      />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        tickLine={{ stroke: 'hsl(var(--border))' }}
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                      />
                      <YAxis 
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        tickLine={{ stroke: 'hsl(var(--border))' }}
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                        allowDecimals={false}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          padding: '12px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        }}
                        labelStyle={{ 
                          color: 'hsl(var(--foreground))',
                          fontWeight: 600,
                          marginBottom: '4px'
                        }}
                        itemStyle={{ 
                          color: 'hsl(var(--foreground))',
                          padding: '4px 0'
                        }}
                        formatter={(value: any, name: string) => {
                          if (name === "Purchases") {
                            return [`${value} purchase${value !== 1 ? 's' : ''}`, name];
                          }
                          return [value, name];
                        }}
                      />
                      <Legend 
                        wrapperStyle={{ paddingTop: '20px' }}
                        iconType="circle"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="purchases" 
                        stroke="#b8960f" 
                        strokeWidth={3}
                        dot={{ fill: '#b8960f', r: 5 }}
                        activeDot={{ r: 7, stroke: '#b8960f', strokeWidth: 2, fill: '#fff' }}
                        name="Purchases"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Revenue Chart */}
          <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Daily Revenue</CardTitle>
              <p className="text-sm text-muted-foreground">
                Revenue generated over the last 7 days
              </p>
            </CardHeader>
            <CardContent>
              {dailyStats.length === 0 || dailyStats.every(d => d.revenue === 0) ? (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="text-center">
                    <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-2" aria-hidden="true" />
                    <p className="text-sm text-muted-foreground">No revenue yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Your first sale will appear here
                    </p>
                  </div>
                </div>
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyStats} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#b8960f" stopOpacity={0.9}/>
                          <stop offset="100%" stopColor="#b8960f" stopOpacity={0.6}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        stroke="hsl(var(--border))"
                        opacity={0.3}
                      />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        tickLine={{ stroke: 'hsl(var(--border))' }}
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                      />
                      <YAxis 
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        tickLine={{ stroke: 'hsl(var(--border))' }}
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                        tickFormatter={(value) => {
                          if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                          if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
                          return value.toString();
                        }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          padding: '12px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        }}
                        labelStyle={{ 
                          color: 'hsl(var(--foreground))',
                          fontWeight: 600,
                          marginBottom: '4px'
                        }}
                        formatter={(value: any) => {
                          const sats = Number(value);
                          const bsv = (sats / 100000000).toFixed(8);
                          return [`${sats.toLocaleString()} sats (≈ ${bsv} BSV)`, 'Revenue'];
                        }}
                        cursor={{ fill: 'hsl(var(--accent))', opacity: 0.1 }}
                      />
                      <Legend 
                        wrapperStyle={{ paddingTop: '20px' }}
                        iconType="square"
                      />
                      <Bar 
                        dataKey="revenue" 
                        fill="url(#revenueGradient)"
                        radius={[8, 8, 0, 0]}
                        name="Revenue (sats)"
                        maxBarSize={80}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

