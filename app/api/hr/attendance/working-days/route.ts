import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { AttendanceStatusValues } from "@/types/hr"; // To validate status values
import { getDaysInMonth } from "date-fns"; // To know how many days in a month

// Zod schema for query parameters validation
const workingDaysQuerySchema = z.object({
  month: z.coerce.number().int().min(1, "Month must be between 1 and 12").max(12, "Month must be between 1 and 12"),
  year: z.coerce.number().int().min(1900, "Year must be valid").max(new Date().getFullYear() + 5), // Allow a few future years
  employeeId: z.string().uuid("Invalid Employee ID format").optional(),
});

// Helper function to calculate working days for a set of attendance records
const calculateWorkingDaysForRecords = (records: any[]): number => {
  let totalWorkingDays = 0;
  records.forEach(record => {
    if (record.status === "PRESENT") {
      totalWorkingDays += 1;
    } else if (record.status === "HALF_DAY") {
      totalWorkingDays += 0.5;
    }
    // ABSENT and other statuses are not counted
  });
  return totalWorkingDays;
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const queryParams = {
      month: searchParams.get("month"),
      year: searchParams.get("year"),
      employeeId: searchParams.get("employeeId"),
    };

    const validationResult = workingDaysQuerySchema.safeParse(queryParams);

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

    // Determine date range for the given month and year
    // Month is 1-indexed from query, but 0-indexed for JavaScript Date
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month - 1, getDaysInMonth(startDate), 23, 59, 59, 999);


    let whereClause: any = {
      date: {
        gte: startDate,
        lte: endDate,
      },
      status: { // Only fetch records that could contribute to working days
        in: ["PRESENT", "HALF_DAY"],
      }
    };

    if (employeeId) {
      whereClause.employeeId = employeeId;
    }

    const attendanceRecords = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        employee: {
          select: { id: true, name: true, employeeId: true }, // Select necessary employee fields
        },
      },
      orderBy: { // Optional: order by employee and then date for easier processing if needed
        employeeId: 'asc',
        date: 'asc',
      }
    });

    if (!attendanceRecords.length && employeeId) {
      // If a specific employee is requested and has no relevant attendance, return their info with 0 working days
      const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
      if (!employee) {
        return NextResponse.json({ error: "Employee not found" }, { status: 404 });
      }
      return NextResponse.json({
        employeeId: employee.id,
        employeeExternalId: employee.employeeId, // employeeId from schema is the custom one
        employeeName: employee.name,
        month,
        year,
        totalWorkingDays: 0,
      });
    }

    if (!attendanceRecords.length && !employeeId) {
      return NextResponse.json(
        { message: "No attendance records found for the specified period.", data: [] },
        { status: 200 }
      );
    }

    if (employeeId) {
      // Calculate for a single employee
      const employee = attendanceRecords[0]?.employee; // All records should be for the same employee
      if (!employee) {
        // This case should ideally be caught by the "!attendanceRecords.length && employeeId" block above,
        // but as a safeguard:
        const empData = await prisma.employee.findUnique({ where: {id: employeeId}});
        if(!empData) return NextResponse.json({ error: "Employee not found" }, { status: 404 });
         return NextResponse.json({
            employeeId: empData.id,
            employeeExternalId: empData.employeeId,
            employeeName: empData.name,
            month,
            year,
            totalWorkingDays: 0,
        });
      }
      const totalWorkingDays = calculateWorkingDaysForRecords(attendanceRecords);
      return NextResponse.json({
        employeeId: employee.id,
        employeeExternalId: employee.employeeId,
        employeeName: employee.name,
        month,
        year,
        totalWorkingDays,
      });
    } else {
      // Group records by employee and calculate for each
      const employeeWorkingDaysMap = new Map<string, { employee: any; records: any[] }>();

      attendanceRecords.forEach(record => {
        if (!employeeWorkingDaysMap.has(record.employeeId)) {
          employeeWorkingDaysMap.set(record.employeeId, { employee: record.employee, records: [] });
        }
        employeeWorkingDaysMap.get(record.employeeId)!.records.push(record);
      });

      const result = Array.from(employeeWorkingDaysMap.values()).map(group => {
        const totalWorkingDays = calculateWorkingDaysForRecords(group.records);
        return {
          employeeId: group.employee.id,
          employeeExternalId: group.employee.employeeId,
          employeeName: group.employee.name,
          month,
          year,
          totalWorkingDays,
        };
      });

      return NextResponse.json(result);
    }

  } catch (error: any) {
    console.error("Error calculating working days:", error);
    return NextResponse.json(
      { error: "Failed to calculate working days", details: error.message },
      { status: 500 }
    );
  }
}
