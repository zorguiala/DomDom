import { useQuery } from "@tanstack/react-query";
import { Supplier } from "@/types";

async function fetchSuppliers() {
  const res = await fetch("/api/suppliers");
  if (!res.ok) throw new Error("Failed to fetch suppliers");
  const data = await res.json();
  return data.suppliers;
}

/**
 * Hook to fetch all suppliers
 * @returns Query result with suppliers array
 */
export function useGetSuppliers() {
  return useQuery<Supplier[], Error>({
    queryKey: ["suppliers"],
    queryFn: fetchSuppliers,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
} 