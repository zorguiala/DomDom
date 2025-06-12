import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Sale, CreateSaleInput, ProcessVanReturnInput } from "@/types/sales";

const SALES_KEY = "sales";

// Fetch all sales
export function useSales() {
  return useQuery({
    queryKey: [SALES_KEY],
    queryFn: async () => {
      const response = await fetch("/api/sales");
      if (!response.ok) {
        throw new Error("Failed to fetch sales");
      }
      const data = await response.json();
      return data.sales as Sale[];
    },
  });
}

// Fetch single sale
export function useSale(saleId: string) {
  return useQuery({
    queryKey: [SALES_KEY, saleId],
    queryFn: async () => {
      const response = await fetch(`/api/sales/${saleId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch sale");
      }
      const data = await response.json();
      return data.sale as Sale;
    },
    enabled: !!saleId,
  });
}

// Create sale
export function useCreateSale() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: CreateSaleInput) => {
      const response = await fetch("/api/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create sale");
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [SALES_KEY] });
      
      const isVanSale = data.sale.type === "DOOR_TO_DOOR";
      toast({
        title: "Success",
        description: isVanSale
          ? `Van sale created with exit slip: ${data.sale.exitSlipNumber}`
          : "Sale created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Process van returns
export function useProcessVanReturns() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: ProcessVanReturnInput) => {
      const response = await fetch("/api/sales/van-returns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to process returns");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [SALES_KEY] });
      queryClient.invalidateQueries({ queryKey: [SALES_KEY, variables.saleId] });
      
      toast({
        title: "Success",
        description: "Van sale returns processed successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Update sale
export function useUpdateSale() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<Sale>) => {
      const response = await fetch(`/api/sales/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update sale");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [SALES_KEY] });
      queryClient.invalidateQueries({ queryKey: [SALES_KEY, variables.id] });
      
      toast({
        title: "Success",
        description: "Sale updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update sale",
        variant: "destructive",
      });
    },
  });
}

// Delete sale
export function useDeleteSale() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (saleId: string) => {
      const response = await fetch(`/api/sales/${saleId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete sale");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SALES_KEY] });
      
      toast({
        title: "Success",
        description: "Sale deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete sale",
        variant: "destructive",
      });
    },
  });
}