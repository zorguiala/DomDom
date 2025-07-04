import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/commercials/[id] - Get a single commercial contact by ID
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const commercial = await prisma.commercial.findUnique({
      where: { id },
      include: {
        client: true, // Include related client information
        // sales: true // Optionally include related sales
      }
    });

    if (!commercial) {
      return NextResponse.json({ error: "Commercial contact not found" }, { status: 404 });
    }

    return NextResponse.json({ commercial });
  } catch (error) {
    console.error(`Error fetching commercial contact:`, error);
    return NextResponse.json(
      { error: "Failed to fetch commercial contact" },
      { status: 500 }
    );
  }
}

// PUT /api/commercials/[id] - Update a commercial contact by ID
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, email, address, phone, clientId } = body;

    const commercialData: any = {
      name,
      email,
      address,
      phone,
    };

    if (clientId !== undefined) { // Check if clientId is explicitly provided (even if null)
      if (clientId === null) {
        commercialData.clientId = null; // Allow unlinking
      } else {
        // Verify if client exists before linking
        const clientExists = await prisma.client.findUnique({ where: { id: clientId } });
        if (!clientExists) {
          return NextResponse.json(
            { error: "Client not found for linking" },
            { status: 404 }
          );
        }
        commercialData.clientId = clientId;
      }
    }


    const commercial = await prisma.commercial.update({
      where: { id },
      data: commercialData,
    });

    return NextResponse.json({ commercial });
  } catch (error) {
    console.error(`Error updating commercial contact:`, error);
    if (error instanceof Error && error.message.includes("Record to update not found")) {
      return NextResponse.json({ error: "Commercial contact not found" }, { status: 404 });
    }
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Commercial contact with this email already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update commercial contact" },
      { status: 500 }
    );
  }
}

// DELETE /api/commercials/[id] - Delete a commercial contact by ID
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    // Consider implications of deleting a commercial contact, e.g., on associated Sales.
    // Prisma's default behavior (restrict, cascade, set null) is defined in the schema.
    await prisma.commercial.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Commercial contact deleted successfully" });
  } catch (error) {
    console.error(`Error deleting commercial contact:`, error);
    if (error instanceof Error && error.message.includes("Record to delete does not exist")) {
      return NextResponse.json({ error: "Commercial contact not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to delete commercial contact" },
      { status: 500 }
    );
  }
}
