import { useQuery } from "@tanstack/react-query";
import { Supplier } from "@/types";

async function fetchSupplier(id: string | null) {
  if (!id) throw new Error("Supplier ID is required");
  const res = await fetch(`/api/suppliers/${id}`);
  if (!res.ok) throw new Error("Failed to fetch supplier");
  const data = await res.json();
  return data.supplier;
}

export function useGetSupplier(id: string | null) {
  return useQuery<Supplier, Error>({
    queryKey: ["supplier", id],
    queryFn: () => fetchSupplier(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
} 