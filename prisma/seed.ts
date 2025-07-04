import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  try {
    // Check if database is already seeded
    const existingUsers = await prisma.user.count();
    if (existingUsers > 0) {
      console.log("ℹ️ Database already contains data. Skipping seed to prevent duplicates.");
      console.log(`Found ${existingUsers} existing users.`);
      return;
    }

    console.log("🔄 Database is empty. Starting fresh seed...");

    // Clear existing data in the correct order (respecting foreign key constraints)
    console.log("🧹 Clearing existing data...");
    
    // Delete in reverse dependency order to avoid foreign key constraint violations
    await prisma.stockMovement.deleteMany().catch(() => console.log("- No stock movements to delete"));
    await prisma.bomComponent.deleteMany().catch(() => console.log("- No BOM components to delete"));
    await prisma.billOfMaterials.deleteMany().catch(() => console.log("- No BOMs to delete"));
    await prisma.saleItem.deleteMany().catch(() => console.log("- No sale items to delete"));
    await prisma.sale.deleteMany().catch(() => console.log("- No sales to delete"));
    await prisma.purchaseItem.deleteMany().catch(() => console.log("- No purchase items to delete"));
    await prisma.purchase.deleteMany().catch(() => console.log("- No purchases to delete"));
    await prisma.productionOrder.deleteMany().catch(() => console.log("- No production orders to delete"));
    await prisma.product.deleteMany().catch(() => console.log("- No products to delete"));
    await prisma.expense.deleteMany().catch(() => console.log("- No expenses to delete"));
    await prisma.expenseCategory.deleteMany().catch(() => console.log("- No expense categories to delete"));
    await prisma.user.deleteMany().catch(() => console.log("- No users to delete"));

    console.log("✅ Cleanup completed");

    // Create users
    console.log("👤 Creating users...");
    const hashedPassword = await bcrypt.hash("password123", 10);

    const adminUser = await prisma.user.create({
      data: {
        email: "admin@domdom.com",
        passwordHash: hashedPassword,
        name: "Admin User",
        role: "ADMIN",
      },
    });

    const salesUser = await prisma.user.create({
      data: {
        email: "sales@domdom.com",
        passwordHash: hashedPassword,
        name: "Sales Manager",
        role: "SALES",
      },
    });

    const inventoryUser = await prisma.user.create({
      data: {
        email: "inventory@domdom.com",
        passwordHash: hashedPassword,
        name: "Inventory Manager",
        role: "INVENTORY",
      },
    });

    console.log("✅ Users created");

    // Create Expense Categories
    console.log("💰 Creating expense categories...");
    await prisma.expenseCategory.createMany({
      data: [
        { name: "Office Supplies", description: "Pens, paper, toner, etc." },
        { name: "Travel", description: "Flights, hotels, rental cars, etc." },
        { name: "Food", description: "Team lunches, client dinners, etc." },
        { name: "Utilities", description: "Electricity, water, internet, etc." },
        { name: "Software", description: "SaaS subscriptions, licenses, etc." },
      ],
    });

    console.log("✅ Expense Categories created");

    // Create products
    console.log("📦 Creating products...");
    await prisma.product.createMany({
      data: [
        // Raw Materials
        {
          name: "Steel Sheet 1mm",
          sku: "STL-001",
          category: "Raw Materials",
          unit: "kg",
          priceSell: 5.5,
          priceCost: 3.2,
          qtyOnHand: 500,
          minQty: 100,
          isRawMaterial: true,
          isFinishedGood: false,
        },
        {
          name: "Aluminum Rod 10mm",
          sku: "ALU-001",
          category: "Raw Materials",
          unit: "m",
          priceSell: 12.3,
          priceCost: 8.5,
          qtyOnHand: 200,
          minQty: 50,
          isRawMaterial: true,
          isFinishedGood: false,
        },
        {
          name: "Plastic Granules PP",
          sku: "PLA-001",
          category: "Raw Materials",
          unit: "kg",
          priceSell: 2.8,
          priceCost: 1.9,
          qtyOnHand: 1000,
          minQty: 200,
          isRawMaterial: true,
          isFinishedGood: false,
        },
        {
          name: "Electronic Component A",
          sku: "ELE-001",
          category: "Components",
          unit: "pcs",
          priceSell: 15.0,
          priceCost: 9.5,
          qtyOnHand: 150,
          minQty: 30,
          isRawMaterial: true,
          isFinishedGood: false,
        },
        {
          name: "Motor Assembly 12V",
          sku: "MOT-001",
          category: "Components",
          unit: "pcs",
          priceSell: 85.0,
          priceCost: 65.0,
          qtyOnHand: 25,
          minQty: 10,
          isRawMaterial: true,
          isFinishedGood: false,
        },
        // Finished Goods
        {
          name: "Industrial Widget Type A",
          sku: "WID-A001",
          category: "Finished Goods",
          unit: "pcs",
          priceSell: 125.0,
          priceCost: 75.0,
          qtyOnHand: 45,
          minQty: 20,
          isRawMaterial: false,
          isFinishedGood: true,
        },
        {
          name: "Custom Assembly B",
          sku: "ASM-B001",
          category: "Finished Goods",
          unit: "pcs",
          priceSell: 250.0,
          priceCost: 180.0,
          qtyOnHand: 12,
          minQty: 5,
          isRawMaterial: false,
          isFinishedGood: true,
        },
        {
          name: "Electronic Device C",
          sku: "DEV-C001",
          category: "Finished Goods",
          unit: "pcs",
          priceSell: 450.0,
          priceCost: 320.0,
          qtyOnHand: 8,
          minQty: 3,
          isRawMaterial: false,
          isFinishedGood: true,
        },
        {
          name: "Premium Tool Kit",
          sku: "TOO-001",
          category: "Finished Goods",
          unit: "set",
          priceSell: 180.0,
          priceCost: 120.0,
          qtyOnHand: 22,
          minQty: 10,
          isRawMaterial: false,
          isFinishedGood: true,
        },
        {
          name: "Precision Instrument D",
          sku: "INS-D001",
          category: "Finished Goods",
          unit: "pcs",
          priceSell: 680.0,
          priceCost: 480.0,
          qtyOnHand: 5,
          minQty: 2,
          isRawMaterial: false,
          isFinishedGood: true,
        },
      ],
    });

    console.log("✅ Products created");

    // Get product IDs for relations
    const allProducts = await prisma.product.findMany();
    const finishedProducts = allProducts.filter((p) => p.isFinishedGood);
    const rawMaterials = allProducts.filter((p) => p.isRawMaterial);

    if (finishedProducts.length === 0 || rawMaterials.length === 0) {
      console.log("⚠️ Warning: Not enough products created for BOM relationships");
      return;
    }

    // Create Bill of Materials
    console.log("🔧 Creating Bill of Materials...");
    
    // BOM for Industrial Widget Type A
    const widgetBom = await prisma.billOfMaterials.create({
      data: {
        name: "Industrial Widget BOM",
        description: "Bill of materials for Industrial Widget Type A",
        finalProductId: finishedProducts[0].id,
        outputQuantity: 100,
        outputUnit: "pcs",
        unitCost: 0, // Will be calculated
      },
    });

    // Add components to BOM
    await prisma.bomComponent.createMany({
      data: [
        {
          bomId: widgetBom.id,
          productId: rawMaterials[0].id, // Steel Sheet
          quantity: 2.5,
          unit: "kg",
        },
        {
          bomId: widgetBom.id,
          productId: rawMaterials[3].id, // Electronic Component
          quantity: 1,
          unit: "pcs",
        },
      ],
    });

    // Update BOM unit cost
    const bomTotalCost = 2.5 * rawMaterials[0].priceCost + 1 * rawMaterials[3].priceCost;
    const bomUnitCost = bomTotalCost / 100; // Cost per unit
    await prisma.billOfMaterials.update({
      where: { id: widgetBom.id },
      data: { unitCost: bomUnitCost },
    });

    console.log("✅ Bill of Materials created");

    // Create Production Orders
    console.log("🏭 Creating production orders...");
    await prisma.productionOrder.create({
      data: {
        orderNumber: "PO-2024-001",
        bomId: widgetBom.id,
        productId: finishedProducts[0].id,
        qtyOrdered: 10,
        status: "PLANNED",
        startDate: new Date(),
        expectedEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      },
    });

    console.log("✅ Production Orders created");

    // Create sample sales
    console.log("💵 Creating sample sales...");
    const sale = await prisma.sale.create({
      data: {
        saleNumber: "SAL-2024-001",
        customerName: "Acme Corporation",
        customerEmail: "orders@acme.com",
        customerPhone: "+1-555-0123",
        saleDate: new Date(),
        status: "DELIVERED",
        totalAmount: 0, // Will be calculated
      },
    });

    await prisma.saleItem.create({
      data: {
        saleId: sale.id,
        productId: finishedProducts[0].id,
        qty: 2,
        unitPrice: finishedProducts[0].priceSell,
        totalPrice: 2 * finishedProducts[0].priceSell,
      },
    });

    // Update sale total
    await prisma.sale.update({
      where: { id: sale.id },
      data: { totalAmount: 2 * finishedProducts[0].priceSell },
    });

    console.log("✅ Sales created");

    // Create sample purchases
    console.log("🛒 Creating sample purchases...");
    const purchase = await prisma.purchase.create({
      data: {
        orderNumber: "PUR-2024-001",
        poNumber: "PO-PUR-2024-001",
        supplierName: "Steel Supplies Inc.",
        supplierEmail: "sales@steelsupplies.com",
        orderDate: new Date(),
        expectedDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        status: "CONFIRMED",
        totalAmount: 0, // Will be calculated
      },
    });

    await prisma.purchaseItem.create({
      data: {
        purchaseId: purchase.id,
        productId: rawMaterials[0].id,
        qtyOrdered: 100,
        unitCost: rawMaterials[0].priceCost,
        totalCost: 100 * rawMaterials[0].priceCost,
      },
    });

    // Update purchase total
    await prisma.purchase.update({
      where: { id: purchase.id },
      data: { totalAmount: 100 * rawMaterials[0].priceCost },
    });

    console.log("✅ Purchases created");

    // Create stock movements
    console.log("📊 Creating stock movements...");
    await prisma.stockMovement.createMany({
      data: [
        {
          productId: rawMaterials[0].id,
          movementType: "IN",
          qty: 100,
          reference: "PUR-2024-001",
          reason: "Purchase Order PUR-2024-001",
          movementDate: new Date(),
        },
        {
          productId: finishedProducts[0].id,
          movementType: "OUT",
          qty: 2,
          reference: "SAL-2024-001",
          reason: "Sale SAL-2024-001",
          movementDate: new Date(),
        },
      ],
    });

    console.log("✅ Stock Movements created");

    // Success summary
    const userCount = await prisma.user.count();
    const productCount = await prisma.product.count();
    const bomCount = await prisma.billOfMaterials.count();
    const saleCount = await prisma.sale.count();
    const purchaseCount = await prisma.purchase.count();

    console.log("\n🎉 Database seeded successfully!");
    console.log("📊 Summary:");
    console.log(`   👤 Users: ${userCount}`);
    console.log(`   📦 Products: ${productCount}`);
    console.log(`   🔧 BOMs: ${bomCount}`);
    console.log(`   💵 Sales: ${saleCount}`);
    console.log(`   🛒 Purchases: ${purchaseCount}`);
    
    console.log("\n👤 Default login credentials:");
    console.log("   Admin: admin@domdom.com / password123");
    console.log("   Sales: sales@domdom.com / password123");
    console.log("   Inventory: inventory@domdom.com / password123");

  } catch (error) {
    console.error("❌ Error during database seeding:");
    console.error(error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error("💥 Seed script failed:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log("🔌 Database connection closed");
  });