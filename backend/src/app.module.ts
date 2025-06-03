import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { BomModule } from './bom/bom.module';
import { ProductionModule } from './production/production.module';
import { SalesModule } from './sales/sales.module';
import { EmployeesModule } from './employees/employees.module';
import { DocumentsModule } from './documents/documents.module';
import { RemindersModule } from './reminders/reminders.module';
import { PrismaModule } from './prisma/prisma.module';
import { StockModule } from './stock/stock.module';
import { PurchaseModule } from './purchase/purchase.module';
import { ExpensesModule } from './expenses/expenses.module';

@Module({
  imports: [
    // Core modules
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    
    // Feature modules
    AuthModule,
    UsersModule,
    ProductsModule,
    StockModule,
    BomModule,
    ProductionModule,
    SalesModule,
    PurchaseModule,
    EmployeesModule,
    DocumentsModule,
    RemindersModule,
    ExpensesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
