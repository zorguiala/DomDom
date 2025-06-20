import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const boms = await prisma.billOfMaterials.findMany({
      include: { 
        components: {
          include: {
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
        },
        finalProduct: {
          select: {
            id: true,
            name: true,
            sku: true,
            priceCost: true,
            isFinishedGood: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ boms });
  } catch (error: any) {
    console.error("Error fetching BOMs:", error);
    return NextResponse.json({ error: "Failed to fetch BOMs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { name, description, finalProductId, outputQuantity, outputUnit, components } = data;

    // Validate required fields
    if (!name || !finalProductId || !outputQuantity || !outputUnit || !components || components.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields: name, finalProductId, outputQuantity, outputUnit, and components" },
        { status: 400 }
      );
    }

    // Validate final product exists
    const finalProduct = await prisma.product.findUnique({
      where: { id: finalProductId }
    });
    if (!finalProduct) {
      return NextResponse.json(
        { error: "Final product not found" },
        { status: 404 }
      );
    }

    // Validate component products and calculate total cost
    let totalCost = 0;
    for (const component of components) {
      const product = await prisma.product.findUnique({
        where: { id: component.productId }
      });
      if (!product) {
        return NextResponse.json(
          { error: `Component product with ID ${component.productId} not found` },
          { status: 404 }
        );
      }
      // Calculate cost for this component
      const componentCost = (product.priceCost || 0) * component.quantity;
      totalCost += componentCost;
    }

    // Calculate unit cost (total cost / output quantity) - Like Odoo
    const unitCost = totalCost / outputQuantity;

    // Create BOM and update final product cost in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the BOM
      const bom = await tx.billOfMaterials.create({
        data: {
          name,
          description,
          finalProductId,
          outputQuantity,
          outputUnit,
          unitCost,
          components: {
            create: components.map((c: any) => ({
              productId: c.productId,
              quantity: c.quantity,
              unit: c.unit,
            })),
          },
        },
        include: {
          components: {
            include: {
              product: true,
            },
          },
          finalProduct: true,
        },
      });

      // Update final product cost with calculated unit cost (like Odoo auto-calculation)
      await tx.product.update({
        where: { id: finalProductId },
        data: { 
          priceCost: unitCost,
          isFinishedGood: true, // Mark as finished good since it has a BOM
        },
      });

      return bom;
    });

    return NextResponse.json({ bom: result });
  } catch (error: any) {
    console.error("Error creating BOM:", error);
    return NextResponse.json({ error: "Failed to create BOM" }, { status: 500 });
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
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    await prisma.billOfMaterials.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 