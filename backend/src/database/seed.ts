/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { AppDataSource } from '../config/typeorm.config';
import { User } from '../entities/user.entity';
import { Employee } from '../entities/employee.entity';
import { Product } from '../entities/product.entity';
import { BOM } from '../entities/bom.entity';
import { BOMItem } from '../entities/bom-item.entity';
import { ProductionOrder } from '../entities/production-order.entity';
import { InventoryTransaction } from '../entities/inventory-transaction.entity';
import { Sale } from '../entities/sale.entity';
import { DocumentTemplate } from '../entities/document-template.entity';
import { Document } from '../entities/document.entity';
import { EmployeeAttendance } from '../entities/employee-attendance.entity';
import { DocumentType, DocumentFormat } from '../entities/enums/document.enum';
import { TransactionType } from '../entities/inventory-transaction.entity';
import { SaleType, SaleStatus } from '../entities/sale.entity';
import { ProductionOrderStatus } from '../entities/production-order.entity';
import { EmployeeRole } from '../entities/employee.entity';
import { Unit } from '../entities/enums/unit.enum';
import { hash } from 'bcrypt';

async function seed() {
  try {
    // Initialize the data source
    await AppDataSource.initialize();
    console.log('Data Source has been initialized!');

    // Clear existing data
    await clearExistingData();

    // Seed data
    await seedUsers();
    await seedEmployees();
    await seedProducts();
    await seedBOMs();
    await seedProductionOrders();
    await seedInventoryTransactions();
    await seedSales();
    await seedDocumentTemplates();
    await seedDocuments();
    await seedAttendance();

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
  }
}

async function clearExistingData() {
  const entities = AppDataSource.entityMetadatas;

  // Disable foreign key checks temporarily
  await AppDataSource.query('SET session_replication_role = replica;');

  // Clear all tables
  for (const entity of entities) {
    try {
      // Check if table exists before truncating
      const tableExists = await AppDataSource.query(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = '${entity.tableName}'
        )`
      );

      if (tableExists[0].exists) {
        await AppDataSource.query(`TRUNCATE TABLE "${entity.tableName}" CASCADE`);
      } else {
        console.log(`Table "${entity.tableName}" does not exist, skipping.`);
      }
    } catch (error) {
      console.warn(`Error clearing table "${entity.tableName}":`, error.message);
    }
  }

  // Re-enable foreign key checks
  await AppDataSource.query('SET session_replication_role = DEFAULT;');
}

async function seedUsers() {
  const userRepository = AppDataSource.getRepository(User);

  const adminUser = new User();
  adminUser.email = 'admin@domdom.com';
  adminUser.firstName = 'Admin';
  adminUser.lastName = 'User';
  adminUser.password = await hash('admin123', 10);
  adminUser.isAdmin = true;
  adminUser.isActive = true;

  const managerUser = new User();
  managerUser.email = 'manager@domdom.com';
  managerUser.firstName = 'Manager';
  managerUser.lastName = 'User';
  managerUser.password = await hash('manager123', 10);
  managerUser.isAdmin = true;
  managerUser.isActive = true;

  const employeeUser = new User();
  employeeUser.email = 'employee@domdom.com';
  employeeUser.firstName = 'Employee';
  employeeUser.lastName = 'User';
  employeeUser.password = await hash('employee123', 10);
  employeeUser.isAdmin = false;
  employeeUser.isActive = true;

  await userRepository.save([adminUser, managerUser, employeeUser]);
  console.log('Users seeded successfully');
}

async function seedEmployees() {
  const employeeRepository = AppDataSource.getRepository(Employee);
  const userRepository = AppDataSource.getRepository(User);

  const adminUser = await userRepository.findOne({ where: { email: 'admin@domdom.com' } });
  if (!adminUser) {
    throw new Error('Admin user not found');
  }

  const employees = [
    employeeRepository.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@domdom.com', // Optional email
      phoneNumber: '+1234567890',
      position: 'Supervisor',
      role: EmployeeRole.SUPERVISOR,
      employeeId: 'EMP001',
      hireDate: new Date(),
      monthlySalary: 50000,
      dailyRate: 200,
      hourlyRate: 25,
      isActive: true,
      address: '123 Main St', // Added address field
      // Production metrics
      productivityRate: 0.85,
      qualityScore: 0.9,
      efficiencyScore: 0.88,
      totalProductionCount: 0,
      totalQualityIssues: 0,
      // Sales related
      isCommissionBased: false,
      commissionRate: 0,
    }),
    employeeRepository.create({
      firstName: 'Jane',
      lastName: 'Smith',
      phoneNumber: '+1234567891', // Email omitted to test optional email
      position: 'Worker',
      role: EmployeeRole.WORKER,
      employeeId: 'EMP002',
      hireDate: new Date(),
      monthlySalary: 40000,
      dailyRate: 160,
      hourlyRate: 20,
      isActive: true,
      address: '456 Oak St',
      // Production metrics
      productivityRate: 0.8,
      qualityScore: 0.85,
      efficiencyScore: 0.82,
      totalProductionCount: 0,
      totalQualityIssues: 0,
      // Sales related
      isCommissionBased: false,
      commissionRate: 0,
    }),
  ];

  await employeeRepository.save(employees);
  console.log('Employees seeded successfully');
}

async function seedProducts() {
  const productRepository = AppDataSource.getRepository(Product);
  const userRepository = AppDataSource.getRepository(User);

  const adminUser = await userRepository.findOne({ where: { email: 'admin@domdom.com' } });
  if (!adminUser) {
    throw new Error('Admin user not found');
  }

  const products = [
    productRepository.create({
      name: 'Raw Material 1',
      sku: 'RM-001',
      barcode: '123456789',
      description: 'Sample raw material',
      price: 10.0,
      currentStock: 100,
      minimumStock: 20,
      isActive: true,
      unit: Unit.KG,
      isRawMaterial: true,
      lastPurchasePrice: 8.0,
    }),
    productRepository.create({
      name: 'Finished Good 1',
      sku: 'FG-001',
      barcode: '987654321',
      description: 'Sample finished good',
      price: 25.0,
      currentStock: 50,
      minimumStock: 10,
      isActive: true,
      unit: Unit.PIECE,
      isRawMaterial: false,
      lastPurchasePrice: undefined,
    }),
  ];

  await productRepository.save(products);
  console.log('Products seeded successfully');
}

async function seedBOMs() {
  const bomRepository = AppDataSource.getRepository(BOM);
  const productRepository = AppDataSource.getRepository(Product);
  const userRepository = AppDataSource.getRepository(User);

  const rawMaterial = await productRepository.findOne({ where: { sku: 'RM-001' } });
  const finishedGood = await productRepository.findOne({ where: { sku: 'FG-001' } });
  const adminUser = await userRepository.findOne({ where: { email: 'admin@domdom.com' } });

  if (!rawMaterial || !finishedGood || !adminUser) {
    throw new Error('Required entities not found');
  }

  const bom = bomRepository.create({
    name: 'Sample BOM',
    description: 'Sample bill of materials',
    outputProduct: finishedGood,
    outputQuantity: 1,
    outputUnit: Unit.PIECE,
    isActive: true,
    createdBy: adminUser,
  });

  const savedBom = await bomRepository.save(bom);

  const bomItem = bomRepository.manager.create(BOMItem, {
    bom: savedBom,
    product: rawMaterial,
    quantity: 2,
    unit: Unit.KG,
    notes: 'Sample BOM item',
  });

  await bomRepository.manager.save(BOMItem, bomItem);
  console.log('BOMs seeded successfully');
}

async function seedProductionOrders() {
  const productionOrderRepository = AppDataSource.getRepository(ProductionOrder);
  const bomRepository = AppDataSource.getRepository(BOM);
  const userRepository = AppDataSource.getRepository(User);

  const bom = await bomRepository.findOne({ where: { name: 'Sample BOM' } });
  const user = await userRepository.findOne({ where: { email: 'admin@domdom.com' } });

  if (!bom || !user) {
    throw new Error('Required entities not found');
  }

  const productionOrder = productionOrderRepository.create({
    bom: bom,
    quantity: 100,
    status: ProductionOrderStatus.PLANNED,
    plannedStartDate: new Date(),
    assignedTo: user,
    createdBy: user,
    notes: 'Sample production order',
  });

  await productionOrderRepository.save(productionOrder);
  console.log('Production orders seeded successfully');
}

async function seedInventoryTransactions() {
  const transactionRepository = AppDataSource.getRepository(InventoryTransaction);
  const productRepository = AppDataSource.getRepository(Product);
  const userRepository = AppDataSource.getRepository(User);

  const products = await productRepository.find();
  const users = await userRepository.find();

  const transactions = products.flatMap((product, index) => {
    return [
      transactionRepository.create({
        product: product,
        quantity: 100,
        unitPrice: product.price,
        reference: `PO-${index + 1}`,
        notes: 'Initial stock',
        createdBy: users[0],
        type: TransactionType.PURCHASE,
      }),
      transactionRepository.create({
        product: product,
        quantity: -50,
        unitPrice: product.price,
        reference: `SO-${index + 1}`,
        notes: 'Initial sale',
        createdBy: users[0],
        type: TransactionType.SALE,
      }),
    ];
  });

  await transactionRepository.save(transactions);
  console.log('Inventory transactions seeded successfully');
}

async function seedSales() {
  const saleRepository = AppDataSource.getRepository(Sale);
  const userRepository = AppDataSource.getRepository(User);

  const user = await userRepository.findOne({ where: { email: 'admin@domdom.com' } });
  if (!user) {
    throw new Error('Admin user not found');
  }

  const sale = saleRepository.create({
    type: SaleType.DIRECT,
    status: SaleStatus.COMPLETED,
    totalAmount: 1000,
    discount: 0,
    finalAmount: 1000,
    createdBy: user,
    notes: 'Sample sale',
  });

  await saleRepository.save(sale);
  console.log('Sales seeded successfully');
}

async function seedDocumentTemplates() {
  const templateRepository = AppDataSource.getRepository(DocumentTemplate);
  const userRepository = AppDataSource.getRepository(User);

  const adminUser = await userRepository.findOne({ where: { email: 'admin@domdom.com' } });
  if (!adminUser) {
    throw new Error('Admin user not found');
  }

  const invoiceTemplate = new DocumentTemplate();
  invoiceTemplate.name = 'Invoice Template';
  invoiceTemplate.type = DocumentType.INVOICE;
  invoiceTemplate.content =
    '<h1>Invoice</h1><p>Customer: {{customer.name}}</p><p>Total: {{totalAmount}}</p>';
  invoiceTemplate.metadata = { companyName: 'DomDom', logo: 'logo.png' };
  invoiceTemplate.description = 'Standard invoice template';
  invoiceTemplate.requiredFields = ['customer.name', 'totalAmount'];
  invoiceTemplate.isActive = true;
  invoiceTemplate.createdBy = adminUser;

  await templateRepository.save(invoiceTemplate);
  console.log('Document Templates seeded successfully');
}

async function seedDocuments() {
  const documentRepository = AppDataSource.getRepository(Document);
  const userRepository = AppDataSource.getRepository(User);

  const user = await userRepository.findOne({ where: { email: 'admin@domdom.com' } });
  if (!user) {
    throw new Error('Admin user not found');
  }

  const document = documentRepository.create({
    name: 'Sample Document',
    type: DocumentType.INVOICE,
    format: DocumentFormat.PDF,
    filePath: '/uploads/documents/sample.pdf',
    metadata: { key: 'value' },
    createdById: user.id,
  });

  await documentRepository.save(document);
  console.log('Documents seeded successfully');
}

async function seedAttendance() {
  const attendanceRepository = AppDataSource.getRepository(EmployeeAttendance);
  const employeeRepository = AppDataSource.getRepository(Employee);
  const userRepository = AppDataSource.getRepository(User);

  // Get all employees to create attendance records for each
  const employees = await employeeRepository.find();
  const adminUser = await userRepository.findOne({ where: { email: 'admin@domdom.com' } });

  if (!employees.length || !adminUser) {
    throw new Error('Required entities not found');
  }

  const currentDate = new Date();
  const attendanceRecords = [] as EmployeeAttendance[];

  // Create attendance records for the past 7 days
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(currentDate.getDate() - i);

    // Skip weekends (Saturday = 6, Sunday = 0)
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    for (const employee of employees) {
      // Random attendance (90% chance of attendance)
      if (Math.random() < 0.9) {
        // Create clock-in time between 7:30 AM and 8:30 AM
        const clockIn = new Date(date);
        clockIn.setHours(7 + Math.floor(Math.random() * 2));
        clockIn.setMinutes(30 + Math.floor(Math.random() * 60));

        // Create clock-out time between 4:30 PM and 5:30 PM
        const clockOut = new Date(date);
        clockOut.setHours(16 + Math.floor(Math.random() * 2));
        clockOut.setMinutes(30 + Math.floor(Math.random() * 60));

        const duration = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60);

        const attendance = attendanceRepository.create({
          employee: employee,
          clockIn: clockIn,
          clockOut: clockOut,
          notes: `Regular workday`,
          durationHours: Number(duration.toFixed(2)),
          recordedBy: adminUser,
        });

        attendanceRecords.push(attendance);
      }
    }
  }

  await attendanceRepository.save(attendanceRecords);
  console.log(`Created ${attendanceRecords.length} attendance records successfully`);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
seed();
