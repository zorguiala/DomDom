// app/api/auth/forgot-password/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
// In a real app, you'd use a proper email sending library
// import { sendPasswordResetEmail } from '@/lib/mail';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json({ message: "Valid email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Important: Do not reveal if the user exists or not for security reasons
    // Always return a generic success message.
    if (user) {
      // Invalidate previous tokens for this email
      await prisma.passwordResetToken.deleteMany({
        where: { email },
      });

      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 3600000); // Token valid for 1 hour

      await prisma.passwordResetToken.create({
        data: {
          email,
          token,
          expiresAt,
        },
      });

      const resetLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password/${token}`;

      // TODO: Implement actual email sending here
      console.log(`Password reset link for ${email}: ${resetLink}`);
      // await sendPasswordResetEmail(email, resetLink); // Example of email sending function
    }

    return NextResponse.json(
      { message: "If an account with that email exists, a password reset link has been sent." },
      { status: 200 }
    );

  } catch (error) {
    console.error("Forgot password error:", error);
    // Generic error message for security
    return NextResponse.json(
      { message: "An error occurred. If the problem persists, please contact support." },
      { status: 500 }
    );
  }
}
