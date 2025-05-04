import { Product } from './inventory';

export interface InventoryBatch {
  id: string;
  productId: string;
  product?: Product;
  batchNumber: string;
  quantity: number;
  unitCost: number;
  manufactureDate?: Date;
  expiryDate?: Date;
  receivedDate: Date;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BatchMovement {
  batchId: string;
  batchNumber: string;
  productId: string;
  productName: string;
  quantity: number;
  movementType: 'IN' | 'OUT' | 'ADJUSTMENT' | 'WASTE';
  movementDate: Date;
  reference?: string;
  notes?: string;
}

export interface BatchInventoryStatus {
  batchId: string;
  batchNumber: string;
  productId: string;
  productName: string;
  initialQuantity: number;
  currentQuantity: number;
  unitCost: number;
  totalValue: number;
  manufactureDate?: Date;
  expiryDate?: Date;
  receivedDate: Date;
  daysUntilExpiry?: number;
  isExpired: boolean;
  isLow: boolean;
}

export interface CreateInventoryBatchRequest {
  productId: string;
  batchNumber: string;
  quantity: number;
  unitCost: number;
  manufactureDate?: Date;
  expiryDate?: Date;
  receivedDate?: Date;
  notes?: string;
}
