import { ForwardRefExoticComponent, RefAttributes } from "react";
import { LucideProps } from "lucide-react";

/**
 * Core entity types based on Prisma schema
 */

// Define status types based on schema constants
export type Role = "ADMIN" | "SALES" | "INVENTORY" | "HR";
export type PurchaseStatus = "DRAFT" | "CONFIRMED" | "RECEIVED";
export type SaleType = "DOOR_TO_DOOR" | "CLASSIC";
export type SaleStatus = "QUOTE" | "CONFIRMED" | "DELIVERED";
export type ProductionStatus =
  | "PLANNED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";
export type AttendanceStatus =
  | "PRESENT"
  | "ABSENT"
  | "LATE"
  | "SICK_LEAVE"
  | "VACATION";

export interface SupplierStatistics {
  totalOrders: number;
  lastOrderDate?: Date;
  lastOrderNumber?: string;
  lastOrderTotal: number;
  avgCostPerUnit: number;
  lastOrderItemsCount: number;
}

export interface Supplier {
  id: string;
  companyName: string;
  email?: string;
  phone?: string;
  address?: string;
  mf?: string;
  createdAt: Date;
  updatedAt: Date;
  statistics?: SupplierStatistics;
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name?: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category?: string;
  unit: string;
  priceSell: number;
  priceCost: number;
  qtyOnHand: number;
  minQty?: number;
  isRawMaterial: boolean;
  isFinishedGood: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BillOfMaterials {
  id: string;
  name: string;
  description?: string;
  finalProductId: string;
  finalProduct?: Product;
  outputQuantity: number; // How many units this BOM produces (like Odoo)
  outputUnit: string; // Unit of the output (pieces, kg, etc.)
  unitCost?: number; // Calculated cost per unit
  components: BomComponent[];
  productionOrders?: ProductionOrder[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BomComponent {
  id: string;
  bomId: string;
  productId: string;
  product: Product;
  quantity: number;
  unit: string;
}

export interface ProductionOrder {
  id: string;
  orderNumber: string;
  bomId?: string;
  bom?: BillOfMaterials;
  productId: string;
  product: Product;
  qtyOrdered: number;
  qtyProduced: number;
  status: ProductionStatus;
  priority?: string;
  startDate?: Date;
  expectedEndDate?: Date;
  actualEndDate?: Date;
  startedAt?: Date;
  finishedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockMovement {
  id: string;
  productId: string;
  product: Product;
  qty: number;
  movementType: string;
  movementDate: Date;
  reference?: string;
  reason?: string;
  notes?: string;
  createdAt: Date;
}

export interface Purchase {
  id: string;
  orderNumber: string;
  poNumber: string;
  supplierName: string;
  supplierEmail?: string;
  status: PurchaseStatus;
  orderDate: Date;
  expectedDate?: Date;
  receivedDate?: Date;
  totalAmount: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  items: PurchaseItem[];
}

export interface PurchaseItem {
  id: string;
  purchaseId: string;
  productId: string;
  product: Product;
  qtyOrdered: number;
  qtyReceived: number;
  unitCost: number;
  totalCost: number;
}

export interface Sale {
  id: string;
  saleNumber: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  type: SaleType;
  status: SaleStatus;
  orderDate: Date;
  saleDate: Date;
  deliveryDate?: Date;
  totalAmount: number;
  subtotal: number;
  tva: number;
  timbre: number;
  exitSlipNumber?: string;
  exitSlipDate?: Date;
  returnDate?: Date;
  returnedAmount: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  items: SaleItem[];
  vanOperation?: VanSalesOperation;
}

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  product: Product;
  qty: number;
  unitPrice: number;
  totalPrice: number;
  deliveredQty: number;
  returnedQty: number;
}

export interface VanSalesOperation {
  id: string;
  operationDate: Date;
  saleId: string;
  sale?: Sale;
  driverName?: string;
  vehicleNumber?: string;
  departureTime?: Date;
  returnTime?: Date;
  totalProductsOut: number;
  totalProductsSold: number;
  totalReturned: number;
  status: "IN_PROGRESS" | "COMPLETED";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  email?: string;
  phone?: string;
  department?: string;
  position?: string;
  salary?: number;
  hireDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  attendance: Attendance[];
  payrolls: Payroll[];
}

export interface Attendance {
  id: string;
  employeeId: string;
  employee: Employee;
  date: Date;
  status: AttendanceStatus;
  hoursWorked?: number;
  notes?: string;
  createdAt: Date;
}

export interface Payroll {
  id: string;
  employeeId: string;
  employee: Employee;
  month: number;
  year: number;
  baseSalary: number;
  overtime: number;
  deductions: number;
  netSalary: number;
  createdAt: Date;
}

export interface Expense {
  id: string;
  description: string;
  category: string;
  amount: number;
  expenseDate: Date;
  receipt?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * API Response types
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Form types for creating/updating entities
 */

export interface CreateProductForm {
  name: string;
  sku?: string;
  category?: string;
  unit: string;
  priceSell: number;
  priceCost: number;
  qtyOnHand: number;
  minQty?: number;
  isRawMaterial: boolean;
  isFinishedGood: boolean;
}

export interface CreatePurchaseForm {
  supplierName: string;
  expectedDate?: Date;
  notes?: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;
}

export interface CreateSaleForm {
  customerName: string;
  type: SaleType;
  deliveryDate?: Date;
  notes?: string;
  driverName?: string;
  vehicleNumber?: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;
}

export interface CreateEmployeeForm {
  employeeId: string;
  name: string;
  email?: string;
  phone?: string;
  department?: string;
  position?: string;
  salary?: number;
  hireDate: Date;
}

export interface CreateExpenseForm {
  description: string;
  category: string;
  amount: number;
  expenseDate: Date;
  receipt?: string;
  notes?: string;
}

/**
 * Dashboard and analytics types
 */

export interface DashboardStats {
  totalProducts: number;
  lowStockProducts: number;
  totalSales: number;
  totalPurchases: number;
  totalEmployees: number;
  monthlySales: number;
  monthlyExpenses: number;
  topSellingProducts: Array<{
    product: Product;
    totalSold: number;
    revenue: number;
  }>;
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }>;
}

/**
 * UI Component props
 */

export interface TableColumn<T = any> {
  header: string;
  accessorKey: keyof T;
  cell?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
}

export interface FilterOption {
  label: string;
  value: string;
}

export interface SortOption {
  field: string;
  direction: "asc" | "desc";
}

/**
 * Feature flags
 */

export interface FeatureFlags {
  doorToDoorSales: boolean;
  advancedReporting: boolean;
  multiCurrency: boolean;
  inventoryBarcode: boolean;
  productionScheduling: boolean;
}

/**
 * Navigation and menu types
 */

export interface NavItem {
  title: string;
  href: string;
  icon?: React.ComponentType;
  badge?: string;
  children?: NavItem[];
}

export interface BreadcrumbItem {
  title: string;
  href?: string;
}

export interface NavigationItem {
  title: string;
  href: string;
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  badge?: string | number;
  children?: NavigationItem[];
  roles?: string[]; // Added for RBAC
}
