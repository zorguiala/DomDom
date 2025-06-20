import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/suppliers/[id] - Get a single supplier by ID
export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const supplier = await prisma.supplier.findUnique({
      where: { id },
    });

    if (!supplier) {
      return NextResponse.json({ error: "Supplier not found" }, { status: 404 });
    }

    return NextResponse.json({ supplier });
  } catch (error) {
    console.error(`Error fetching supplier ${id}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch supplier" },
      { status: 500 }
    );
  }
}

// PUT /api/suppliers/[id] - Update a supplier by ID
export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { companyName, email, address, phone, mf } = body;

    // Ensure companyName is not being set to null or empty if it's required
    // For now, we allow partial updates, so only update fields that are provided.
    // If companyName is provided and is empty, it might be an issue depending on requirements.
    // For this implementation, an empty string will be saved if provided.

    const supplier = await prisma.supplier.update({
      where: { id },
      data: {
        companyName,
        email,
        address,
        phone,
        mf,
      },
    });

    return NextResponse.json({ supplier });
  } catch (error) {
    console.error(`Error updating supplier ${id}:`, error);
    if (error instanceof Error && error.message.includes("Record to update not found")) {
      return NextResponse.json({ error: "Supplier not found" }, { status: 404 });
    }
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Supplier with this email already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update supplier" },
      { status: 500 }
    );
  }
}

// DELETE /api/suppliers/[id] - Delete a supplier by ID
export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    await prisma.supplier.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Supplier deleted successfully" });
  } catch (error) {
    console.error(`Error deleting supplier ${id}:`, error);
    if (error instanceof Error && error.message.includes("Record to delete does not exist")) {
      return NextResponse.json({ error: "Supplier not found" }, { status: 404 });
    }
    // Handle related records if necessary, e.g., if a supplier has purchases.
    // Prisma by default might prevent deletion if there are related records,
    // depending on schema definitions (e.g., onDelete behavior).
    // For now, we assume either cascading delete is set up or deletion will be blocked.
    return NextResponse.json(
      { error: "Failed to delete supplier" },
      { status: 500 }
    );
  }
}
