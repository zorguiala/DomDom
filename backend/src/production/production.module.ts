import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductionOrder } from '../entities/production-order.entity';
import { ProductionRecord } from '../entities/production-record.entity';
import { EmployeeAttendance } from '../entities/employee-attendance.entity';
import { Employee } from '../entities/employee.entity';
import { BOM } from '../entities/bom.entity';
import { User } from '../entities/user.entity';
import { Notification } from '../entities/notification.entity';
import { BOMModule } from '../bom/bom.module';
import { InventoryModule } from '../inventory/inventory.module';
import { ProductionController } from './production.controller';
import { AttendanceController } from './attendance.controller';
import { NotificationController } from './notification.controller';
import { ProductionService } from './production.service';
import { AttendanceService } from './attendance.service';
import { ProductionOrderService } from './services/production-order.service';
import { ProductionRecordService } from './services/production-record.service';
import { MaterialConsumptionService } from './services/material-consumption.service';
import { EmployeeProductivityService } from './services/employee-productivity.service';
import { NotificationService } from './services/notification.service';
import { ProductionStatisticsService } from './services/production-statistics.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductionOrder,
      ProductionRecord,
      EmployeeAttendance,
      Employee,
      BOM,
      User,
      Notification,
    ]),
    BOMModule,
    InventoryModule,
  ],
  controllers: [
    ProductionController, 
    AttendanceController,
    NotificationController,
  ],
  providers: [
    ProductionService,
    AttendanceService,
    // Register the specialized services
    ProductionOrderService,
    ProductionRecordService,
    MaterialConsumptionService,
    EmployeeProductivityService,
    NotificationService,
    ProductionStatisticsService,
  ],
  exports: [
    ProductionService,
    AttendanceService,
    // Export the specialized services
    ProductionOrderService,
    ProductionRecordService,
    MaterialConsumptionService,
    EmployeeProductivityService,
    NotificationService,
    ProductionStatisticsService,
  ],
})
export class ProductionModule {}
