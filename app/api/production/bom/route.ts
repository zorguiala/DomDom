import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const boms = await prisma.billOfMaterials.findMany({
      include: { components: true },
    });
    return NextResponse.json(boms);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const bom = await prisma.billOfMaterials.create({
      data: {
        name: data.name,
        description: data.description,
        finalProductId: data.finalProductId,
        components: {
          create: data.components.map((c: any) => ({
            productId: c.productId,
            quantity: c.quantity,
            unit: c.unit,
          })),
        },
      },
      include: { components: true },
    });
    return NextResponse.json(bom);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    const bom = await prisma.billOfMaterials.update({
      where: { id: data.id },
      data: {
        name: data.name,
        description: data.description,
        finalProductId: data.finalProductId,
        components: {
          deleteMany: {},
          create: data.components.map((c: any) => ({
            productId: c.productId,
            quantity: c.quantity,
            unit: c.unit,
          })),
        },
      },
      include: { components: true },
    });
    return NextResponse.json(bom);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    await prisma.billOfMaterials.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 