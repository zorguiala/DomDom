import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const sales = await prisma.sale.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        vanOperation: true,
      },
    });
    
    return NextResponse.json({ sales });
  } catch (error) {
    console.error("Error fetching sales:", error);
    return NextResponse.json(
      { error: "Failed to fetch sales" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      type = "CLASSIC",
      status,
      items, // Array of { productId, quantity, unitPrice }
      driverName,
      vehicleNumber,
    } = body;
    
    // Validate required fields
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Validate that all products exist and have sufficient stock
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.productId}` },
          { status: 400 },
        );
      }
      
      // For door-to-door sales, we'll check stock when confirming the sale
      if (type === "CLASSIC" && product.qtyOnHand < item.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for product: ${product.name}. Available: ${product.qtyOnHand}, Requested: ${item.quantity}`,
          },
          { status: 400 },
        );
      }
    }

    // Calculate totals
    const subtotal = items.reduce(
      (sum: number, item: any) =>
        sum + parseFloat(item.unitPrice) * parseInt(item.quantity),
      0,
    );
    
    // Apply TVA and timbre only for classic sales
    const tva = type === "CLASSIC" ? subtotal * 0.19 : 0;
    const timbre = type === "CLASSIC" ? 1 : 0;
    const totalAmount = subtotal + tva + timbre;

    // Create the sale with all items in a transaction
    const sale = await prisma.$transaction(async (tx: any) => {
      // Generate sale number and exit slip number
      const timestamp = Date.now();
      const saleNumber = `SALE-${timestamp}`;
      const exitSlipNumber = type === "DOOR_TO_DOOR" ? `EXIT-${timestamp}` : undefined;
      
      // Create the sale
      const newSale = await tx.sale.create({
        data: {
          saleNumber,
          customerName: customerName || (type === "DOOR_TO_DOOR" ? "Van Sale" : ""),
          customerEmail,
          customerPhone,
          type,
          status: type === "DOOR_TO_DOOR" ? "CONFIRMED" : (status || "QUOTE"),
          subtotal,
          tva,
          timbre,
          totalAmount,
          exitSlipNumber,
          exitSlipDate: type === "DOOR_TO_DOOR" ? new Date() : undefined,
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              qty: parseInt(item.quantity),
              unitPrice: parseFloat(item.unitPrice),
              totalPrice: parseFloat(item.unitPrice) * parseInt(item.quantity),
              deliveredQty: type === "DOOR_TO_DOOR" ? parseInt(item.quantity) : 0,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                },
              },
            },
          },
        },
      });

      // For door-to-door sales, create van operation and update stock immediately
      if (type === "DOOR_TO_DOOR") {
        // Create van operation
        await tx.vanSalesOperation.create({
          data: {
            saleId: newSale.id,
            driverName,
            vehicleNumber,
            departureTime: new Date(),
            totalProductsOut: totalAmount,
            totalProductsSold: 0, // Will be updated when confirming sales
            totalReturned: 0, // Will be updated when processing returns
            status: "IN_PROGRESS",
          },
        });

        // Update product stock levels (products going out)
        for (const item of items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              qtyOnHand: {
                decrement: parseInt(item.quantity),
              },
            },
          });
          
          // Create stock movement for exit
          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              qty: -parseInt(item.quantity),
              movementType: "OUT",
              reference: exitSlipNumber,
              reason: "Van Sale - Exit",
              notes: `Driver: ${driverName || "N/A"}, Vehicle: ${vehicleNumber || "N/A"}`,
            },
          });
        }
      } else if (type === "CLASSIC" && status === "CONFIRMED") {
        // For classic sales, only deduct stock when confirmed
        for (const item of items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              qtyOnHand: {
                decrement: parseInt(item.quantity),
              },
            },
          });
          
          // Create stock movement
          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              qty: -parseInt(item.quantity),
              movementType: "OUT",
              reference: saleNumber,
              reason: "Sale - Confirmed",
            },
          });
        }
      }

      return newSale;
    });
    
    // Fetch the complete sale with van operation
    const completeSale = await prisma.sale.findUnique({
      where: { id: sale.id },
      include: {
        vanOperation: true,
      },
    });

    return NextResponse.json({ sale: completeSale }, { status: 201 });
  } catch (error) {
    console.error("Error creating sale:", error);
    return NextResponse.json(
      { error: "Failed to create sale" },
      { status: 500 },
    );
  }
}
