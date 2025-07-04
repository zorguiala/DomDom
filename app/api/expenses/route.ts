import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const expenseSchema = z.object({
  description: z.string().min(1, "Description is required"),
  categoryId: z.string().min(1, "Category is required"),
  totalAmount: z.number().positive("Total amount must be a positive number"),
  paidAmount: z.number().min(0, "Paid amount cannot be negative").optional().default(0),
  type: z.enum(["ONE_TIME", "RECURRING", "LOAN"]).optional().default("ONE_TIME"),
  expenseDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format. Expected YYYY-MM-DD or ISO string",
  }),
  dueDate: z.string().optional().nullable().refine((date) => !date || !isNaN(Date.parse(date)), {
    message: "Invalid due date format. Expected YYYY-MM-DD or ISO string",
  }),
  paymentMethod: z.string().optional().nullable(),
  receipt: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  // Recurring fields
  isRecurring: z.boolean().optional().default(false),
  recurringFreq: z.enum(["WEEKLY", "MONTHLY", "YEARLY"]).optional().nullable(),
  nextDueDate: z.string().optional().nullable().refine((date) => !date || !isNaN(Date.parse(date)), {
    message: "Invalid next due date format",
  }),
  recurringEndDate: z.string().optional().nullable().refine((date) => !date || !isNaN(Date.parse(date)), {
    message: "Invalid recurring end date format",
  }),
});

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
    
    // Calculate status based on paid amount
    let status = "UNPAID";
    if (data.paidAmount > 0) {
      status = data.paidAmount >= data.totalAmount ? "PAID" : "PARTIALLY_PAID";
    }
    
    const newExpense = await prisma.expense.create({
      data: {
        ...data,
        expenseDate: new Date(data.expenseDate),
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        nextDueDate: data.nextDueDate ? new Date(data.nextDueDate) : null,
        recurringEndDate: data.recurringEndDate ? new Date(data.recurringEndDate) : null,
        status,
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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const dateFromStr = searchParams.get("dateFrom");
    const dateToStr = searchParams.get("dateTo");

    let filters: any = {};
    if (category) {
      filters.categoryId = category;
    }
    if (dateFromStr) {
      const dateFrom = new Date(dateFromStr);
      if (isNaN(dateFrom.getTime())) return NextResponse.json({ error: "Invalid dateFrom format" }, { status: 400 });
      filters.expenseDate = { ...filters.expenseDate, gte: dateFrom };
    }
    if (dateToStr) {
      const dateTo = new Date(dateToStr);
      if (isNaN(dateTo.getTime())) return NextResponse.json({ error: "Invalid dateTo format" }, { status: 400 });
      dateTo.setHours(23, 59, 59, 999);
      filters.expenseDate = { ...filters.expenseDate, lte: dateTo };
    }

    const expenses = await prisma.expense.findMany({
      where: filters,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        payments: {
          orderBy: {
            paymentDate: "desc",
          },
        },
      },
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