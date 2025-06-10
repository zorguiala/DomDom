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
      include: {
        supplier: true,
        items: {
          include: {
            product: true,
          },
        },
      },
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
      if (!item.productId && !item.sku) {
        return NextResponse.json(
          { error: "Each item must have a productId or an SKU." },
          { status: 400 }
        );
      }
      if (!item.productId && item.sku && (!item.name || !item.unit)) {
        return NextResponse.json(
          { error: `New product (SKU: ${item.sku}) requires name and unit.`},
          { status: 400}
        )
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
      const newPurchase = await tx.purchase.create({
        data: {
          poNumber,
          supplierId,
          supplierName: supplierId ? undefined : supplierName, // Only save supplierName if no ID
          status,
          orderDate: new Date(orderDate),
          expectedDate: expectedDate ? new Date(expectedDate) : undefined,
          totalAmount,
          notes,
          items: {
            create: [], // Will be populated below
          },
        },
      });

      // Process each item: find/create product, then create purchase item linking to it
      const finalPurchaseItemsData = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        let productRecord;

        if (item.productId) {
          productRecord = await tx.product.findUnique({ where: { id: item.productId } });
          if (!productRecord) {
            throw new Error(`Product with ID ${item.productId} not found.`);
          }
        } else if (item.sku) {
          productRecord = await tx.product.findUnique({ where: { sku: item.sku } });
          if (!productRecord) {
            // Product does not exist, create it
            if (!item.name || !item.unit) throw new Error(`SKU ${item.sku} needs name and unit to be created.`);
            productRecord = await tx.product.create({
              data: {
                name: item.name,
                sku: item.sku,
                category: item.category || 'Default',
                unit: item.unit,
                priceSell: 0, // Default sell price, can be updated later
                priceCost: item.unitCost, // Initial cost price from this purchase
                qtyOnHand: 0, // Initial qty
                isRawMaterial: true, // Assume items bought are raw materials
                isFinishedGood: false,
              },
            });
          }
        } else {
            throw new Error("Item must have productId or SKU.");
        }

        // Now create the purchase item and link it to the product
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
          const currentProduct = await tx.product.findUnique({ where: { id: productRecord.id } });
          if (!currentProduct) throw new Error(`Product ${productRecord.id} vanished mid-transaction`);

          const newQtyOnHand = currentProduct.qtyOnHand + (item.qtyReceived || 0);

          await tx.product.update({
            where: { id: productRecord.id },
            data: {
              qtyOnHand: newQtyOnHand,
              priceCost: item.unitCost, // Update cost to this purchase's unit cost
            },
          });

          await tx.stockMovement.create({
            data: {
              productId: productRecord.id,
              qty: item.qtyReceived || 0,
              movementType: "IN",
              movementDate: new Date(),
              reference: `PO: ${newPurchase.poNumber}`,
              reason: "Purchase Order Received",
            },
          });
        }
      }
      // Return the purchase with its items by querying it again
      // This ensures all relations are correctly populated
      return tx.purchase.findUnique({
        where: { id: newPurchase.id },
        include: {
            supplier: true,
            items: { include: { product: true }}
        }
      });
    });


    return NextResponse.json({ purchase }, { status: 201 });
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
