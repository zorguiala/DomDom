import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { PayrollAdjustmentItem } from "@/types/hr"; // Assuming this is globally available for payroll items
import { getDaysInMonth } from "date-fns";

// Zod schema for payroll generation request
const payrollGenerationRequestSchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(1900).max(new Date().getFullYear() + 5),
  // Standard working days for pro-rata calculation. If not provided, will use actual days in month.
  standardWorkingDaysInput: z.coerce.number().positive().optional(),
});

// Helper to fetch working days (simplified - assumes internal call or direct logic)
// In a real scenario, this might call the /api/hr/attendance/working-days endpoint via fetch,
// or directly use a shared service if available. For simplicity here, we'll mock the core logic.
async function getEmployeeWorkingDays(employeeId: string, month: number, year: number): Promise<number> {
  // This is a simplified version. Ideally, reuse the logic from the working-days endpoint.
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month - 1, getDaysInMonth(startDate), 23, 59, 59, 999);

  const records = await prisma.attendance.findMany({
    where: {
      employeeId,
      date: { gte: startDate, lte: endDate },
      status: { in: ["PRESENT", "HALF_DAY"] },
    },
  });

  let totalDays = 0;
  records.forEach(record => {
    if (record.status === "PRESENT") totalDays += 1;
    else if (record.status === "HALF_DAY") totalDays += 0.5;
  });
  return totalDays;
}

export async function POST(req: NextRequest) {
  try {
    const rawData = await req.json();
    const validationResult = payrollGenerationRequestSchema.safeParse(rawData);

    if (!validationResult.success) {
      return NextResponse.json({ error: "Invalid input", details: validationResult.error.flatten().fieldErrors }, { status: 400 });
    }

    const { month, year, standardWorkingDaysInput } = validationResult.data;

    const activeEmployees = await prisma.employee.findMany({
      where: { isActive: true, salary: { not: null } }, // Only active employees with a salary
    });

    if (!activeEmployees.length) {
      return NextResponse.json({ message: "No active employees with salary found to generate payroll for." }, { status: 200 });
    }

    let recordsCreated = 0;
    let recordsUpdated = 0;

    for (const employee of activeEmployees) {
      const employeeBaseSalary = employee.salary!; // Already filtered for not null

      const actualDaysInMonth = getDaysInMonth(new Date(year, month - 1, 1));
      const standardWorkingDaysForMonth = standardWorkingDaysInput || actualDaysInMonth; // Use input or actual days

      const totalWorkingDays = await getEmployeeWorkingDays(employee.id, month, year);

      let proRataSalary = employeeBaseSalary;
      if (totalWorkingDays < standardWorkingDaysForMonth) {
        // Simplified pro-rata: (worked_days / standard_days_in_month) * base_salary
        // This assumes baseSalary is for the standardWorkingDaysForMonth.
        proRataSalary = (totalWorkingDays / standardWorkingDaysForMonth) * employeeBaseSalary;
      }
      // Ensure proRataSalary is not negative or excessively large if working days > standard (e.g. overtime not part of this base calc)
      proRataSalary = Math.max(0, proRataSalary);


      const initialBonuses: PayrollAdjustmentItem[] = [];
      const initialDeductions: PayrollAdjustmentItem[] = [];

      // Net salary calculation (initial)
      // For now, bonuses and deductions are handled via PUT, so initial net = pro-rata base
      const netSalary = proRataSalary;

      const payrollData = {
        employeeId: employee.id,
        month,
        year,
        baseSalary: proRataSalary, // Store the pro-rated base salary
        originalBaseSalary: employeeBaseSalary, // Store original monthly base for reference
        bonusesOrOvertime: JSON.stringify(initialBonuses),
        deductions: JSON.stringify(initialDeductions),
        netSalary,
        paid: false,
        paidAt: null,
        // Could add workingDays, standardDays, etc. for record keeping if schema supported
      };

      // Upsert: Create if not exists for that employee/month/year, otherwise update.
      // This prevents duplicate payroll records for the same period for an employee.
      const result = await prisma.payroll.upsert({
        where: {
          employeeId_month_year: { employeeId: employee.id, month, year }
        },
        update: payrollData, // If it exists, update it (e.g. re-calculate pro-rata)
        create: payrollData,
      });

      // This simple check doesn't distinguish create vs update from upsert's result directly without more logic
      // For now, just count as processed. A more detailed check might look at result.createdAt vs result.updatedAt if different.
      // Or, if upsert guarantees a new createdAt on creation, that could be used.
      // However, Prisma's upsert might update `updatedAt` on both.
      // A common pattern is to try findFirst, then update or create.
      // For this, we'll assume each successful upsert is a "processed" record.
      // To distinguish, one might query first, then decide to create or update.
      // For simplicity, let's assume we always "update" if it exists or "create" if not.
      // The problem with simple count is if an existing record was updated with identical values.
      // Let's say, for now, we count every processed employee.
      // A better approach for created/updated count would be:
      // 1. Fetch existing payrolls for month/year.
      // 2. For each employee, if in existing, it's an update. If not, it's a create.
      // This is more complex, so simplifying for now.
      recordsCreated++; // Simplified: assume each upsert leads to one record handled.
    }

    return NextResponse.json(
      { message: `Payroll generation process completed for ${month}/${year}. Processed ${recordsCreated} employee records.` },
      { status: 200 } // 200 OK as the operation attempted to process, even if some were updates.
                     // Use 201 if you are sure all were creations.
    );

  } catch (error: any) {
    console.error("Error generating payroll:", error);
    return NextResponse.json({ error: "Failed to generate payroll", details: error.message }, { status: 500 });
  }
}
