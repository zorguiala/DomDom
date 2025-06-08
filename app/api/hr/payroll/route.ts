import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { PayrollData, PayrollAdjustmentItem } from "@/types/hr";

// Zod schema for query parameters validation
const getPayrollQuerySchema = z.object({
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(1900).max(new Date().getFullYear() + 5).optional(),
  employeeId: z.string().uuid("Invalid Employee ID format").optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const queryParams = {
      month: searchParams.get("month"),
      year: searchParams.get("year"),
      employeeId: searchParams.get("employeeId"),
    };

    const validationResult = getPayrollQuerySchema.safeParse(queryParams);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid query parameters",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { month, year, employeeId } = validationResult.data;
    let whereClause: any = {};

    if (month) whereClause.month = month;
    if (year) whereClause.year = year;
    if (employeeId) whereClause.employeeId = employeeId;

    // If month is provided, year must also be provided, and vice-versa (optional: depends on desired API behavior)
    if ((month && !year) || (!month && year)) {
        return NextResponse.json({ error: "Both month and year must be provided if one is specified for filtering." }, { status: 400 });
    }

    const payrollRecords = await prisma.payroll.findMany({
      where: whereClause,
      include: {
        employee: {
          select: { id: true, name: true, employeeId: true }, // employeeId here is the custom one
        },
      },
      orderBy: [
        { year: "desc" },
        { month: "desc" },
        { employee: { name: "asc" } },
      ],
    });

    // Deserialize JSON string fields
    const formattedRecords: PayrollData[] = payrollRecords.map(record => {
      let bonusesOrOvertime: PayrollAdjustmentItem[] = [];
      let deductions: PayrollAdjustmentItem[] = [];

      try {
        if (record.bonusesOrOvertime) {
          bonusesOrOvertime = JSON.parse(record.bonusesOrOvertime);
        }
      } catch (e) {
        console.warn(`Failed to parse bonusesOrOvertime for payroll ID ${record.id}:`, e);
        // Keep as empty array or handle error as needed
      }

      try {
        if (record.deductions) {
          deductions = JSON.parse(record.deductions);
        }
      } catch (e) {
        console.warn(`Failed to parse deductions for payroll ID ${record.id}:`, e);
        // Keep as empty array
      }

      // Ensure employee object is passed correctly, even if null/undefined from Prisma
      const employeeData = record.employee ? {
        id: record.employee.id,
        name: record.employee.name,
        employeeId: record.employee.employeeId // This is the custom string ID
      } : undefined;

      return {
        ...record,
        bonusesOrOvertime,
        deductions,
        employee: employeeData,
      };
    });

    return NextResponse.json(formattedRecords);

  } catch (error: any) {
    console.error("Error fetching payroll records:", error);
    return NextResponse.json(
      { error: "Failed to fetch payroll records", details: error.message },
      { status: 500 }
    );
  }
}
