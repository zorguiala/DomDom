import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Supplier } from "@/types";

interface UpdateSupplierData {
  companyName: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  mf?: string | null;
}

async function updateSupplier(id: string, data: UpdateSupplierData): Promise<Supplier> {
  const res = await fetch(`/api/suppliers/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to update supplier");
  }
  
  const result = await res.json();
  return result.supplier;
}

/**
 * Hook to update a supplier
 * @returns Mutation function for updating supplier
 */
export function useUpdateSupplier() {
  const queryClient = useQueryClient();
  
  return useMutation<Supplier, Error, { id: string; data: UpdateSupplierData }>({
    mutationFn: ({ id, data }) => updateSupplier(id, data),
    onSuccess: (updatedSupplier, { id }) => {
      // Update the specific supplier in cache
      queryClient.setQueryData(["supplier", id], updatedSupplier);
      // Invalidate the suppliers list to refetch
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });
} 