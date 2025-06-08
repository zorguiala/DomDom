import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Zod schema for employee creation
const createEmployeeSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address").optional().nullable(),
  phone: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  position: z.string().optional().nullable(),
  salary: z.number().positive("Salary must be a positive number").optional().nullable(),
  hireDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format for hire date",
  }), // Expecting ISO string e.g. "2023-01-15T00:00:00.000Z" or "2023-01-15"
  isActive: z.boolean().optional().default(true),
});

// POST /api/hr/employees - Create a new employee
export async function POST(req: NextRequest) {
  try {
    const rawData = await req.json();
    const validationResult = createEmployeeSchema.safeParse(rawData);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid input",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Check for uniqueness of employeeId and email if provided
    if (data.employeeId) {
        const existingByEmployeeId = await prisma.employee.findUnique({ where: { employeeId: data.employeeId } });
        if (existingByEmployeeId) {
            return NextResponse.json({ error: "Employee with this Employee ID already exists." }, { status: 409 });
        }
    }
    if (data.email) {
        const existingByEmail = await prisma.employee.findUnique({ where: { email: data.email } });
        if (existingByEmail) {
            return NextResponse.json({ error: "Employee with this email already exists." }, { status: 409 });
        }
    }

    const newEmployee = await prisma.employee.create({
      data: {
        ...data,
        hireDate: new Date(data.hireDate), // Convert string to DateTime
        // salary can be null, so no special handling needed if optional & nullable in schema
      },
    });

    return NextResponse.json(newEmployee, { status: 201 });
  } catch (error: any) {
    console.error("Error creating employee:", error);
    // Prisma unique constraint violation (though checked above, good as a fallback)
    if (error.code === 'P2002' && error.meta?.target) {
        const targetFields = Array.isArray(error.meta.target) ? error.meta.target.join(', ') : error.meta.target;
        return NextResponse.json({ error: `Unique constraint failed on field(s): ${targetFields}` }, { status: 409 });
    }
    return NextResponse.json(
      { error: "Failed to create employee", details: error.message },
      { status: 500 }
    );
  }
}

// GET /api/hr/employees - Get a list of all employees
export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(employees);
  } catch (error: any) {
    console.error("Error fetching employees:", error);
    return NextResponse.json(
      { error: "Failed to fetch employees", details: error.message },
      { status: 500 }
    );
  }
}
