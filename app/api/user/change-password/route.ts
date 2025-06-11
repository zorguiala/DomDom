// app/api/user/change-password/route.ts
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    return NextResponse.json({ message: 'Authentication secret is not configured.' }, { status: 500 });
  }

  const token = await getToken({ req: request, secret });

  if (!token || !token.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: "Current password and new password are required." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
        return NextResponse.json(
            { message: "New password must be at least 6 characters long." },
            { status: 400 }
        );
    }

    const user = await prisma.user.findUnique({
      where: { id: token.id as string },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash
    );

    if (!isCurrentPasswordValid) {
      return NextResponse.json({ message: "Invalid current password." }, { status: 403 });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    });

    return NextResponse.json(
      { message: "Password updated successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { message: "Internal server error while changing password." },
      { status: 500 }
    );
  }
}
