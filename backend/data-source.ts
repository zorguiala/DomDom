import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from './src/entities/user.entity';
import { Product } from './src/entities/product.entity';
import { StockItem } from './src/entities/stock-item.entity';
import { BOM } from './src/entities/bom.entity';
import { BOMItem } from './src/entities/bom-item.entity';
import { StockTransaction } from './src/entities/stock-transaction.entity';
import { StockCount, StockCountItem } from './src/entities/stock-count.entity';
import { StockWastage } from './src/entities/stock-wastage.entity';
import { Employee } from './src/entities/employee.entity';
import { EmployeeAttendance } from './src/entities/employee-attendance.entity';
import { EmployeeSchedule } from './src/entities/employee-schedule.entity';
import { ProductionRecord } from './src/entities/production-record.entity';
import { Sale } from './src/entities/sale.entity';
import { SaleItem } from './src/entities/sale-item.entity';
import { Reminder } from './src/entities/reminder.entity';
import { Document } from './src/entities/document.entity';
import { DocumentTemplate } from './src/entities/document-template.entity';
import { ProductionOrder } from './src/entities/production-order.entity';
import { ProductionOrderItem } from './src/entities/production-order-item.entity';

config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [
    User,
    Product,
    StockItem,
    StockWastage,
    StockCount,
    StockCountItem,
    BOM,
    BOMItem,
    StockTransaction,
    Employee,
    EmployeeAttendance,
    EmployeeSchedule,
    ProductionRecord,
    Sale,
    SaleItem,
    Reminder,
    Document,
    DocumentTemplate,
    ProductionOrder,
    ProductionOrderItem,
  ],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  logging: process.env.NODE_ENV !== 'production',
});
