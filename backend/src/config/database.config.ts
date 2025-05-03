import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { config } from 'dotenv';
import { User } from '../entities/user.entity';
import { Product } from '../entities/product.entity';
import { BOM } from '../entities/bom.entity';
import { BOMItem } from '../entities/bom-item.entity';
import { InventoryTransaction } from '../entities/inventory-transaction.entity';
import { Employee } from '../entities/employee.entity';
import { EmployeeAttendance } from '../entities/employee-attendance.entity';
import { ProductionRecord } from '../entities/production-record.entity';
import { Sale } from '../entities/sale.entity';
import { SaleItem } from '../entities/sale-item.entity';
import { Reminder } from '../entities/reminder.entity';
import { Document } from '../entities/document.entity';
import { DocumentTemplate } from '../entities/document-template.entity';
import { ProductionOrder } from '../entities/production-order.entity';
import { ProductionOrderItem } from '../entities/production-order-item.entity';
import { EmployeeSchedule } from '../entities/employee-schedule.entity';

config();

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'domdom',
  entities: [
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
  ],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV !== 'production',
};
