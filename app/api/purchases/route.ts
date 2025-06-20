import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client"; // Import Prisma for types

// GET /api/purchases - Get all purchase orders
export async function GET() {
  try {
    const purchases = await prisma.purchase.findMany({
      orderBy: {
        orderDate: "desc",
      },
      select: {
        id: true,
        poNumber: true,
        orderNumber: true,
        status: true,
        orderDate: true,
        expectedDate: true,
        totalAmount: true,
        notes: true,
        supplier: {
          select: {
            id: true,
            companyName: true,
            email: true,
            phone: true,
          }
        },
        items: {
          select: {
            id: true,
            qtyOrdered: true,
            qtyReceived: true,
            unitCost: true,
            totalCost: true,
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                unit: true,
                priceCost: true,
                qtyOnHand: true,
              }
            }
          }
        }
      }
    });
    return NextResponse.json({ purchases });
  } catch (error) {
    console.error("Error fetching purchases:", error);
    return NextResponse.json(
      { error: "Failed to fetch purchases" },
      { status: 500 }
    );
  }
}

interface PurchaseItemInput {
  productId?: string; // Existing product ID
  sku?: string; // SKU to find or create product
  name?: string; // Name for new product
  category?: string; // Category for new product
  unit?: string; // Unit for new product
  qtyOrdered: number;
  qtyReceived?: number; // Optional at PO creation, but crucial for 'RECEIVED' status
  unitCost: number;
}

interface PurchaseInput {
  supplierId?: string;
  supplierName?: string; // Kept for flexibility if supplierId not provided
  poNumber: string;
  orderNumber?: string; // Optional as it will be auto-generated
  status?: string; // DRAFT, CONFIRMED, RECEIVED
  orderDate: string; // ISO Date string
  expectedDate?: string; // ISO Date string
  notes?: string;
  items: PurchaseItemInput[];
}

// POST /api/purchases - Create a new purchase order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as PurchaseInput;
    const {
      supplierId,
      supplierName,
      poNumber,
      status = "DRAFT",
      orderDate,
      expectedDate,
      notes,
      items,
    } = body;

    if (!poNumber) {
      return NextResponse.json(
        { error: "Purchase Order number (poNumber) is required" },
        { status: 400 }
      );
    }
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Purchase must include at least one item" },
        { status: 400 }
      );
    }
    if (!orderDate) {
        return NextResponse.json(
            { error: "Order date is required" },
            { status: 400 }
        );
    }

    // Validate supplier
    if (supplierId) {
        const supplierExists = await prisma.supplier.findUnique({ where: { id: supplierId }});
        if (!supplierExists) {
            return NextResponse.json({ error: "Supplier not found"}, { status: 404 });
        }
    } else if (!supplierName) {
        // If no ID, supplierName becomes more important, though ideally we'd always use IDs.
        // For now, we allow supplierName to be directly on Purchase if no ID.
    }


    let totalAmount = 0;
    const purchaseItemsData: Prisma.PurchaseItemCreateWithoutPurchaseInput[] = [];

    for (const item of items) {
      if (!item.qtyOrdered || item.qtyOrdered <= 0 || !item.unitCost || item.unitCost < 0) {
        return NextResponse.json(
          { error: `Invalid quantity or cost for item (SKU: ${item.sku || 'N/A'})` },
          { status: 400 }
        );
      }
      // Check if we have either productId or sku
      if (!item.productId && !item.sku) {
        return NextResponse.json(
          { error: "Each item must have either a productId or SKU." },
          { status: 400 }
        );
      }
      // Only require name and unit if we're creating a new product
      if (!item.productId && item.sku && (!item.name || !item.unit)) {
        return NextResponse.json(
          { error: `New product with SKU ${item.sku} requires name and unit.`},
          { status: 400}
        );
      }

      purchaseItemsData.push({
        // productId will be resolved/created below if necessary
        // For now, push placeholder, will connect/create product inside transaction
        product: {} as any, // Placeholder
        qtyOrdered: item.qtyOrdered,
        qtyReceived: item.qtyReceived || 0,
        unitCost: item.unitCost,
        totalCost: item.qtyOrdered * item.unitCost,
      });
      totalAmount += item.qtyOrdered * item.unitCost;
    }

    const purchase = await prisma.$transaction(async (tx) => {
      // Create the purchase header first
      const newPurchase = await tx.purchase.create({
        data: {
          poNumber,
          orderNumber: `PO-${Date.now()}`, // Simple order number generation
          status,
          orderDate: new Date(orderDate),
          expectedDate: expectedDate ? new Date(expectedDate) : null,
          notes,
          totalAmount,
          supplier: supplierId ? { connect: { id: supplierId } } : undefined,
          supplierName: !supplierId ? supplierName : undefined,
        },
      });

      const finalPurchaseItemsData = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        let productRecord;

        // First try to find by productId
        if (item.productId) {
          productRecord = await tx.product.findUnique({ where: { id: item.productId } });
          if (!productRecord) {
            throw new Error(`Product with ID ${item.productId} not found.`);
          }
        } 
        // Then try to find by SKU
        else if (item.sku) {
          productRecord = await tx.product.findUnique({ where: { sku: item.sku } });
          // Only create new product if SKU doesn't exist
          if (!productRecord) {
            if (!item.name || !item.unit) {
              throw new Error(`SKU ${item.sku} needs name and unit to be created.`);
            }
            productRecord = await tx.product.create({
              data: {
                name: item.name,
                sku: item.sku,
                category: item.category || 'Default',
                unit: item.unit,
                priceSell: 0,
                priceCost: item.unitCost,
                qtyOnHand: 0,
                minQty: 0,
                isRawMaterial: true,
                isFinishedGood: false,
              },
            });
          }
        } else {
          throw new Error("Item must have productId or SKU.");
        }

        // Always update the product's cost price with the latest purchase cost
        await tx.product.update({
          where: { id: productRecord.id },
          data: { priceCost: item.unitCost }
        });

        // Create purchase item
        const createdPurchaseItem = await tx.purchaseItem.create({
          data: {
            purchaseId: newPurchase.id,
            productId: productRecord.id,
            qtyOrdered: item.qtyOrdered,
            qtyReceived: item.qtyReceived || 0,
            unitCost: item.unitCost,
            totalCost: item.qtyOrdered * item.unitCost,
          }
        });
        finalPurchaseItemsData.push(createdPurchaseItem);

        // If status is 'RECEIVED' and qtyReceived > 0, update inventory and product cost
        if (status.toUpperCase() === "RECEIVED" && (item.qtyReceived || 0) > 0) {
          const receivedQty = item.qtyReceived || 0;
          const receivedCost = item.unitCost;
          const prevQty = productRecord.qtyOnHand;
          const prevCost = productRecord.priceCost;

          // Weighted average cost calculation
          const newQtyOnHand = prevQty + receivedQty;
          let newPriceCost = receivedCost;
          if (prevQty > 0) {
            newPriceCost = ((prevQty * prevCost) + (receivedQty * receivedCost)) / newQtyOnHand;
          }

          await tx.product.update({
            where: { id: productRecord.id },
            data: {
              qtyOnHand: newQtyOnHand,
              priceCost: newPriceCost,
            },
          });

          await tx.stockMovement.create({
            data: {
              productId: productRecord.id,
              qty: receivedQty,
              movementType: "IN",
              movementDate: new Date(),
              reference: `PO: ${newPurchase.poNumber}`,
              reason: "Purchase Order Received",
            },
          });
        }
      }

      return tx.purchase.findUnique({
        where: { id: newPurchase.id },
        include: {
          supplier: true,
          items: {
            include: {
              product: true
            }
          }
        }
      });
    });

    return NextResponse.json({ purchase });
  } catch (error: any) {
    console.error("Error creating purchase:", error);
    if (error.code === 'P2002' && error.meta?.target?.includes('poNumber')) {
        return NextResponse.json({ error: "Purchase with this PO Number already exists" }, { status: 409 });
    }
    return NextResponse.json(
      { error: `Failed to create purchase: ${error.message}` },
      { status: 500 }
    );
  }
}
