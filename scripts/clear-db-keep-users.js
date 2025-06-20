const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearDatabaseKeepUsers() {
  try {
    console.log('🗑️  Starting database cleanup (keeping users only)...');

    // Delete in correct order to respect foreign key constraints
    console.log('1. Deleting stock movements...');
    await prisma.stockMovement.deleteMany({});

    console.log('2. Deleting van sales operations...');
    await prisma.vanSalesOperation.deleteMany({});

    console.log('3. Deleting sale items...');
    await prisma.saleItem.deleteMany({});

    console.log('4. Deleting sales...');
    await prisma.sale.deleteMany({});

    console.log('5. Deleting purchase items...');
    await prisma.purchaseItem.deleteMany({});

    console.log('6. Deleting purchases...');
    await prisma.purchase.deleteMany({});

    console.log('7. Deleting attendance records...');
    await prisma.attendance.deleteMany({});

    console.log('8. Deleting payroll records...');
    await prisma.payroll.deleteMany({});

    console.log('9. Deleting employees...');
    await prisma.employee.deleteMany({});

    console.log('10. Deleting production orders...');
    await prisma.productionOrder.deleteMany({});

    console.log('11. Deleting BOM components...');
    await prisma.bomComponent.deleteMany({});

    console.log('12. Deleting BOMs...');
    await prisma.billOfMaterials.deleteMany({});

    console.log('13. Deleting products...');
    await prisma.product.deleteMany({});

    console.log('14. Deleting suppliers...');
    await prisma.supplier.deleteMany({});

    console.log('15. Deleting clients...');
    await prisma.client.deleteMany({});

    console.log('16. Deleting commercials...');
    await prisma.commercial.deleteMany({});

    console.log('17. Deleting password reset tokens...');
    await prisma.passwordResetToken.deleteMany({});

    // Count remaining users
    const userCount = await prisma.user.count();
    
    console.log('\n✅ Database cleared successfully!');
    console.log(`👥 Users preserved: ${userCount}`);
    
    console.log('\n📊 Final database state:');
    console.log(`- Users: ${userCount}`);
    console.log(`- Products: ${await prisma.product.count()}`);
    console.log(`- BOMs: ${await prisma.billOfMaterials.count()}`);
    console.log(`- Production Orders: ${await prisma.productionOrder.count()}`);
    console.log(`- Sales: ${await prisma.sale.count()}`);
    console.log(`- Purchases: ${await prisma.purchase.count()}`);
    console.log(`- Suppliers: ${await prisma.supplier.count()}`);
    console.log(`- Clients: ${await prisma.client.count()}`);
    console.log(`- Employees: ${await prisma.employee.count()}`);
    console.log(`- Stock Movements: ${await prisma.stockMovement.count()}`);

  } catch (error) {
    console.error('❌ Error clearing database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
clearDatabaseKeepUsers(); 