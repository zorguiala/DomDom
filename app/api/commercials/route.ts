import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/commercials - Get all commercial contacts
export async function GET() {
  try {
    const commercials = await prisma.commercial.findMany({
      orderBy: {
        name: "asc",
      },
      include: {
        client: true, // Include related client information
      }
    });
    return NextResponse.json({ commercials });
  } catch (error) {
    console.error("Error fetching commercial contacts:", error);
    return NextResponse.json(
      { error: "Failed to fetch commercial contacts" },
      { status: 500 }
    );
  }
}

// POST /api/commercials - Create a new commercial contact
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, address, phone, clientId } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Name is required for commercial contact" },
        { status: 400 }
      );
    }

    const commercialData: any = {
      name,
      email,
      address,
      phone,
    };

    if (clientId) {
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

    const commercial = await prisma.commercial.create({
      data: commercialData,
    });

    return NextResponse.json({ commercial }, { status: 201 });
  } catch (error) {
    console.error("Error creating commercial contact:", error);
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      // Assuming email is unique for commercial contact
      return NextResponse.json(
        { error: "Commercial contact with this email already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create commercial contact" },
      { status: 500 }
    );
  }
}
