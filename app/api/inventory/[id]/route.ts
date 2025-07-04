import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const paramValues = await params;
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: {
        id,
      },
      include: {
        stockMoves: {
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        },
        saleItems: {
          include: {
            sale: true,
          },
          take: 5,
        },
        purchaseItems: {
          include: {
            purchase: true,
          },
          take: 5,
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Calculate stock status
    const status =
      product.qtyOnHand === 0
        ? "out_of_stock"
        : product.minQty && product.qtyOnHand <= product.minQty
          ? "low_stock"
          : "in_stock";

    return NextResponse.json({ product: { ...product, status } });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
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
    const { id } = await params;
    const body = await request.json();
    const {
      name,
      sku,
      category,
      unit,
      priceSell,
      priceCost,
      qtyOnHand,
      minQty,
      isRawMaterial,
      isFinishedGood,
    } = body;

    const product = await prisma.product.update({
      where: {
        id,
      },
      data: {
        name,
        sku,
        category,
        unit,
        priceSell: parseFloat(priceSell),
        priceCost: parseFloat(priceCost),
        qtyOnHand: parseFloat(qtyOnHand),
        minQty: minQty ? parseFloat(minQty) : null,
        isRawMaterial: Boolean(isRawMaterial),
        isFinishedGood: Boolean(isFinishedGood),
      },
    });

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Error updating product:", error);
    if (
      error instanceof Error &&
      error.message.includes("Record to update not found")
    ) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const paramValues = await params;
    const { id } = await params;
    await prisma.product.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    if (
      error instanceof Error &&
      error.message.includes("Record to delete does not exist")
    ) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 },
    );
  }
}
