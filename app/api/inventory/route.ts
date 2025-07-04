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
    const productsWithStatus = products.map((product: any) => ({
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
    
    // Generate SKU automatically
    const sku = `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Convert string numbers to proper types
    const productData = {
      name: body.name,
      sku,
      unit: body.unit,
      priceCost: body.priceCost ? parseFloat(body.priceCost) : 0,
      priceSell: body.priceSell ? parseFloat(body.priceSell) : 0,
      qtyOnHand: body.qtyOnHand ? parseFloat(body.qtyOnHand) : 0,
      minQty: body.minQty ? parseFloat(body.minQty) : null,
      isRawMaterial: body.isRawMaterial === true || body.isRawMaterial === "true",
      isFinishedGood: body.isFinishedGood === true || body.isFinishedGood === "true",
      category: body.category || null,
    };
    
    const product = await prisma.product.create({
      data: productData,
    });

    return NextResponse.json({ product });
  } catch (error: any) {
    console.error("Error creating product:", error);
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Product with this SKU already exists" },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to create product" },
      { status: 500 }
    );
  }
}
