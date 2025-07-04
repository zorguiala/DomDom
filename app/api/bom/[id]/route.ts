import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client"; // Import Prisma for TransactionClient type

// Helper function (copied from bom/route.ts - consider moving to a shared lib if used in more places)
async function calculateAndRecordBomCost(bomId: string, finalProductId: string, tx: Prisma.TransactionClient) {
  const bomWithComponents = await tx.billOfMaterials.findUnique({
    where: { id: bomId },
    include: {
      components: {
        include: {
          product: {
            select: {
              id: true,
              priceCost: true,
            }
          }
        }
      }
    }
  });

  if (!bomWithComponents || !bomWithComponents.components) {
    console.error(`BOM ${bomId} or its components not found for cost calculation during update.`);
    throw new Error(`BOM ${bomId} or its components not found for cost calculation during update.`);
  }

  let totalCostOfComponents = 0;
  for (const component of bomWithComponents.components) {
    if (component.product && typeof component.product.priceCost === 'number' && typeof component.quantity === 'number') {
      totalCostOfComponents += component.quantity * component.product.priceCost;
    } else {
      console.warn(`Product ${component.productId} (part of BOM ${bomId}) or its priceCost is missing. Cost calculation may be inaccurate.`);
      // Consider if this should throw an error during update as well
      // throw new Error(`Product ${component.productId} has no priceCost. Cannot calculate BOM cost accurately.`);
    }
  }

  await tx.product.update({
    where: { id: finalProductId },
    data: {
      priceCost: totalCostOfComponents,
      isFinishedGood: true,
      isRawMaterial: false,
    },
  });
  console.log(`Updated priceCost for product ${finalProductId} to ${totalCostOfComponents} based on BOM ${bomId} update.`);
}


export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const paramValues = await params;
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
        finalProduct: { // Include final product details
            select: {
                id: true,
                name: true,
                sku: true,
                priceCost: true,
                isFinishedGood: true,
                isRawMaterial: true,
            }
        }
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
    const paramValues = await params;
    const { id: bomId } = await params;
    const body = await request.json();
    // finalProductId cannot be changed in PUT, so we fetch it.
    // Components can change, name and description can change.
    const { name, description, components } = body;

    const existingBom = await prisma.billOfMaterials.findUnique({
      where: { id: bomId },
    });

    if (!existingBom) {
      return NextResponse.json({ error: "BOM not found" }, { status: 404 });
    }
    const finalProductId = existingBom.finalProductId; // Get finalProductId from existing BOM

    // Validate component products if components are being updated
    if (components) { // components can be undefined if only name/desc is updated
        if (!Array.isArray(components)) {
             return NextResponse.json({ error: "Components must be an array." }, { status: 400 });
        }
        for (const component of components) {
            if (!component.productId || !component.quantity || !component.unit) {
                return NextResponse.json({ error: "Each component must have productId, quantity, and unit." }, { status: 400 });
            }
            const productExists = await prisma.product.findUnique({ where: { id: component.productId }});
            if (!productExists) {
                return NextResponse.json({ error: `Component product with ID ${component.productId} not found.` }, { status: 400 });
            }
            if (typeof productExists.priceCost !== 'number') {
                 console.warn(`Component product ${productExists.name} (ID: ${component.productId}) does not have a valid priceCost. BOM cost might be 0 or inaccurate initially.`);
            }
        }
    }


    const updatedBom = await prisma.$transaction(async (tx) => {
      await tx.billOfMaterials.update({
        where: { id: bomId },
        data: {
          name: name || existingBom.name, // Use existing if not provided
          description: description !== undefined ? description : existingBom.description,
          updatedAt: new Date(),
        },
      });

      // let componentsChanged = false; // This variable is not strictly needed with current logic
      if (components !== undefined) { // Only update components if 'components' key was in the request body
        // componentsChanged = true; // Not used
        // Delete existing components
        await tx.bomComponent.deleteMany({
          where: { bomId: bomId },
        });

        // Create new components if there are any and 'components' is not an empty array
        if (components.length > 0) {
            await tx.bomComponent.createMany({
              data: components.map((component: any) => ({
                bomId: bomId,
                productId: component.productId,
                quantity: parseFloat(component.quantity),
                unit: component.unit,
              })),
            });
        }
        // If 'components' was provided (even as empty array), recalculate cost.
        await calculateAndRecordBomCost(bomId, finalProductId, tx);
      }
      // If 'components' was not in the request body, the cost is not recalculated.
      // This means changes to component product costs made OUTSIDE of this BOM update
      // will not automatically reflect in the final product's cost via this PUT,
      // unless the 'components' array is explicitly re-sent (even if identical).

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
                  priceCost: true,
                },
              },
            },
          },
          finalProduct: {
            select: {
                id: true,
                name: true,
                sku: true,
                priceCost: true,
                isFinishedGood: true,
                isRawMaterial: true,
            }
          }
        },
      });
    });

    return NextResponse.json({
      bom: updatedBom,
      message: "BOM updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating BOM:", error);
    if (error.message.includes("BOM") && error.message.includes("cost calculation")) {
        return NextResponse.json({ error: `Failed to update BOM due to cost calculation issue: ${error.message}` }, { status: 500 });
    }
    if (error.message.includes("product") && error.message.includes("priceCost")) {
        return NextResponse.json({ error: `Failed to update BOM: ${error.message}` }, { status: 400 });
    }
    if (error.code === 'P2025') { // Prisma's record not found error, e.g. during tx.product.update if finalProductId is somehow invalid
        return NextResponse.json({ error: `Failed to update BOM: A related record was not found. ${error.message}` }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Internal server error while updating BOM" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: bomId } = await params;
  try {

    const existingBom = await prisma.billOfMaterials.findUnique({
      where: { id: bomId },
      include: {
        productionOrders: { select: { id: true } }, // Check if used in production orders
      },
    });

    if (!existingBom) {
      return NextResponse.json({ error: "BOM not found" }, { status: 404 });
    }

    if (existingBom.productionOrders.length > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete BOM. It is being used in production orders.",
          details: `Used in ${existingBom.productionOrders.length} production order(s).`,
        },
        { status: 400 }, // Bad Request, as the deletion is disallowed by business logic
      );
    }

    // Deleting the BOM. The finalProduct's priceCost will remain as it was, it won't be reset by this action.
    // Prisma schema should handle cascading delete of BomComponents.
    await prisma.billOfMaterials.delete({
      where: { id: bomId },
    });

    return NextResponse.json({
      message: "BOM deleted successfully",
    });
  } catch (error: any) {
    console.error(`Error deleting BOM ${bomId}:`, error);
     if (error.code === 'P2025') { // Record to delete not found (should be caught by findUnique check earlier)
        return NextResponse.json({ error: "BOM not found for deletion." }, { status: 404 });
    }
    // Handle other potential errors, e.g., unexpected DB issues
    return NextResponse.json(
      { error: "Internal server error while deleting BOM." },
      { status: 500 },
    );
  }
}
