import { useState, useEffect } from "react";
import { stockApi, StockCount } from "../services/stock-service";

interface UseStockCountResult {
  stockCounts: StockCount[];
  loading: boolean;
  error: string | null;
  fetchStockCounts: () => Promise<void>;
  fetchStockCountById: (id: string) => Promise<StockCount | null>;
  createStockCount: (data: {
    name: string;
    scheduledDate: string;
    products: string[];
    notes?: string;
  }) => Promise<StockCount | null>;
  startStockCount: (id: string) => Promise<StockCount | null>;
  recordQuantities: (
    id: string,
    items: Array<{ itemId: string; actualQuantity: number; notes?: string }>
  ) => Promise<StockCount | null>;
  completeStockCount: (id: string) => Promise<StockCount | null>;
  reconcileStockCount: (id: string) => Promise<StockCount | null>;
}

export const useStockCount = (): UseStockCountResult => {
  const [stockCounts, setStockCounts] = useState<StockCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStockCounts = async () => {
    try {
      setLoading(true);
      const data = await stockApi.getAllStockCounts();
      setStockCounts(data);
      setError(null);
      return data;
    } catch (err) {
      console.error("Error fetching stock counts:", err);
      setError("Failed to load stock count data");
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchStockCountById = async (
    id: string
  ): Promise<StockCount | null> => {
    try {
      setLoading(true);
      const data = await stockApi.getStockCountById(id);
      setError(null);
      return data;
    } catch (err) {
      console.error("Error fetching stock count:", err);
      setError("Failed to load stock count");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createStockCount = async (data: {
    name: string;
    scheduledDate: string;
    products: string[];
    notes?: string;
  }): Promise<StockCount | null> => {
    try {
      setLoading(true);
      const newCount = await stockApi.createStockCount(data);
      setStockCounts([...stockCounts, newCount]);
      setError(null);
      return newCount;
    } catch (err) {
      console.error("Error creating stock count:", err);
      setError("Failed to create stock count");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const startStockCount = async (id: string): Promise<StockCount | null> => {
    try {
      setLoading(true);
      const updatedCount = await stockApi.startStockCount(id);
      setStockCounts(
        stockCounts.map((count) => (count.id === id ? updatedCount : count))
      );
      setError(null);
      return updatedCount;
    } catch (err) {
      console.error("Error starting stock count:", err);
      setError("Failed to start stock count");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const recordQuantities = async (
    id: string,
    items: Array<{ itemId: string; actualQuantity: number; notes?: string }>
  ): Promise<StockCount | null> => {
    try {
      setLoading(true);
      const updatedCount = await stockApi.recordStockCountQuantities(id, items);
      setStockCounts(
        stockCounts.map((count) => (count.id === id ? updatedCount : count))
      );
      setError(null);
      return updatedCount;
    } catch (err) {
      console.error("Error recording quantities:", err);
      setError("Failed to record quantities");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const completeStockCount = async (id: string): Promise<StockCount | null> => {
    try {
      setLoading(true);
      const updatedCount = await stockApi.completeStockCount(id);
      setStockCounts(
        stockCounts.map((count) => (count.id === id ? updatedCount : count))
      );
      setError(null);
      return updatedCount;
    } catch (err) {
      console.error("Error completing stock count:", err);
      setError("Failed to complete stock count");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const reconcileStockCount = async (
    id: string
  ): Promise<StockCount | null> => {
    try {
      setLoading(true);
      const updatedCount = await stockApi.reconcileStockCount(id);
      setStockCounts(
        stockCounts.map((count) => (count.id === id ? updatedCount : count))
      );
      setError(null);
      return updatedCount;
    } catch (err) {
      console.error("Error reconciling stock count:", err);
      setError("Failed to reconcile stock count");
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockCounts();
  }, []);

  return {
    stockCounts,
    loading,
    error,
    fetchStockCounts,
    fetchStockCountById,
    createStockCount,
    startStockCount,
    recordQuantities,
    completeStockCount,
    reconcileStockCount,
  };
};
