import { Product } from './inventory';

export enum CountStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  RECONCILED = 'reconciled'
}

export interface InventoryCountItem {
  id: string;
  countId: string;
  product: Product;
  productId: string;
  productName: string;
  expectedQuantity: number;
  actualQuantity: number;
  unit: string;
  variance: number;
  variancePercentage: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryCount {
  id: string;
  reference: string;
  countDate: Date;
  status: CountStatus;
  notes?: string;
  items: InventoryCountItem[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  reconciledAt?: Date;
}

export interface InventoryCountItemDto {
  productId: string;
  expectedQuantity: number;
  actualQuantity: number;
  notes?: string;
}

export interface CreateInventoryCountRequest {
  reference?: string;
  countDate?: Date;
  notes?: string;
  items?: InventoryCountItemDto[];
}

export interface UpdateInventoryCountRequest {
  status?: CountStatus;
  notes?: string;
  items?: InventoryCountItemDto[];
}

export interface InventoryReconciliation {
  countId: string;
  adjustments: {
    productId: string;
    productName: string;
    variance: number;
    approved: boolean;
    adjustmentQuantity?: number;
    reason?: string;
  }[];
}
