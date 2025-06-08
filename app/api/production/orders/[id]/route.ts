import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/production/orders/[id] - Fetch a single production order
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const productionOrder = await prisma.productionOrder.findUnique({
      where: { id },
      include: {
        product: true, // Product to be produced
        bom: {
          include: {
            components: {
              include: {
                product: true, // Raw material product details
              },
            },
          },
        },
      },
    });

    if (!productionOrder) {
      return NextResponse.json(
        { error: "Production order not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(productionOrder);
  } catch (error: any) {
    console.error("Error fetching production order:", error);
    return NextResponse.json(
      { error: "Failed to fetch production order", details: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/production/orders/[id] - Update a production order
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { status, qtyProduced, ...updateData } = body;

    const currentOrder = await prisma.productionOrder.findUnique({
      where: { id },
      include: {
        bom: {
          include: {
            components: {
              include: { product: true }, // Ensure raw material product data is fetched
            },
          },
        },
        product: true, // Ensure finished good product data is fetched
      },
    });

    if (!currentOrder) {
      return NextResponse.json(
        { error: "Production order not found" },
        { status: 404 }
      );
    }

    // If status is not changing, just update other fields
    if (!status || status === currentOrder.status) {
      const updatedOrder = await prisma.productionOrder.update({
        where: { id },
        data: { ...updateData, qtyProduced: qtyProduced !== undefined ? parseFloat(qtyProduced) : currentOrder.qtyProduced },
      });
      return NextResponse.json(updatedOrder);
    }

    // Handle status change with transaction
    let updatedOrderWithStatusChange;

    if (status === "IN_PROGRESS" && currentOrder.status === "PLANNED") {
      if (!currentOrder.bomId || !currentOrder.bom) {
        return NextResponse.json(
          { error: "BOM is not assigned to this production order. Cannot start production." },
          { status: 400 }
        );
      }
      if (!currentOrder.bom.components || currentOrder.bom.components.length === 0) {
        return NextResponse.json(
          { error: "BOM has no components. Cannot start production." },
          { status: 400 }
        );
      }

      updatedOrderWithStatusChange = await prisma.$transaction(async (tx) => {
        // 1. Check stock for all components
        for (const component of currentOrder.bom!.components) {
          const requiredQty = component.quantity * currentOrder.qtyOrdered;
          const rawMaterialProduct = await tx.product.findUnique({
            where: { id: component.productId },
          });
          if (!rawMaterialProduct || rawMaterialProduct.qtyOnHand < requiredQty) {
            throw new Error(
              `Insufficient stock for component ${component.product.name} (SKU: ${component.product.sku}). Required: ${requiredQty}, Available: ${rawMaterialProduct?.qtyOnHand || 0}`
            );
          }
        }

        // 2. Deduct stock for all components
        for (const component of currentOrder.bom!.components) {
          const requiredQty = component.quantity * currentOrder.qtyOrdered;
          await tx.product.update({
            where: { id: component.productId },
            data: { qtyOnHand: { decrement: requiredQty } },
          });
          // Optional: Create StockMovement record
          await tx.stockMovement.create({
            data: {
              productId: component.productId,
              qty: -requiredQty,
              movementType: "PRODUCTION_RAW_OUT",
              reference: `PO:${currentOrder.orderNumber}`,
              notes: `Raw material for Production Order ${currentOrder.orderNumber}`,
            }
          });
        }

        // 3. Update order status
        return tx.productionOrder.update({
          where: { id },
          data: { ...updateData, status, startedAt: new Date() },
        });
      });
    } else if (status === "DONE" && (currentOrder.status === "PLANNED" || currentOrder.status === "IN_PROGRESS")) {
      // If moving from PLANNED to DONE, raw materials might not have been deducted.
      // This simplified logic assumes raw materials are deducted when moving to IN_PROGRESS.
      // A more robust solution would handle PLANNED -> DONE by also running deductions if currentOrder.status was PLANNED.
      if (currentOrder.status === "PLANNED") {
         // This means we need to deduct raw materials first.
         // For simplicity, we'll require it to go through IN_PROGRESS or handle that complex transaction here.
         // Current logic: if it was PLANNED, it must go to IN_PROGRESS first to deduct raw materials.
         // To support PLANNED -> DONE directly with raw material deduction:
         // You would need to include the same stock check and deduction logic as in the "IN_PROGRESS" block.
         // For this exercise, we'll assume if it was PLANNED, it should have gone to IN_PROGRESS first.
         // However, if qtyProduced is being set, it implies completion.
         if (!currentOrder.bomId || !currentOrder.bom) {
          return NextResponse.json(
            { error: "BOM is not assigned. Cannot complete production." },
            { status: 400 }
          );
        }
        // Check and Deduct Raw Materials if not already IN_PROGRESS
        if (currentOrder.status === "PLANNED") {
            await prisma.$transaction(async (tx) => {
                for (const component of currentOrder.bom!.components) {
                    const requiredQty = component.quantity * currentOrder.qtyOrdered;
                    const rawMaterialProduct = await tx.product.findUnique({ where: { id: component.productId } });
                    if (!rawMaterialProduct || rawMaterialProduct.qtyOnHand < requiredQty) {
                        throw new Error(`Insufficient stock for ${component.product.name}. Required: ${requiredQty}, Available: ${rawMaterialProduct?.qtyOnHand || 0}`);
                    }
                }
                for (const component of currentOrder.bom!.components) {
                    const requiredQty = component.quantity * currentOrder.qtyOrdered;
                    await tx.product.update({
                        where: { id: component.productId },
                        data: { qtyOnHand: { decrement: requiredQty } },
                    });
                    await tx.stockMovement.create({
                        data: {
                            productId: component.productId, qty: -requiredQty, movementType: "PRODUCTION_RAW_OUT",
                            reference: `PO:${currentOrder.orderNumber}`, notes: `Raw material for PO ${currentOrder.orderNumber} (skipped IN_PROGRESS)`,
                        }
                    });
                }
            });
        }
      }

      const finalQtyProduced = qtyProduced !== undefined ? parseFloat(qtyProduced) : currentOrder.qtyOrdered;
      if (finalQtyProduced <= 0) {
        return NextResponse.json(
          { error: "Quantity produced must be greater than zero to mark as DONE." },
          { status: 400 }
        );
      }

      updatedOrderWithStatusChange = await prisma.$transaction(async (tx) => {
        // 1. Increment stock for the finished good
        await tx.product.update({
          where: { id: currentOrder.productId },
          data: { qtyOnHand: { increment: finalQtyProduced } },
        });
         // Optional: Create StockMovement record
         await tx.stockMovement.create({
          data: {
            productId: currentOrder.productId,
            qty: finalQtyProduced,
            movementType: "PRODUCTION_FG_IN",
            reference: `PO:${currentOrder.orderNumber}`,
            notes: `Finished good from Production Order ${currentOrder.orderNumber}`,
          }
        });

        // 2. Update order status and qtyProduced
        return tx.productionOrder.update({
          where: { id },
          data: { ...updateData, status, qtyProduced: finalQtyProduced, finishedAt: new Date(), actualEndDate: new Date() },
        });
      });
    } else if (status === "PLANNED" && currentOrder.status === "IN_PROGRESS") {
        // Reverting to PLANNED from IN_PROGRESS:
        // This implies materials that were deducted should be returned to stock.
        if (!currentOrder.bomId || !currentOrder.bom || !currentOrder.bom.components || currentOrder.bom.components.length === 0) {
            // No BOM or components, so nothing to return
        } else {
            updatedOrderWithStatusChange = await prisma.$transaction(async (tx) => {
                for (const component of currentOrder.bom!.components) {
                    const deductedQty = component.quantity * currentOrder.qtyOrdered;
                    await tx.product.update({
                        where: { id: component.productId },
                        data: { qtyOnHand: { increment: deductedQty } },
                    });
                    await tx.stockMovement.create({
                        data: {
                            productId: component.productId, qty: deductedQty, movementType: "PRODUCTION_RAW_REVERSAL",
                            reference: `PO:${currentOrder.orderNumber}`, notes: `Reversal for PO ${currentOrder.orderNumber} (IN_PROGRESS -> PLANNED)`,
                        }
                    });
                }
                return tx.productionOrder.update({
                    where: { id },
                    data: { ...updateData, status, startedAt: null }, // Reset startedAt
                });
            });
        }
         if (!updatedOrderWithStatusChange) { // If no transaction was run (e.g. no BOM)
            updatedOrderWithStatusChange = await prisma.productionOrder.update({
                where: { id },
                data: { ...updateData, status, startedAt: null },
            });
        }


    } else {
      // For other status changes or if the transition is not handled above (e.g., DONE -> CANCELLED)
      updatedOrderWithStatusChange = await prisma.productionOrder.update({
        where: { id },
        data: { ...updateData, status, qtyProduced: qtyProduced !== undefined ? parseFloat(qtyProduced) : currentOrder.qtyProduced },
      });
    }

    return NextResponse.json(updatedOrderWithStatusChange);

  } catch (error: any) {
    console.error("Error updating production order:", error);
    // Check if it's a Prisma transaction error (e.g. stock check failed)
    if (error.message.includes("Insufficient stock") || error.message.includes("BOM")) {
        return NextResponse.json(
            { error: "Failed to update production order", details: error.message },
            { status: 400 } // Bad Request due to business logic failure
        );
    }
    return NextResponse.json(
      { error: "Failed to update production order", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/production/orders/[id] - Delete a production order
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const order = await prisma.productionOrder.findUnique({ where: { id } });
    if (!order) {
      return NextResponse.json({ error: "Production order not found" }, { status: 404 });
    }

    // Check if the order is in a state where deletion is problematic (e.g., IN_PROGRESS or DONE)
    // For simplicity, we allow deletion from any state here.
    // A more robust system might prevent deletion of DONE orders or require a reversal process.
    // Prisma's default behavior for relations will be used. If BomComponents are tied
    // to a ProductionOrder directly (not via BOM), those relations need to be handled.
    // Here, ProductionOrder links to BOM, and BOM links to BomComponents.
    // Deleting ProductionOrder does not automatically delete the BOM itself.

    await prisma.productionOrder.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Production order deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting production order:", error);
    // Check for known Prisma errors, like foreign key constraints if not handled by schema
    if (error.code === 'P2003' || error.code === 'P2014') { // Foreign key constraint failed or relation violation
        return NextResponse.json(
            { error: "Cannot delete production order due to existing relations that are not set to cascade.", details: error.message },
            { status: 409 } // Conflict
        );
    }
    return NextResponse.json(
      { error: "Failed to delete production order", details: error.message },
      { status: 500 }
    );
  }
}
