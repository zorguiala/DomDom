// Types for the employees module
export interface EmployeeAttendanceSummary {
  date: Date;
  totalEmployees: number;
  presentCount: number;
  absentCount: number;
  attendanceRate: number;
  attendance: Array<{
    employeeId: string;
    employeeName: string;
    checkInTime: Date;
    checkOutTime: Date | null;
  }>;
}

export interface EmployeeDto {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  position: string;
  hireDate: Date;
  salary: number;
  address?: string;
  role?: string;
  monthlySalary?: number;
  dailyRate?: number;
  hourlyRate?: number;
  isCommissionBased?: boolean;
  commissionRate?: number;
}

export interface MarkAttendanceDto {
  employeeId: string;
  checkInTime: Date;
  checkOutTime?: Date;
}
