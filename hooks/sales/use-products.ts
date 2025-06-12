import { useQuery } from "@tanstack/react-query";
import { Product } from "@/types/sales";

const PRODUCTS_KEY = "products";

export function useProducts(options?: { finishedGoodsOnly?: boolean }) {
  return useQuery({
    queryKey: [PRODUCTS_KEY, options],
    queryFn: async () => {
      const response = await fetch("/api/products");
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const data = await response.json();
      let products = data.products as Product[];
      
      // Filter finished goods if requested
      if (options?.finishedGoodsOnly) {
        products = products.filter(p => p.isFinishedGood !== false);
      }
      
      return products;
    },
  });
}