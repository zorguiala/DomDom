import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const orders = await prisma.productionOrder.findMany({
      include: { 
        bom: {
          include: {
            finalProduct: true,
            components: {
              include: {
                product: true
              }
            }
          }
        },
        product: true 
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Validate required fields
    if (!data.bomId || !data.qtyOrdered || data.qtyOrdered <= 0) {
      return NextResponse.json(
        { error: "BOM ID and valid quantity are required" },
        { status: 400 }
      );
    }

    // Get BOM with components and final product
    const bom = await prisma.billOfMaterials.findUnique({
      where: { id: data.bomId },
      include: {
        finalProduct: true,
        components: {
          include: {
            product: true
          }
        }
      }
    });

    if (!bom) {
      return NextResponse.json(
        { error: "BOM not found" },
        { status: 404 }
      );
    }

    // Generate order number if not provided
    const orderNumber = data.orderNumber || `MO-${Date.now()}`;

    // Check stock availability for all components
    const insufficientStock: string[] = [];
    for (const component of bom.components) {
      const required = component.quantity * data.qtyOrdered;
      if (component.product.qtyOnHand < required) {
        insufficientStock.push(
          `${component.product.name}: need ${required} ${component.unit}, available ${component.product.qtyOnHand} ${component.unit}`
        );
      }
    }

    if (insufficientStock.length > 0) {
      return NextResponse.json(
        { 
          error: "Insufficient stock for production",
          details: insufficientStock
        },
        { status: 400 }
      );
    }

    // Create production order
    const order = await prisma.productionOrder.create({
      data: {
        orderNumber,
        bomId: data.bomId,
        productId: bom.finalProductId, // Auto-set from BOM
        qtyOrdered: data.qtyOrdered,
        qtyProduced: 0,
        status: "PLANNED",
        priority: data.priority || "MEDIUM",
        startDate: data.startDate ? new Date(data.startDate) : null,
        expectedEndDate: data.expectedEndDate ? new Date(data.expectedEndDate) : null,
        notes: data.notes,
      },
      include: { 
        bom: {
          include: {
            finalProduct: true,
            components: {
              include: {
                product: true
              }
            }
          }
        },
        product: true 
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error creating production order:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Get current order to check status change
    const currentOrder = await prisma.productionOrder.findUnique({
      where: { id: data.id },
      include: {
        bom: {
          include: {
            finalProduct: true,
            components: {
              include: {
                product: true
              }
            }
          }
        }
      }
    });

    if (!currentOrder) {
      return NextResponse.json({ error: "Production order not found" }, { status: 404 });
    }

    // Handle completion logic (Odoo-style)
    if (data.status === "COMPLETED" && currentOrder.status !== "COMPLETED") {
      return await completeProductionOrder(currentOrder, data);
    }

    // Regular update
    const order = await prisma.productionOrder.update({
      where: { id: data.id },
      data: {
        qtyOrdered: data.qtyOrdered,
        qtyProduced: data.qtyProduced,
        status: data.status,
        priority: data.priority,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        expectedEndDate: data.expectedEndDate ? new Date(data.expectedEndDate) : undefined,
        actualEndDate: data.status === "COMPLETED" ? new Date() : undefined,
        notes: data.notes,
      },
      include: { 
        bom: {
          include: {
            finalProduct: true,
            components: {
              include: {
                product: true
              }
            }
          }
        },
        product: true 
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error updating production order:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

// Complete production order with inventory updates (Odoo-style)
async function completeProductionOrder(order: any, updateData: any) {
  return await prisma.$transaction(async (tx) => {
    // 1. Consume raw materials from inventory
    for (const component of order.bom.components) {
      const consumeQty = component.quantity * order.qtyOrdered;
      
      await tx.product.update({
        where: { id: component.product.id },
        data: {
          qtyOnHand: {
            decrement: consumeQty
          }
        }
      });

      // Create stock movement for consumption
      await tx.stockMovement.create({
        data: {
          productId: component.product.id,
          qty: -consumeQty,
          movementType: "OUT",
          reference: `Production Order ${order.orderNumber}`,
          reason: "Production consumption",
          notes: `Consumed for production of ${order.bom.finalProduct.name}`,
        }
      });
    }

    // 2. Add finished goods to inventory
    const producedQty = order.qtyOrdered * order.bom.outputQuantity;
    
    await tx.product.update({
      where: { id: order.bom.finalProductId },
      data: {
        qtyOnHand: {
          increment: producedQty
        },
        // Update product cost from BOM unit cost (Odoo-style)
        priceCost: order.bom.unitCost || undefined
      }
    });

    // Create stock movement for production
    await tx.stockMovement.create({
      data: {
        productId: order.bom.finalProductId,
        qty: producedQty,
        movementType: "IN",
        reference: `Production Order ${order.orderNumber}`,
        reason: "Production output",
        notes: `Produced from BOM: ${order.bom.name}`,
      }
    });

    // 3. Update the production order
    const updatedOrder = await tx.productionOrder.update({
      where: { id: order.id },
      data: {
        qtyProduced: producedQty,
        status: "COMPLETED",
        actualEndDate: new Date(),
        finishedAt: new Date(),
        notes: updateData.notes,
      },
      include: { 
        bom: {
          include: {
            finalProduct: true,
            components: {
              include: {
                product: true
              }
            }
          }
        },
        product: true 
      },
    });

    return updatedOrder;
  });
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    
    // Check if order can be deleted (only if not started)
    const order = await prisma.productionOrder.findUnique({
      where: { id }
    });

    if (!order) {
      return NextResponse.json({ error: "Production order not found" }, { status: 404 });
    }

    if (order.status === "IN_PROGRESS" || order.status === "COMPLETED") {
      return NextResponse.json(
        { error: "Cannot delete production order that is in progress or completed" },
        { status: 400 }
      );
    }

    await prisma.productionOrder.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
} 