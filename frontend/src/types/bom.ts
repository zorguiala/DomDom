import { Product } from "./inventory";

export interface BOMItem {
  id: string;
  product: Product;
  quantity: number;
  unit: string;
  wastagePercent?: number;
  createdAt: string;
  updatedAt: string;
}

export interface BOM {
  id: string;
  name: string;
  description?: string;
  outputQuantity: number;
  outputUnit: string;
  isActive: boolean;
  items: BOMItem[];
  createdAt: string;
  updatedAt: string;
}

export interface BOMItemInput {
  productId: string;
  quantity: number;
  unit: string;
  wastagePercent?: number;
}

export interface BOMInput {
  name: string;
  description?: string;
  outputQuantity: number;
  outputUnit: string;
  items: BOMItemInput[];
}

export interface MaterialRequirement {
  product: Product;
  requiredQuantity: number;
  unit: string;
}

export interface AvailabilityCheck {
  isAvailable: boolean;
  shortages: Array<{
    product: Product;
    required: number;
    available: number;
    shortage: number;
    unit: string;
  }>;
}

export interface ProductionCost {
  materialCost: number;
  totalCost: number;
  costBreakdown: Array<{
    product: Product;
    quantity: number;
    unit: string;
    unitCost: number;
    totalCost: number;
  }>;
}
