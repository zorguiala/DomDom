import { User } from "./user";
import { BOM } from "./bom";
import { Employee } from "./employee";

export enum ProductionOrderStatus {
  PLANNED = "planned",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  ON_HOLD = "on_hold",
}

export enum ProductionOrderPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

export enum NotificationType {
  PRODUCTION_COMPLETED = "production_completed",
  PRODUCTION_STARTED = "production_started",
  QUALITY_ISSUE = "quality_issue",
  BATCH_COMPLETED = "batch_completed",
  PRODUCTION_DELAYED = "production_delayed",
  WASTAGE_ALERT = "wastage_alert",
}

export enum NotificationPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

export type ProductionOrderPagination = {
  data: ProductionOrder[];
  limit: number;
  page: number;
  total: number;
};

export interface ProductionOrder {
  id: string;
  bom: BOM;
  quantity: number;
  status: ProductionOrderStatus;
  priority: ProductionOrderPriority;
  plannedStartDate: string;
  actualStartDate?: string;
  completedDate?: string;
  completedQuantity: number;
  assignedTo?: User;
  createdBy: User;
  notes?: string;
  productionRecords?: ProductionRecord[];
  // Batch tracking fields
  isBatchProduction: boolean;
  batchPrefix?: string;
  batchSize?: number;
  batchCount?: number;
}

export interface ProductionRecord {
  id: string;
  productionOrder: ProductionOrder;
  employee: Employee;
  quantity: number;
  startTime?: string;
  endTime?: string;
  notes?: string;
  qualityChecked: boolean;
  qualityNotes?: string;
  wastage: number;
  createdAt: string;
  // Batch tracking fields
  batchNumber?: string;
  batchExpiryDate?: string;
  batchLocation?: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  entityId: string;
  userId: string;
  priority: NotificationPriority;
  isRead: boolean;
  createdAt: string;
}

export interface ProductionProgress {
  order: ProductionOrder;
  totalCompletedQuantity: number;
  percentComplete: number;
  recordsByEmployee: ProductionEmployeeRecord[];
}

interface ProductionEmployeeRecord {
  employee: Employee;
  totalQuantity: number;
  records: ProductionRecord[];
}

export interface ProductionStats {
  efficiency: number;
  totalCompleted: number;
  totalInProgress: number;
  totalPlanned: number;
  averageCompletionTime: number;
  wastagePercentage?: number;
  onTimePercentage?: number;
  qualityPassRate?: number;
}

export interface BatchStatus {
  batchCount: number;
  completedBatches: number;
  inProgressBatches: number;
  remainingBatches: number;
  nextBatchNumber: string | null;
  batches: BatchInfo[];
}

export interface BatchInfo {
  batchNumber: string;
  quantity: number;
  status: string;
  qualityChecked: boolean;
}

export interface QualityControlStats {
  totalRecords: number;
  qualityCheckedRecords: number;
  qualityCheckRate: number;
  issuesFound: number;
  issueRate: number;
}

export interface RecordProductionDto {
  employeeId: string;
  quantity: number;
  notes?: string;
  qualityChecked?: boolean;
  qualityNotes?: string;
  wastage?: number;
  batchNumber?: string;
  batchExpiryDate?: string;
  batchLocation?: string;
}

export interface CreateProductionOrderDto {
  bomId: string;
  quantity: number;
  plannedStartDate: string;
  priority: ProductionOrderPriority;
  assignedToId?: string;
  notes?: string;
  // Batch tracking fields
  isBatchProduction?: boolean;
  batchPrefix?: string;
  batchSize?: number;
  batchCount?: number;
}

export interface UpdateProductionOrderDto {
  bomId?: string;
  quantity?: number;
  plannedStartDate?: string;
  priority?: ProductionOrderPriority;
  assignedToId?: string;
  notes?: string;
  // Batch tracking fields
  isBatchProduction?: boolean;
  batchPrefix?: string;
  batchSize?: number;
  batchCount?: number;
}

export interface UpdateProductionOrderStatusDto {
  status: ProductionOrderStatus;
}

export interface FilterProductionOrdersDto {
  status?: ProductionOrderStatus;
  priority?: ProductionOrderPriority;
  bomId?: string;
  employeeId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  isBatchProductionOnly?: boolean;
  page?: number;
  limit?: number;
}

export interface ProductionRecordsFilterDto {
  startDate?: string;
  endDate?: string;
  employeeId?: string;
  bomId?: string;
  productionOrderId?: string;
  qualityChecked?: boolean;
  batchNumber?: string;
  page?: number;
  limit?: number;
}

export interface NotificationsFilterDto {
  userId?: string;
  unreadOnly?: boolean;
  type?: NotificationType;
  priority?: NotificationPriority;
}

export interface ProductionStatisticsDto {
  startDate: string;
  endDate: string;
  bomId?: string;
  employeeId?: string;
  includeWastage?: boolean;
  groupBy?: 'daily' | 'weekly' | 'monthly';
}

export interface ExportReportDto extends ProductionStatisticsDto {
  format: 'pdf' | 'excel' | 'csv';
  title?: string;
}

export interface CreateNotificationDto {
  type: NotificationType;
  title: string;
  message: string;
  entityId: string;
  userId?: string;
  priority?: NotificationPriority;
  isRead?: boolean;
}

export interface CreateProductionRecordDto {
  bomId: string;
  employeeId: string;
  productionOrderId: string;
  quantity: number;
  wastage?: number;
  notes?: string;
  qualityChecked?: boolean;
  qualityNotes?: string;
  batchNumber?: string;
  batchExpiryDate?: string;
  batchLocation?: string;
}
