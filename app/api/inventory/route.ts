import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate stock status for each product
    const productsWithStatus = products.map((product) => ({
      ...product,
      status:
        product.qtyOnHand === 0
          ? "out_of_stock"
          : product.minQty && product.qtyOnHand <= product.minQty
            ? "low_stock"
            : "in_stock",
    }));

    return NextResponse.json({ products: productsWithStatus });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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

    // Validate required fields
    if (!name || !sku || !unit || !priceSell || !priceCost) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        sku,
        category,
        unit,
        priceSell: parseFloat(priceSell),
        priceCost: parseFloat(priceCost),
        qtyOnHand: parseFloat(qtyOnHand) || 0,
        minQty: minQty ? parseFloat(minQty) : null,
        isRawMaterial: Boolean(isRawMaterial),
        isFinishedGood: Boolean(isFinishedGood),
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Product with this SKU already exists" },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 },
    );
  }
}
