import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Zod schema for employee update - all fields are optional for PUT
const updateEmployeeSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required").optional(),
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email("Invalid email address").optional().nullable(),
  phone: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  position: z.string().optional().nullable(),
  salary: z.number().positive("Salary must be a positive number").optional().nullable(),
  hireDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format for hire date",
  }).optional(),
  isActive: z.boolean().optional(),
});

// GET /api/hr/employees/[id] - Get a single employee by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const paramValues = await params;
    const { id } = paramValues;
    const employee = await prisma.employee.findUnique({
      where: { id },
    });

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }
    return NextResponse.json(employee);
  } catch (error: any) {
    console.error("Error fetching employee:", error);
    return NextResponse.json(
      { error: "Failed to fetch employee", details: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/hr/employees/[id] - Update an employee by ID
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const paramValues = await params;
    const { id } = paramValues;
    const rawData = await req.json();
    const validationResult = updateEmployeeSchema.safeParse(rawData);

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

    // If hireDate is being updated, convert it to DateTime
    let processedData: any = { ...dataToUpdate };
    if (dataToUpdate.hireDate) {
      processedData.hireDate = new Date(dataToUpdate.hireDate);
    }

    // Check for uniqueness if employeeId or email are being changed
    if (dataToUpdate.employeeId) {
        const existingByEmployeeId = await prisma.employee.findFirst({ where: { employeeId: dataToUpdate.employeeId, NOT: { id } } });
        if (existingByEmployeeId) {
            return NextResponse.json({ error: "Another employee with this Employee ID already exists." }, { status: 409 });
        }
    }
    if (dataToUpdate.email) {
        const existingByEmail = await prisma.employee.findFirst({ where: { email: dataToUpdate.email, NOT: { id } } });
        if (existingByEmail) {
            return NextResponse.json({ error: "Another employee with this email already exists." }, { status: 409 });
        }
    }

    const updatedEmployee = await prisma.employee.update({
      where: { id },
      data: processedData,
    });

    return NextResponse.json(updatedEmployee);
  } catch (error: any) {
    console.error("Error updating employee:", error);
     if (error.code === 'P2025') { // Record to update not found
        return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }
    if (error.code === 'P2002' && error.meta?.target) {
        const targetFields = Array.isArray(error.meta.target) ? error.meta.target.join(', ') : error.meta.target;
        return NextResponse.json({ error: `Unique constraint failed on field(s): ${targetFields}. Another record already has this value.` }, { status: 409 });
    }
    return NextResponse.json(
      { error: "Failed to update employee", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/hr/employees/[id] - Delete an employee by ID
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const paramValues = await params;
    const { id } = paramValues;

    // Ensure employee exists before trying to delete
    const employee = await prisma.employee.findUnique({ where: { id } });
    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    // Add checks here if employee deletion should be restricted based on related data (e.g., payroll history, attendance)
    // For now, direct delete. Prisma schema should define onDelete behavior for relations (e.g., Cascade, Restrict).
    // Current schema has relations to Attendance and Payroll but no explicit onDelete specified,
    // so default is likely Restrict or SetNull if optional. This might cause deletion to fail if related records exist.
    // For simplicity, we assume deletion is allowed. A robust app would check or handle this.

    await prisma.employee.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Employee deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting employee:", error);
    if (error.code === 'P2025') { // Record to delete not found
        return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }
    // Prisma's P2003 error for foreign key constraint violation (e.g., if related Attendance/Payroll records exist and onDelete is Restrict)
    if (error.code === 'P2003') {
        return NextResponse.json({ error: "Cannot delete employee due to existing related records (e.g., attendance, payroll). Please remove or reassign them first." }, { status: 409 });
    }
    return NextResponse.json(
      { error: "Failed to delete employee", details: error.message },
      { status: 500 }
    );
  }
}
