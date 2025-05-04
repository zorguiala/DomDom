export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  description?: string;
  price: number;
  costPrice?: number;
  currentStock: number;
  minimumStock: number;
  unit: string;
  isRawMaterial: boolean;
  isActive: boolean;
  leadTimeDays?: number;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryTransaction {
  id: string;
  productId: string;
  type: "purchase" | "sale" | "production_in" | "production_out" | "adjustment";
  quantity: number;
  unitPrice: number;
  reference?: string;
  notes?: string;
  createdAt: string;
  createdById: string;
}

export interface InventoryReport {
  productId: string;
  productName: string;
  totalPurchased: number;
  totalSold: number;
  currentStock: number;
}
