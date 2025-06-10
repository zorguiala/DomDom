// app/api/user/profile/route.ts
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(request: Request) {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    return NextResponse.json({ message: 'Authentication secret is not configured.' }, { status: 500 });
  }

  const token = await getToken({ req: request, secret });

  if (!token || !token.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name } = await request.json();

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { message: "Name is required and must be a non-empty string." },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: token.id as string },
      data: { name: name.trim() },
    });

    // Exclude passwordHash from the returned user object
    const { passwordHash, ...userWithoutPassword } = updatedUser;

    return NextResponse.json(
      { message: "Profile updated successfully", user: userWithoutPassword },
      { status: 200 }
    );
  } catch (error) {
    console.error("Profile update error:", error);
    // Check for specific Prisma errors if needed, e.g., P2025 (Record not found)
    return NextResponse.json(
      { message: "Internal server error while updating profile" },
      { status: 500 }
    );
  }
}
