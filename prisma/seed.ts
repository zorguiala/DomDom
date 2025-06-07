import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Clear existing data
  await prisma.stockMovement.deleteMany();
  await prisma.bomComponent.deleteMany();
  await prisma.billOfMaterials.deleteMany();
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.purchaseItem.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.productionOrder.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // Create users
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

  // Create products
  const products = await prisma.product.createMany({
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

  // Create Bill of Materials
  if (finishedProducts.length > 0 && rawMaterials.length > 2) {
    const bom1 = await prisma.billOfMaterials.create({
      data: {
        name: "Industrial Widget BOM",
        description: "Bill of materials for Industrial Widget Type A",
        finalProductId: finishedProducts[0].id,
        components: {
          create: [
            {
              productId: rawMaterials[0].id, // Steel Sheet
              quantity: 2.5,
              unit: "kg",
            },
            {
              productId: rawMaterials[3].id, // Electronic Component
              quantity: 1,
              unit: "pcs",
            },
          ],
        },
      },
    });

    const bom2 = await prisma.billOfMaterials.create({
      data: {
        name: "Custom Assembly BOM",
        description: "Bill of materials for Custom Assembly B",
        finalProductId: finishedProducts[1].id,
        components: {
          create: [
            {
              productId: rawMaterials[1].id, // Aluminum Rod
              quantity: 3.0,
              unit: "m",
            },
            {
              productId: rawMaterials[4].id, // Motor Assembly
              quantity: 1,
              unit: "pcs",
            },
          ],
        },
      },
    });

    console.log("✅ Bill of Materials created");
  }

  // Create Production Orders
  if (finishedProducts.length > 0) {
    await prisma.productionOrder.createMany({
      data: [
        {
          orderNumber: "PO-2025-001",
          productId: finishedProducts[0].id,
          qtyOrdered: 50,
          qtyProduced: 35,
          status: "IN_PROGRESS",
          priority: "HIGH",
          startDate: new Date("2025-05-28"),
          expectedEndDate: new Date("2025-06-05"),
        },
        {
          orderNumber: "PO-2025-002",
          productId: finishedProducts[1].id,
          qtyOrdered: 25,
          qtyProduced: 25,
          status: "DONE",
          priority: "MEDIUM",
          startDate: new Date("2025-05-20"),
          expectedEndDate: new Date("2025-05-30"),
          actualEndDate: new Date("2025-05-29"),
        },
        {
          orderNumber: "PO-2025-003",
          productId: finishedProducts[2].id,
          qtyOrdered: 10,
          qtyProduced: 0,
          status: "PLANNED",
          priority: "LOW",
          startDate: new Date("2025-06-10"),
          expectedEndDate: new Date("2025-06-20"),
        },
      ],
    });

    console.log("✅ Production Orders created");
  }

  // Create Sales
  if (finishedProducts.length > 0) {
    const sale1 = await prisma.sale.create({
      data: {
        saleNumber: "SO-2025-001",
        customerName: "ABC Manufacturing Ltd",
        customerEmail: "orders@abcmfg.com",
        customerPhone: "+1-555-0123",
        orderDate: new Date("2025-06-01"),
        status: "CONFIRMED",
        totalAmount: 875.0,
        items: {
          create: [
            {
              productId: finishedProducts[0].id,
              qty: 5,
              unitPrice: 125.0,
              totalPrice: 625.0,
            },
            {
              productId: finishedProducts[1].id,
              qty: 1,
              unitPrice: 250.0,
              totalPrice: 250.0,
            },
          ],
        },
      },
    });

    const sale2 = await prisma.sale.create({
      data: {
        saleNumber: "SO-2025-002",
        customerName: "Tech Solutions Inc",
        customerEmail: "procurement@techsol.com",
        customerPhone: "+1-555-0456",
        orderDate: new Date("2025-06-02"),
        status: "DELIVERED",
        totalAmount: 1360.0,
        items: {
          create: [
            {
              productId: finishedProducts[2].id,
              qty: 2,
              unitPrice: 450.0,
              totalPrice: 900.0,
            },
            {
              productId: finishedProducts[3].id,
              qty: 1,
              unitPrice: 180.0,
              totalPrice: 180.0,
            },
            {
              productId: finishedProducts[4].id,
              qty: 1,
              unitPrice: 680.0,
              totalPrice: 680.0,
            },
          ],
        },
      },
    });

    console.log("✅ Sales created");
  }

  // Create Purchases
  if (rawMaterials.length > 0) {
    const purchase1 = await prisma.purchase.create({
      data: {
        orderNumber: "PU-2025-001",
        poNumber: "PO-2025-001",
        supplierName: "Steel & Metal Supply Co",
        supplierEmail: "orders@steelmetal.com",
        orderDate: new Date("2025-05-25"),
        status: "RECEIVED",
        totalAmount: 1600.0,
        items: {
          create: [
            {
              productId: rawMaterials[0].id, // Steel Sheet
              qtyOrdered: 500,
              qtyReceived: 500,
              unitCost: 3.2,
              totalCost: 1600.0,
            },
          ],
        },
      },
    });

    const purchase2 = await prisma.purchase.create({
      data: {
        orderNumber: "PU-2025-002",
        poNumber: "PO-2025-002",
        supplierName: "Electronic Components Ltd",
        supplierEmail: "sales@electrocomp.com",
        orderDate: new Date("2025-06-01"),
        status: "CONFIRMED",
        totalAmount: 1425.0,
        items: {
          create: [
            {
              productId: rawMaterials[3].id, // Electronic Component
              qtyOrdered: 100,
              qtyReceived: 0,
              unitCost: 9.5,
              totalCost: 950.0,
            },
            {
              productId: rawMaterials[4].id, // Motor Assembly
              qtyOrdered: 10,
              qtyReceived: 0,
              unitCost: 65.0,
              totalCost: 650.0,
            },
          ],
        },
      },
    });

    console.log("✅ Purchases created");
  }

  // Create Stock Movements
  if (allProducts.length > 0) {
    await prisma.stockMovement.createMany({
      data: [
        {
          productId: allProducts[0].id,
          movementType: "IN",
          qty: 500,
          movementDate: new Date("2025-05-25"),
          reference: "PU-2025-001",
          reason: "Purchase receipt",
        },
        {
          productId: allProducts[5].id, // Industrial Widget
          movementType: "OUT",
          qty: 5,
          movementDate: new Date("2025-06-01"),
          reference: "SO-2025-001",
          reason: "Sale shipment",
        },
        {
          productId: allProducts[6].id, // Custom Assembly
          movementType: "OUT",
          qty: 1,
          movementDate: new Date("2025-06-01"),
          reference: "SO-2025-001",
          reason: "Sale shipment",
        },
        {
          productId: allProducts[7].id, // Electronic Device
          movementType: "OUT",
          qty: 2,
          movementDate: new Date("2025-06-02"),
          reference: "SO-2025-002",
          reason: "Sale shipment",
        },
      ],
    });

    console.log("✅ Stock Movements created");
  }

  console.log("🎉 Database seeded successfully!");
  console.log("👤 Default login credentials:");
  console.log("   Admin: admin@domdom.com / password123");
  console.log("   Sales: sales@domdom.com / password123");
  console.log("   Inventory: inventory@domdom.com / password123");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
