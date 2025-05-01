import { ProductionOrder } from '../entities/production-order.entity';
import { ProductionRecord } from '../entities/production-record.entity';

/**
 * Efficiency metrics for production data
 */
export interface EfficiencyMetrics {
  date: Date;
  totalOutput: number;
  plannedOutput: number;
  efficiency: number;
  unitsMissing: number;
}

/**
 * Production output statistics
 */
export interface ProductionOutput {
  date: Date;
  outputs: Array<{
    product: string;
    quantity: number;
  }>;
  totalOutput: number;
}

/**
 * Progress information for a specific production order
 */
export interface ProductionOrderProgress {
  order: ProductionOrder;
  totalCompletedQuantity: number;
  percentComplete: number;
  recordsByEmployee: Array<{
    employee: {
      id: string;
      firstName: string;
      lastName: string;
      [key: string]: any;
    };
    totalQuantity: number;
    records: ProductionRecord[];
  }>;
}

export interface RecordsByEmployee {
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    [key: string]: any;
  };
  totalQuantity: number;
  records: ProductionRecord[];
}

/**
 * Daily production statistics
 */
export interface DailyProductionStat {
  date: string;
  quantity: number;
  quality: number;
  attended: boolean;
}

/**
 * Metrics for employee productivity
 */
export interface EmployeeProductivityMetrics {
  productivity: number;
  efficiency: number;
  qualityScore: number;
  totalProduced: number;
  targetProduction: number;
  attendanceRate: number;
  metrics: {
    dailyStats: DailyProductionStat[];
    totalRecords: number;
    daysWorked: number;
    workingDays: number;
    daysAbsent: number;
  };
}

/**
 * Product grouping by BOM
 */
export interface ProductByBom {
  bomId: string;
  bomName: string;
  totalQuantity: number;
  records: ProductionRecord[];
}

/**
 * Employee information with productivity metrics
 */
export interface EmployeeEfficiency {
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    employeeId: string;
  };
  metrics: EmployeeProductivityMetrics;
}

/**
 * Detailed production report for an employee
 */
export interface EmployeeProductionReport {
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    employeeId: string;
    role: string;
  };
  metrics: EmployeeProductivityMetrics;
  productionByProduct: ProductByBom[];
  records: ProductionRecord[];
}
