import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function main() {
  console.log('Starting seed...');

  // Clean up existing data if needed
  await prisma.$transaction([
    prisma.saleItem.deleteMany(),
    prisma.sale.deleteMany(),
    prisma.purchaseItem.deleteMany(),
    prisma.purchase.deleteMany(),
    prisma.productionRecord.deleteMany(),
    prisma.productionOrderItem.deleteMany(),
    prisma.productionOrder.deleteMany(),
    prisma.bomItem.deleteMany(),
    prisma.bom.deleteMany(),
    prisma.stockWastage.deleteMany(),
    prisma.stockCountItem.deleteMany(),
    prisma.stockCount.deleteMany(),
    prisma.stockTransaction.deleteMany(),
    prisma.stockItem.deleteMany(),
    prisma.employeeAttendance.deleteMany(),
    prisma.employeeSchedule.deleteMany(),
    prisma.employee.deleteMany(),
    prisma.expense.deleteMany(),
    prisma.reminder.deleteMany(),
    prisma.document.deleteMany(),
    prisma.documentTemplate.deleteMany(),
    prisma.product.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  // Create users
  const adminPassword = await hashPassword('admin123');
  const userPassword = await hashPassword('user123');
  const salesPassword = await hashPassword('sales123');
  
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  });

  const user = await prisma.user.create({
    data: {
      email: 'user@example.com',
      password: userPassword,
      name: 'Regular User',
      role: 'USER',
    },
  });

  const salesUser = await prisma.user.create({
    data: {
      email: 'sales@example.com',
      password: salesPassword,
      name: 'Sales Rep',
      role: 'SALES',
    },
  });

  console.log('Users created');

  // Create raw materials
  const flour = await prisma.product.create({
    data: {
      name: 'Flour',
      description: 'All-purpose wheat flour',
      sku: 'RM-FLOUR-001',
      category: 'Raw Materials',
      unit: 'kg',
      price: 0,
      cost: 1.20,
      isRawMaterial: true,
      isFinishedGood: false,
      minStockLevel: 50,
    },
  });

  const sugar = await prisma.product.create({
    data: {
      name: 'Sugar',
      description: 'Granulated white sugar',
      sku: 'RM-SUGAR-001',
      category: 'Raw Materials',
      unit: 'kg',
      price: 0,
      cost: 1.50,
      isRawMaterial: true,
      isFinishedGood: false,
      minStockLevel: 30,
    },
  });

  const eggs = await prisma.product.create({
    data: {
      name: 'Eggs',
      description: 'Fresh chicken eggs',
      sku: 'RM-EGGS-001',
      category: 'Raw Materials',
      unit: 'dozen',
      price: 0,
      cost: 2.00,
      isRawMaterial: true,
      isFinishedGood: false,
      minStockLevel: 20,
    },
  });

  const milk = await prisma.product.create({
    data: {
      name: 'Milk',
      description: 'Fresh whole milk',
      sku: 'RM-MILK-001',
      category: 'Raw Materials',
      unit: 'liter',
      price: 0,
      cost: 1.80,
      isRawMaterial: true,
      isFinishedGood: false,
      minStockLevel: 25,
    },
  });

  const butter = await prisma.product.create({
    data: {
      name: 'Butter',
      description: 'Unsalted butter',
      sku: 'RM-BUTTER-001',
      category: 'Raw Materials',
      unit: 'kg',
      price: 0,
      cost: 4.50,
      isRawMaterial: true,
      isFinishedGood: false,
      minStockLevel: 15,
    },
  });

  console.log('Raw materials created');

  // Create finished products
  const bread = await prisma.product.create({
    data: {
      name: 'Bread',
      description: 'Fresh white bread loaf',
      sku: 'FG-BREAD-001',
      category: 'Bakery',
      unit: 'loaf',
      price: 3.50,
      cost: 1.20,
      isRawMaterial: false,
      isFinishedGood: true,
      minStockLevel: 10,
    },
  });

  const cake = await prisma.product.create({
    data: {
      name: 'Cake',
      description: 'Vanilla sponge cake',
      sku: 'FG-CAKE-001',
      category: 'Bakery',
      unit: 'piece',
      price: 15.00,
      cost: 5.00,
      isRawMaterial: false,
      isFinishedGood: true,
      minStockLevel: 5,
    },
  });

  const cookies = await prisma.product.create({
    data: {
      name: 'Cookies',
      description: 'Chocolate chip cookies',
      sku: 'FG-COOKIES-001',
      category: 'Bakery',
      unit: 'dozen',
      price: 8.00,
      cost: 3.00,
      isRawMaterial: false,
      isFinishedGood: true,
      minStockLevel: 8,
    },
  });

  console.log('Finished products created');

  // Create BOMs
  const breadBom = await prisma.bOM.create({
    data: {
      name: 'White Bread Recipe',
      description: 'Recipe for standard white bread loaf',
      finalProductId: bread.id,
      items: {
        create: [
          {
            productId: flour.id,
            quantity: 0.5,
            unit: 'kg',
          },
          {
            productId: sugar.id,
            quantity: 0.05,
            unit: 'kg',
          },
          {
            productId: milk.id,
            quantity: 0.25,
            unit: 'liter',
          },
          {
            productId: butter.id,
            quantity: 0.05,
            unit: 'kg',
          },
        ],
      },
    },
  });

  const cakeBom = await prisma.bOM.create({
    data: {
      name: 'Vanilla Cake Recipe',
      description: 'Recipe for vanilla sponge cake',
      finalProductId: cake.id,
      items: {
        create: [
          {
            productId: flour.id,
            quantity: 0.3,
            unit: 'kg',
          },
          {
            productId: sugar.id,
            quantity: 0.2,
            unit: 'kg',
          },
          {
            productId: eggs.id,
            quantity: 0.5,
            unit: 'dozen',
          },
          {
            productId: milk.id,
            quantity: 0.2,
            unit: 'liter',
          },
          {
            productId: butter.id,
            quantity: 0.15,
            unit: 'kg',
          },
        ],
      },
    },
  });

  const cookiesBom = await prisma.bOM.create({
    data: {
      name: 'Chocolate Chip Cookies Recipe',
      description: 'Recipe for chocolate chip cookies',
      finalProductId: cookies.id,
      items: {
        create: [
          {
            productId: flour.id,
            quantity: 0.25,
            unit: 'kg',
          },
          {
            productId: sugar.id,
            quantity: 0.15,
            unit: 'kg',
          },
          {
            productId: eggs.id,
            quantity: 0.25,
            unit: 'dozen',
          },
          {
            productId: butter.id,
            quantity: 0.1,
            unit: 'kg',
          },
        ],
      },
    },
  });

  console.log('BOMs created');

  // Create stock items for raw materials
  await prisma.stockItem.create({
    data: {
      productId: flour.id,
      quantity: 100,
      location: 'Warehouse A',
      batchNumber: 'FLOUR-BATCH-001',
    },
  });

  await prisma.stockItem.create({
    data: {
      productId: sugar.id,
      quantity: 80,
      location: 'Warehouse A',
      batchNumber: 'SUGAR-BATCH-001',
    },
  });

  await prisma.stockItem.create({
    data: {
      productId: eggs.id,
      quantity: 50,
      location: 'Warehouse B',
      batchNumber: 'EGGS-BATCH-001',
    },
  });

  await prisma.stockItem.create({
    data: {
      productId: milk.id,
      quantity: 60,
      location: 'Warehouse B',
      batchNumber: 'MILK-BATCH-001',
    },
  });

  await prisma.stockItem.create({
    data: {
      productId: butter.id,
      quantity: 40,
      location: 'Warehouse B',
      batchNumber: 'BUTTER-BATCH-001',
    },
  });

  // Create stock items for finished products
  await prisma.stockItem.create({
    data: {
      productId: bread.id,
      quantity: 30,
      location: 'Store A',
      batchNumber: 'BREAD-BATCH-001',
    },
  });

  await prisma.stockItem.create({
    data: {
      productId: cake.id,
      quantity: 15,
      location: 'Store A',
      batchNumber: 'CAKE-BATCH-001',
    },
  });

  await prisma.stockItem.create({
    data: {
      productId: cookies.id,
      quantity: 25,
      location: 'Store A',
      batchNumber: 'COOKIES-BATCH-001',
    },
  });

  console.log('Stock items created');

  // Create employees
  const baker = await prisma.employee.create({
    data: {
      name: 'John Baker',
      position: 'Baker',
      department: 'Production',
      contactInfo: 'john.baker@example.com',
      salary: 2500,
      hireDate: new Date('2023-01-15'),
      status: 'ACTIVE',
    },
  });

  const salesRep = await prisma.employee.create({
    data: {
      name: 'Sarah Sales',
      position: 'Sales Representative',
      department: 'Sales',
      contactInfo: 'sarah.sales@example.com',
      salary: 2200,
      hireDate: new Date('2023-02-10'),
      status: 'ACTIVE',
    },
  });

  const manager = await prisma.employee.create({
    data: {
      name: 'Mike Manager',
      position: 'Store Manager',
      department: 'Management',
      contactInfo: 'mike.manager@example.com',
      salary: 3500,
      hireDate: new Date('2022-11-05'),
      status: 'ACTIVE',
    },
  });

  console.log('Employees created');

  // Create attendance records
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  await prisma.employeeAttendance.create({
    data: {
      employeeId: baker.id,
      date: yesterday,
      checkIn: new Date(yesterday.setHours(8, 0, 0)),
      checkOut: new Date(yesterday.setHours(17, 0, 0)),
      status: 'PRESENT',
    },
  });

  await prisma.employeeAttendance.create({
    data: {
      employeeId: salesRep.id,
      date: yesterday,
      checkIn: new Date(yesterday.setHours(8, 15, 0)),
      checkOut: new Date(yesterday.setHours(17, 30, 0)),
      status: 'PRESENT',
    },
  });

  await prisma.employeeAttendance.create({
    data: {
      employeeId: manager.id,
      date: yesterday,
      checkIn: new Date(yesterday.setHours(7, 45, 0)),
      checkOut: new Date(yesterday.setHours(18, 0, 0)),
      status: 'PRESENT',
    },
  });

  console.log('Attendance records created');

  // Create production orders
  const breadProduction = await prisma.productionOrder.create({
    data: {
      bomId: breadBom.id,
      quantity: 20,
      status: 'COMPLETED',
      startDate: new Date(yesterday.setHours(9, 0, 0)),
      endDate: new Date(yesterday.setHours(11, 0, 0)),
      notes: 'Regular daily bread production',
      items: {
        create: [
          // Input items (raw materials)
          {
            productId: flour.id,
            plannedQuantity: 10, // 0.5kg * 20 loaves
            actualQuantity: 10,
            unit: 'kg',
            isOutput: false,
          },
          {
            productId: sugar.id,
            plannedQuantity: 1, // 0.05kg * 20 loaves
            actualQuantity: 1,
            unit: 'kg',
            isOutput: false,
          },
          {
            productId: milk.id,
            plannedQuantity: 5, // 0.25L * 20 loaves
            actualQuantity: 5,
            unit: 'liter',
            isOutput: false,
          },
          {
            productId: butter.id,
            plannedQuantity: 1, // 0.05kg * 20 loaves
            actualQuantity: 1,
            unit: 'kg',
            isOutput: false,
          },
          // Output item (finished product)
          {
            productId: bread.id,
            plannedQuantity: 20,
            actualQuantity: 20,
            unit: 'loaf',
            isOutput: true,
          },
        ],
      },
    },
  });

  console.log('Production orders created');

  // Create stock transactions for the production
  // These would typically be created by the production service in real operation
  await prisma.stockTransaction.create({
    data: {
      stockItemId: (await prisma.stockItem.findFirst({ where: { productId: flour.id } })).id,
      productId: flour.id,
      quantity: -10, // Negative for consumption
      type: 'PRODUCTION_OUT',
      reference: breadProduction.id,
      referenceType: 'PRODUCTION',
      notes: 'Consumed for bread production',
    },
  });

  await prisma.stockTransaction.create({
    data: {
      stockItemId: (await prisma.stockItem.findFirst({ where: { productId: sugar.id } })).id,
      productId: sugar.id,
      quantity: -1, // Negative for consumption
      type: 'PRODUCTION_OUT',
      reference: breadProduction.id,
      referenceType: 'PRODUCTION',
      notes: 'Consumed for bread production',
    },
  });

  await prisma.stockTransaction.create({
    data: {
      stockItemId: (await prisma.stockItem.findFirst({ where: { productId: milk.id } })).id,
      productId: milk.id,
      quantity: -5, // Negative for consumption
      type: 'PRODUCTION_OUT',
      reference: breadProduction.id,
      referenceType: 'PRODUCTION',
      notes: 'Consumed for bread production',
    },
  });

  await prisma.stockTransaction.create({
    data: {
      stockItemId: (await prisma.stockItem.findFirst({ where: { productId: butter.id } })).id,
      productId: butter.id,
      quantity: -1, // Negative for consumption
      type: 'PRODUCTION_OUT',
      reference: breadProduction.id,
      referenceType: 'PRODUCTION',
      notes: 'Consumed for bread production',
    },
  });

  await prisma.stockTransaction.create({
    data: {
      stockItemId: (await prisma.stockItem.findFirst({ where: { productId: bread.id } })).id,
      productId: bread.id,
      quantity: 20, // Positive for production
      type: 'PRODUCTION_IN',
      reference: breadProduction.id,
      referenceType: 'PRODUCTION',
      notes: 'Produced in bread production',
    },
  });

  console.log('Production stock transactions created');

  // Create purchase orders
  const flourPurchase = await prisma.purchase.create({
    data: {
      supplierName: 'Flour Supplies Inc.',
      supplierContact: 'contact@floursupplies.com',
      referenceNumber: 'PO-2023-001',
      date: new Date(yesterday.setDate(yesterday.getDate() - 5)),
      status: 'RECEIVED',
      totalAmount: 120.00,
      paymentStatus: 'PAID',
      paymentMethod: 'BANK_TRANSFER',
      notes: 'Regular flour order',
      items: {
        create: [
          {
            productId: flour.id,
            quantity: 100,
            price: 1.20,
            receivedQuantity: 100,
            total: 120.00,
          },
        ],
      },
    },
  });

  const mixedPurchase = await prisma.purchase.create({
    data: {
      supplierName: 'Bakery Supplies Co.',
      supplierContact: 'orders@bakerysupplies.com',
      referenceNumber: 'PO-2023-002',
      date: new Date(yesterday.setDate(yesterday.getDate() - 3)),
      status: 'PARTIALLY_RECEIVED',
      totalAmount: 290.00,
      paymentStatus: 'PARTIAL',
      paymentMethod: 'CREDIT_CARD',
      notes: 'Monthly supplies order',
      items: {
        create: [
          {
            productId: sugar.id,
            quantity: 50,
            price: 1.50,
            receivedQuantity: 50,
            total: 75.00,
          },
          {
            productId: eggs.id,
            quantity: 30,
            price: 2.00,
            receivedQuantity: 30,
            total: 60.00,
          },
          {
            productId: milk.id,
            quantity: 40,
            price: 1.80,
            receivedQuantity: 30, // Partially received
            total: 72.00,
          },
          {
            productId: butter.id,
            quantity: 20,
            price: 4.50,
            receivedQuantity: 15, // Partially received
            total: 90.00,
          },
        ],
      },
    },
  });

  console.log('Purchase orders created');

  // Create sales
  const standardSale = await prisma.sale.create({
    data: {
      customerName: 'Cafe Delight',
      customerContact: 'orders@cafedelight.com',
      saleType: 'STANDARD',
      status: 'DELIVERED',
      date: new Date(yesterday),
      totalAmount: 95.00,
      paymentStatus: 'PAID',
      paymentMethod: 'BANK_TRANSFER',
      notes: 'Weekly order',
      userId: salesUser.id,
      items: {
        create: [
          {
            productId: bread.id,
            quantity: 10,
            price: 3.50,
            total: 35.00,
          },
          {
            productId: cake.id,
            quantity: 2,
            price: 15.00,
            total: 30.00,
          },
          {
            productId: cookies.id,
            quantity: 5,
            price: 6.00, // Discounted price
            discount: 2.00,
            total: 30.00,
          },
        ],
      },
    },
  });

  const doorToDoorSale = await prisma.sale.create({
    data: {
      customerName: 'Walk-in Customer',
      saleType: 'DOOR_TO_DOOR',
      status: 'DELIVERED',
      date: new Date(yesterday),
      totalAmount: 17.50,
      paymentStatus: 'PAID',
      paymentMethod: 'CASH',
      notes: 'Door-to-door sales route #3',
      userId: salesUser.id,
      items: {
        create: [
          {
            productId: bread.id,
            quantity: 5,
            price: 3.50,
            total: 17.50,
          },
        ],
      },
    },
  });

  console.log('Sales created');

  // Create expenses
  await prisma.expense.create({
    data: {
      category: 'Utilities',
      amount: 250.00,
      date: new Date(yesterday.setDate(yesterday.getDate() - 2)),
      description: 'Electricity bill for bakery',
      paymentMethod: 'BANK_TRANSFER',
      reference: 'UTIL-2023-05',
    },
  });

  await prisma.expense.create({
    data: {
      category: 'Vehicle',
      amount: 120.00,
      date: new Date(yesterday.setDate(yesterday.getDate() - 1)),
      description: 'Fuel for delivery van',
      paymentMethod: 'CREDIT_CARD',
      reference: 'FUEL-2023-12',
    },
  });

  await prisma.expense.create({
    data: {
      category: 'Maintenance',
      amount: 350.00,
      date: new Date(yesterday.setDate(yesterday.getDate() - 5)),
      description: 'Oven repair',
      paymentMethod: 'CASH',
      reference: 'MAINT-2023-03',
    },
  });

  console.log('Expenses created');

  // Create document templates
  const invoiceTemplate = await prisma.documentTemplate.create({
    data: {
      name: 'Standard Invoice',
      documentType: 'INVOICE',
      template: `
        <html>
          <head>
            <title>Invoice</title>
            <style>
              body { font-family: Arial, sans-serif; }
              .header { text-align: center; margin-bottom: 20px; }
              .invoice-details { margin-bottom: 20px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              .total { font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>INVOICE</h1>
            </div>
            <div class="invoice-details">
              <p><strong>Invoice Number:</strong> {{invoiceNumber}}</p>
              <p><strong>Date:</strong> {{date}}</p>
              <p><strong>Customer:</strong> {{customerName}}</p>
            </div>
            <table>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
              {{#items}}
              <tr>
                <td>{{name}}</td>
                <td>{{quantity}}</td>
                <td>{{price}}</td>
                <td>{{total}}</td>
              </tr>
              {{/items}}
              <tr class="total">
                <td colspan="3">Total</td>
                <td>{{totalAmount}}</td>
              </tr>
            </table>
            <div class="footer">
              <p>Thank you for your business!</p>
            </div>
          </body>
        </html>
      `,
    },
  });

  console.log('Document templates created');

  // Create a sample document (invoice)
  await prisma.document.create({
    data: {
      title: 'Invoice for Cafe Delight',
      documentType: 'INVOICE',
      content: JSON.stringify({
        invoiceNumber: 'INV-2023-001',
        date: yesterday.toISOString().split('T')[0],
        customerName: 'Cafe Delight',
        items: [
          { name: 'Bread', quantity: 10, price: '3.50', total: '35.00' },
          { name: 'Cake', quantity: 2, price: '15.00', total: '30.00' },
          { name: 'Cookies', quantity: 5, price: '6.00', total: '30.00' },
        ],
        totalAmount: '95.00',
      }),
      userId: admin.id,
      templateId: invoiceTemplate.id,
    },
  });

  console.log('Documents created');

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
