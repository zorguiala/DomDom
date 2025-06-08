import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Zod schema for creating/updating an expense
const expenseSchema = z.object({
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  amount: z.number().positive("Amount must be a positive number"),
  expenseDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format. Expected YYYY-MM-DD or ISO string",
  }),
  paymentMethod: z.string().optional().nullable(),
  receipt: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

// POST /api/expenses - Create a new expense
export async function POST(req: NextRequest) {
  try {
    const rawData = await req.json();
    const validationResult = expenseSchema.safeParse(rawData);

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
    const newExpense = await prisma.expense.create({
      data: {
        ...data,
        expenseDate: new Date(data.expenseDate), // Convert string to DateTime
      },
    });

    return NextResponse.json(newExpense, { status: 201 });
  } catch (error: any) {
    console.error("Error creating expense:", error);
    return NextResponse.json(
      { error: "Failed to create expense", details: error.message },
      { status: 500 }
    );
  }
}

// GET /api/expenses - Get a list of all expenses
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const dateFromStr = searchParams.get("dateFrom");
    const dateToStr = searchParams.get("dateTo");

    let filters: any = {};
    if (category) {
      filters.category = category;
    }
    if (dateFromStr) {
      const dateFrom = new Date(dateFromStr);
      if (isNaN(dateFrom.getTime())) return NextResponse.json({ error: "Invalid dateFrom format" }, { status: 400 });
      filters.expenseDate = { ...filters.expenseDate, gte: dateFrom };
    }
    if (dateToStr) {
      const dateTo = new Date(dateToStr);
      if (isNaN(dateTo.getTime())) return NextResponse.json({ error: "Invalid dateTo format" }, { status: 400 });
      // To include the whole day of dateTo:
      dateTo.setHours(23, 59, 59, 999);
      filters.expenseDate = { ...filters.expenseDate, lte: dateTo };
    }

    const expenses = await prisma.expense.findMany({
      where: filters,
      orderBy: {
        expenseDate: "desc",
      },
    });
    return NextResponse.json(expenses);
  } catch (error: any) {
    console.error("Error fetching expenses:", error);
    return NextResponse.json(
      { error: "Failed to fetch expenses", details: error.message },
      { status: 500 }
    );
  }
}
