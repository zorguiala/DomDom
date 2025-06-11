import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: {
    id: string;
  };
}

// GET /api/clients/[id] - Get a single client by ID
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const client = await prisma.client.findUnique({
      where: { id: params.id },
      // include: { commercials: true, sales: true } // Optionally include related data
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json({ client });
  } catch (error) {
    console.error(`Error fetching client ${params.id}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch client" },
      { status: 500 }
    );
  }
}

// PUT /api/clients/[id] - Update a client by ID
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const body = await request.json();
    const { companyName, email, address, phone, mf } = body;

    const client = await prisma.client.update({
      where: { id: params.id },
      data: {
        companyName,
        email,
        address,
        phone,
        mf,
      },
    });

    return NextResponse.json({ client });
  } catch (error) {
    console.error(`Error updating client ${params.id}:`, error);
    if (error instanceof Error && error.message.includes("Record to update not found")) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Client with this email already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update client" },
      { status: 500 }
    );
  }
}

// DELETE /api/clients/[id] - Delete a client by ID
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    // Consider implications of deleting a client:
    // - What happens to sales associated with this client?
    // - What happens to commercial contacts associated with this client?
    // Prisma's default behavior (restrict, cascade, set null) is defined in the schema.
    // For now, we assume the schema handles this as desired.
    await prisma.client.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Client deleted successfully" });
  } catch (error) {
    console.error(`Error deleting client ${params.id}:`, error);
    if (error instanceof Error && error.message.includes("Record to delete does not exist")) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }
    // Add more specific error handling if Prisma throws errors due to relational constraints.
    return NextResponse.json(
      { error: "Failed to delete client" },
      { status: 500 }
    );
  }
}
