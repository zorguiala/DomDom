import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { AttendanceStatusValues } from "@/types/hr";

// Zod schema for updating attendance - all fields are optional
const updateAttendanceSchema = z.object({
  employeeId: z.string().uuid("Invalid Employee ID format").optional(), // Usually not changed, but can be if correcting a mistake
  date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format. Expected YYYY-MM-DD",
  }).optional(),
  status: z.enum(AttendanceStatusValues).optional(),
  hoursWorked: z.number().min(0).max(24).optional().nullable(),
  notes: z.string().optional().nullable(),
});

// PUT /api/hr/attendance/[id] - Update an existing attendance record
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const rawData = await req.json();
    const validationResult = updateAttendanceSchema.safeParse(rawData);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid input",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const dataToUpdate = validationResult.data;
    let processedData: any = { ...dataToUpdate };

    if (dataToUpdate.date) {
      processedData.date = new Date(dataToUpdate.date);
    }

    // Ensure the record exists before trying to update
    const existingAttendance = await prisma.attendance.findUnique({ where: { id } });
    if (!existingAttendance) {
        return NextResponse.json({ error: "Attendance record not found" }, { status: 404 });
    }

    // Handle potential change in unique constraint (employeeId, date)
    // If employeeId or date is changing, we need to ensure the new combination is unique.
    const newEmployeeId = processedData.employeeId || existingAttendance.employeeId;
    const newDate = processedData.date || existingAttendance.date;

    if ( (processedData.employeeId && processedData.employeeId !== existingAttendance.employeeId) ||
         (processedData.date && newDate.toISOString().split('T')[0] !== existingAttendance.date.toISOString().split('T')[0]) )
    {
        const conflictingRecord = await prisma.attendance.findFirst({
            where: {
                employeeId: newEmployeeId,
                date: newDate,
                id: { not: id }, // Exclude the current record
            }
        });
        if (conflictingRecord) {
            return NextResponse.json({ error: "Another attendance record for this employee on this date already exists." }, { status: 409 });
        }
    }


    const updatedAttendance = await prisma.attendance.update({
      where: { id },
      data: processedData,
    });

    return NextResponse.json(updatedAttendance);
  } catch (error: any) {
    console.error("Error updating attendance record:", error);
    if (error.code === 'P2025') { // Record to update not found (already checked, but good fallback)
        return NextResponse.json({ error: "Attendance record not found" }, { status: 404 });
    }
    if (error.code === 'P2002') { // Unique constraint violation
        return NextResponse.json({ error: "This change would result in a duplicate attendance record (employee + date)." }, { status: 409 });
    }
    return NextResponse.json(
      { error: "Failed to update attendance record", details: error.message },
      { status: 500 }
    );
  }
}

// GET /api/hr/attendance/[id] - Fetch a single attendance record (optional, good for edit prefill)
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const attendanceRecord = await prisma.attendance.findUnique({
      where: { id },
      include: {
        employee: { select: { name: true, employeeId: true } }
      }
    });

    if (!attendanceRecord) {
      return NextResponse.json({ error: "Attendance record not found" }, { status: 404 });
    }
    return NextResponse.json(attendanceRecord);
  } catch (error: any) {
    console.error("Error fetching attendance record:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance record", details: error.message },
      { status: 500 }
    );
  }
}
