// app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Missing name, email, or password" },
        { status: 400 }
      );
    }

    // Basic email validation
    if (!/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json(
        { message: "Invalid email format" },
        { status: 400 }
      );
    }

    // Basic password length validation
    if (password.length < 6) {
        return NextResponse.json(
            { message: "Password must be at least 6 characters long" },
            { status: 400 }
        );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists with this email" },
        { status: 409 } // Conflict
      );
    }

    const passwordHash = await bcrypt.hash(password, 10); // 10 is salt rounds

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "ADMIN", // Default role, consider making this more configurable or "USER"
      },
    });

    // Return a subset of user information, excluding passwordHash
    const { passwordHash: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(
      { message: "User created successfully", user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Internal server error during registration" },
      { status: 500 }
    );
  }
}
