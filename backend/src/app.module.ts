import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { InventoryModule } from './inventory/inventory.module';
import { ProductsModule } from './products/products.module';
import { BOMModule } from './bom/bom.module';
import { ProductionModule } from './production/production.module';
import { SalesModule } from './sales/sales.module';
import { DocumentsModule } from './documents/documents.module';
import { RemindersModule } from './reminders/reminders.module';
import { UsersModule } from './users/users.module';
import { User } from './entities/user.entity';
import { databaseConfig } from './config/database.config';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      ...databaseConfig,
      entities: [User, ...(databaseConfig.entities as EntityClassOrSchema[])],
    }),
    AuthModule,
    InventoryModule,
    ProductsModule,
    BOMModule,
    ProductionModule,
    SalesModule,
    DocumentsModule,
    RemindersModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
