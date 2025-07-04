import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { PayrollAdjustmentItem, UpdatePayrollRequest, PayrollData } from "@/types/hr";

// Zod schema for a single PayrollAdjustmentItem
const payrollAdjustmentItemSchema = z.object({
  reason: z.string().min(1, "Reason is required"),
  amount: z.number().positive("Amount must be a positive number"),
});

// Zod schema for updating a payroll record
const updatePayrollSchema = z.object({
  baseSalary: z.number().positive("Base salary must be positive").optional(),
  bonusesOrOvertime: z.array(payrollAdjustmentItemSchema).optional().nullable(),
  deductions: z.array(payrollAdjustmentItemSchema).optional().nullable(),
  // netSalary: z.number().optional(), // Typically recalculated, not directly set
  paid: z.boolean().optional(),
  paidAt: z.string().datetime({ offset: true }).optional().nullable().or(z.literal("")), // Allow empty string for clearing date
  notes: z.string().optional().nullable(),
});


// Helper to calculate net salary
const calculateNetSalary = (
  baseSalary: number,
  bonuses: PayrollAdjustmentItem[] = [],
  deductions: PayrollAdjustmentItem[] = []
): number => {
  const totalBonuses = bonuses.reduce((sum, item) => sum + item.amount, 0);
  const totalDeductions = deductions.reduce((sum, item) => sum + item.amount, 0);
  return baseSalary + totalBonuses - totalDeductions;
};


export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ payrollId: string }> }
) {
  try {
    const paramValues = await params;
    const { payrollId } = await params;
    if (!payrollId.match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/)) {
        return NextResponse.json({ error: "Invalid Payroll ID format." }, { status: 400 });
    }

    const rawData = await req.json();
    const validationResult = updatePayrollSchema.safeParse(rawData);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const dataToUpdate = validationResult.data;

    // Fetch existing payroll record to get current baseSalary if not provided
    const existingPayroll = await prisma.payroll.findUnique({
      where: { id: payrollId },
    });

    if (!existingPayroll) {
      return NextResponse.json({ error: "Payroll record not found" }, { status: 404 });
    }

    let processedData: any = {};

    if (dataToUpdate.baseSalary !== undefined) {
        processedData.baseSalary = dataToUpdate.baseSalary;
    }
    if (dataToUpdate.paid !== undefined) {
        processedData.paid = dataToUpdate.paid;
        if (dataToUpdate.paid && dataToUpdate.paidAt === undefined) { // If marking as paid and no paidAt provided, set to now
            processedData.paidAt = new Date().toISOString();
        } else if (!dataToUpdate.paid) { // If marking as unpaid, clear paidAt
             processedData.paidAt = null;
        }
    }
    if (dataToUpdate.paidAt !== undefined) { // Explicitly setting or clearing paidAt
        processedData.paidAt = dataToUpdate.paidAt === "" ? null : (dataToUpdate.paidAt ? new Date(dataToUpdate.paidAt).toISOString() : null);
    }
     if (dataToUpdate.notes !== undefined) {
        processedData.notes = dataToUpdate.notes;
    }


    // Handle JSON stringification for bonuses and deductions
    const currentBonuses = dataToUpdate.bonusesOrOvertime !== undefined
        ? dataToUpdate.bonusesOrOvertime
        : (existingPayroll.bonusesOrOvertime ? JSON.parse(existingPayroll.bonusesOrOvertime) : []);

    const currentDeductions = dataToUpdate.deductions !== undefined
        ? dataToUpdate.deductions
        : (existingPayroll.deductions ? JSON.parse(existingPayroll.deductions) : []);

    if (dataToUpdate.bonusesOrOvertime !== undefined) {
        processedData.bonusesOrOvertime = JSON.stringify(dataToUpdate.bonusesOrOvertime || []);
    }
     if (dataToUpdate.deductions !== undefined) {
        processedData.deductions = JSON.stringify(dataToUpdate.deductions || []);
    }

    // Recalculate netSalary
    const baseForCalc = processedData.baseSalary ?? existingPayroll.baseSalary;
    processedData.netSalary = calculateNetSalary(baseForCalc, currentBonuses || [], currentDeductions || []);


    const updatedPayroll = await prisma.payroll.update({
      where: { id: payrollId },
      data: {
        baseSalary: processedData.baseSalary, // Only update if provided
        bonusesOrOvertime: processedData.bonusesOrOvertime, // Always provide, even if stringified empty array
        deductions: processedData.deductions, // Always provide
        netSalary: processedData.netSalary,
        paid: processedData.paid, // Only update if provided
        paidAt: processedData.paidAt, // Only update if provided or logic dictates
        notes: processedData.notes, // Only update if provided
      },
    });

    // Deserialize for response consistency with GET /api/hr/payroll
    const responseRecord: PayrollData = {
        ...updatedPayroll,
        bonusesOrOvertime: updatedPayroll.bonusesOrOvertime ? JSON.parse(updatedPayroll.bonusesOrOvertime) : [],
        deductions: updatedPayroll.deductions ? JSON.parse(updatedPayroll.deductions) : [],
    };


    return NextResponse.json(responseRecord);

  } catch (error: any) {
    console.error("Error updating payroll record:", error);
    if (error.code === 'P2025') {
        return NextResponse.json({ error: "Payroll record not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to update payroll record", details: error.message },
      { status: 500 }
    );
  }
}


// GET /api/hr/payroll/[payrollId] - Fetch a single payroll record (optional, if needed for an edit page)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ payrollId: string }> }
) {
  try {
    const paramValues = await params;
    const { payrollId } = await params;
    if (!payrollId.match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/)) {
        return NextResponse.json({ error: "Invalid Payroll ID format." }, { status: 400 });
    }

    const payrollRecord = await prisma.payroll.findUnique({
      where: { id: payrollId },
      include: {
        employee: { select: { id: true, name: true, employeeId: true } },
      },
    });

    if (!payrollRecord) {
      return NextResponse.json({ error: "Payroll record not found" }, { status: 404 });
    }

    // Deserialize JSON string fields
    const formattedRecord: PayrollData = {
        ...payrollRecord,
        bonusesOrOvertime: payrollRecord.bonusesOrOvertime ? JSON.parse(payrollRecord.bonusesOrOvertime) : [],
        deductions: payrollRecord.deductions ? JSON.parse(payrollRecord.deductions) : [],
        employee: payrollRecord.employee ? {
            id: payrollRecord.employee.id,
            name: payrollRecord.employee.name,
            employeeId: payrollRecord.employee.employeeId
        } : undefined,
    };

    return NextResponse.json(formattedRecord);

  } catch (error: any) {
    console.error("Error fetching payroll record:", error);
    return NextResponse.json(
      { error: "Failed to fetch payroll record", details: error.message },
      { status: 500 }
    );
  }
}
