// Sales Module Types

export type SaleType = "DOOR_TO_DOOR" | "CLASSIC";
export type SaleStatus = "QUOTE" | "CONFIRMED" | "DELIVERED" | "CANCELLED";
export type VanOperationStatus = "IN_PROGRESS" | "COMPLETED";

export interface Product {
  id: string;
  name: string;
  sku: string;
  priceSell: number;
  qtyOnHand: number;
  isFinishedGood?: boolean;
}

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  product?: Product;
  qty: number;
  unitPrice: number;
  totalPrice: number;
  deliveredQty: number;
  returnedQty: number;
}

export interface VanOperation {
  id: string;
  operationDate: Date | string;
  saleId: string;
  driverName?: string;
  vehicleNumber?: string;
  departureTime?: Date | string;
  returnTime?: Date | string;
  totalProductsOut: number;
  totalProductsSold: number;
  totalReturned: number;
  status: VanOperationStatus;
  notes?: string;
}

export interface Sale {
  id: string;
  saleNumber: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  type: SaleType;
  status: SaleStatus;
  orderDate: Date | string;
  saleDate: Date | string;
  deliveryDate?: Date | string;
  totalAmount: number;
  subtotal: number;
  tva: number;
  timbre: number;
  exitSlipNumber?: string;
  exitSlipDate?: Date | string;
  returnDate?: Date | string;
  returnedAmount: number;
  notes?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  items: SaleItem[];
  vanOperation?: VanOperation;
  clientId?: string;
  commercialId?: string;
}

// Form Types
export interface CreateSaleItemInput {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateSaleInput {
  type: SaleType;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  driverName?: string;
  vehicleNumber?: string;
  notes?: string;
  items: CreateSaleItemInput[];
}

export interface ProcessVanReturnInput {
  saleId: string;
  returnedItems: Array<{
    productId: string;
    returnedQty: number;
  }>;
}

// Calculation Types
export interface SaleTotals {
  subtotal: number;
  tva: number;
  timbre: number;
  total: number;
}

export interface VanReturnSummary {
  totalOut: number;
  totalReturned: number;
  totalSold: number;
}