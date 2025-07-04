import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client"; // Import Prisma for TransactionClient type

// Helper function to calculate and record finished good's cost
async function calculateAndRecordBomCost(bomId: string, finalProductId: string, tx: Prisma.TransactionClient) {
  const bomWithComponents = await tx.billOfMaterials.findUnique({
    where: { id: bomId },
    include: {
      components: {
        include: {
          product: { // Ensure product and its priceCost are selected
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
    // Should not happen if called after BOM creation
    console.error(`BOM ${bomId} or its components not found for cost calculation.`);
    throw new Error(`BOM ${bomId} or its components not found for cost calculation.`);
  }

  let totalCostOfComponents = 0;
  for (const component of bomWithComponents.components) {
    if (component.product && typeof component.product.priceCost === 'number' && typeof component.quantity === 'number') {
      totalCostOfComponents += component.quantity * component.product.priceCost;
    } else {
      // Handle missing product or cost - this might mean a component's cost is not yet set
      // For now, we'll log an error and this could result in an inaccurate BOM cost.
      // A stricter approach might throw an error or assign a default cost.
      console.warn(`Product ${component.productId} or its priceCost is missing for BOM ${bomId}. Cost calculation may be inaccurate.`);
      // Depending on business logic, you might want to throw an error here:
      // throw new Error(`Product ${component.productId} has no priceCost. Cannot calculate BOM cost accurately.`);
    }
  }

  // Update the final product's priceCost
  await tx.product.update({
    where: { id: finalProductId },
    data: {
      priceCost: totalCostOfComponents,
      // Optionally, mark this product as a finished good if not already
      isFinishedGood: true,
      isRawMaterial: false, // A finished good is typically not a raw material
    },
  });
  console.log(`Updated priceCost for product ${finalProductId} to ${totalCostOfComponents} based on BOM ${bomId}`);
}


export async function GET(request: NextRequest) {
  // The 'request' parameter is not used, but it's good practice to keep it
  // if other route handlers in the same file might use it, or for consistency.
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
                priceCost: true, // Include priceCost for display/verification
              },
            },
          },
        },
        // Include the final product details as well
        // This requires adding a relation in schema from BOM to final Product named 'finalProduct'
        // model BillOfMaterials {
        //   id             String   @id @default(uuid())
        //   ...
        //   finalProductId String
        //   finalProduct   Product  @relation("FinalProductForBOM", fields: [finalProductId], references: [id])
        //   ...
        // }
        // model Product {
        //   ...
        //   bomsAsFinalProduct BillOfMaterials[] @relation("FinalProductForBOM")
        //   ...
        // }
        // Assuming the above relation `finalProduct` exists on BillOfMaterials model
         finalProduct: {
            select: {
                id: true,
                name: true,
                sku: true,
                priceCost: true, // To see the calculated cost
                isFinishedGood: true,
                isRawMaterial: true,
            }
        }
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

    if (!name || !finalProductId || !components || components.length === 0) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: name, finalProductId, and components",
        },
        { status: 400 },
      );
    }

    // Validate that finalProductId exists and is a valid product
    const finalProductExists = await prisma.product.findUnique({ where: { id: finalProductId } });
    if (!finalProductExists) {
        return NextResponse.json({ error: `Final product with ID ${finalProductId} not found.` }, { status: 400 });
    }

    // Validate component products
    for (const component of components) {
        if (!component.productId || !component.quantity || !component.unit) {
            return NextResponse.json({ error: "Each component must have productId, quantity, and unit." }, { status: 400 });
        }
        const productExists = await prisma.product.findUnique({ where: { id: component.productId }});
        if (!productExists) {
            return NextResponse.json({ error: `Component product with ID ${component.productId} not found.` }, { status: 400 });
        }
         if (typeof productExists.priceCost !== 'number') {
            // Stricter check: ensure all components have a cost before creating BOM
            // return NextResponse.json({ error: `Component product ${productExists.name} (ID: ${component.productId}) does not have a valid priceCost. Please set its cost first (e.g., via a purchase).` }, { status: 400 });
            console.warn(`Component product ${productExists.name} (ID: ${component.productId}) does not have a valid priceCost. BOM cost might be 0 or inaccurate initially.`);
        }
    }


    const bom = await prisma.$transaction(async (tx) => {
      const newBom = await tx.billOfMaterials.create({
        data: {
          name,
          description: description || null,
          finalProductId,
          outputQuantity: 1, // Default to 1 if not provided
          outputUnit: "unit", // Default unit if not provided
          // finalProduct: { connect: { id: finalProductId }} // This is how you'd connect if relation was setup this way.
                                                          // But it's usually finalProductId field and then separate query for product.
        },
      });

      await tx.bomComponent.createMany({
        data: components.map((component: any) => ({
          bomId: newBom.id,
          productId: component.productId,
          quantity: parseFloat(component.quantity),
          unit: component.unit, // Ensure unit is also passed and stored
        })),
      });

      // Calculate and record the BOM cost for the final product
      await calculateAndRecordBomCost(newBom.id, finalProductId, tx);

      // Fetch the created BOM with its components and the updated final product
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
                isRawMaterial: true, // Check this, should be false after calculation
            }
          }
        },
      });
    });

    return NextResponse.json({ bom }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating BOM:", error);
    // Check if it's Prisma's transaction error from our helper
    if (error.message.includes("BOM") && error.message.includes("cost calculation")) {
        return NextResponse.json({ error: `Failed to create BOM due to cost calculation issue: ${error.message}` }, { status: 500 });
    }
    if (error.message.includes("product") && error.message.includes("priceCost")) {
        // This could be from the pre-check or the helper
        return NextResponse.json({ error: `Failed to create BOM: ${error.message}` }, { status: 400 });
    }
    // General error for other issues like DB connection, etc.
    return NextResponse.json(
      { error: `Failed to create BOM: ${error.message || "Unknown error"}` },
      { status: 500 },
    );
  }
}
