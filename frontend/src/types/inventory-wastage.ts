import { Product } from './inventory';

export enum WastageReason {
  EXPIRED = 'expired',
  DAMAGED = 'damaged',
  QUALITY_ISSUES = 'quality_issues',
  SPILLAGE = 'spillage',
  PRODUCTION_ERROR = 'production_error',
  OTHER = 'other'
}

export interface WastageRecord {
  id: string;
  batchId?: string;
  batchNumber?: string;
  productId: string;
  productName: string;
  product?: Product;
  quantity: number;
  reason: WastageReason;
  date: Date;
  reportedBy: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWastageRecordRequest {
  batchId?: string;
  productId: string;
  quantity: number;
  reason: WastageReason;
  date?: Date;
  notes?: string;
}

export interface WastageReportItem {
  productId: string;
  productName: string;
  totalQuantity: number;
  totalCost: number;
  wastageReasons: {
    reason: WastageReason;
    count: number;
    quantity: number;
  }[];
}

export interface WastageAnalytics {
  totalRecords: number;
  totalValue: number;
  totalQuantity: number;
  byReason: {
    reason: WastageReason;
    count: number;
    quantity: number;
    value: number;
  }[];
  byProduct: WastageReportItem[];
  byMonth: {
    month: string;
    count: number;
    quantity: number;
    value: number;
  }[];
}
