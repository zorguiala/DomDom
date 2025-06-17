import { useQuery } from "@tanstack/react-query";

export function useGetPurchases() {
  return useQuery({
    queryKey: ["purchases"],
    queryFn: async () => {
      const res = await fetch("/api/purchases");
      if (!res.ok) throw new Error("Failed to fetch purchases");
      const data = await res.json();
      return data.purchases;
    },
  });
} 