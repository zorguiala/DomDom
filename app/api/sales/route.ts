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
      },
    }); // Calculate totals for each sale
    const salesWithTotals = sales.map((sale: any) => ({
      ...sale,
      totalAmount: sale.items.reduce(
        (sum: number, item: any) => sum + item.totalPrice,
        0,
      ),
      totalItems: sale.items.reduce(
        (sum: number, item: any) => sum + item.qty,
        0,
      ),
    }));

    return NextResponse.json({ sales: salesWithTotals });
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
      status,
      totalAmount,
      totalItems,
      items, // Array of { productId, quantity, price }
    } = body; // Validate required fields
    if (!customerName || !items || items.length === 0) {
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
      if (product.qtyOnHand < item.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for product: ${product.name}. Available: ${product.qtyOnHand}, Requested: ${item.quantity}`,
          },
          { status: 400 },
        );
      }
    }

    // Create the sale with all items in a transaction
    const sale = await prisma.$transaction(async (tx: any) => {
      // Create the sale
      const newSale = await tx.sale.create({
        data: {
          customerName,
          customerEmail,
          customerPhone,
          status: status || "QUOTE",
          saleNumber: `SALE-${Date.now()}`,
          totalAmount: items.reduce(
            (sum: number, item: any) =>
              sum + parseFloat(item.unitPrice) * parseInt(item.qty),
            0,
          ),
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              qty: parseInt(item.qty),
              unitPrice: parseFloat(item.unitPrice),
              totalPrice: parseFloat(item.unitPrice) * parseInt(item.qty),
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

      // Update product stock levels
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            qtyOnHand: {
              decrement: parseInt(item.qty),
            },
          },
        });
      }

      return newSale;
    }); // Calculate totals and return
    const saleWithTotals = {
      ...sale,
      totalAmount: sale.items.reduce(
        (sum: number, item: any) => sum + item.totalPrice,
        0,
      ),
      totalItems: sale.items.reduce(
        (sum: number, item: any) => sum + item.qty,
        0,
      ),
    };

    return NextResponse.json({ sale: saleWithTotals }, { status: 201 });
  } catch (error) {
    console.error("Error creating sale:", error);
    return NextResponse.json(
      { error: "Failed to create sale" },
      { status: 500 },
    );
  }
}
