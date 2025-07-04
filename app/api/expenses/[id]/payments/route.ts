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
  { params }: { params: { id: string } }
) {
  try {
    const expenseId = params.id;
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

    // Check if payment amount would exceed total amount
    const newPaidAmount = expense.paidAmount + data.amount;
    if (newPaidAmount > expense.totalAmount) {
      return NextResponse.json(
        { error: "Payment amount exceeds remaining balance" },
        { status: 400 }
      );
    }

    // Create the payment record
    const payment = await prisma.expensePayment.create({
      data: {
        expenseId,
        amount: data.amount,
        paymentDate: new Date(data.paymentDate),
        paymentMethod: data.paymentMethod,
        reference: data.reference,
        notes: data.notes,
      },
    });

    // Update the expense with new paid amount and status
    const newStatus = 
      newPaidAmount >= expense.totalAmount 
        ? "PAID" 
        : newPaidAmount > 0 
        ? "PARTIALLY_PAID" 
        : "UNPAID";

    const updatedExpense = await prisma.expense.update({
      where: { id: expenseId },
      data: {
        paidAmount: newPaidAmount,
        status: newStatus,
      },
      include: {
        category: true,
        payments: {
          orderBy: { paymentDate: "desc" },
        },
      },
    });

    return NextResponse.json({ payment, expense: updatedExpense }, { status: 201 });
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
  { params }: { params: { id: string } }
) {
  try {
    const expenseId = params.id;

    const payments = await prisma.expensePayment.findMany({
      where: { expenseId },
      orderBy: { paymentDate: "desc" },
    });

    return NextResponse.json(payments);
  } catch (error: any) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments", details: error.message },
      { status: 500 }
    );
  }
} 