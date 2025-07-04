import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getDaysInMonth } from "date-fns";

// Zod schema for payroll generation request
const payrollGenerationRequestSchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(1900).max(new Date().getFullYear() + 5),
  standardWorkingDaysInput: z.coerce.number().positive().optional(),
});

// Helper to calculate working days for an employee in a given month
async function getEmployeeWorkingDays(employeeId: string, month: number, year: number): Promise<number> {
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
  records.forEach((record: any) => {
    if (record.status === "PRESENT") totalDays += 1;
    else if (record.status === "HALF_DAY") totalDays += 0.5;
  });
  return totalDays;
}

// Helper to calculate total hours worked for an employee
async function getEmployeeHours(employeeId: string, month: number, year: number): Promise<{totalHours: number, overtimeHours: number}> {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month - 1, getDaysInMonth(startDate), 23, 59, 59, 999);

  const records = await prisma.attendance.findMany({
    where: {
      employeeId,
      date: { gte: startDate, lte: endDate },
      status: "PRESENT",
    },
  });

  // Calculate total hours from attendance records
  let totalHours = 0;
  records.forEach((record: any) => {
    if (record.hoursWorked) {
      totalHours += record.hoursWorked;
    } else {
      // Default to 8 hours if not specified
      totalHours += 8;
    }
  });
  
  // Calculate standard hours (40 hours per week, approximately 160 hours per month)
  const workingDays = await getEmployeeWorkingDays(employeeId, month, year);
  const standardHours = workingDays * 8; // 8 hours per day
  
  const overtimeHours = Math.max(0, totalHours - standardHours);

  return { totalHours, overtimeHours };
}

export async function POST(req: NextRequest) {
  try {
    const rawData = await req.json();
    const validationResult = payrollGenerationRequestSchema.safeParse(rawData);

    if (!validationResult.success) {
      return NextResponse.json({ 
        error: "Invalid input", 
        details: validationResult.error.flatten().fieldErrors 
      }, { status: 400 });
    }

    const { month, year, standardWorkingDaysInput } = validationResult.data;

    const activeEmployees = await prisma.employee.findMany({
      where: { 
        isActive: true, 
        salary: { not: null } 
      },
    });

    if (!activeEmployees.length) {
      return NextResponse.json({ 
        message: "No active employees with salary found to generate payroll for." 
      }, { status: 200 });
    }

    let recordsCreated = 0;
    let recordsUpdated = 0;
    
    const standardWorkingDaysForMonth = standardWorkingDaysInput || 22; // Default to 22 working days

    for (const employee of activeEmployees) {
      const monthlyBaseSalary = employee.salary!;
      
      // Calculate actual working days for this employee
      const actualWorkingDays = await getEmployeeWorkingDays(employee.id, month, year);
      
      // Calculate hours worked and overtime
      const { totalHours, overtimeHours } = await getEmployeeHours(employee.id, month, year);
      
      // Calculate pro-rated base salary based on working days
      let calculatedBaseSalary = monthlyBaseSalary;
      if (actualWorkingDays < standardWorkingDaysForMonth) {
        calculatedBaseSalary = (actualWorkingDays / standardWorkingDaysForMonth) * monthlyBaseSalary;
      }
      
      // Calculate overtime pay (1.5x regular hourly rate)
      const dailyRate = monthlyBaseSalary / standardWorkingDaysForMonth;
      const hourlyRate = dailyRate / 8; // 8 hours per day
      const overtimePay = overtimeHours * hourlyRate * 1.5;
      
      // Prepare bonus/overtime data as JSON string
      const bonusesData = [];
      if (overtimePay > 0) {
        bonusesData.push({
          reason: `Overtime (${overtimeHours} hours)`,
          amount: overtimePay
        });
      }
      
      // Calculate net salary
      const netSalary = calculatedBaseSalary + overtimePay;

      const payrollData = {
        employeeId: employee.id,
        month,
        year,
        baseSalary: calculatedBaseSalary,
        originalBaseSalary: monthlyBaseSalary,
        bonusesOrOvertime: JSON.stringify(bonusesData),
        deductions: JSON.stringify([]), // No deductions for now
        netSalary,
        regularHours: totalHours - overtimeHours,
        overtimeHours,
        workingDaysActual: actualWorkingDays,
        workingDaysStandard: standardWorkingDaysForMonth,
        paid: false,
        notes: `Auto-generated for ${month}/${year}. Total hours: ${totalHours}, Overtime: ${overtimeHours}`,
      };

      // Check if payroll already exists
      const existingPayroll = await prisma.payroll.findFirst({
        where: {
          employeeId: employee.id,
          month,
          year
        },
      });

      if (existingPayroll) {
        await prisma.payroll.update({
          where: { id: existingPayroll.id },
          data: payrollData,
        });
        recordsUpdated++;
      } else {
        await prisma.payroll.create({ data: payrollData });
        recordsCreated++;
      }
    }

    const totalProcessed = recordsCreated + recordsUpdated;
    const message = `Payroll generation completed for ${month}/${year}. ` +
      `Created: ${recordsCreated}, Updated: ${recordsUpdated}, Total: ${totalProcessed} records. ` +
      `Automatic calculations include pro-rated salaries based on working days and overtime pay at 1.5x rate.`;

    return NextResponse.json({ message }, { status: 200 });

  } catch (error: any) {
    console.error("Error generating payroll:", error);
    return NextResponse.json({ 
      error: "Failed to generate payroll", 
      details: error.message 
    }, { status: 500 });
  }
}
