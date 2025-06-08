import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const boms = await prisma.billOfMaterials.findMany({
      orderBy: {
        createdAt: "desc",
      },
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

    return NextResponse.json({ boms });
  } catch (error) {
    console.error("Error fetching BOMs:", error);
    return NextResponse.json(
      { error: "Failed to fetch BOMs" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, finalProductId, components } = body;

    // Validate required fields
    if (!name || !finalProductId || !components || components.length === 0) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: name, finalProductId, and components",
        },
        { status: 400 },
      );
    }

    // Create BOM with components in a transaction
    const bom = await prisma.$transaction(async (tx) => {
      // Create the BOM
      const newBom = await tx.billOfMaterials.create({
        data: {
          name,
          description: description || null,
          finalProductId,
        },
      });

      // Create BOM components
      await tx.bomComponent.createMany({
        data: components.map((component: any) => ({
          bomId: newBom.id,
          productId: component.productId,
          quantity: parseFloat(component.quantity),
          unit: component.unit,
        })),
      });

      // Return BOM with components
      return await tx.billOfMaterials.findUnique({
        where: { id: newBom.id },
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

    return NextResponse.json({ bom }, { status: 201 });
  } catch (error) {
    console.error("Error creating BOM:", error);
    return NextResponse.json(
      { error: "Failed to create BOM" },
      { status: 500 },
    );
  }
}
