import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

interface Params {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/purchases/[id] - Get a specific purchase order
export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const purchase = await prisma.purchase.findUnique({
      where: { id },
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

    if (!purchase) {
      return NextResponse.json(
        { error: "Purchase order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ purchase });
  } catch (error) {
    console.error("Error fetching purchase:", error);
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
  const { id: purchaseId } = await params;
  try {
    const body = await request.json() as PurchaseUpdateInput;

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
        supplier: supplierId ? { connect: { id: supplierId } } : undefined,
        supplierName: !supplierId ? supplierName : undefined,
        poNumber,
        status,
        orderDate: orderDate ? new Date(orderDate) : undefined,
        expectedDate: expectedDate ? new Date(expectedDate) : undefined,
        receivedDate: (status?.toUpperCase() === "RECEIVED") ? new Date(receivedDate || Date.now()) : (receivedDate ? new Date(receivedDate) : undefined),
        totalAmount: (items && items.length > 0) ? totalAmount : undefined,
        notes,
      };

      // Remove undefined fields using type-safe approach
      const cleanedData = Object.fromEntries(
        Object.entries(updatedPurchaseData).filter(([_, value]) => value !== undefined)
      ) as Prisma.PurchaseUpdateInput;

      return tx.purchase.update({
        where: { id: purchaseId },
        data: cleanedData,
        include: {
          supplier: true,
          items: { include: { product: true } },
        },
      });
    });

    return NextResponse.json({ purchase: updatedPurchase });
  } catch (error: any) {
    console.error(`Error updating purchase order ${purchaseId}:`, error);
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
  const { id: purchaseId } = await params;
  try {

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
    console.error(`Error deleting purchase order ${purchaseId}:`, error);
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

// PATCH /api/purchases/[id] - Update a purchase order
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ["DRAFT", "CONFIRMED", "RECEIVED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    // Get current purchase to check if status change is valid
    const currentPurchase = await prisma.purchase.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!currentPurchase) {
      return NextResponse.json(
        { error: "Purchase order not found" },
        { status: 404 }
      );
    }

    // Validate status transition
    const isValidTransition = (
      (currentPurchase.status === "DRAFT" && ["CONFIRMED", "RECEIVED"].includes(status)) ||
      (currentPurchase.status === "CONFIRMED" && status === "RECEIVED") ||
      status === currentPurchase.status
    );

    if (!isValidTransition) {
      return NextResponse.json(
        { error: "Invalid status transition" },
        { status: 400 }
      );
    }

    // If transitioning to RECEIVED, validate that all items have qtyReceived set
    if (status === "RECEIVED") {
      const invalidItems = currentPurchase.items.filter(
        item => !item.qtyReceived || item.qtyReceived <= 0
      );

      if (invalidItems.length > 0) {
        return NextResponse.json(
          { 
            error: "Cannot mark as received: some items have no received quantity",
            invalidItems: invalidItems.map(item => ({
              productName: item.product.name,
              sku: item.product.sku
            }))
          },
          { status: 400 }
        );
      }
    }

    // Use transaction to ensure all updates are atomic
    const updatedPurchase = await prisma.$transaction(async (tx) => {
      // If transitioning to CONFIRMED, set qtyReceived equal to qtyOrdered for all items
      if (status === "CONFIRMED" && currentPurchase.status === "DRAFT") {
        for (const item of currentPurchase.items) {
          await tx.purchaseItem.update({
            where: { id: item.id },
            data: {
              qtyReceived: item.qtyOrdered
            }
          });
        }
      }

      // If transitioning to RECEIVED, update inventory
      if (status === "RECEIVED" && currentPurchase.status !== "RECEIVED") {
        for (const item of currentPurchase.items) {
          const qtyToReceive = item.qtyReceived;
          const product = item.product;
          const newQtyOnHand = product.qtyOnHand + qtyToReceive;

          // Update product quantity and cost
          await tx.product.update({
            where: { id: product.id },
            data: {
              qtyOnHand: newQtyOnHand,
              priceCost: item.unitCost, // Update cost at the time of receiving
            },
          });

          // Create stock movement record
          await tx.stockMovement.create({
            data: {
              productId: product.id,
              qty: qtyToReceive,
              movementType: "IN",
              movementDate: new Date(),
              reference: `PO: ${currentPurchase.poNumber}`,
              reason: "Purchase Order Item Received",
            },
          });
        }
      }

      // Update purchase status
      return tx.purchase.update({
        where: { id },
        data: {
          status,
          receivedDate: status === "RECEIVED" ? new Date() : undefined
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });
    });

    return NextResponse.json({ purchase: updatedPurchase });
  } catch (error) {
    console.error("Error updating purchase:", error);
    return NextResponse.json(
      { error: "Failed to update purchase order" },
      { status: 500 }
    );
  }
}
