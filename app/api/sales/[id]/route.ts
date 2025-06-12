import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: saleId } = await params;
    const sale = await prisma.sale.findUnique({
      where: {
        id: saleId,
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
        vanOperation: true,
        client: true,
        commercial: true,
      },
    });

    if (!sale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 });
    }

    return NextResponse.json({
      sale,
    });
  } catch (error) {
    console.error("Error fetching sale:", error);
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
    const { id: saleId } = await params;
    const body = await request.json();
    const { customerName, customerEmail, customerPhone, status } = body;

    // Check if sale exists
    const existingSale = await prisma.sale.findUnique({
      where: { id: saleId },
    });

    if (!existingSale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 });
    }

    // Update the sale
    const updatedSale = await prisma.sale.update({
      where: {
        id: saleId,
      },
      data: {
        customerName,
        customerEmail,
        customerPhone,
        status,
        updatedAt: new Date(),
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

    return NextResponse.json({
      sale: updatedSale,
      message: "Sale updated successfully",
    });
  } catch (error) {
    console.error("Error updating sale:", error);
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
    const { id: saleId } = await params; // Check if sale exists
    const existingSale = await prisma.sale.findUnique({
      where: { id: saleId },
      include: {
        items: true,
      },
    });

    if (!existingSale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 });
    } // Delete sale items first (due to foreign key constraint)
    await prisma.saleItem.deleteMany({
      where: {
        saleId: saleId,
      },
    });

    // Delete the sale
    await prisma.sale.delete({
      where: {
        id: saleId,
      },
    });

    return NextResponse.json({
      message: "Sale deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting sale:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
