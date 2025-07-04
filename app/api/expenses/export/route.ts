import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ExpenseWithCategory } from "@/types/expenses";

const escapeCsvField = (field: any): string => {
  if (field === null || field === undefined) {
    return "";
  }
  const stringField = String(field);
  if (stringField.includes(",") || stringField.includes("\n") || stringField.includes('"')) {
    return `"${stringField.replace(/"/g, '""')}"`;
  }
  return stringField;
};

export async function GET(req: NextRequest) {
  try {
    const expenses = await prisma.expense.findMany({
      include: {
        category: true,
      },
      orderBy: {
        expenseDate: "asc",
      },
    });

    const headers = [
      "ID",
      "Description",
      "Category",
      "Amount",
      "ExpenseDate",
      "PaymentMethod",
      "Receipt",
      "Notes",
      "CreatedAt",
      "UpdatedAt",
    ];

    let csvString = headers.join(",") + "\n";

    expenses.forEach((expense) => {
      const expenseDate = expense.expenseDate instanceof Date
        ? expense.expenseDate.toISOString().split("T")[0]
        : String(expense.expenseDate);

      const createdAtDate = expense.createdAt instanceof Date
        ? expense.createdAt.toISOString()
        : String(expense.createdAt);

      const updatedAtDate = expense.updatedAt instanceof Date
        ? expense.updatedAt.toISOString()
        : String(expense.updatedAt);

      const row = [
        escapeCsvField(expense.id),
        escapeCsvField(expense.description),
        escapeCsvField(expense.category.name),
        escapeCsvField(expense.totalAmount),
        escapeCsvField(expenseDate),
        escapeCsvField(expense.paymentMethod),
        escapeCsvField(expense.receipt),
        escapeCsvField(expense.notes),
        escapeCsvField(createdAtDate),
        escapeCsvField(updatedAtDate),
      ];
      csvString += row.join(",") + "\n";
    });

    const responseHeaders = new Headers();
    responseHeaders.set("Content-Type", "text/csv; charset=utf-8");
    responseHeaders.set("Content-Disposition", `attachment; filename="expenses-${new Date().toISOString().split('T')[0]}.csv"`);

    return new NextResponse(csvString, {
      status: 200,
      headers: responseHeaders,
    });

  } catch (error: any) {
    console.error("Error exporting expenses:", error);
    return NextResponse.json(
      { error: "Failed to export expenses", details: error.message },
      { status: 500 }
    );
  }
}