import { useState, useEffect } from "react";
import { stockApi, StockMetrics, StockItem } from "../services/stock-service";

interface UseStockMetricsResult {
  metrics: StockMetrics | null;
  lowStockItems: StockItem[];
  mostProfitableItems: StockItem[];
  topSellingItems: StockItem[];
  loading: boolean;
  error: string | null;
  fetchMetrics: () => Promise<void>;
  fetchLowStockItems: () => Promise<void>;
  fetchMostProfitableItems: (limit?: number) => Promise<void>;
  fetchTopSellingItems: (
    limit?: number,
    dateRange?: { start: string; end: string }
  ) => Promise<void>;
}

export const useStockMetrics = (): UseStockMetricsResult => {
  const [metrics, setMetrics] = useState<StockMetrics | null>(null);
  const [lowStockItems, setLowStockItems] = useState<StockItem[]>([]);
  const [mostProfitableItems, setMostProfitableItems] = useState<
    StockItem[]
  >([]);
  const [topSellingItems, setTopSellingItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const data = await stockApi.getStockMetrics();
      setMetrics(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching stock metrics:", err);
      setError("Failed to load stock metrics");
    } finally {
      setLoading(false);
    }
  };

  const fetchLowStockItems = async () => {
    try {
      setLoading(true);
      const data = await stockApi.getLowStockItems();
      setLowStockItems(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching low stock items:", err);
      setError("Failed to load low stock items");
    } finally {
      setLoading(false);
    }
  };

  const fetchMostProfitableItems = async (limit = 5) => {
    try {
      setLoading(true);
      const data = await stockApi.getMostProfitableItems(limit);
      setMostProfitableItems(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching most profitable items:", err);
      setError("Failed to load most profitable items");
    } finally {
      setLoading(false);
    }
  };

  const fetchTopSellingItems = async (
    limit = 5,
    dateRange?: { start: string; end: string }
  ) => {
    try {
      setLoading(true);
      const data = await stockApi.getTopSellingItems(limit, dateRange);
      setTopSellingItems(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching top selling items:", err);
      setError("Failed to load top selling items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchMetrics(),
          fetchLowStockItems(),
          fetchMostProfitableItems(),
          fetchTopSellingItems()
        ]);
      } catch (err) {
        console.error("Error fetching initial stock metrics data:", err);
        setError("Failed to load stock metrics data");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  return {
    metrics,
    lowStockItems,
    mostProfitableItems,
    topSellingItems,
    loading,
    error,
    fetchMetrics,
    fetchLowStockItems,
    fetchMostProfitableItems,
    fetchTopSellingItems,
  };
};
