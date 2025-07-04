import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Zod schema for updating an expense (all fields optional)
// Base schema for an expense's core fields
const expenseBaseSchema = z.object({
  description: z.string().min(1, "Description is required"),
  categoryId: z.string().min(1, "Category is required"),
  amount: z.number().positive("Amount must be a positive number"),
  expenseDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format. Expected YYYY-MM-DD or ISO string",
  }),
  paymentMethod: z.string().optional().nullable(),
  receipt: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

const updateExpenseSchema = expenseBaseSchema.partial(); // All fields become optional

// GET /api/expenses/[id] - Get a single expense by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const paramValues = await params;
    const { id } = paramValues;
    const expense = await prisma.expense.findUnique({
      where: { id },
    });

    if (!expense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }
    return NextResponse.json(expense);
  } catch (error: any) {
    console.error("Error fetching expense:", error);
    return NextResponse.json(
      { error: "Failed to fetch expense", details: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/expenses/[id] - Update an expense by ID
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const paramValues = await params;
    const { id } = paramValues;
    const rawData = await req.json();
    const validationResult = updateExpenseSchema.safeParse(rawData);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid input",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const dataToUpdate = validationResult.data;
    let processedData: any = { ...dataToUpdate };

    if (dataToUpdate.expenseDate) {
      processedData.expenseDate = new Date(dataToUpdate.expenseDate);
    }

    // Ensure the record exists
    const existingExpense = await prisma.expense.findUnique({ where: { id } });
    if (!existingExpense) {
        return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    const updatedExpense = await prisma.expense.update({
      where: { id },
      data: processedData,
    });

    return NextResponse.json(updatedExpense);
  } catch (error: any) {
    console.error("Error updating expense:", error);
    if (error.code === 'P2025') { // Record to update not found
        return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to update expense", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/expenses/[id] - Delete an expense by ID
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const paramValues = await params;
    const { id } = paramValues;

    // Ensure the record exists
    const existingExpense = await prisma.expense.findUnique({ where: { id } });
    if (!existingExpense) {
        return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    await prisma.expense.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Expense deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting expense:", error);
     if (error.code === 'P2025') { // Record to delete not found
        return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to delete expense", details: error.message },
      { status: 500 }
    );
  }
}
