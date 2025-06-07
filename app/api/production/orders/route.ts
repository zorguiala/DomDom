import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const orders = await prisma.productionOrder.findMany({
      include: { bom: true, product: true },
    });
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const order = await prisma.productionOrder.create({
      data: {
        orderNumber: data.orderNumber,
        bomId: data.bomId,
        productId: data.productId,
        qtyOrdered: data.qtyOrdered,
        status: data.status,
        priority: data.priority,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        expectedEndDate: data.expectedEndDate ? new Date(data.expectedEndDate) : undefined,
        notes: data.notes,
      },
      include: { bom: true, product: true },
    });
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    const order = await prisma.productionOrder.update({
      where: { id: data.id },
      data: {
        orderNumber: data.orderNumber,
        bomId: data.bomId,
        productId: data.productId,
        qtyOrdered: data.qtyOrdered,
        status: data.status,
        priority: data.priority,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        expectedEndDate: data.expectedEndDate ? new Date(data.expectedEndDate) : undefined,
        notes: data.notes,
      },
      include: { bom: true, product: true },
    });
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    await prisma.productionOrder.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
} 