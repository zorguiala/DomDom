import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PrismaExpense } from "@/types/expenses"; // Using our defined PrismaExpense type

// Helper function to escape CSV fields
const escapeCsvField = (field: any): string => {
  if (field === null || field === undefined) {
    return "";
  }
  const stringField = String(field);
  // If the field contains a comma, newline, or double quote, enclose it in double quotes
  if (stringField.includes(",") || stringField.includes("\n") || stringField.includes('"')) {
    // Escape existing double quotes by doubling them
    return `"${stringField.replace(/"/g, '""')}"`;
  }
  return stringField;
};

// GET /api/expenses/export - Export all expenses to CSV
export async function GET(req: NextRequest) {
  try {
    const expenses: PrismaExpense[] = await prisma.expense.findMany({
      orderBy: {
        expenseDate: "asc", // Or any preferred order for export
      },
    });

    if (!expenses.length) {
      // Optionally, return an empty CSV or a message, or a 204 No Content
      // For now, returning an empty CSV with headers.
      // Or: return new NextResponse("No expenses to export.", { status: 200, headers: { 'Content-Type': 'text/plain'} });
    }

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

    // Convert data to CSV format
    let csvString = headers.join(",") + "\n";

    expenses.forEach((expense) => {
      const expenseDate = expense.expenseDate instanceof Date
        ? expense.expenseDate.toISOString().split("T")[0] // Format to YYYY-MM-DD
        : String(expense.expenseDate); // Fallback if it's already a string (though Prisma should give Date)

      const createdAtDate = expense.createdAt instanceof Date
        ? expense.createdAt.toISOString()
        : String(expense.createdAt);

      const updatedAtDate = expense.updatedAt instanceof Date
        ? expense.updatedAt.toISOString()
        : String(expense.updatedAt);

      const row = [
        escapeCsvField(expense.id),
        escapeCsvField(expense.description),
        escapeCsvField(expense.category),
        escapeCsvField(expense.amount),
        escapeCsvField(expenseDate),
        escapeCsvField(expense.paymentMethod),
        escapeCsvField(expense.receipt),
        escapeCsvField(expense.notes),
        escapeCsvField(createdAtDate),
        escapeCsvField(updatedAtDate),
      ];
      csvString += row.join(",") + "\n";
    });

    // Set response headers for CSV download
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
