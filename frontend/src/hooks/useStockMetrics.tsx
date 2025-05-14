import { useState, useEffect } from "react";
import { stockApi, Product, StockMetrics } from "../services/stock-service";

interface UseStockMetricsResult {
  metrics: StockMetrics | null;
  lowStockItems: Product[];
  mostProfitableProducts: Product[];
  topSellingProducts: Product[];
  loading: boolean;
  error: string | null;
  fetchMetrics: () => Promise<void>;
  fetchLowStockItems: () => Promise<void>;
  fetchMostProfitableProducts: (limit?: number) => Promise<void>;
  fetchTopSellingProducts: (
    limit?: number,
    dateRange?: { start: string; end: string }
  ) => Promise<void>;
}

export const useStockMetrics = (): UseStockMetricsResult => {
  const [metrics, setMetrics] = useState<StockMetrics | null>(null);
  const [lowStockItems, setLowStockItems] = useState<Product[]>([]);
  const [mostProfitableProducts, setMostProfitableProducts] = useState<
    Product[]
  >([]);
  const [topSellingProducts, setTopSellingProducts] = useState<Product[]>([]);
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

  const fetchMostProfitableProducts = async (limit = 5) => {
    try {
      setLoading(true);
      const data = await stockApi.getMostProfitableProducts(limit);
      setMostProfitableProducts(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching most profitable products:", err);
      setError("Failed to load most profitable products");
    } finally {
      setLoading(false);
    }
  };

  const fetchTopSellingProducts = async (
    limit = 5,
    dateRange?: { start: string; end: string }
  ) => {
    try {
      setLoading(true);
      const data = await stockApi.getTopSellingProducts(limit, dateRange);
      setTopSellingProducts(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching top selling products:", err);
      setError("Failed to load top selling products");
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
          fetchMostProfitableProducts(),
          fetchTopSellingProducts(),
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
    mostProfitableProducts,
    topSellingProducts,
    loading,
    error,
    fetchMetrics,
    fetchLowStockItems,
    fetchMostProfitableProducts,
    fetchTopSellingProducts,
  };
};
