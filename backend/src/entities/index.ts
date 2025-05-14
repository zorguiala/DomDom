import { User } from './user.entity';
import { Product } from './product.entity';
import { BOM } from './bom.entity';
import { BOMItem } from './bom-item.entity';
import { InventoryTransaction } from './inventory-transaction.entity';
import { Employee } from './employee.entity';
import { EmployeeAttendance } from './employee-attendance.entity';
import { ProductionRecord } from './production-record.entity';
import { Sale } from './sale.entity';
import { SaleItem } from './sale-item.entity';
import { Reminder } from './reminder.entity';
import { Document } from './document.entity';
import { DocumentTemplate } from './document-template.entity';
import { ProductionOrder } from './production-order.entity';
import { ProductionOrderItem } from './production-order-item.entity';
import { EmployeeSchedule } from './employee-schedule.entity';
import { StockTransaction } from './stock-transaction.entity';

export const entities = [
  User,
  Product,
  BOM,
  BOMItem,
  InventoryTransaction,
  Employee,
  EmployeeAttendance,
  ProductionRecord,
  Sale,
  SaleItem,
  Reminder,
  Document,
  DocumentTemplate,
  ProductionOrder,
  ProductionOrderItem,
  EmployeeSchedule,
  StockTransaction,
];
