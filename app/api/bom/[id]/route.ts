import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: bomId } = await params;

    const bom = await prisma.billOfMaterials.findUnique({
      where: { id: bomId },
      include: {
        components: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                unit: true,
                qtyOnHand: true,
                priceCost: true,
              },
            },
          },
        },
      },
    });

    if (!bom) {
      return NextResponse.json({ error: "BOM not found" }, { status: 404 });
    }

    return NextResponse.json({ bom });
  } catch (error) {
    console.error("Error fetching BOM:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: bomId } = await params;
    const body = await request.json();
    const { name, description, components } = body;

    // Check if BOM exists
    const existingBom = await prisma.billOfMaterials.findUnique({
      where: { id: bomId },
    });

    if (!existingBom) {
      return NextResponse.json({ error: "BOM not found" }, { status: 404 });
    }

    // Update BOM and components in a transaction
    const updatedBom = await prisma.$transaction(async (tx) => {
      // Update the BOM
      const bom = await tx.billOfMaterials.update({
        where: { id: bomId },
        data: {
          name,
          description: description || null,
          updatedAt: new Date(),
        },
      });

      if (components && components.length > 0) {
        // Delete existing components
        await tx.bomComponent.deleteMany({
          where: { bomId: bomId },
        });

        // Create new components
        await tx.bomComponent.createMany({
          data: components.map((component: any) => ({
            bomId: bomId,
            productId: component.productId,
            quantity: parseFloat(component.quantity),
            unit: component.unit,
          })),
        });
      }

      // Return updated BOM with components
      return await tx.billOfMaterials.findUnique({
        where: { id: bomId },
        include: {
          components: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                  unit: true,
                  qtyOnHand: true,
                },
              },
            },
          },
        },
      });
    });

    return NextResponse.json({
      bom: updatedBom,
      message: "BOM updated successfully",
    });
  } catch (error) {
    console.error("Error updating BOM:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: bomId } = await params;

    // Check if BOM exists
    const existingBom = await prisma.billOfMaterials.findUnique({
      where: { id: bomId },
      include: {
        productionOrders: true,
      },
    });

    if (!existingBom) {
      return NextResponse.json({ error: "BOM not found" }, { status: 404 });
    }

    // Check if BOM is being used in production orders
    if (existingBom.productionOrders.length > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete BOM. It is being used in production orders.",
          usedInOrders: existingBom.productionOrders.length,
        },
        { status: 400 },
      );
    }

    // Delete BOM components first (will cascade automatically with schema)
    await prisma.billOfMaterials.delete({
      where: { id: bomId },
    });

    return NextResponse.json({
      message: "BOM deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting BOM:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
