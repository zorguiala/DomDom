// app/api/auth/reset-password/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { message: "Token and new password are required." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
        return NextResponse.json(
            { message: "Password must be at least 6 characters long." },
            { status: 400 }
        );
    }

    const passwordResetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!passwordResetToken) {
      return NextResponse.json({ message: "Invalid or expired token." }, { status: 400 });
    }

    if (new Date() > passwordResetToken.expiresAt) {
      // Optionally delete expired token
      await prisma.passwordResetToken.delete({ where: { id: passwordResetToken.id } });
      return NextResponse.json({ message: "Token has expired." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: passwordResetToken.email },
    });

    if (!user) {
      // This case should ideally not happen if token was generated for an existing user
      // but good to handle. Also delete token as it's now invalid.
      await prisma.passwordResetToken.delete({ where: { id: passwordResetToken.id } });
      return NextResponse.json({ message: "User not found for this token." }, { status: 404 });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    });

    // Delete the token after successful password reset
    await prisma.passwordResetToken.delete({
      where: { id: passwordResetToken.id },
    });

    return NextResponse.json(
      { message: "Password has been reset successfully." },
      { status: 200 }
    );

  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { message: "Internal server error while resetting password." },
      { status: 500 }
    );
  }
}
