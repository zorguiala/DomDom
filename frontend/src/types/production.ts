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
  wastage: number;
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
}

export interface RecordProductionDto {
  employeeId: string;
  quantity: number;
  notes?: string;
}

export interface CreateProductionOrderDto {
  bomId: string;
  quantity: number;
  plannedStartDate: string;
  priority: ProductionOrderPriority;
  assignedToId?: string;
  notes?: string;
}

export interface UpdateProductionOrderDto {
  bomId?: string;
  quantity?: number;
  plannedStartDate?: string;
  priority?: ProductionOrderPriority;
  assignedToId?: string;
  notes?: string;
}

export interface UpdateProductionOrderStatusDto {
  status: ProductionOrderStatus;
}
