import { useState, useEffect } from "react";
import {
  stockApi,
  StockTransaction,
  TransactionFilters,
} from "../services/stock-service";

interface UseStockTransactionsResult {
  transactions: StockTransaction[];
  loading: boolean;
  error: string | null;
  fetchTransactions: (filters?: TransactionFilters) => Promise<void>;
  fetchProductHistory: (
    productId: string,
    dateRange?: { start: string; end: string }
  ) => Promise<void>;
}

export const useStockTransactions = (
  initialFilters?: TransactionFilters
): UseStockTransactionsResult => {
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async (filters?: TransactionFilters) => {
    try {
      setLoading(true);
      const data = await stockApi.getTransactions(filters);
      setTransactions(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError("Failed to load transaction data");
    } finally {
      setLoading(false);
    }
  };

  const fetchProductHistory = async (
    productId: string,
    dateRange?: { start: string; end: string }
  ) => {
    try {
      setLoading(true);
      const data = await stockApi.getStockMovementHistory(productId, dateRange);
      setTransactions(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching product history:", err);
      setError("Failed to load product history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(initialFilters);
  }, []);

  return {
    transactions,
    loading,
    error,
    fetchTransactions,
    fetchProductHistory,
  };
};
