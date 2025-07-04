import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const paymentSchema = z.object({
  amount: z.number().positive("Payment amount must be positive"),
  paymentDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid payment date format",
  }),
  paymentMethod: z.string().optional().nullable(),
  reference: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const paramValues = await params;
    const expenseId = paramValues.id;
    const rawData = await req.json();
    const validationResult = paymentSchema.safeParse(rawData);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid input",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Get the current expense
    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
    });

    if (!expense) {
      return NextResponse.json(
        { error: "Expense not found" },
        { status: 404 }
      );
    }

    // TODO: Add expensePayment model to Prisma schema to enable payment tracking
    return NextResponse.json(
      { error: "Payment functionality not yet implemented - missing expensePayment model in schema" },
      { status: 501 }
    );
  } catch (error: any) {
    console.error("Error creating payment:", error);
    return NextResponse.json(
      { error: "Failed to create payment", details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const paramValues = await params;
    // TODO: Add expensePayment model to Prisma schema to enable payment tracking
    return NextResponse.json(
      { error: "Payment functionality not yet implemented - missing expensePayment model in schema" },
      { status: 501 }
    );
  } catch (error: any) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments", details: error.message },
      { status: 500 }
    );
  }
} 