import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { AttendanceStatusValues } from "@/types/hr"; // Import status values

// Zod schema for creating attendance
const createAttendanceSchema = z.object({
  employeeId: z.string().uuid("Invalid Employee ID format"),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format. Expected YYYY-MM-DD",
  }),
  status: z.enum(AttendanceStatusValues),
  hoursWorked: z.number().min(0).max(24).optional().nullable(),
  notes: z.string().optional().nullable(),
});

// POST /api/hr/attendance - Create a new attendance record
export async function POST(req: NextRequest) {
  try {
    const rawData = await req.json();
    const validationResult = createAttendanceSchema.safeParse(rawData);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid input",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { date, ...data } = validationResult.data;
    const attendanceDate = new Date(date); // Convert YYYY-MM-DD string to Date object for Prisma

    // Prisma will handle the @@unique([employeeId, date]) constraint
    const newAttendance = await prisma.attendance.create({
      data: {
        ...data,
        date: attendanceDate,
      },
    });

    return NextResponse.json(newAttendance, { status: 201 });
  } catch (error: any) {
    console.error("Error creating attendance record:", error);
    if (error.code === 'P2002' && error.meta?.target?.includes('employeeId') && error.meta?.target?.includes('date')) {
      return NextResponse.json(
        { error: "Attendance record for this employee on this date already exists." },
        { status: 409 } // Conflict
      );
    }
    return NextResponse.json(
      { error: "Failed to create attendance record", details: error.message },
      { status: 500 }
    );
  }
}

// GET /api/hr/attendance - Fetch attendance records with filtering
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get("employeeId");
    const dateFromStr = searchParams.get("dateFrom");
    const dateToStr = searchParams.get("dateTo");
    const status = searchParams.get("status");

    let filters: any = {};

    if (employeeId) {
      filters.employeeId = employeeId;
    }
    if (status) {
      if (AttendanceStatusValues.includes(status as any)) {
        filters.status = status;
      } else {
        return NextResponse.json({ error: "Invalid status filter value" }, { status: 400 });
      }
    }
    if (dateFromStr) {
      const dateFrom = new Date(dateFromStr);
      if (isNaN(dateFrom.getTime())) return NextResponse.json({ error: "Invalid dateFrom format" }, { status: 400 });
      filters.date = { ...filters.date, gte: dateFrom };
    }
    if (dateToStr) {
      const dateTo = new Date(dateToStr);
      if (isNaN(dateTo.getTime())) return NextResponse.json({ error: "Invalid dateTo format" }, { status: 400 });
      filters.date = { ...filters.date, lte: dateTo };
    }

    const attendanceRecords = await prisma.attendance.findMany({
      where: filters,
      include: {
        employee: { // Include employee's name for better display
          select: { name: true }
        }
      },
      orderBy: {
        date: "desc", // Default sort by date descending
      },
    });

    return NextResponse.json(attendanceRecords);
  } catch (error: any) {
    console.error("Error fetching attendance records:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance records", details: error.message },
      { status: 500 }
    );
  }
}
