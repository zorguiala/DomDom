import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { saleId, returnedItems } = body;

    // Validate input
    if (!saleId || !returnedItems) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Fetch the sale with items and van operation
    const sale = await prisma.sale.findUnique({
      where: { id: saleId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        vanOperation: true,
      },
    });

    if (!sale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 });
    }

    if (sale.type !== "DOOR_TO_DOOR") {
      return NextResponse.json(
        { error: "This operation is only for door-to-door sales" },
        { status: 400 },
      );
    }

    if (!sale.vanOperation || sale.vanOperation.status === "COMPLETED") {
      return NextResponse.json(
        { error: "Van operation is already completed or not found" },
        { status: 400 },
      );
    }

    // Process returns in a transaction
    const result = await prisma.$transaction(async (tx: any) => {
      let totalReturnedAmount = 0;
      let totalSoldAmount = 0;

      // Process each returned item
      for (const returnItem of returnedItems) {
        const saleItem = sale.items.find(
          (item: any) => item.productId === returnItem.productId,
        );

        if (!saleItem) {
          throw new Error(`Product ${returnItem.productId} not found in sale`);
        }

        const returnedQty = parseInt(returnItem.returnedQty);
        const soldQty = saleItem.qty - returnedQty;

        if (returnedQty > saleItem.qty) {
          throw new Error(
            `Cannot return more than was taken out for product ${saleItem.product.name}`,
          );
        }

        // Update sale item with returned quantity
        await tx.saleItem.update({
          where: { id: saleItem.id },
          data: {
            returnedQty: returnedQty,
            deliveredQty: soldQty,
          },
        });

        // Return products to stock
        if (returnedQty > 0) {
          await tx.product.update({
            where: { id: returnItem.productId },
            data: {
              qtyOnHand: {
                increment: returnedQty,
              },
            },
          });

          // Create stock movement for returns
          await tx.stockMovement.create({
            data: {
              productId: returnItem.productId,
              qty: returnedQty,
              movementType: "IN",
              reference: sale.exitSlipNumber,
              reason: "Van Sale - Return",
              notes: `Returned from sale ${sale.saleNumber}`,
            },
          });

          totalReturnedAmount += saleItem.unitPrice * returnedQty;
        }

        totalSoldAmount += saleItem.unitPrice * soldQty;
      }

      // Update sale with return information
      const updatedSale = await tx.sale.update({
        where: { id: saleId },
        data: {
          returnDate: new Date(),
          returnedAmount: totalReturnedAmount,
          status: "DELIVERED",
          // Recalculate total amount based on what was actually sold
          totalAmount: totalSoldAmount,
          subtotal: totalSoldAmount,
        },
      });

      // Update van operation
      await tx.vanSalesOperation.update({
        where: { id: sale.vanOperation.id },
        data: {
          returnTime: new Date(),
          totalProductsSold: totalSoldAmount,
          totalReturned: totalReturnedAmount,
          status: "COMPLETED",
        },
      });

      return updatedSale;
    });

    // Fetch the complete updated sale
    const completeSale = await prisma.sale.findUnique({
      where: { id: saleId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        vanOperation: true,
      },
    });

    return NextResponse.json({
      success: true,
      sale: completeSale,
      message: "Van sale returns processed successfully",
    });
  } catch (error) {
    console.error("Error processing van returns:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to process van returns",
      },
      { status: 500 },
    );
  }
}