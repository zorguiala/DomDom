import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductionController } from './production.controller';
import { ProductionService } from './production.service';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { ProductionRecord } from '../entities/production-record.entity';
import { EmployeeAttendance } from '../entities/employee-attendance.entity';
import { Employee } from '../entities/employee.entity';
import { BOM } from '../entities/bom.entity';
import { BomModule } from '../bom/bom.module';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductionRecord,
      EmployeeAttendance,
      Employee,
      BOM,
    ]),
    BomModule,
    InventoryModule,
  ],
  controllers: [ProductionController, AttendanceController],
  providers: [ProductionService, AttendanceService],
  exports: [ProductionService, AttendanceService],
})
export class ProductionModule {}
