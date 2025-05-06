import { MigrationInterface, QueryRunner } from 'typeorm';
import { User } from '../../entities/user.entity';
import { Product } from '../../entities/product.entity';
import { BOM } from '../../entities/bom.entity';
import { BOMItem } from '../../entities/bom-item.entity';
import { InventoryTransaction, TransactionType } from '../../entities/inventory-transaction.entity';
import { Employee } from '../../entities/employee.entity';
import { EmployeeAttendance } from '../../entities/employee-attendance.entity';
import { ProductionRecord } from '../../entities/production-record.entity';
import { Sale } from '../../entities/sale.entity';
import { SaleItem } from '../../entities/sale-item.entity';
import * as bcrypt from 'bcrypt';
import { SaleType, SaleStatus } from '../../entities/enums/sale.enum';

export class SeedData1713890568275 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Seed Users
    const adminUser = new User();
    adminUser.email = 'admin@domdom.com';
    adminUser.firstName = 'Admin';
    adminUser.lastName = 'User';
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    adminUser.password = await bcrypt.hash('admin123', 10);
    adminUser.isAdmin = true;
    adminUser.isActive = true;

    const regularUser = new User();
    regularUser.email = 'user@domdom.com';
    regularUser.firstName = 'Regular';
    regularUser.lastName = 'User';
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    regularUser.password = await bcrypt.hash('user123', 10);
    regularUser.isAdmin = false;
    regularUser.isActive = true;

    // Save users
    await queryRunner.manager.save([adminUser, regularUser]);

    // Seed Raw Materials
    const rawMaterials = [
      {
        name: 'Flour',
        sku: 'RM-FL001',
        barcode: '5901234123457',
        description: 'All-purpose flour for baking',
        price: 2.5,
        currentStock: 500,
        minimumStock: 100,
        isActive: true,
        unit: 'kg',
        isRawMaterial: true,
      },
      {
        name: 'Sugar',
        sku: 'RM-SG001',
        barcode: '5901234123458',
        description: 'White granulated sugar',
        price: 3.2,
        currentStock: 300,
        minimumStock: 50,
        isActive: true,
        unit: 'kg',
        isRawMaterial: true,
      },
      {
        name: 'Butter',
        sku: 'RM-BT001',
        barcode: '5901234123459',
        description: 'Unsalted butter',
        price: 5.75,
        currentStock: 100,
        minimumStock: 20,
        isActive: true,
        unit: 'kg',
        isRawMaterial: true,
      },
      {
        name: 'Eggs',
        sku: 'RM-EG001',
        barcode: '5901234123460',
        description: 'Fresh eggs',
        price: 0.25,
        currentStock: 1000,
        minimumStock: 200,
        isActive: true,
        unit: 'piece',
        isRawMaterial: true,
      },
      {
        name: 'Chocolate Chips',
        sku: 'RM-CC001',
        barcode: '5901234123461',
        description: 'Semi-sweet chocolate chips',
        price: 8.5,
        currentStock: 150,
        minimumStock: 30,
        isActive: true,
        unit: 'kg',
        isRawMaterial: true,
      },
    ];

    const savedRawMaterials = await queryRunner.manager.save(
      rawMaterials.map((material) => {
        const product = new Product();
        Object.assign(product, material);
        return product;
      })
    );

    // Seed Finished Products
    const finishedProducts = [
      {
        name: 'Chocolate Chip Cookies',
        sku: 'FP-CC001',
        barcode: '5901234123462',
        description: 'Delicious chocolate chip cookies',
        price: 12.99,
        currentStock: 50,
        minimumStock: 10,
        isActive: true,
        unit: 'pack',
        isRawMaterial: false,
      },
      {
        name: 'Vanilla Cupcakes',
        sku: 'FP-VC001',
        barcode: '5901234123463',
        description: 'Sweet vanilla cupcakes',
        price: 18.5,
        currentStock: 30,
        minimumStock: 5,
        isActive: true,
        unit: 'pack',
        isRawMaterial: false,
      },
      {
        name: 'Sourdough Bread',
        sku: 'FP-SB001',
        barcode: '5901234123464',
        description: 'Artisanal sourdough bread',
        price: 8.75,
        currentStock: 25,
        minimumStock: 5,
        isActive: true,
        unit: 'loaf',
        isRawMaterial: false,
      },
    ];

    const savedFinishedProducts = await queryRunner.manager.save(
      finishedProducts.map((product) => {
        const finishedProduct = new Product();
        Object.assign(finishedProduct, product);
        return finishedProduct;
      })
    );

    // Create BOMs for finished products
    // Chocolate Chip Cookies BOM
    const cookiesBom = new BOM();
    cookiesBom.name = 'Chocolate Chip Cookies Recipe';
    cookiesBom.description = 'Recipe for chocolate chip cookies';
    cookiesBom.isActive = true;
    cookiesBom.outputProduct = savedFinishedProducts[0];
    cookiesBom.outputQuantity = 10; // Makes 10 packs
    cookiesBom.outputUnit = 'pack';

    await queryRunner.manager.save(cookiesBom);

    // BOM Items for Chocolate Chip Cookies
    const cookieBomItems = [
      {
        bom: cookiesBom,
        product: savedRawMaterials[0], // Flour
        quantity: 2, // 2 kg
        unit: 'kg',
        notes: 'Sifted',
      },
      {
        bom: cookiesBom,
        product: savedRawMaterials[1], // Sugar
        quantity: 1, // 1 kg
        unit: 'kg',
        notes: null,
      },
      {
        bom: cookiesBom,
        product: savedRawMaterials[2], // Butter
        quantity: 0.5, // 0.5 kg
        unit: 'kg',
        notes: 'Room temperature',
      },
      {
        bom: cookiesBom,
        product: savedRawMaterials[3], // Eggs
        quantity: 12, // 12 eggs
        unit: 'piece',
        notes: null,
      },
      {
        bom: cookiesBom,
        product: savedRawMaterials[4], // Chocolate Chips
        quantity: 1.5, // 1.5 kg
        unit: 'kg',
        notes: null,
      },
    ];

    await queryRunner.manager.save(
      cookieBomItems.map((item) => {
        const bomItem = new BOMItem();
        Object.assign(bomItem, item);
        return bomItem;
      })
    );

    // Cupcakes BOM
    const cupcakesBom = new BOM();
    cupcakesBom.name = 'Vanilla Cupcakes Recipe';
    cupcakesBom.description = 'Recipe for vanilla cupcakes';
    cupcakesBom.isActive = true;
    cupcakesBom.outputProduct = savedFinishedProducts[1];
    cupcakesBom.outputQuantity = 8; // Makes 8 packs
    cupcakesBom.outputUnit = 'pack';

    await queryRunner.manager.save(cupcakesBom);

    // BOM Items for Vanilla Cupcakes
    const cupcakeBomItems = [
      {
        bom: cupcakesBom,
        product: savedRawMaterials[0], // Flour
        quantity: 1.5, // 1.5 kg
        unit: 'kg',
        notes: 'Sifted',
      },
      {
        bom: cupcakesBom,
        product: savedRawMaterials[1], // Sugar
        quantity: 0.75, // 0.75 kg
        unit: 'kg',
        notes: null,
      },
      {
        bom: cupcakesBom,
        product: savedRawMaterials[2], // Butter
        quantity: 0.5, // 0.5 kg
        unit: 'kg',
        notes: 'Softened',
      },
      {
        bom: cupcakesBom,
        product: savedRawMaterials[3], // Eggs
        quantity: 8, // 8 eggs
        unit: 'piece',
        notes: null,
      },
    ];

    await queryRunner.manager.save(
      cupcakeBomItems.map((item) => {
        const bomItem = new BOMItem();
        Object.assign(bomItem, item);
        return bomItem;
      })
    );

    // Seed Employees
    const employees = [
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@domdom.com',
        phoneNumber: '555-123-4567',
        position: 'Baker',
        hireDate: new Date('2023-01-15'),
        salary: 3500,
        isActive: true,
        employeeId: 'EMP001',
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@domdom.com',
        phoneNumber: '555-987-6543',
        position: 'Production Manager',
        hireDate: new Date('2022-11-05'),
        salary: 4500,
        isActive: true,
        employeeId: 'EMP002',
      },
      {
        firstName: 'Robert',
        lastName: 'Johnson',
        email: 'robert.johnson@domdom.com',
        phoneNumber: '555-456-7890',
        position: 'Sales Representative',
        hireDate: new Date('2023-03-20'),
        salary: 3200,
        isActive: true,
        employeeId: 'EMP003',
      },
    ];

    const savedEmployees = await queryRunner.manager.save(
      employees.map((emp) => {
        const employee = new Employee();
        Object.assign(employee, emp);
        return employee;
      })
    );

    // Seed Employee Attendance
    const currentDate = new Date();
    const attendances: EmployeeAttendance[] = [];

    // Create attendance records for the past 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(currentDate.getDate() - i);

      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      for (const employee of savedEmployees) {
        // Random attendance (90% chance of attendance)
        if (Math.random() < 0.9) {
          const attendance = new EmployeeAttendance();
          attendance.employee = employee;
          attendance.clockIn = new Date(date.setHours(8, 0, 0));
          attendance.clockOut = new Date(date.setHours(17, 0, 0));
          attendance.notes = '';

          attendances.push(attendance);
        }
      }
    }

    await queryRunner.manager.save(attendances);

    // Seed Inventory Transactions
    const transactions: InventoryTransaction[] = [];

    // Purchase transactions for raw materials
    for (const material of savedRawMaterials) {
      const purchaseDate = new Date();
      purchaseDate.setDate(currentDate.getDate() - 15);

      const transaction = new InventoryTransaction();
      transaction.product = material;
      transaction.type = TransactionType.PURCHASE;
      transaction.quantity = material.currentStock;
      transaction.unitPrice = material.price * 0.7; // Purchase price is 70% of selling price
      transaction.reference = 'INI-PUR-' + material.sku;
      transaction.notes = 'Initial purchase of ' + material.name;
      transaction.createdBy = adminUser;

      transactions.push(transaction);
    }

    // Production transactions
    // Production of Chocolate Chip Cookies
    const cookieProductionDate = new Date();
    cookieProductionDate.setDate(currentDate.getDate() - 10);

    // Production OUT transactions (raw materials used)
    for (const bomItem of cookieBomItems) {
      const outTransaction = new InventoryTransaction();
      outTransaction.product = bomItem.product;
      outTransaction.type = TransactionType.PRODUCTION_OUT;
      outTransaction.quantity = bomItem.quantity * 2; // Produced 2 batches
      outTransaction.unitPrice = bomItem.product.price;
      outTransaction.reference = 'PROD-OUT-CC001';
      outTransaction.notes = 'Used for chocolate chip cookies production';
      outTransaction.createdBy = adminUser;

      transactions.push(outTransaction);
    }

    // Production IN transaction (finished product added)
    const cookieInTransaction = new InventoryTransaction();
    cookieInTransaction.product = savedFinishedProducts[0]; // Chocolate Chip Cookies
    cookieInTransaction.type = TransactionType.PRODUCTION_IN;
    cookieInTransaction.quantity = cookiesBom.outputQuantity * 2; // 2 batches
    cookieInTransaction.unitPrice = savedFinishedProducts[0].price;
    cookieInTransaction.reference = 'PROD-IN-CC001';
    cookieInTransaction.notes = 'Produced chocolate chip cookies';
    cookieInTransaction.createdBy = adminUser;

    transactions.push(cookieInTransaction);

    // Production of Vanilla Cupcakes
    const cupcakeProductionDate = new Date();
    cupcakeProductionDate.setDate(currentDate.getDate() - 5);

    // Production OUT transactions (raw materials used)
    for (const bomItem of cupcakeBomItems) {
      const outTransaction = new InventoryTransaction();
      outTransaction.product = bomItem.product;
      outTransaction.type = TransactionType.PRODUCTION_OUT;
      outTransaction.quantity = bomItem.quantity * 1.5; // Produced 1.5 batches
      outTransaction.unitPrice = bomItem.product.price;
      outTransaction.reference = 'PROD-OUT-VC001';
      outTransaction.notes = 'Used for vanilla cupcakes production';
      outTransaction.createdBy = adminUser;

      transactions.push(outTransaction);
    }

    // Production IN transaction (finished product added)
    const cupcakeInTransaction = new InventoryTransaction();
    cupcakeInTransaction.product = savedFinishedProducts[1]; // Vanilla Cupcakes
    cupcakeInTransaction.type = TransactionType.PRODUCTION_IN;
    cupcakeInTransaction.quantity = cupcakesBom.outputQuantity * 1.5; // 1.5 batches
    cupcakeInTransaction.unitPrice = savedFinishedProducts[1].price;
    cupcakeInTransaction.reference = 'PROD-IN-VC001';
    cupcakeInTransaction.notes = 'Produced vanilla cupcakes';
    cupcakeInTransaction.createdBy = adminUser;

    transactions.push(cupcakeInTransaction);

    // Sales transactions
    // Sale of Chocolate Chip Cookies
    const cookieSaleDate = new Date();
    cookieSaleDate.setDate(currentDate.getDate() - 3);

    const cookieSaleTransaction = new InventoryTransaction();
    cookieSaleTransaction.product = savedFinishedProducts[0]; // Chocolate Chip Cookies
    cookieSaleTransaction.type = TransactionType.SALE;
    cookieSaleTransaction.quantity = -10; // Negative quantity for sales
    cookieSaleTransaction.unitPrice = savedFinishedProducts[0].price;
    cookieSaleTransaction.reference = 'SALE-CC001';
    cookieSaleTransaction.notes = 'Sold chocolate chip cookies';
    cookieSaleTransaction.createdBy = regularUser;

    transactions.push(cookieSaleTransaction);

    // Sale of Vanilla Cupcakes
    const cupcakeSaleDate = new Date();
    cupcakeSaleDate.setDate(currentDate.getDate() - 2);

    const cupcakeSaleTransaction = new InventoryTransaction();
    cupcakeSaleTransaction.product = savedFinishedProducts[1]; // Vanilla Cupcakes
    cupcakeSaleTransaction.type = TransactionType.SALE;
    cupcakeSaleTransaction.quantity = -5; // Negative quantity for sales
    cupcakeSaleTransaction.unitPrice = savedFinishedProducts[1].price;
    cupcakeSaleTransaction.reference = 'SALE-VC001';
    cupcakeSaleTransaction.notes = 'Sold vanilla cupcakes';
    cupcakeSaleTransaction.createdBy = regularUser;

    transactions.push(cupcakeSaleTransaction);

    await queryRunner.manager.save(transactions);

    // Seed Production Records
    const productionRecords = [
      {
        employee: savedEmployees[1], // Jane Smith (Production Manager)
        bom: cookiesBom,
        quantity: cookiesBom.outputQuantity * 2,
        wastage: 0,
        startTime: new Date(cookieProductionDate.setHours(9, 0, 0)),
        endTime: new Date(cookieProductionDate.setHours(14, 0, 0)),
        notes: 'Regular production run',
        qualityChecked: true,
        qualityNotes: 'All products meet quality standards',
      },
      {
        employee: savedEmployees[1], // Jane Smith (Production Manager)
        bom: cupcakesBom,
        quantity: cupcakesBom.outputQuantity * 1.5,
        wastage: 0,
        startTime: new Date(cupcakeProductionDate.setHours(10, 0, 0)),
        endTime: new Date(cupcakeProductionDate.setHours(15, 30, 0)),
        notes: 'Special order batch',
        qualityChecked: true,
        qualityNotes: 'All products meet quality standards',
      },
    ];

    await queryRunner.manager.save(
      productionRecords.map((record) => {
        const prodRecord = new ProductionRecord();
        Object.assign(prodRecord, record);
        return prodRecord;
      })
    );

    // Seed Sales
    const sales = [
      {
        type: SaleType.DIRECT,
        status: SaleStatus.COMPLETED,
        customer: adminUser, // Using admin as customer for demo
        totalAmount: savedFinishedProducts[0].price * 10, // 10 packs of cookies
        discount: 0,
        finalAmount: savedFinishedProducts[0].price * 10,
        notes: 'Regular weekly order',
        invoiceNumber: 'INV-001',
        createdBy: regularUser,
        completedAt: new Date(cookieSaleDate),
      },
      {
        type: SaleType.DIRECT,
        status: SaleStatus.COMPLETED,
        customer: adminUser, // Using admin as customer for demo
        totalAmount: savedFinishedProducts[1].price * 5, // 5 packs of cupcakes
        discount: 0,
        finalAmount: savedFinishedProducts[1].price * 5,
        notes: 'First-time customer',
        invoiceNumber: 'INV-002',
        createdBy: regularUser,
        completedAt: new Date(cupcakeSaleDate),
      },
    ];

    const savedSales = await queryRunner.manager.save(
      sales.map((sale) => {
        const saleRecord = new Sale();
        Object.assign(saleRecord, sale);
        return saleRecord;
      })
    );

    // Seed Sale Items
    const saleItems = [
      {
        sale: savedSales[0],
        product: savedFinishedProducts[0], // Chocolate Chip Cookies
        quantity: 10,
        unitPrice: savedFinishedProducts[0].price,
        totalPrice: savedFinishedProducts[0].price * 10,
        discount: 0,
        finalPrice: savedFinishedProducts[0].price * 10, // Same as totalPrice since no discount
      },
      {
        sale: savedSales[1],
        product: savedFinishedProducts[1], // Vanilla Cupcakes
        quantity: 5,
        unitPrice: savedFinishedProducts[1].price,
        totalPrice: savedFinishedProducts[1].price * 5,
        discount: 0,
        finalPrice: savedFinishedProducts[1].price * 5, // Same as totalPrice since no discount
      },
    ];

    await queryRunner.manager.save(
      saleItems.map((item) => {
        const saleItem = new SaleItem();
        Object.assign(saleItem, item);
        return saleItem;
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Delete all data in reverse order to avoid foreign key constraints
    await queryRunner.query(`DELETE FROM sale_items`);
    await queryRunner.query(`DELETE FROM sales`);
    await queryRunner.query(`DELETE FROM production_records`);
    await queryRunner.query(`DELETE FROM inventory_transactions`);
    await queryRunner.query(`DELETE FROM employee_attendances`);
    await queryRunner.query(`DELETE FROM employees`);
    await queryRunner.query(`DELETE FROM bom_items`);
    await queryRunner.query(`DELETE FROM boms`);
    await queryRunner.query(`DELETE FROM products`);
    await queryRunner.query(`DELETE FROM users`);
  }
}
