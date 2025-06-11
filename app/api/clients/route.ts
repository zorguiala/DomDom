import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/clients - Get all clients
export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      orderBy: {
        companyName: "asc",
      },
      include: { // Optional: include related commercials if needed directly here
        // commercials: true,
      }
    });
    return NextResponse.json({ clients });
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 }
    );
  }
}

// POST /api/clients - Create a new client
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

    const client = await prisma.client.create({
      data: {
        companyName,
        email,
        address,
        phone,
        mf,
      },
    });

    return NextResponse.json({ client }, { status: 201 });
  } catch (error) {
    console.error("Error creating client:", error);
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      // Assuming email is unique for client as well
      return NextResponse.json(
        { error: "Client with this email already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create client" },
      { status: 500 }
    );
  }
}
