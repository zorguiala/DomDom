import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductionOrder } from '../entities/production-order.entity';
import { ProductionRecord } from '../entities/production-record.entity';
import { EmployeeAttendance } from '../entities/employee-attendance.entity';
import { Employee } from '../entities/employee.entity';
import { BOM } from '../entities/bom.entity';
import { BOMModule } from '../bom/bom.module';
import { InventoryModule } from '../inventory/inventory.module';
import { ProductionController } from './production.controller';
import { AttendanceController } from './attendance.controller';
import { ProductionService } from './production.service';
import { AttendanceService } from './attendance.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductionOrder,
      ProductionRecord,
      EmployeeAttendance,
      Employee,
      BOM,
    ]),
    BOMModule,
    InventoryModule,
  ],
  controllers: [ProductionController, AttendanceController],
  providers: [ProductionService, AttendanceService],
  exports: [ProductionService, AttendanceService],
})
export class ProductionModule {}
