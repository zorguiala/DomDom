import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/suppliers - Get all suppliers with purchase order statistics
export async function GET() {
  try {
    const suppliers = await prisma.supplier.findMany({
      include: {
        purchases: {
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
        },
      },
      orderBy: {
        companyName: "asc",
      },
    });

    // Transform data to include statistics
    const suppliersWithStats = suppliers.map((supplier: any) => {
      const totalOrders = supplier.purchases.length;
      const lastOrder = supplier.purchases[0] || null;
      
      // Calculate average cost per unit from last order
      let avgCostPerUnit = 0;
      if (lastOrder && lastOrder.items.length > 0) {
        const totalItems = lastOrder.items.reduce((sum: number, item: any) => sum + item.qtyOrdered, 0);
        const totalCost = lastOrder.items.reduce((sum: number, item: any) => sum + (item.qtyOrdered * item.unitCost), 0);
        avgCostPerUnit = totalItems > 0 ? totalCost / totalItems : 0;
      }

      return {
        id: supplier.id,
        companyName: supplier.companyName,
        email: supplier.email,
        phone: supplier.phone,
        address: supplier.address,
        mf: supplier.mf,
        createdAt: supplier.createdAt,
        updatedAt: supplier.updatedAt,
        statistics: {
          totalOrders,
          lastOrderDate: lastOrder?.createdAt || null,
          lastOrderNumber: lastOrder?.orderNumber || null,
          lastOrderTotal: lastOrder?.totalAmount || 0,
          avgCostPerUnit: avgCostPerUnit,
          lastOrderItemsCount: lastOrder?.items.length || 0,
        },
      };
    });

    return NextResponse.json({ suppliers: suppliersWithStats });
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return NextResponse.json(
      { error: "Failed to fetch suppliers" },
      { status: 500 }
    );
  }
}

// POST /api/suppliers - Create a new supplier
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyName, email, address, phone, mf } = body;

    if (!companyName) {
      return NextResponse.json(
        { error: "Company name is required" },
        { status: 400 }
      );
    }

    const supplier = await prisma.supplier.create({
      data: {
        companyName,
        email,
        address,
        phone,
        mf,
      },
    });

    return NextResponse.json({ supplier }, { status: 201 });
  } catch (error) {
    console.error("Error creating supplier:", error);
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Supplier with this email already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create supplier" },
      { status: 500 }
    );
  }
}
