import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

interface Params {
  params: {
    id: string;
  };
}

// GET /api/purchases/[id] - Get a single purchase order by ID
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const purchase = await prisma.purchase.findUnique({
      where: { id: params.id },
      include: {
        supplier: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!purchase) {
      return NextResponse.json({ error: "Purchase order not found" }, { status: 404 });
    }

    return NextResponse.json({ purchase });
  } catch (error) {
    console.error(`Error fetching purchase order ${params.id}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch purchase order" },
      { status: 500 }
    );
  }
}

interface PurchaseItemUpdateInput {
  id?: string; // ID of existing purchase item for updates
  productId?: string;
  sku?: string;
  name?: string;
  category?: string;
  unit?: string;
  qtyOrdered: number;
  qtyReceived?: number;
  unitCost: number;
  // If an item is to be removed, it should be handled by not including it in the 'items' array for update,
  // or by a specific 'deletedItemIds' field if partial item updates are supported.
  // For simplicity, this PUT might replace items or require all items to be sent.
}

interface PurchaseUpdateInput {
  supplierId?: string;
  supplierName?: string;
  poNumber?: string;
  status?: string; // DRAFT, CONFIRMED, RECEIVED
  orderDate?: string; // ISO Date string
  expectedDate?: string; // ISO Date string
  receivedDate?: string; // ISO Date string, set when status is RECEIVED
  notes?: string;
  items?: PurchaseItemUpdateInput[]; // Optional: if not provided, items are not updated.
                                   // If provided, it might replace existing items or update them based on ID.
}

// PUT /api/purchases/[id] - Update a purchase order by ID
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const body = await request.json() as PurchaseUpdateInput;
    const purchaseId = params.id;

    const {
      supplierId,
      supplierName,
      poNumber,
      status,
      orderDate,
      expectedDate,
      receivedDate,
      notes,
      items, // For now, let's assume if 'items' are sent, they replace the old ones.
             // More granular item updates (add/remove/update specific items) are more complex.
    } = body;

    const purchaseToUpdate = await prisma.purchase.findUnique({
        where: { id: purchaseId },
        include: { items: true }
    });

    if (!purchaseToUpdate) {
        return NextResponse.json({ error: "Purchase order not found" }, { status: 404 });
    }

    // Logic to handle inventory updates if status changes to 'RECEIVED'
    // or if items are received.
    // This can be complex if items are updated, added, or removed.
    // A common scenario: PO is confirmed, then later marked as 'RECEIVED'.

    const updatedPurchase = await prisma.$transaction(async (tx) => {
      let totalAmount = purchaseToUpdate.totalAmount; // Start with current total

      // If items are part of the update, this indicates a potential change in items.
      // For simplicity, this example will assume that if `items` are provided,
      // they are a new set of items for the PO.
      // A more robust implementation would handle individual item CRUD within the PO.
      if (items && items.length > 0) {
        // Delete old items first if we are replacing them
        await tx.purchaseItem.deleteMany({
          where: { purchaseId: purchaseId },
        });

        totalAmount = 0; // Recalculate total amount based on new items
        const newPurchaseItemsData = [];

        for (const item of items) {
          if (!item.qtyOrdered || item.qtyOrdered <= 0 || !item.unitCost || item.unitCost < 0) {
            throw new Error(`Invalid quantity or cost for item (SKU: ${item.sku || 'N/A'})`);
          }
           if (!item.productId && !item.sku) {
            throw new Error("Each item must have a productId or an SKU.");
          }
          if (!item.productId && item.sku && (!item.name || !item.unit)) {
            throw new Error(`New product (SKU: ${item.sku}) requires name and unit.`);
          }

          let productRecord;
          if (item.productId) {
            productRecord = await tx.product.findUnique({ where: { id: item.productId } });
            if (!productRecord) throw new Error(`Product with ID ${item.productId} not found.`);
          } else if (item.sku) {
            productRecord = await tx.product.findUnique({ where: { sku: item.sku } });
            if (!productRecord) {
              productRecord = await tx.product.create({
                data: {
                  name: item.name!,
                  sku: item.sku!,
                  category: item.category || 'Default',
                  unit: item.unit!,
                  priceSell: 0,
                  priceCost: item.unitCost,
                  qtyOnHand: 0,
                  isRawMaterial: true,
                  isFinishedGood: false,
                },
              });
            }
          } else {
            throw new Error("Item must have a productId or SKU.");
          }

          newPurchaseItemsData.push({
            productId: productRecord.id,
            qtyOrdered: item.qtyOrdered,
            qtyReceived: item.qtyReceived || 0,
            unitCost: item.unitCost,
            totalCost: item.qtyOrdered * item.unitCost,
          });
          totalAmount += item.qtyOrdered * item.unitCost;
        }
        // Update purchase with new items
        await tx.purchase.update({
            where: { id: purchaseId },
            data: { items: { create: newPurchaseItemsData } }
        });
      }


      // Handle status change, especially to 'RECEIVED'
      // This is where stock updates happen for items that were not yet processed.
      if (status && status.toUpperCase() === "RECEIVED" && purchaseToUpdate.status !== "RECEIVED") {
        const currentItems = await tx.purchaseItem.findMany({
            where: { purchaseId: purchaseId },
            include: { product: true }
        });

        for (const item of currentItems) {
          // Process only if qtyReceived is specified and positive, and potentially if not already processed.
          // This logic assumes qtyReceived is set upon this PUT request or was set before.
          // If qtyReceived was already processed by POST, this might double count.
          // A more robust system would track processed quantities.
          // For now, assume this PUT is the point of "receiving" items if status changes to RECEIVED.

          const qtyToReceive = (item.qtyReceived || 0); // Use the current item.qtyReceived

          if (qtyToReceive > 0) {
            // We need to ensure we only process the reception once.
            // A simple check could be if the product stock was already updated for this item.
            // A better way would be to have a flag on PurchaseItem 'processedForStock'
            // or compare qtyReceived with a new field like 'qtyStocked'.
            // For this version, we'll proceed if status becomes RECEIVED.

            const product = item.product;
            const newQtyOnHand = product.qtyOnHand + qtyToReceive;

            await tx.product.update({
              where: { id: product.id },
              data: {
                qtyOnHand: newQtyOnHand,
                priceCost: item.unitCost, // Update cost at the time of receiving
              },
            });

            await tx.stockMovement.create({
              data: {
                productId: product.id,
                qty: qtyToReceive,
                movementType: "IN",
                movementDate: new Date(receivedDate || Date.now()),
                reference: `PO: ${purchaseToUpdate.poNumber}`,
                reason: "Purchase Order Item Received",
              },
            });

            // Optionally, update the purchase item itself if qtyReceived was just set.
            // If items array was passed in body, it might have new qtyReceived values.
            // If not, ensure item.qtyReceived is updated in the DB if it changed.
            // The current logic replaces items if `items` is in body, or processes existing items.
          }
        }
      }

      // Update the purchase header
      const updatedPurchaseData: Prisma.PurchaseUpdateInput = {
        supplierId,
        supplierName: supplierId ? undefined : supplierName,
        poNumber,
        status,
        orderDate: orderDate ? new Date(orderDate) : undefined,
        expectedDate: expectedDate ? new Date(expectedDate) : undefined,
        receivedDate: (status?.toUpperCase() === "RECEIVED") ? new Date(receivedDate || Date.now()) : (receivedDate ? new Date(receivedDate) : undefined),
        totalAmount: (items && items.length > 0) ? totalAmount : undefined, // only update if items were processed
        notes,
      };

      // Remove undefined fields from updatedPurchaseData
      Object.keys(updatedPurchaseData).forEach(key => updatedPurchaseData[key] === undefined && delete updatedPurchaseData[key]);


      return tx.purchase.update({
        where: { id: purchaseId },
        data: updatedPurchaseData,
        include: {
          supplier: true,
          items: { include: { product: true } },
        },
      });
    });

    return NextResponse.json({ purchase: updatedPurchase });
  } catch (error: any) {
    console.error(`Error updating purchase order ${params.id}:`, error);
    if (error.code === 'P2025') { // Prisma error code for record not found
        return NextResponse.json({ error: "Purchase order or related entity not found" }, { status: 404 });
    }
    if (error.code === 'P2002' && error.meta?.target?.includes('poNumber')) {
        return NextResponse.json({ error: "Purchase with this PO Number already exists" }, { status: 409 });
    }
    return NextResponse.json(
      { error: `Failed to update purchase order: ${error.message}` },
      { status: 500 }
    );
  }
}

// DELETE /api/purchases/[id] - Delete a purchase order by ID
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const purchaseId = params.id;

    // Before deleting a purchase, consider if stock movements should be reversed.
    // This can be complex (e.g., if the stock has since been used).
    // For now, we'll delete the PO. Associated PurchaseItems will be cascade deleted by Prisma.
    // StockMovement records will remain as a historical log unless explicitly handled.

    const purchaseToDelete = await prisma.purchase.findUnique({ where: { id: purchaseId }});
    if (!purchaseToDelete) {
         return NextResponse.json({ error: "Purchase order not found" }, { status: 404 });
    }

    // If the purchase was 'RECEIVED' and items were stocked, deleting it creates inconsistency
    // unless stock is adjusted back. This is a business logic decision.
    // For now, direct deletion.
    if (purchaseToDelete.status === "RECEIVED") {
        // Potentially add a warning or prevent deletion, or implement stock reversal.
        // console.warn(`Deleting a RECEIVED purchase order (${purchaseId}). Stock adjustments may be needed.`);
    }

    await prisma.purchase.delete({
      where: { id: purchaseId },
    });

    return NextResponse.json({ message: "Purchase order deleted successfully" });
  } catch (error: any) {
    console.error(`Error deleting purchase order ${params.id}:`, error);
    if (error.code === 'P2025') {
        return NextResponse.json({ error: "Purchase order not found for deletion" }, { status: 404 });
    }
    // Handle other potential errors, e.g., relational constraints if not set to cascade.
    return NextResponse.json(
      { error: "Failed to delete purchase order" },
      { status: 500 }
    );
  }
}
