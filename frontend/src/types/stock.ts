export interface StockCountItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  expectedQuantity: number;
  actualQuantity?: number;
  unit: string;
  variance?: number;
  variancePercentage?: number;
  notes?: string;
}

export interface StockCount {
  id: string;
  name: string;
  status: "draft" | "in_progress" | "completed" | "reconciled";
  createdAt: string;
  scheduledDate: string;
  completedAt?: string;
  createdBy: string;
  completedBy?: string;
  notes?: string;
  items: StockCountItem[];
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  description?: string;
  currentStock: number;
  minimumStock: number;
  unit: string;
  price: number;
  costPrice: number;
  profitMargin: number;
  totalValueInStock: number;
  lowStockAlert?: boolean;
  category?: string;
  location?: string;
  supplier?: string;
  lastRestockDate?: string;
}
