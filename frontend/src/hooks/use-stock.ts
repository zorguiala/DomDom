import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { inventoryApi } from "../services/inventoryService";
import type { Product } from "../types/inventory";

interface UseStockOptions {
  search?: string;
  showRawMaterials?: boolean;
  showInactive?: boolean;
}

export function useStock({
  search = "",
  showRawMaterials,
  showInactive,
}: UseStockOptions) {
  const productsQuery = useQuery(
    ["products", search, showRawMaterials, showInactive],
    () =>
      inventoryApi.getProducts({
        search,
        isRawMaterial: showRawMaterials,
        isActive: showInactive ? undefined : true,
      })
  );

  const lowStockQuery = useQuery(["lowStock"], () =>
    inventoryApi.getLowStockProducts()
  );

  return {
    products: productsQuery.data as Product[] | undefined,
    loadingProducts: productsQuery.isLoading,
    lowStock: lowStockQuery.data as Product[] | undefined,
    loadingLowStock: lowStockQuery.isLoading,
    refetchProducts: productsQuery.refetch,
  };
}
