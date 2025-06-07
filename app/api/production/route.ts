import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const productionOrders = await prisma.productionOrder.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
        bom: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ productionOrders });
  } catch (error) {
    console.error("Error fetching production orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch production orders" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      productId,
      bomId,
      qtyOrdered,
      priority,
      startDate,
      expectedEndDate,
      notes,
    } = body;

    // Validate required fields
    if (!productId || !qtyOrdered) {
      return NextResponse.json(
        { error: "Missing required fields: productId and qtyOrdered" },
        { status: 400 },
      );
    }

    // Generate order number
    const orderCount = await prisma.productionOrder.count();
    const orderNumber = `PO-${(orderCount + 1).toString().padStart(6, "0")}`;

    // Create production order
    const productionOrder = await prisma.productionOrder.create({
      data: {
        orderNumber,
        productId,
        bomId: bomId || null,
        qtyOrdered: parseFloat(qtyOrdered),
        priority: priority || "MEDIUM",
        startDate: startDate ? new Date(startDate) : null,
        expectedEndDate: expectedEndDate ? new Date(expectedEndDate) : null,
        notes: notes || null,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
        bom: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ productionOrder }, { status: 201 });
  } catch (error) {
    console.error("Error creating production order:", error);
    return NextResponse.json(
      { error: "Failed to create production order" },
      { status: 500 },
    );
  }
}
