import { Employee } from '../../entities/employee.entity';
import { EmployeeAttendance } from '../../entities/employee-attendance.entity';

export interface EmployeeAttendanceSummary {
  present: number;
  absent: number;
  total: number;
  records: EmployeeAttendance[];
}

export interface EmployeeAttendanceStats {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  averageHoursPerDay: number;
}

export interface EmployeeProductivityMetrics {
  productivityRate?: number;
  qualityScore?: number;
  efficiencyScore?: number;
  totalProductionCount?: number;
  totalQualityIssues?: number;
}

export interface EmployeeWithAttendance extends Employee {
  attendanceRecords: EmployeeAttendance[];
}
