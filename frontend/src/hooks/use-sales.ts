import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { salesService } from "../services/sales-service";
import { CreateSaleDto, Sale } from "../types/sales";

export function useSales(params?: {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
}) {
  return useQuery({
    queryKey: ["sales", params],
    queryFn: () => salesService.getSales(params),
  });
}

export function useSale(id: string) {
  return useQuery({
    queryKey: ["sale", id],
    queryFn: () => salesService.getSale(id),
    enabled: !!id,
  });
}

export function useCreateSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSaleDto) => salesService.createSale(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
    },
  });
}

export function useUpdateSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: string; update: Partial<Sale> }) =>
      salesService.updateSale(data.id, data.update),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
    },
  });
}

export function useDeleteSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => salesService.deleteSale(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
    },
  });
}

export function useSalesReport(params?: {
  startDate?: string;
  endDate?: string;
  productId?: string;
  customerName?: string;
}) {
  return useQuery({
    queryKey: ["sales-report", params],
    queryFn: () => salesService.getSalesReport(params),
  });
}
