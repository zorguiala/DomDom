import { Product } from '../../entities/product.entity';

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

export interface WastageRecord {
  id: string;
  batchId?: string;
  batchNumber?: string;
  productId: string;
  productName: string;
  quantity: number;
  reason: WastageReason;
  date: Date;
  reportedBy: string;
  notes?: string;
}

export enum WastageReason {
  EXPIRED = 'EXPIRED',
  DAMAGED = 'DAMAGED',
  QUALITY_ISSUE = 'QUALITY_ISSUE',
  CONTAMINATION = 'CONTAMINATION',
  PROCESSING_LOSS = 'PROCESSING_LOSS',
  OTHER = 'OTHER'
}

export interface InventoryCountRecord {
  id: string;
  countDate: Date;
  status: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED';
  initiatedBy: string;
  completedBy?: string;
  notes?: string;
  items: InventoryCountItem[];
}

export interface InventoryCountItem {
  productId: string;
  productName: string;
  batchId?: string;
  batchNumber?: string;
  expectedQuantity: number;
  actualQuantity: number;
  discrepancy: number;
  notes?: string;
  isReconciled: boolean;
}

export interface InventoryForecast {
  productId: string;
  productName: string;
  currentStock: number;
  averageDailyUsage: number;
  estimatedDepletion: Date;
  daysRemaining: number;
  recommendedReorderQuantity: number;
  reorderPoint: number;
  isLow: boolean;
  usageTrend: 'INCREASING' | 'STABLE' | 'DECREASING';
}
