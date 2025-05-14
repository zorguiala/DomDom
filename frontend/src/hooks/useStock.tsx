import { useState, useEffect } from "react";
import { stockApi, Product } from "../services/stock-service";

export const useStock = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await stockApi.getAllStock();
        setProducts(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching stock data:", err);
        setError("Failed to load stock data");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, loading, error };
};
