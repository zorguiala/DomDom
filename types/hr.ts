import { Employee } from "@prisma/client"; // Assuming prisma generate would have run

// For Employee form data - adjust fields as needed for your form
export interface EmployeeFormData {
  id?: string; // For edit, not for create
  employeeId: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  department?: string | null;
  position?: string | null;
  salary?: number | null; // Prisma schema uses Float, which maps to number
  hireDate: string; // Use string for date inputs, will be converted to DateTime
  isActive?: boolean;
}

// If you need a more detailed type for displaying employees,
// you can extend the Prisma type or create a new one.
export type EmployeeWithDetails = Employee; // Example, can be expanded

// For itemized deductions/bonuses in Payroll
export interface PayrollAdjustmentItem {
  reason: string;
  amount: number;
}

// --- Attendance Types ---

// Define allowed statuses for attendance
export const AttendanceStatusValues = ["PRESENT", "ABSENT", "HALF_DAY"] as const;
export type AttendanceStatus = typeof AttendanceStatusValues[number];

export interface AttendanceFormData {
  id?: string; // For editing existing records
  employeeId: string;
  date: string; // Expecting YYYY-MM-DD string from date picker
  status: AttendanceStatus;
  hoursWorked?: number | null;
  notes?: string | null;
}

// For displaying attendance records, potentially with employee details
// Assuming 'Attendance' is the Prisma model type
import { Attendance as PrismaAttendance } from "@prisma/client";

export type AttendanceWithEmployee = PrismaAttendance & {
  employee?: {
    name: string; // Or Employee model if you need more details
  };
};
